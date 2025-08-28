"use client";

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";

interface ModalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRecovering: boolean;
  retryCount: number;
}

interface ModalErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRecover?: () => void;
  maxRetries?: number;
  fallbackComponent?: ReactNode;
  modalTitle?: string;
}

/**
 * Error Boundary específico para modais que implementa recuperação automática
 * e fallbacks seguros conforme especificações do projeto.
 */
export class ModalErrorBoundary extends Component<ModalErrorBoundaryProps, ModalErrorBoundaryState> {
  private recoveryTimer: NodeJS.Timeout | null = null;
  private retryTimer: NodeJS.Timeout | null = null;

  constructor(props: ModalErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRecovering: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ModalErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ModalErrorBoundary] Erro capturado:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Notificar callback de erro se fornecido
    this.props.onError?.(error, errorInfo);

    // Iniciar recuperação automática
    this.startAutoRecovery();
  }

  componentWillUnmount() {
    // Limpar timers ao desmontar
    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer);
    }
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }

  private startAutoRecovery = () => {
    const { maxRetries = 3 } = this.props;
    
    if (this.state.retryCount >= maxRetries) {
      console.warn('[ModalErrorBoundary] Máximo de tentativas de recuperação atingido');
      return;
    }

    this.setState({ isRecovering: true });

    // Aguardar 2 segundos antes da recuperação
    this.recoveryTimer = setTimeout(() => {
      this.attemptRecovery();
    }, 2000);
  };

  private attemptRecovery = () => {
    try {
      console.log('[ModalErrorBoundary] Tentando recuperação automática...');
      
      // Limpar possíveis estados problemáticos
      this.cleanupModalState();
      
      // Resetar estado do Error Boundary
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        isRecovering: false,
        retryCount: prevState.retryCount + 1
      }));

      // Notificar callback de recuperação
      this.props.onRecover?.();
      
      console.log('[ModalErrorBoundary] Recuperação bem-sucedida');
      
    } catch (recoveryError) {
      console.error('[ModalErrorBoundary] Falha na recuperação:', recoveryError);
      
      // Se a recuperação falhar, aguardar mais tempo antes da próxima tentativa
      this.retryTimer = setTimeout(() => {
        this.startAutoRecovery();
      }, 5000);
    }
  };

  private cleanupModalState = () => {
    try {
      if (typeof document !== 'undefined') {
        // Remover overlays órfãos
        const overlays = document.querySelectorAll('[data-radix-dialog-overlay]');
        overlays.forEach(overlay => {
          try {
            if (overlay.parentNode) {
              overlay.parentNode.removeChild(overlay);
            }
          } catch (error) {
            // Ignorar erros de limpeza
          }
        });

        // Reset do body
        document.body.style.overflow = '';
        document.body.style.pointerEvents = '';
      }
    } catch (error) {
      console.warn('[ModalErrorBoundary] Erro durante limpeza:', error);
    }
  };

  private handleManualRetry = () => {
    this.attemptRecovery();
  };

  private handleForceClose = () => {
    // Cleanup completo e fechamento forçado
    this.cleanupModalState();
    
    // Reset do estado
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isRecovering: false,
      retryCount: 0
    });
  };

  private handleReloadPage = () => {
    window.location.reload();
  };

  render() {
    const { hasError, error, isRecovering, retryCount } = this.state;
    const { children, fallbackComponent, modalTitle = "Erro no Modal", maxRetries = 3 } = this.props;

    if (hasError) {
      // Se fornecido, usar componente de fallback customizado
      if (fallbackComponent) {
        return fallbackComponent;
      }

      // Fallback padrão com interface amigável
      return (
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                {isRecovering ? 'Recuperando...' : modalTitle}
              </DialogTitle>
              <DialogDescription>
                {isRecovering 
                  ? 'Tentando recuperar o modal automaticamente...'
                  : 'Ocorreu um erro inesperado. O sistema tentará recuperar automaticamente.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col gap-4 py-6">
              {isRecovering ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
                  <span className="text-sm text-gray-600">Recuperando...</span>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-4">
                    {retryCount > 0 && (
                      <p className="mb-2">
                        Tentativas de recuperação: {retryCount}/{maxRetries}
                      </p>
                    )}
                    <p>O modal encontrou um problema e será recuperado automaticamente.</p>
                  </div>
                  
                  {process.env.NODE_ENV === 'development' && error && (
                    <details className="text-left bg-gray-50 p-3 rounded text-xs">
                      <summary className="cursor-pointer font-medium">Detalhes do erro (desenvolvimento)</summary>
                      <pre className="mt-2 whitespace-pre-wrap break-words">
                        {error.toString()}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={this.handleForceClose}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Fechar
              </Button>
              
              {!isRecovering && retryCount < maxRetries && (
                <Button 
                  onClick={this.handleManualRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tentar Novamente
                </Button>
              )}
              
              <Button 
                variant="secondary"
                onClick={this.handleReloadPage}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Recarregar Página
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    return children;
  }
}

/**
 * Hook para usar Error Boundary com componentes funcionais
 */
export const useModalErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    captureError,
    resetError,
    hasError: error !== null
  };
};