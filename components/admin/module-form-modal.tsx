"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { BookOpen, X } from 'lucide-react';

// Schema de validação para o módulo
const moduleFormSchema = z.object({
  title: z.string()
    .min(1, 'Nome do módulo é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string()
    .optional()
    .or(z.literal(''))
});

export type ModuleFormData = z.infer<typeof moduleFormSchema>;

interface ModuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ModuleFormData) => void;
  initialData?: Partial<ModuleFormData>;
  isEditing?: boolean;
  isLoading?: boolean;
}

export function ModuleFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
  isLoading = false
}: ModuleFormModalProps) {
  const [editorContent, setEditorContent] = useState(initialData?.description || '');

  const form = useForm<ModuleFormData>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || ''
    }
  });

  // Sincronizar dados iniciais quando modal abrir
  useEffect(() => {
    if (isOpen && initialData) {
      form.reset({
        title: initialData.title || '',
        description: initialData.description || ''
      });
      setEditorContent(initialData.description || '');
    } else if (isOpen && !isEditing) {
      // Limpar formulário para nova criação
      form.reset({
        title: '',
        description: ''
      });
      setEditorContent('');
    }
  }, [isOpen, initialData, isEditing, form]);

  const handleSubmit = (data: ModuleFormData) => {
    // Incluir o conteúdo do editor na descrição
    const finalData = {
      ...data,
      description: editorContent
    };
    
    onSubmit(finalData);
  };

  const handleClose = () => {
    form.reset();
    setEditorContent('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <DialogTitle>
                {isEditing ? 'Editar Módulo' : 'Criar Novo Módulo'}
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-1">
            <div className="space-y-6 py-4">
              {/* Nome do Módulo */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Nome do Módulo *
                </Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  placeholder="Ex: Introdução ao JavaScript"
                  className="w-full"
                  disabled={isLoading}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              {/* Descrição do Módulo */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Descrição do Módulo
                </Label>
                <div className="border rounded-lg overflow-hidden">
                  <TiptapEditor
                    value={editorContent}
                    onChange={(content) => {
                      setEditorContent(content);
                      form.setValue('description', content);
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Descreva o que os alunos aprenderão neste módulo. Esta descrição aparecerá na estrutura do curso.
                </p>
                {form.formState.errors.description && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 border-t pt-4">
            <div className="flex justify-end gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !form.formState.isValid}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isEditing ? 'Salvando...' : 'Criando...'}
                  </div>
                ) : (
                  isEditing ? 'Salvar Módulo' : 'Criar Módulo'
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}