// Hook customizado para gerenciar o formulário de curso
import { useState, useEffect, useCallback } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Course, Module, Lesson } from '../types/course';

// Schema de validação aprimorado
export const courseFormSchema = z.object({
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
    .min(1, 'Categoria é obrigatória')
    .uuid('Categoria deve ser um UUID válido'),
  image: z.string()
    .url('URL da imagem deve ser válida')
    .refine(
      (url) => {
        if (!url) return true;
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        return imageExtensions.some(ext => url.toLowerCase().includes(ext));
      },
      { message: 'A imagem deve ter formato válido (jpg, jpeg, png, gif ou webp)' }
    )
    .optional()
    .or(z.literal('')),
  published: z.boolean().default(false),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
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
        .url('URL do vídeo deve ser válida')
        .refine(
          (url) => {
            if (!url) return true;
            const videoPlatforms = ['youtube.com', 'vimeo.com', 'youtu.be'];
            return videoPlatforms.some(platform => url.toLowerCase().includes(platform));
          },
          { message: 'URL deve ser do YouTube ou Vimeo' }
        )
        .optional()
        .or(z.literal('')),
      duration: z.number()
        .min(0, 'Duração deve ser positiva')
        .max(1440, 'Duração máxima é 24 horas (1440 minutos)')
        .default(0)
    }))
  }))
  .min(1, 'O curso deve ter pelo menos 1 módulo')
  .refine(
    (modules) => modules.every(module => module.lessons.length > 0),
    { message: 'Cada módulo deve ter pelo menos 1 lição' }
  )
});

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
  saveCourse: (data: CourseFormData) => Promise<void>;
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

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      category: '',
      image: '',
      published: false,
      level: 'beginner',
      modules: []
    }
  });

  // Carregar dados do curso
  const loadCourse = useCallback(async () => {
    if (!courseId || courseId === 'new') return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) throw new Error('Erro ao carregar curso');
      
      const course: Course = await response.json();
      
      console.log('Dados retornados pela API:', course);
      console.log('Descrição do curso:', course.description);
      
      // Mapear dados do curso para o formulário
      form.reset({
        title: course.title,
        description: course.description || '',
        price: course.price || 0,
        category: course.category?.id || '', // Usamos o ID da categoria
        image: course.thumbnail || '',
        published: course.status === 'PUBLISHED', // Mapeia status para published
        level: (course.level?.toLowerCase() as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
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
      });
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, onError]); // Removido 'form' das dependências

  // Salvar curso
  const saveCourse = useCallback(async (data: CourseFormData) => {
    setIsSaving(true);
    try {
      const url = courseId === 'new' ? '/api/courses' : `/api/courses/${courseId}`;
      const method = courseId === 'new' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Erro ao salvar curso');
      
      const savedCourse = await response.json();
      onSuccess?.(savedCourse);
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setIsSaving(false);
    }
  }, [courseId, onSuccess, onError]);

  // Upload de thumbnail
  const uploadThumbnail = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Erro ao fazer upload');
    
    const { url } = await response.json();
    return url;
  }, []);

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

  // Carregar curso ao montar
  useEffect(() => {
    loadCourse();
  }, [courseId]); // Mudado de [loadCourse] para [courseId]

  return {
    form,
    isLoading,
    isSaving,
    saveCourse,
    uploadThumbnail,
    addModule,
    removeModule,
    addLesson,
    removeLesson
  };
}
