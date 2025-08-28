'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Notificar o usuário do erro
    toast.error('Ocorreu um erro inesperado. A página será recarregada.');
    
    // Recarregar a página após um breve atraso
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Ops! Algo deu errado
          </h2>
          <p className="text-gray-600 mb-4">
            Ocorreu um erro inesperado. A página será recarregada automaticamente.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Recarregar agora
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;