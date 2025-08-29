"use client";

import React, { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccessibleDialogContent } from "@/components/ui/accessible-dialog-content";
import { UserEditForm } from "@/components/admin/user-edit-form";
import { ModalErrorBoundary } from "@/components/admin/modal-error-boundary";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { useRobustModal } from "@/hooks/use-robust-modal";
import { useModalCleanupDetector } from "@/hooks/use-modal-cleanup";
import { User } from "@/types";

interface RobustUserEditModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal robusto para edição de usuário com proteção anti-congelamento.
 * Implementa as especificações do projeto para gerenciamento seguro de modais.
 */
export const RobustUserEditModal: React.FC<RobustUserEditModalProps> = ({
  user,
  isOpen: externalIsOpen,
  onClose,
  onSuccess
}) => {
  const [hasError, setHasError] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  // Hook robusto para gerenciamento de modal
  const {
    isOpen: internalIsOpen,
    openModal,
    closeModal,
    forceClose,
    isClosing
  } = useRobustModal({
    onClose,
    debugMode: process.env.NODE_ENV === 'development',
    onError: (error) => {
      console.error('[RobustUserEditModal] Erro no modal:', error);
      setHasError(true);
    }
  });

  // Sistema de detecção e limpeza automática
  const { forceCleanup } = useModalCleanupDetector({
    onInconsistentStateDetected: () => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[RobustUserEditModal] Estado inconsistente detectado, executando limpeza...');
      }
    },
    debugMode: process.env.NODE_ENV === 'development'
  });

  // Sincronização com estado externo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[RobustUserEditModal] Sincronização de estado:', {
        externalIsOpen,
        internalIsOpen,
        isClosing,
        'vai_abrir': externalIsOpen && !internalIsOpen,
        'vai_fechar': !externalIsOpen && internalIsOpen && !isClosing
      });
    }
    
    // Abrir modal: quando externo é true e interno é false
    if (externalIsOpen && !internalIsOpen) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[RobustUserEditModal] EXECUTANDO ABERTURA - sincronização externa');
      }
      openModal();
    } 
    // Fechar modal: quando externo é false, interno é true e não está fechando
    else if (!externalIsOpen && internalIsOpen && !isClosing) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[RobustUserEditModal] EXECUTANDO FECHAMENTO - sincronização externa');
      }
      closeModal();
    }
    else if (process.env.NODE_ENV === 'development') {
      console.log('[RobustUserEditModal] NENHUMA AÇÃO - condições não atendidas');
    }
  }, [externalIsOpen, internalIsOpen, isClosing, openModal, closeModal]);

  // Handler para onOpenChange do Radix UI - critical para prevenir congelamento
  const handleOpenChange = useCallback((open: boolean) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[RobustUserEditModal] onOpenChange chamado:', { open, internalIsOpen });
    }
    
    if (!open) {
      closeModal();
    }
  }, [closeModal]);

  // Handler de sucesso protegido contra erros
  const handleSuccess = useCallback(async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('[RobustUserEditModal] Processando sucesso...');
      }
      
      // Executa callback de sucesso do componente pai
      await onSuccess();
      
      // O modal será fechado através do onClose do componente pai
      // NÃO chamamos closeModal() aqui para evitar conflito
      
    } catch (error) {
      console.error('[RobustUserEditModal] Erro no onSuccess:', error);
      
      // Em caso de erro, forçar fechamento direto
      setHasError(true);
      
      // Forçar fechamento após 2 segundos
      setTimeout(() => {
        forceClose();
        setHasError(false);
      }, 2000);
    }
  }, [onSuccess, forceClose]);

  // Handler de cancelamento
  const handleCancel = useCallback(() => {
    closeModal();
  }, [closeModal]);

  // Handler de erro do Error Boundary
  const handleModalError = useCallback((error: Error) => {
    console.error('[RobustUserEditModal] Erro capturado pelo Error Boundary:', error);
    setHasError(true);
    
    // Executar limpeza forçada após erro
    setTimeout(() => {
      forceCleanup();
    }, 1000);
  }, [forceCleanup]);

  // Handler de recuperação do Error Boundary
  const handleModalRecover = useCallback(() => {
    console.log('[RobustUserEditModal] Modal recuperado pelo Error Boundary');
    setHasError(false);
    setIsRecovering(false);
  }, []);

  // Auto-recovery para casos de erro
  useEffect(() => {
    if (hasError) {
      setIsRecovering(true);
      
      const recoveryTimer = setTimeout(() => {
        setIsRecovering(false);
        
        setTimeout(() => {
          setHasError(false);
          forceClose();
        }, 500);
      }, 2000);

      return () => clearTimeout(recoveryTimer);
    }
  }, [hasError, forceClose]);

  // Render do componente de erro
  if (hasError) {
    return (
      <Dialog open={internalIsOpen} onOpenChange={handleOpenChange}>
        <AccessibleDialogContent 
          className="sm:max-w-[425px]"
          descriptionId="error-recovery-description"
          descriptionText="Sistema de recuperação de erro do modal"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              {isRecovering ? 'Recuperando...' : 'Oops! Algo deu errado'}
            </DialogTitle>
            <DialogDescription>
              {isRecovering 
                ? 'Tentando recuperar o modal de edição...'
                : 'O modal será recarregado automaticamente em alguns segundos.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-4 py-6">
            {isRecovering ? (
              <div className="flex items-center gap-2">
                <svg className="h-6 w-6 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Recuperando...</span>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                O sistema detectou um problema e tentará recuperar automaticamente.
              </p>
            )}
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={forceClose}>
              Fechar
            </Button>
            <Button onClick={() => window.location.reload()}>
              Recarregar Página
            </Button>
          </div>
        </AccessibleDialogContent>
      </Dialog>
    );
  }

  return (
    <ModalErrorBoundary
      onError={handleModalError}
      onRecover={handleModalRecover}
      modalTitle="Erro na Edição de Usuário"
      maxRetries={2}
    >
      <Dialog open={internalIsOpen} onOpenChange={handleOpenChange}>
        <AccessibleDialogContent 
          className="sm:max-w-[625px]"
          descriptionId="edit-user-description"
          descriptionText="Formulário para edição de usuário"
        >
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Modifique as informações do usuário {user.name} conforme necessário.
            </DialogDescription>
          </DialogHeader>
          
          {/* Container com transição suave durante fechamento */}
          <div className={`transition-opacity duration-150 ${
            isClosing ? 'opacity-50 pointer-events-none' : 'opacity-100'
          }`}>
            <UserEditForm
              user={user}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
          
          {/* Botão de emergência apenas em desenvolvimento */}
          {process.env.NODE_ENV === 'development' && isClosing && (
            <div className="absolute top-2 right-2 z-50">
              <Button
                variant="ghost"
                size="sm"
                onClick={forceClose}
                className="opacity-60 hover:opacity-100 transition-opacity"
                title="Forçar fechamento (apenas desenvolvimento)"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </AccessibleDialogContent>
      </Dialog>
    </ModalErrorBoundary>
  );
};