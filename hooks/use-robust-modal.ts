import { useState, useCallback, useRef, useEffect } from 'react';

interface RobustModalConfig {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
  debugMode?: boolean;
}

interface RobustModalReturn {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  forceClose: () => void;
  isClosing: boolean;
}

/**
 * Hook para gerenciamento robusto de modais, prevenindo congelamento de interface.
 * Baseado nas especificações do projeto para garantir cleanup adequado e sincronia de estado.
 */
export const useRobustModal = (config: RobustModalConfig = {}): RobustModalReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const listenersRef = useRef<Array<() => void>>([]);
  const isMountedRef = useRef(true);

  // Função segura para verificar se o componente ainda está montado
  const isMounted = useCallback(() => isMountedRef.current, []);

  // Função segura para abrir modal
  const openModal = useCallback(() => {
    if (!isMounted()) return;
    
    if (config.debugMode) {
      console.log('[useRobustModal] Abrindo modal...');
    }
    
    // Reset de estados para garantir consistência
    setIsClosing(false);
    setIsOpen(true);
    
    // Garantir que não há event listeners órfãos
    cleanupListeners();
    
    config.onOpen?.();
  }, [config, isMounted]);

  // Função para cleanup de listeners
  const cleanupListeners = useCallback(() => {
    try {
      listenersRef.current.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
          if (config.debugMode) {
            console.warn('[useRobustModal] Erro ao limpar listener:', error);
          }
        }
      });
      listenersRef.current = [];
      
      // Cleanup adicional para garantir que não há problemas de CSS
      if (typeof document !== 'undefined') {
        document.body.style.pointerEvents = '';
        document.body.style.overflow = '';
      }
    } catch (error) {
      if (config.debugMode) {
        console.error('[useRobustModal] Erro no cleanup:', error);
      }
    }
  }, [config.debugMode]);

  // Função segura para fechar modal
  const closeModal = useCallback(() => {
    if (!isMounted()) return;
    
    if (config.debugMode) {
      console.log('[useRobustModal] Iniciando fechamento seguro...');
    }
    
    try {
      setIsClosing(true);
      
      // Cleanup imediato para prevenir problemas
      cleanupListeners();
      
      // Delayed state update para permitir animação do Radix UI
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        if (!isMounted()) return;
        
        setIsOpen(false);
        setIsClosing(false);
        
        config.onClose?.();
        
        if (config.debugMode) {
          console.log('[useRobustModal] Modal fechado com sucesso.');
        }
      }, 150); // Tempo suficiente para animação do Radix UI
      
    } catch (error) {
      if (config.debugMode) {
        console.error('[useRobustModal] Erro durante fechamento:', error);
      }
      config.onError?.(error as Error);
      
      // Fallback para fechamento forçado em caso de erro
      forceClose();
    }
  }, [config, cleanupListeners, isMounted]);

  // Fechamento forçado para casos extremos
  const forceClose = useCallback(() => {
    if (config.debugMode) {
      console.log('[useRobustModal] Executando fechamento forçado...');
    }
    
    try {
      // Limpar timeouts pendentes
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Cleanup completo
      cleanupListeners();
      
      // Reset imediato de todos os estados
      setIsOpen(false);
      setIsClosing(false);
      
      // Reset manual de possíveis estados problemáticos do DOM
      if (typeof document !== 'undefined') {
        document.body.style.pointerEvents = '';
        document.body.style.overflow = '';
        
        // Remover qualquer backdrop órfão
        const backdrops = document.querySelectorAll('[data-radix-popper-content-wrapper], [data-radix-dialog-overlay]');
        backdrops.forEach(backdrop => {
          try {
            if (backdrop.parentNode) {
              backdrop.parentNode.removeChild(backdrop);
            }
          } catch (error) {
            // Ignorar erros de remoção de DOM
          }
        });
      }
      
      config.onClose?.();
      
      if (config.debugMode) {
        console.log('[useRobustModal] Fechamento forçado concluído.');
      }
    } catch (error) {
      if (config.debugMode) {
        console.error('[useRobustModal] Erro no fechamento forçado:', error);
      }
    }
  }, [config, cleanupListeners]);

  // Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      cleanupListeners();
    };
  }, [cleanupListeners]);

  // Detector de estado inconsistente (apenas em desenvolvimento)
  useEffect(() => {
    if (config.debugMode && typeof window !== 'undefined') {
      const checkConsistency = () => {
        if (!isMounted()) return;
        
        try {
          const hasBackdrop = document.querySelector('[data-radix-dialog-overlay]');
          const bodyOverflow = document.body.style.overflow;
          
          // Estado inconsistente detectado
          if (!isOpen && (hasBackdrop || bodyOverflow === 'hidden')) {
            console.warn('[useRobustModal] Estado inconsistente detectado, executando correção...');
            forceClose();
          }
        } catch (error) {
          // Ignorar erros de verificação
        }
      };

      const interval = setInterval(checkConsistency, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen, config.debugMode, forceClose, isMounted]);

  return {
    isOpen,
    openModal,
    closeModal,
    forceClose,
    isClosing
  };
};