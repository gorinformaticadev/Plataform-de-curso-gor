'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LessonFormData } from '@/app/types/course';
import { lessonSchema } from '@/app/schemas/course';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, X, Clock } from 'lucide-react';

interface LessonFormProps {
  /** Dados iniciais da aula (para edição) */
  initialData?: Partial<LessonFormData>;
  /** Callback chamado ao submeter o formulário */
  onSubmit: (data: LessonFormData) => Promise<void>;
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
 * Formulário para criar/editar aulas
 * Utiliza React Hook Form com validação Zod
 */
export function LessonForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  title = 'Nova Aula',
  submitText = 'Salvar Aula'
}: LessonFormProps) {
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema.pick({ 
      title: true, 
      description: true, 
      duration: true 
    })),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      duration: initialData?.duration || 0
    }
  });

  /**
   * Manipula o submit do formulário
   */
  const handleFormSubmit = async (data: LessonFormData) => {
    try {
      // Converte duração para número
      const formattedData = {
        ...data,
        duration: data.duration ? Number(data.duration) : undefined
      };
      
      await onSubmit(formattedData);
      if (!initialData) {
        reset(); // Limpa o formulário apenas se for criação
      }
    } catch (error) {
      console.error('Erro ao salvar aula:', error);
    }
  };

  /**
   * Conta caracteres dos campos
   */
  const titleLength = watch('title')?.length || 0;
  const descriptionLength = watch('description')?.length || 0;
  const duration = watch('duration') || 0;

  /**
   * Formata duração em minutos para exibição
   */
  const formatDurationDisplay = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} minutos`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours}h ${remainingMinutes}min` 
      : `${hours} hora${hours > 1 ? 's' : ''}`;
  };

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
              Título da Aula *
            </Label>
            <Input
              id="title"
              placeholder="Ex: Criando seu primeiro componente"
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
              placeholder="Descreva o que será abordado nesta aula..."
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

          {/* Campo Duração */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Duração Estimada (minutos)
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                id="duration"
                type="number"
                min="0"
                max="600"
                placeholder="0"
                disabled={isLoading}
                {...register('duration', { valueAsNumber: true })}
                className={`max-w-32 ${errors.duration ? 'border-destructive' : ''}`}
              />
              {duration > 0 && (
                <span className="text-sm text-muted-foreground">
                  = {formatDurationDisplay(Number(duration))}
                </span>
              )}
            </div>
            {errors.duration && (
              <Alert className="py-2">
                <AlertDescription className="text-sm">
                  {errors.duration.message}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Dicas de boas práticas */}
          <Alert>
            <AlertDescription className="text-sm">
              <strong>Dicas:</strong>
              <ul className="mt-2 space-y-1 text-xs">
                <li>• Use títulos específicos que indiquem o que será aprendido</li>
                <li>• A duração ajuda os alunos a se organizarem</li>
                <li>• Mantenha aulas entre 5-20 minutos para melhor engajamento</li>
                <li>• A descrição deve destacar os principais pontos da aula</li>
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
export function CompactLessonForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false
}: Omit<LessonFormProps, 'title' | 'submitText'>) {
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema.pick({ 
      title: true, 
      description: true, 
      duration: true 
    })),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      duration: initialData?.duration || 0
    }
  });

  const handleFormSubmit = async (data: LessonFormData) => {
    try {
      const formattedData = {
        ...data,
        duration: data.duration ? Number(data.duration) : undefined
      };
      
      await onSubmit(formattedData);
      if (!initialData) {
        reset();
      }
    } catch (error) {
      console.error('Erro ao salvar aula:', error);
    }
  };

  const duration = watch('duration') || 0;
  const isLoading = loading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Campo Título */}
      <div className="space-y-2">
        <Label htmlFor="title">Título da Aula *</Label>
        <Input
          id="title"
          placeholder="Ex: Criando seu primeiro componente"
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
          placeholder="Descreva o conteúdo desta aula..."
          rows={3}
          disabled={isLoading}
          {...register('description')}
          className={errors.description ? 'border-destructive' : ''}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Campo Duração */}
      <div className="space-y-2">
        <Label htmlFor="duration" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Duração (minutos)
        </Label>
        <Input
          id="duration"
          type="number"
          min="0"
          max="600"
          placeholder="0"
          disabled={isLoading}
          {...register('duration', { valueAsNumber: true })}
          className={errors.duration ? 'border-destructive' : ''}
        />
        {errors.duration && (
          <p className="text-sm text-destructive">{errors.duration.message}</p>
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
