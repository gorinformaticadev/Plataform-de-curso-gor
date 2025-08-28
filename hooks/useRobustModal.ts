import { useState, useEffect, useCallback, useRef } from 'react';

interface UseRobustModalOptions {
  onOpen?: () => void;
  onClose?: () => void;
  autoCleanup?: boolean;
  cleanupDelay?: number;
}

/**
 * Hook personalizado para gerenciamento robusto de modais
 * Previne e resolve automaticamente problemas de congelamento de interface
 */
export function useRobustModal(options: UseRobustModalOptions = {}) {
  const {
    onOpen,
    onClose,
    autoCleanup = true,
    cleanupDelay = 150
  } = options;
  
  const [isOpen, setIsOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Função robusta para limpeza de elementos DOM órfãos
  const forceCleanup = useCallback(() => {
    
    // Limpa estilos do body que podem travar interface
    document.body.style.pointerEvents = '';
    document.body.style.overflow = '';
    document.body.classList.remove('overflow-hidden');
    
    // Remove elementos órfãos do Radix UI e outros modais
    const selectorsToClean = [
      '[data-radix-dialog-overlay]',
      '[data-radix-dialog-content]',
      '[data-radix-portal]',
      '[data-state="closed"]',
      '.modal-backdrop'
    ];
    
    selectorsToClean.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        // Verifica se elemento não está em modal ativo
        if (!element.closest('[data-state="open"]')) {
          try {
            // Remove usando diferentes estratégias
            if (element.parentNode) {
              element.parentNode.removeChild(element);
            } else if (element.remove) {
              element.remove();
            }
          } catch (error) {
            console.warn('[useRobustModal] Aviso ao remover elemento:', error);
          }
        }
      });
    });
    
    // Força foco para fora de elementos potencialmente travados
    const activeElement = document.activeElement;
    if (activeElement && activeElement !== document.body) {
      try {
        (activeElement as HTMLElement).blur();
        document.body.focus();
      } catch (error) {
        console.warn('[useRobustModal] Aviso ao resetar foco:', error);
      }
    }
    
    console.log('[useRobustModal] Limpeza robusta concluída');
  }, []);
  
  // Função para abrir modal
  const openModal = useCallback(() => {
    setIsTransitioning(true);
    
    // Limpa timeouts pendentes
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
    }
    
    requestAnimationFrame(() => {
      setIsOpen(true);
      setIsTransitioning(false);
      onOpen?.();
    });
  }, [onOpen]);
  
  // Função para fechar modal
  const closeModal = useCallback(() => {
    setIsTransitioning(true);
    
    // Fecha imediatamente no estado React
    setIsOpen(false);
    
    // Executa callback de fechamento
    onClose?.();
    
    // Agenda limpeza automática se habilitada
    if (autoCleanup) {
      cleanupTimeoutRef.current = setTimeout(() => {
        forceCleanup();
        setIsTransitioning(false);
      }, cleanupDelay);
    } else {
      setIsTransitioning(false);
    }
  }, [onClose, autoCleanup, cleanupDelay, forceCleanup]);
  
  // Handler para mudanças de estado (usado pelo Radix UI)
  const handleOpenChange = useCallback((open: boolean) => {
    if (open) {
      openModal();
    } else {
      closeModal();
    }
  }, [openModal, closeModal]);
  
  // Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
      
      // Força limpeza final
      if (autoCleanup) {
        forceCleanup();
      }
    };
  }, [autoCleanup, forceCleanup]);
  
  // Limpeza automática quando modal fecha
  useEffect(() => {
    if (!isOpen && autoCleanup) {
      const timeoutId = setTimeout(forceCleanup, cleanupDelay);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, autoCleanup, cleanupDelay, forceCleanup]);
  
  return {
    isOpen,
    isTransitioning,
    openModal,
    closeModal,
    handleOpenChange,
    forceCleanup
  };
}