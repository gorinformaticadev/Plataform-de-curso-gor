import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Module, Lesson, ModuleFormData, LessonFormData, ReorderItem } from '../types/module.types';
import { moduleService, lessonService, uploadService } from '../services/moduleService';
import { toast } from 'sonner';

// Hook para gerenciar módulos
export const useModules = (courseId: string) => {
  const queryClient = useQueryClient();

  // Buscar módulos
  const { data: modules = [], isLoading, error } = useQuery({
    queryKey: ['modules', courseId],
    queryFn: () => moduleService.getModulesByCourse(courseId),
    enabled: !!courseId,
  });

  // Criar módulo
  const createModuleMutation = useMutation({
    mutationFn: (data: ModuleFormData) => moduleService.createModule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules', courseId] });
      toast.success('Módulo criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar módulo:', error);
      toast.error('Erro ao criar módulo');
    },
  });

  // Atualizar módulo
  const updateModuleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ModuleFormData> }) =>
      moduleService.updateModule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules', courseId] });
      toast.success('Módulo atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar módulo:', error);
      toast.error('Erro ao atualizar módulo');
    },
  });

  // Deletar módulo
  const deleteModuleMutation = useMutation({
    mutationFn: (moduleId: string) => moduleService.deleteModule(moduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules', courseId] });
      toast.success('Módulo deletado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao deletar módulo:', error);
      toast.error('Erro ao deletar módulo');
    },
  });

  // Reordenar módulos
  const reorderModulesMutation = useMutation({
    mutationFn: (reorderData: ReorderItem[]) =>
      moduleService.reorderModules(courseId, reorderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules', courseId] });
      toast.success('Ordem dos módulos atualizada!');
    },
    onError: (error) => {
      console.error('Erro ao reordenar módulos:', error);
      toast.error('Erro ao reordenar módulos');
    },
  });

  return {
    modules,
    isLoading,
    error,
    createModule: createModuleMutation.mutate,
    updateModule: updateModuleMutation.mutate,
    deleteModule: deleteModuleMutation.mutate,
    reorderModules: reorderModulesMutation.mutate,
    isCreating: createModuleMutation.isPending,
    isUpdating: updateModuleMutation.isPending,
    isDeleting: deleteModuleMutation.isPending,
    isReordering: reorderModulesMutation.isPending,
  };
};

// Hook para gerenciar aulas
export const useLessons = (moduleId: string) => {
  const queryClient = useQueryClient();

  // Buscar aulas
  const { data: lessons = [], isLoading, error } = useQuery({
    queryKey: ['lessons', moduleId],
    queryFn: () => lessonService.getLessonsByModule(moduleId),
    enabled: !!moduleId,
  });

  // Criar aula
  const createLessonMutation = useMutation({
    mutationFn: (data: LessonFormData) => lessonService.createLesson(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', moduleId] });
      toast.success('Aula criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar aula:', error);
      toast.error('Erro ao criar aula');
    },
  });

  // Atualizar aula
  const updateLessonMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LessonFormData> }) =>
      lessonService.updateLesson(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', moduleId] });
      toast.success('Aula atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar aula:', error);
      toast.error('Erro ao atualizar aula');
    },
  });

  // Deletar aula
  const deleteLessonMutation = useMutation({
    mutationFn: (lessonId: string) => lessonService.deleteLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', moduleId] });
      toast.success('Aula deletada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao deletar aula:', error);
      toast.error('Erro ao deletar aula');
    },
  });

  // Reordenar aulas
  const reorderLessonsMutation = useMutation({
    mutationFn: (reorderData: ReorderItem[]) =>
      lessonService.reorderLessons(moduleId, reorderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', moduleId] });
      toast.success('Ordem das aulas atualizada!');
    },
    onError: (error) => {
      console.error('Erro ao reordenar aulas:', error);
      toast.error('Erro ao reordenar aulas');
    },
  });

  return {
    lessons,
    isLoading,
    error,
    createLesson: createLessonMutation.mutate,
    updateLesson: updateLessonMutation.mutate,
    deleteLesson: deleteLessonMutation.mutate,
    reorderLessons: reorderLessonsMutation.mutate,
    isCreating: createLessonMutation.isPending,
    isUpdating: updateLessonMutation.isPending,
    isDeleting: deleteLessonMutation.isPending,
    isReordering: reorderLessonsMutation.isPending,
  };
};

// Hook para upload de arquivos
export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const url = await uploadService.uploadVideo(file);
      toast.success('Arquivo enviado com sucesso!');
      return url;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload do arquivo');
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { uploadFile, isUploading };
};
