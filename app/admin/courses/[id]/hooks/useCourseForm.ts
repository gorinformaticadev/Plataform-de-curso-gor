// Hook customizado para gerenciar o formulário de curso
import { useState, useEffect, useCallback } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Course } from '../types/course';
import { useCategories } from '@/app/admin/categories/categories.service';
import { useAuth } from '@/contexts/auth-context';
import { ImageUrlBuilder } from '@/lib/image-config';

// O componente CategorySelect agora trabalha diretamente com UUIDs das categorias
// Não é mais necessário mapear entre UUIDs e valores

// Schema de validação para rascunho (menos restritivo)
const courseFormSchemaDraft = z.object({
  title: z.string()
    .min(1, 'Título é obrigatório')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  description: z.string()
    .optional()
    .or(z.literal('')),
  price: z.number()
    .min(0, 'Preço deve ser positivo')
    .max(9999.99, 'Preço máximo é R$ 9.999,99')
    .multipleOf(0.01, 'Preço deve ter no máximo 2 casas decimais')
    .optional(),
  category: z.string()
    .optional()
    .or(z.literal('')),
  thumbnail: z.string()
    .refine(
      (value) => !value || ImageUrlBuilder.validateImageUrl(value),
      'URL da imagem inválida'
    )
    .optional()
    .or(z.literal('')),
  published: z.boolean().default(false),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  duration: z.number()
    .min(0, 'Duração deve ser positiva')
    .max(10080, 'Duração máxima é 1 semana (10.080 minutos)')
    .optional()
    .or(z.literal(0)),
  modules: z.array(z.object({
    id: z.string(),
    title: z.string().optional().or(z.literal('')),
    description: z.string().optional().or(z.literal('')),
    lessons: z.array(z.object({
      id: z.string(),
      title: z.string().optional().or(z.literal('')),
      videoUrl: z.string().optional().or(z.literal('')),
      duration: z.number().optional().default(0)
    })).optional().default([])
  })).optional().default([])
});

// Schema de validação para publicação (completo e rigoroso)
const courseFormSchemaPublished = z.object({
  title: z.string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  description: z.string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres'),
  price: z.number()
    .min(0, 'Preço deve ser positivo')
    .max(9999.99, 'Preço máximo é R$ 9.999,99')
    .multipleOf(0.01, 'Preço deve ter no máximo 2 casas decimais'),
  category: z.string()
    .min(1, 'Categoria é obrigatória'),
  thumbnail: z.string()
    .refine(
      (value) => !value || ImageUrlBuilder.validateImageUrl(value),
      'URL da imagem inválida'
    )
    .optional()
    .or(z.literal('')),
  published: z.boolean().default(false),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  duration: z.number()
    .min(0, 'Duração deve ser positiva')
    .max(10080, 'Duração máxima é 1 semana (10.080 minutos)')
    .optional()
    .or(z.literal(0)),
  modules: z.array(z.object({
    id: z.string(),
    title: z.string()
      .min(1, 'Título do módulo é obrigatório')
      .max(100, 'Título do módulo deve ter no máximo 100 caracteres'),
    description: z.string()
      .max(500, 'Descrição do módulo deve ter no máximo 500 caracteres')
      .optional()
      .or(z.literal('')),
    lessons: z.array(z.object({
      id: z.string(),
      title: z.string()
        .min(1, 'Título da lição é obrigatória')
        .max(200, 'Título da lição deve ter no máximo 200 caracteres'),
      videoUrl: z.string()
        .refine(
          (url) => {
            if (!url) return true;
            try {
              new URL(url);
              const videoPlatforms = ['youtube.com', 'vimeo.com', 'youtu.be'];
              return videoPlatforms.some(platform => url.toLowerCase().includes(platform));
            } catch {
              return false;
            }
          },
          { message: 'URL deve ser válida e do YouTube ou Vimeo' }
        )
        .optional()
        .or(z.literal('')),
      duration: z.number()
        .min(0, 'Duração deve ser positiva')
        .max(1440, 'Duração máxima é 24 horas (1440 minutos)')
        .default(0)
    }))
    .min(1, 'Cada módulo deve ter pelo menos 1 lição')
  }))
  .min(1, 'Curso publicado deve ter pelo menos 1 módulo')
});

// Schema de validação aprimorado
// Schema principal usado no formulário (permissivo para edição)
export const courseFormSchema = courseFormSchemaDraft;

export type CourseFormData = z.infer<typeof courseFormSchema>;

interface UseCourseFormProps {
  courseId: string;
  onSuccess?: (data: CourseFormData) => void;
  onError?: (error: Error) => void;
}

interface UseCourseFormReturn {
  form: UseFormReturn<CourseFormData>;
  isLoading: boolean;
  isSaving: boolean;
  isTogglingStatus: boolean;
  saveCourse: (data: CourseFormData) => Promise<void>;
  toggleCourseStatus: (newStatus: boolean) => Promise<void>;
  uploadThumbnail: (file: File) => Promise<string>;
  addModule: () => void;
  removeModule: (index: number) => void;
  addLesson: (moduleIndex: number) => void;
  removeLesson: (moduleIndex: number, lessonIndex: number) => void;
}

export function useCourseForm({
  courseId,
  onSuccess,
  onError
}: UseCourseFormProps): UseCourseFormReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const { token } = useAuth();
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2/api';

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      category: '',
      thumbnail: '',
      published: false,
      level: 'BEGINNER',
      duration: 0,
      modules: []
    }
  });

  // Carregar dados do curso com limpeza adequada - APENAS UMA VEZ
  const loadCourse = useCallback(async () => {
    if (!courseId || courseId === 'new') {
      // Limpar formulário para novos cursos
      form.reset({
        title: '',
        description: '',
        price: 0,
        category: '',
        thumbnail: '',
        published: false,
        level: 'BEGINNER',
        duration: 0,
        modules: []
      });
      setIsInitialized(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Erro ao carregar curso');
      
      const course: Course = await response.json();
      
      console.log('Dados retornados pela API:', course);
      console.log('CourseId atual:', courseId);
      console.log('Thumbnail do curso (API):', course.thumbnail);
      
      // Mapear dados do curso para o formulário com URLs de imagem padronizadas
      const formData = {
        title: course.title,
        description: course.description || '',
        price: course.price || 0,
        category: course.category?.id || '',
        thumbnail: course.thumbnail ? ImageUrlBuilder.buildImageUrl(course.thumbnail) : '',
        published: course.status === 'PUBLISHED',
        level: course.level,
        duration: course.duration || 0,
        modules: course.modules?.map(module => ({
          id: module.id,
          title: module.title,
          description: module.description || '',
          lessons: module.lessons?.map(lesson => ({
            id: lesson.id,
            title: lesson.title,
            videoUrl: lesson.videoUrl || '',
            duration: lesson.duration || 0
          })) || []
        })) || []
      };
      
      console.log('Dados mapeados para o formulário:', formData);
      console.log('Thumbnail no formulário:', formData.thumbnail);
      
      // Reset completo do formulário com novos dados APENAS na primeira vez
      form.reset(formData);
      setIsInitialized(true);
    } catch (error) {
      console.error('Erro ao carregar curso:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, token, API_URL, onError]);


  // Salvar dados do curso (sem alterar status)
  const saveCourse = useCallback(async (data: CourseFormData) => {
    setIsSaving(true);
    try {
      // Validar apenas com schema de rascunho - permite salvar com dados incompletos
      const validatedData = courseFormSchemaDraft.parse(data);
      
      console.log('Dados enviados para API:', validatedData);
      
      // Mapear published boolean para status enum
      const payload = {
        ...validatedData,
        status: validatedData.published ? 'PUBLISHED' : 'DRAFT'
      };
      
      // Remover o campo published do payload
      delete (payload as any).published;
      
      const url = courseId === 'new' ? `${API_URL}/courses` : `${API_URL}/courses/${courseId}`;
      const method = courseId === 'new' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Erro ao salvar curso');
      
      const savedCourse = await response.json();
      onSuccess?.(savedCourse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Converter erros de validação Zod em mensagem de erro amigável
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        onError?.(new Error(`Erro de validação: ${errorMessages}`));
      } else {
        onError?.(error as Error);
      }
    } finally {
      setIsSaving(false);
    }
  }, [courseId, API_URL, token, onSuccess, onError]);

  // Alternar status do curso (publicar/despublicar)
  const toggleCourseStatus = useCallback(async (newStatus: boolean) => {
    if (courseId === 'new') {
      onError?.(new Error('Não é possível alterar status de curso não salvo'));
      return;
    }

    setIsTogglingStatus(true);
    try {
      // Se estiver publicando, validar com schema rigoroso
      if (newStatus) {
        const currentData = form.getValues();
        const validatedData = courseFormSchemaPublished.parse(currentData);
        console.log('Dados validados para publicação:', validatedData);
      }
      
      // Usar o endpoint PATCH normal, mas enviar apenas o status
      const response = await fetch(`${API_URL}/courses/${courseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          status: newStatus ? 'PUBLISHED' : 'DRAFT' 
        })
      });

      if (!response.ok) throw new Error('Erro ao alterar status do curso');
      
      // Atualizar o estado local
      form.setValue('published', newStatus);
      
      const savedCourse = await response.json();
      onSuccess?.(savedCourse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Converter erros de validação Zod em mensagem de erro amigável
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        onError?.(new Error(`Erro de validação para publicação: ${errorMessages}`));
      } else {
        onError?.(error as Error);
      }
    } finally {
      setIsTogglingStatus(false);
    }
  }, [courseId, API_URL, token, form, onSuccess, onError]);

  // Upload de thumbnail com validação aprimorada
  const uploadThumbnail = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file); // Corrigir: backend espera 'file', não 'image'

    const response = await fetch(`${API_URL}/uploads/course-thumbnail`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData
    });

    if (!response.ok) throw new Error('Erro ao fazer upload');
    
    const { url } = await response.json();
    // Garantir que a URL seja construída corretamente
    return ImageUrlBuilder.buildImageUrl(url) || url;
  }, [API_URL, token]);

  // Gerenciar módulos
  const addModule = useCallback(() => {
    const currentModules = form.getValues('modules');
    form.setValue('modules', [
      ...currentModules,
      {
        id: `module-${Date.now()}`,
        title: '',
        description: '',
        lessons: []
      }
    ]);
  }, [form]);

  const removeModule = useCallback((index: number) => {
    const currentModules = form.getValues('modules');
    form.setValue('modules', currentModules.filter((_, i) => i !== index));
  }, [form]);

  // Gerenciar lições
  const addLesson = useCallback((moduleIndex: number) => {
    const currentModules = form.getValues('modules');
    const newModules = [...currentModules];
    
    newModules[moduleIndex].lessons.push({
      id: `lesson-${Date.now()}`,
      title: '',
      videoUrl: '',
      duration: 0
    });
    
    form.setValue('modules', newModules);
  }, [form]);

  const removeLesson = useCallback((moduleIndex: number, lessonIndex: number) => {
    const currentModules = form.getValues('modules');
    const newModules = [...currentModules];
    
    newModules[moduleIndex].lessons = newModules[moduleIndex].lessons.filter(
      (_, i) => i !== lessonIndex
    );
    
    form.setValue('modules', newModules);
  }, [form]);

  // Effect para carregar dados APENAS UMA VEZ quando courseId muda
  useEffect(() => {
    if (!isInitialized && courseId) {
      loadCourse();
    }
  }, [courseId, isInitialized, loadCourse]);

  // Reset do estado de inicialização quando courseId muda
  useEffect(() => {
    setIsInitialized(false);
  }, [courseId]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      // Limpar estado de inicialização ao desmontar
      setIsInitialized(false);
    };
  }, []);

  return {
    form,
    isLoading,
    isSaving,
    isTogglingStatus,
    saveCourse,
    toggleCourseStatus,
    uploadThumbnail,
    addModule,
    removeModule,
    addLesson,
    removeLesson
  };
}
