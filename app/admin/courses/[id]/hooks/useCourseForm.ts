// Hook customizado para gerenciar o formulário de curso
import { useState, useEffect, useCallback } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Course, Module, Lesson } from '../types/course';

// Schema de validação
export const courseFormSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  price: z.number().min(0, 'Preço deve ser positivo'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  image: z.string().optional(),
  published: z.boolean().default(false),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  modules: z.array(z.object({
    id: z.string(),
    title: z.string().min(1, 'Título do módulo é obrigatório'),
    description: z.string().optional(),
    lessons: z.array(z.object({
      id: z.string(),
      title: z.string().min(1, 'Título da lição é obrigatória'),
      videoUrl: z.string().optional(),
      duration: z.number().default(0)
    }))
  }))
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
      
      // Mapear dados do curso para o formulário
      form.reset({
        title: course.title,
        description: course.description || '',
        price: course.price || 0,
        category: course.category || '',
        image: course.image || '',
        published: course.published || false,
        level: course.level || 'beginner',
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
