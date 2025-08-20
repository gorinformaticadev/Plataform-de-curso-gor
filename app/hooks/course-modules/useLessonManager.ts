import { useState, useCallback } from 'react';
import { Lesson, lessonSchema } from '../../schemas/course';
import { z } from 'zod';

interface UseLessonManagerProps {
  moduleId: string;
  initialLessons?: Lesson[];
  onLessonsChange?: (lessons: Lesson[]) => void;
}

interface UseLessonManagerReturn {
  lessons: Lesson[];
  addLesson: (lesson: Omit<Lesson, 'id' | 'order'>) => Promise<Lesson>;
  updateLesson: (id: string, updates: Partial<Lesson>) => Promise<Lesson>;
  deleteLesson: (id: string) => Promise<void>;
  reorderLessons: (startIndex: number, endIndex: number) => void;
  duplicateLesson: (id: string) => Promise<Lesson>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook customizado para gerenciar aulas de um módulo
 * @param moduleId - ID do módulo pai
 * @param initialLessons - Aulas iniciais
 * @param onLessonsChange - Callback quando aulas mudam
 * @returns Objeto com métodos e estados das aulas
 */
export function useLessonManager({
  moduleId,
  initialLessons = [],
  onLessonsChange
}: UseLessonManagerProps): UseLessonManagerReturn {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Adiciona uma nova aula
   */
  const addLesson = useCallback(async (lessonData: Omit<Lesson, 'id' | 'order'>): Promise<Lesson> => {
    setLoading(true);
    setError(null);

    try {
      // Valida os dados da aula
      const validatedData = lessonSchema.parse({
        ...lessonData,
        id: crypto.randomUUID(),
        order: lessons.length,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const newLesson: Lesson = {
        ...validatedData,
        id: crypto.randomUUID(),
        order: lessons.length
      };

      const updatedLessons = [...lessons, newLesson];
      setLessons(updatedLessons);
      onLessonsChange?.(updatedLessons);
      
      return newLesson;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0]?.message || 'Erro de validação');
      } else {
        setError('Erro ao adicionar aula');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [lessons, onLessonsChange]);

  /**
   * Atualiza uma aula existente
   */
  const updateLesson = useCallback(async (id: string, updates: Partial<Lesson>): Promise<Lesson> => {
    setLoading(true);
    setError(null);

    try {
      const updatedLessons = lessons.map(lesson => 
        lesson.id === id 
          ? { ...lesson, ...updates, updatedAt: new Date() } 
          : lesson
      );
      
      setLessons(updatedLessons);
      onLessonsChange?.(updatedLessons);
      
      const updatedLesson = updatedLessons.find(l => l.id === id);
      if (!updatedLesson) throw new Error('Aula não encontrada');
      
      return updatedLesson;
    } catch (err) {
      setError('Erro ao atualizar aula');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [lessons, onLessonsChange]);

  /**
   * Remove uma aula
   */
  const deleteLesson = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const updatedLessons = lessons
        .filter(lesson => lesson.id !== id)
        .map((lesson, index) => ({ ...lesson, order: index }));
      
      setLessons(updatedLessons);
      onLessonsChange?.(updatedLessons);
    } catch (err) {
      setError('Erro ao remover aula');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [lessons, onLessonsChange]);

  /**
   * Reordena as aulas
   */
  const reorderLessons = useCallback((startIndex: number, endIndex: number) => {
    const newLessons = Array.from(lessons);
    const [removed] = newLessons.splice(startIndex, 1);
    newLessons.splice(endIndex, 0, removed);
    
    const reorderedLessons = newLessons.map((lesson, index) => ({
      ...lesson,
      order: index,
      updatedAt: new Date()
    }));
    
    setLessons(reorderedLessons);
    onLessonsChange?.(reorderedLessons);
  }, [lessons, onLessonsChange]);

  /**
   * Duplica uma aula existente
   */
  const duplicateLesson = useCallback(async (id: string): Promise<Lesson> => {
    setLoading(true);
    setError(null);

    try {
      const originalLesson = lessons.find(l => l.id === id);
      if (!originalLesson) throw new Error('Aula não encontrada');

      const duplicatedLesson: Lesson = {
        ...originalLesson,
        id: crypto.randomUUID(),
        title: `${originalLesson.title} (Cópia)`,
        order: lessons.length,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Duplicar conteúdos com novos IDs
        contents: originalLesson.contents.map(content => ({
          ...content,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      };

      const updatedLessons = [...lessons, duplicatedLesson];
      setLessons(updatedLessons);
      onLessonsChange?.(updatedLessons);
      
      return duplicatedLesson;
    } catch (err) {
      setError('Erro ao duplicar aula');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [lessons, onLessonsChange]);

  return {
    lessons,
    addLesson,
    updateLesson,
    deleteLesson,
    reorderLessons,
    duplicateLesson,
    loading,
    error
  };
}
