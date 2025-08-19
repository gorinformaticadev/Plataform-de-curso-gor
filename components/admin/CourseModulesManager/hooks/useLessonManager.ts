import { useState, useCallback } from 'react';
import { Lesson, LessonFormData } from '../types/course.types';
import { lessonSchema } from '../utils/validation';

interface UseLessonManagerProps {
  initialLessons?: Lesson[];
  onLessonsChange?: (lessons: Lesson[]) => void;
}

interface UseLessonManagerReturn {
  lessons: Lesson[];
  addLesson: (moduleId: string, data: LessonFormData) => Promise<Lesson>;
  updateLesson: (id: string, data: LessonFormData) => Promise<Lesson>;
  deleteLesson: (id: string) => Promise<void>;
  reorderLessons: (moduleId: string, startIndex: number, endIndex: number) => void;
  isLoading: boolean;
  error: string | null;
}

export const useLessonManager = ({
  initialLessons = [],
  onLessonsChange,
}: UseLessonManagerProps): UseLessonManagerReturn => {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateId = () => `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addLesson = useCallback(async (moduleId: string, data: LessonFormData): Promise<Lesson> => {
    setIsLoading(true);
    setError(null);

    try {
      const validatedData = lessonSchema.parse(data);

      const newLesson: Lesson = {
        id: generateId(),
        moduleId,
        title: validatedData.title,
        description: validatedData.description,
        order: lessons.filter(l => l.moduleId === moduleId).length,
        isPublished: false,
        content: [],
        duration: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedLessons = [...lessons, newLesson];
      setLessons(updatedLessons);
      onLessonsChange?.(updatedLessons);

      return newLesson;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar aula');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [lessons, onLessonsChange]);

  const updateLesson = useCallback(async (id: string, data: LessonFormData): Promise<Lesson> => {
    setIsLoading(true);
    setError(null);

    try {
      const validatedData = lessonSchema.parse(data);
      
      const updatedLessons = lessons.map(lesson =>
        lesson.id === id
          ? {
              ...lesson,
              ...validatedData,
              updatedAt: new Date().toISOString(),
            }
          : lesson
      );

      setLessons(updatedLessons);
      onLessonsChange?.(updatedLessons);

      const updatedLesson = updatedLessons.find(l => l.id === id);
      if (!updatedLesson) throw new Error('Aula não encontrada');
      
      return updatedLesson;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar aula');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [lessons, onLessonsChange]);

  const deleteLesson = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const lessonToDelete = lessons.find(l => l.id === id);
      if (!lessonToDelete) throw new Error('Aula não encontrada');

      const updatedLessons = lessons.filter(lesson => lesson.id !== id);
      
      // Reordenar aulas do mesmo módulo
      const reorderedLessons = updatedLessons.map(lesson => {
        if (lesson.moduleId === lessonToDelete.moduleId && lesson.order > lessonToDelete.order) {
          return { ...lesson, order: lesson.order - 1 };
        }
        return lesson;
      });

      setLessons(reorderedLessons);
      onLessonsChange?.(reorderedLessons);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar aula');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [lessons, onLessonsChange]);

  const reorderLessons = useCallback((moduleId: string, startIndex: number, endIndex: number) => {
    const moduleLessons = lessons.filter(l => l.moduleId === moduleId);
    const otherLessons = lessons.filter(l => l.moduleId !== moduleId);

    const newModuleLessons = Array.from(moduleLessons);
    const [removed] = newModuleLessons.splice(startIndex, 1);
    newModuleLessons.splice(endIndex, 0, removed);

    const reorderedModuleLessons = newModuleLessons.map((lesson, index) => ({
      ...lesson,
      order: index,
    }));

    const updatedLessons = [...otherLessons, ...reorderedModuleLessons];
    setLessons(updatedLessons);
    onLessonsChange?.(updatedLessons);
  }, [lessons, onLessonsChange]);

  return {
    lessons,
    addLesson,
    updateLesson,
    deleteLesson,
    reorderLessons,
    isLoading,
    error,
  };
};
