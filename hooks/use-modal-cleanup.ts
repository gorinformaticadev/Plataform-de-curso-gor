import { useEffect, useRef } from 'react';

interface ModalCleanupDetectorConfig {
  onInconsistentStateDetected?: () => void;
  checkInterval?: number;
  debugMode?: boolean;
}

/**
 * Hook para detectar e limpar automaticamente estados inconsistentes de modais.
 * Previne vazamentos de memória e event listeners órfãos.
 */
export const useModalCleanupDetector = (config: ModalCleanupDetectorConfig = {}) => {
  const {
    onInconsistentStateDetected,
    checkInterval = 3000,
    debugMode = false
  } = config;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    const checkForOrphanedState = () => {
      if (!isMountedRef.current || typeof window === 'undefined') {
        return;
      }

      try {
        let issuesFound = false;

        // Verificar backdropds órfãos do Radix UI
        const orphanedBackdrops = document.querySelectorAll('[data-radix-dialog-overlay]');
        const visibleBackdrops = Array.from(orphanedBackdrops).filter(backdrop => {
          const style = window.getComputedStyle(backdrop as Element);
          return style.display !== 'none' && style.visibility !== 'hidden';
        });

        if (visibleBackdrops.length > 0) {
          if (debugMode) {
            console.warn('[ModalCleanupDetector] Backdropds órfãos detectados:', visibleBackdrops.length);
          }
          issuesFound = true;
          
          // Limpar backdropds órfãos
          visibleBackdrops.forEach(backdrop => {
            try {
              if (backdrop.parentNode) {
                backdrop.parentNode.removeChild(backdrop);
              }
            } catch (error) {
              if (debugMode) {
                console.warn('[ModalCleanupDetector] Erro ao remover backdrop:', error);
              }
            }
          });
        }

        // Verificar overflow do body
        const bodyStyle = document.body.style;
        if (bodyStyle.overflow === 'hidden' && !document.querySelector('[data-radix-dialog-content]')) {
          if (debugMode) {
            console.warn('[ModalCleanupDetector] Body overflow órfão detectado');
          }
          issuesFound = true;
          bodyStyle.overflow = '';
        }

        // Verificar pointer-events do body
        if (bodyStyle.pointerEvents === 'none' && !document.querySelector('[data-radix-dialog-content]')) {
          if (debugMode) {
            console.warn('[ModalCleanupDetector] Body pointer-events órfão detectado');
          }
          issuesFound = true;
          bodyStyle.pointerEvents = '';
        }

        // Verificar elementos de modal órfãos
        const orphanedModals = document.querySelectorAll('[data-radix-dialog-content]');
        const visibleOrphanedModals = Array.from(orphanedModals).filter(modal => {
          const style = window.getComputedStyle(modal as Element);
          return style.display !== 'none' && style.visibility !== 'hidden';
        });

        // Se há modais visíveis, verificar se estão realmente funcionais
        if (visibleOrphanedModals.length > 0) {
          visibleOrphanedModals.forEach(modal => {
            const modalElement = modal as HTMLElement;
            
            // Verificar se o modal está responsivo
            const rect = modalElement.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) {
              if (debugMode) {
                console.warn('[ModalCleanupDetector] Modal não-responsivo detectado');
              }
              issuesFound = true;
              
              try {
                if (modalElement.parentNode) {
                  modalElement.parentNode.removeChild(modalElement);
                }
              } catch (error) {
                if (debugMode) {
                  console.warn('[ModalCleanupDetector] Erro ao remover modal:', error);
                }
              }
            }
          });
        }

        // Notificar sobre estados inconsistentes encontrados
        if (issuesFound && onInconsistentStateDetected) {
          onInconsistentStateDetected();
        }

      } catch (error) {
        if (debugMode) {
          console.error('[ModalCleanupDetector] Erro durante verificação:', error);
        }
      }
    };

    // Iniciar verificação periódica
    intervalRef.current = setInterval(checkForOrphanedState, checkInterval);

    // Cleanup inicial ao montar
    checkForOrphanedState();

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkInterval, debugMode, onInconsistentStateDetected]);

  // Função para cleanup manual
  const forceCleanup = () => {
    if (typeof window === 'undefined') return;

    try {
      // Remover todos os elementos de modal órfãos
      const allModals = document.querySelectorAll('[data-radix-dialog-content], [data-radix-dialog-overlay]');
      allModals.forEach(element => {
        try {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
        } catch (error) {
          // Ignorar erros de remoção
        }
      });

      // Reset do body
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';

      if (debugMode) {
        console.log('[ModalCleanupDetector] Cleanup forçado executado');
      }
    } catch (error) {
      if (debugMode) {
        console.error('[ModalCleanupDetector] Erro no cleanup forçado:', error);
      }
    }
  };

  return { forceCleanup };
};

/**
 * Hook específico para monitoramento de performance de modais
 */
export const useModalPerformanceMonitor = (modalId?: string) => {
  const metricsRef = useRef({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0
  });

  const debugMode = process.env.NODE_ENV === 'development';

  useEffect(() => {
    const startTime = performance.now();
    metricsRef.current.renderCount++;

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      metricsRef.current.lastRenderTime = renderTime;
      metricsRef.current.averageRenderTime = 
        (metricsRef.current.averageRenderTime * (metricsRef.current.renderCount - 1) + renderTime) / 
        metricsRef.current.renderCount;

      if (debugMode && renderTime > 100) {
        console.warn(`[ModalPerformanceMonitor] Render lento detectado${modalId ? ` em ${modalId}` : ''}: ${renderTime.toFixed(2)}ms`);
      }
    };
  });

  const getMetrics = () => metricsRef.current;

  return { getMetrics };
};