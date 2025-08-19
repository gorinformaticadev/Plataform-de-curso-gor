import { useState, useCallback } from 'react';
import { Content, ContentFormData } from '../types/course.types';
import { contentSchema } from '../utils/validation';

interface UseContentManagerProps {
  initialContent?: Content[];
  onContentChange?: (content: Content[]) => void;
}

interface UseContentManagerReturn {
  content: Content[];
  addContent: (lessonId: string, data: ContentFormData) => Promise<Content>;
  updateContent: (id: string, data: ContentFormData) => Promise<Content>;
  deleteContent: (id: string) => Promise<void>;
  reorderContent: (lessonId: string, startIndex: number, endIndex: number) => void;
  isLoading: boolean;
  error: string | null;
}

export const useContentManager = ({
  initialContent = [],
  onContentChange,
}: UseContentManagerProps): UseContentManagerReturn => {
  const [content, setContent] = useState<Content[]>(initialContent);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateId = () => `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addContent = useCallback(async (lessonId: string, data: ContentFormData): Promise<Content> => {
    setIsLoading(true);
    setError(null);

    try {
      const validatedData = contentSchema.parse(data);

      const newContent: Content = {
        id: generateId(),
        lessonId,
        type: validatedData.type,
        title: validatedData.title,
        content: validatedData.content,
        fileUrl: validatedData.fileUrl,
        order: content.filter(c => c.lessonId === lessonId).length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedContent = [...content, newContent];
      setContent(updatedContent);
      onContentChange?.(updatedContent);

      return newContent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar conteúdo');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [content, onContentChange]);

  const updateContent = useCallback(async (id: string, data: ContentFormData): Promise<Content> => {
    setIsLoading(true);
    setError(null);

    try {
      const validatedData = contentSchema.parse(data);
      
      const updatedContent = content.map(item =>
        item.id === id
          ? {
              ...item,
              ...validatedData,
              updatedAt: new Date().toISOString(),
            }
          : item
      );

      setContent(updatedContent);
      onContentChange?.(updatedContent);

      const updatedItem = updatedContent.find(c => c.id === id);
      if (!updatedItem) throw new Error('Conteúdo não encontrado');
      
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar conteúdo');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [content, onContentChange]);

  const deleteContent = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const contentToDelete = content.find(c => c.id === id);
      if (!contentToDelete) throw new Error('Conteúdo não encontrado');

      const updatedContent = content.filter(item => item.id !== id);
      
      // Reordenar conteúdo da mesma aula
      const reorderedContent = updatedContent.map(item => {
        if (item.lessonId === contentToDelete.lessonId && item.order > contentToDelete.order) {
          return { ...item, order: item.order - 1 };
        }
        return item;
      });

      setContent(reorderedContent);
      onContentChange?.(reorderedContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar conteúdo');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [content, onContentChange]);

  const reorderContent = useCallback((lessonId: string, startIndex: number, endIndex: number) => {
    const lessonContent = content.filter(c => c.lessonId === lessonId);
    const otherContent = content.filter(c => c.lessonId !== lessonId);

    const newLessonContent = Array.from(lessonContent);
    const [removed] = newLessonContent.splice(startIndex, 1);
    newLessonContent.splice(endIndex, 0, removed);

    const reorderedLessonContent = newLessonContent.map((item, index) => ({
      ...item,
      order: index,
    }));

    const updatedContent = [...otherContent, ...reorderedLessonContent];
    setContent(updatedContent);
    onContentChange?.(updatedContent);
  }, [content, onContentChange]);

  return {
    content,
    addContent,
    updateContent,
    deleteContent,
    reorderContent,
    isLoading,
    error,
  };
};
