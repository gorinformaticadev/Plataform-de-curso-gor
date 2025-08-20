'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ModuleFormData } from '@/app/types/course';
import { moduleSchema } from '@/app/schemas/course';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, X } from 'lucide-react';

interface ModuleFormProps {
  /** Dados iniciais do módulo (para edição) */
  initialData?: Partial<ModuleFormData>;
  /** Callback chamado ao submeter o formulário */
  onSubmit: (data: ModuleFormData) => Promise<void>;
  /** Callback chamado ao cancelar */
  onCancel?: () => void;
  /** Se o formulário está carregando */
  loading?: boolean;
  /** Título do formulário */
  title?: string;
  /** Texto do botão de submit */
  submitText?: string;
}

/**
 * Formulário para criar/editar módulos
 * Utiliza React Hook Form com validação Zod
 */
export function ModuleForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  title = 'Novo Módulo',
  submitText = 'Salvar Módulo'
}: ModuleFormProps) {
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema.pick({ title: true, description: true })),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || ''
    }
  });

  /**
   * Manipula o submit do formulário
   */
  const handleFormSubmit = async (data: ModuleFormData) => {
    try {
      await onSubmit(data);
      if (!initialData) {
        reset(); // Limpa o formulário apenas se for criação
      }
    } catch (error) {
      console.error('Erro ao salvar módulo:', error);
    }
  };

  /**
   * Conta caracteres do título
   */
  const titleLength = watch('title')?.length || 0;
  const descriptionLength = watch('description')?.length || 0;

  const isLoading = loading || isSubmitting;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Campo Título */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Título do Módulo *
            </Label>
            <Input
              id="title"
              placeholder="Ex: Introdução ao React"
              disabled={isLoading}
              {...register('title')}
              className={errors.title ? 'border-destructive' : ''}
            />
            <div className="flex justify-between items-center">
              {errors.title && (
                <Alert className="py-2">
                  <AlertDescription className="text-sm">
                    {errors.title.message}
                  </AlertDescription>
                </Alert>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {titleLength}/100 caracteres
              </span>
            </div>
          </div>

          {/* Campo Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição (Opcional)
            </Label>
            <Textarea
              id="description"
              placeholder="Descreva o conteúdo e objetivos deste módulo..."
              rows={4}
              disabled={isLoading}
              {...register('description')}
              className={errors.description ? 'border-destructive' : ''}
            />
            <div className="flex justify-between items-center">
              {errors.description && (
                <Alert className="py-2">
                  <AlertDescription className="text-sm">
                    {errors.description.message}
                  </AlertDescription>
                </Alert>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {descriptionLength}/500 caracteres
              </span>
            </div>
          </div>

          {/* Dicas de boas práticas */}
          <Alert>
            <AlertDescription className="text-sm">
              <strong>Dicas:</strong>
              <ul className="mt-2 space-y-1 text-xs">
                <li>• Use títulos claros e descritivos</li>
                <li>• Organize o conteúdo de forma lógica e progressiva</li>
                <li>• A descrição ajuda os alunos a entender o que aprenderão</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Botões de ação */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {submitText}
                </>
              )}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * Versão compacta do formulário para uso em modais
 */
export function CompactModuleForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false
}: Omit<ModuleFormProps, 'title' | 'submitText'>) {
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema.pick({ title: true, description: true })),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || ''
    }
  });

  const handleFormSubmit = async (data: ModuleFormData) => {
    try {
      await onSubmit(data);
      if (!initialData) {
        reset();
      }
    } catch (error) {
      console.error('Erro ao salvar módulo:', error);
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Campo Título */}
      <div className="space-y-2">
        <Label htmlFor="title">Título do Módulo *</Label>
        <Input
          id="title"
          placeholder="Ex: Introdução ao React"
          disabled={isLoading}
          {...register('title')}
          className={errors.title ? 'border-destructive' : ''}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Campo Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição (Opcional)</Label>
        <Textarea
          id="description"
          placeholder="Descreva o conteúdo deste módulo..."
          rows={3}
          disabled={isLoading}
          {...register('description')}
          className={errors.description ? 'border-destructive' : ''}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Botões de ação */}
      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar'
          )}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
