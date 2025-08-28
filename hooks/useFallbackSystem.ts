import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface FallbackSystemOptions {
  timeoutDelay?: number; // Tempo limite para operações em ms
  maxRecoveryAttempts?: number; // Máximo de tentativas de recovery
  enableForceReload?: boolean; // Permitir reload forçado da página
  enableStateReset?: boolean; // Permitir reset de estado
  onFallbackTriggered?: (reason: string) => void;
}

/**
 * Sistema de fallback para garantir que a interface nunca trave definitivamente
 * Implementa timeouts forçados e reset de estado como última linha de defesa
 */
export function useFallbackSystem(options: FallbackSystemOptions = {}) {
  const {
    timeoutDelay = 45000, // 45 segundos
    maxRecoveryAttempts = 3,
    enableForceReload = true,
    enableStateReset = true,
    onFallbackTriggered
  } = options;

  const recoveryAttemptsRef = useRef(0);
  const lastInteractionRef = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();
  const fallbackActiveRef = useRef(false);

  // Função para resetar contador de interação
  const resetInteractionTimer = useCallback(() => {
    lastInteractionRef.current = Date.now();
    recoveryAttemptsRef.current = 0; // Reset tentativas ao detectar atividade
    
    // Limpa timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Agenda novo timeout
    timeoutRef.current = setTimeout(() => {
      triggerFallback('timeout');
    }, timeoutDelay);
  }, [timeoutDelay]);

  // Função para executar fallback
  const triggerFallback = useCallback((reason: string) => {
    if (fallbackActiveRef.current) {
      console.log('[FallbackSystem] Fallback já ativo, ignorando nova tentativa');
      return;
    }

    fallbackActiveRef.current = true;
    recoveryAttemptsRef.current++;
    
    console.warn(`[FallbackSystem] Executando fallback - Razão: ${reason}, Tentativa: ${recoveryAttemptsRef.current}`);
    
    // Callback customizado
    onFallbackTriggered?.(reason);

    if (recoveryAttemptsRef.current <= maxRecoveryAttempts) {
      // Tentativas de recovery automático
      performAutomaticRecovery(reason);
    } else {
      // Última linha de defesa
      performForceRecovery(reason);
    }
    
    // Reset flag após 5 segundos
    setTimeout(() => {
      fallbackActiveRef.current = false;
    }, 5000);
  }, [maxRecoveryAttempts, onFallbackTriggered]);

  // Função para recovery automático
  const performAutomaticRecovery = useCallback((reason: string) => {
    console.log(`[FallbackSystem] Executando recovery automático (${reason})...`);
    
    try {
      // 1. Limpa todos os estilos problemáticos
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
      document.body.classList.remove('overflow-hidden');
      
      // 2. Remove elementos DOM órfãos
      const orphanSelectors = [
        '[data-radix-dialog-overlay]',
        '[data-radix-dialog-content]:not([data-state=\"open\"])',
        '[data-radix-portal]:empty',
        '.modal-backdrop',
        '[data-state=\"closed\"]'
      ];
      
      orphanSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          try {
            if (el.parentNode) {
              el.parentNode.removeChild(el);
            }
          } catch (error) {
            console.warn('[FallbackSystem] Erro ao remover elemento:', error);
          }
        });
      });
      
      // 3. Força reset de foco
      const activeElement = document.activeElement;
      if (activeElement && activeElement !== document.body) {
        try {
          (activeElement as HTMLElement).blur();
          document.body.focus();
        } catch (error) {
          console.warn('[FallbackSystem] Erro ao resetar foco:', error);
        }
      }
      
      // 4. Força repaint
      document.body.style.transform = 'translateZ(0)';
      requestAnimationFrame(() => {
        document.body.style.transform = '';
      });
      
      // 5. Reset de eventos
      window.dispatchEvent(new Event('resize'));
      
      // Recovery silencioso, sem toast
      console.log('[FallbackSystem] Recovery automático concluído');
      
    } catch (error) {
      console.error('[FallbackSystem] Erro durante recovery automático:', error);
      // Apenas log de erro, sem toast
    }
  }, []);

  // Função para recovery forçado (última linha de defesa)
  const performForceRecovery = useCallback((reason: string) => {
    console.error(`[FallbackSystem] FORÇA RECOVERY - Máximo de tentativas atingido (${reason})`);
    
    if (enableForceReload) {
      // Apenas em caso extremo mostra aviso de reload
      toast.error('Interface travada detectada. Recarregando página em 3 segundos...', {
        duration: 3000
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  }, [enableForceReload]);

  // Função manual para forçar fallback
  const forceFallback = useCallback((reason = 'manual') => {
    triggerFallback(reason);
  }, [triggerFallback]);

  // Função para resetar sistema
  const resetSystem = useCallback(() => {
    recoveryAttemptsRef.current = 0;
    fallbackActiveRef.current = false;
    resetInteractionTimer();
    console.log('[FallbackSystem] Sistema resetado');
  }, [resetInteractionTimer]);

  // Monitora atividade do usuário
  useEffect(() => {
    if (!enableStateReset) return;

    const events = ['click', 'keydown', 'touchstart', 'scroll', 'mousemove'];
    
    const handleActivity = () => {
      resetInteractionTimer();
    };

    // Adiciona listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Inicia timer inicial
    resetInteractionTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enableStateReset, resetInteractionTimer]);

  return {
    forceFallback,
    resetSystem,
    recoveryAttempts: recoveryAttemptsRef.current,
    lastInteraction: lastInteractionRef.current,
    isActive: fallbackActiveRef.current
  };
}