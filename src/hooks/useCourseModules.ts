import { useState, useCallback, useMemo } from 'react';
import { Module, Lesson, ModuleFormData, LessonFormData } from '../types/courseModules';
import ModulesApiService from '../services/modulesApi';

interface UseCourseModulesProps {
  initialModules: Module[];
  courseId: string;
  token: string;
  onModulesChange?: (modules: Module[]) => void;
}

interface UseCourseModulesReturn {
  modules: Module[];
  loading: boolean;
  error: string | null;
  
  // Métodos para módulos
  createModule: (data: ModuleFormData) => Promise<void>;
  updateModule: (moduleId: string, data: ModuleFormData) => Promise<void>;
  deleteModule: (moduleId: string) => Promise<void>;
  reorderModules: (newOrder: Module[]) => Promise<void>;
  
  // Métodos para aulas
  createLesson: (moduleId: string, data: LessonFormData) => Promise<void>;
  updateLesson: (moduleId: string, lessonId: string, data: LessonFormData) => Promise<void>;
  deleteLesson: (moduleId: string, lessonId: string) => Promise<void>;
  reorderLessons: (moduleId: string, newOrder: Lesson[]) => Promise<void>;
  
  // Utilidades
  getModuleById: (moduleId: string) => Module | undefined;
  getLessonById: (moduleId: string, lessonId: string) => Lesson | undefined;
  toggleModuleExpansion: (moduleId: string) => void;
}

export const useCourseModules = ({
  initialModules,
  courseId,
  token,
  onModulesChange
}: UseCourseModulesProps): UseCourseModulesReturn => {
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiService = useMemo(() => new ModulesApiService(token), [token]);

  // Atualiza o estado e notifica mudanças
  const updateModules = useCallback((newModules: Module[]) => {
    setModules(newModules);
    onModulesChange?.(newModules);
  }, [onModulesChange]);

  // Métodos para módulos
  const createModule = useCallback(async (data: ModuleFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newModule = await apiService.createModule(courseId, {
        ...data,
        order: modules.length,
        contents: []
      });
      
      updateModules([...modules, newModule]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar módulo');
    } finally {
      setLoading(false);
    }
  }, [modules, courseId, apiService, updateModules]);

  const updateModule = useCallback(async (moduleId: string, data: ModuleFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedModule = await apiService.updateModule(courseId, moduleId, data);
      
      updateModules(modules.map(m => 
        m.id === moduleId ? { ...m, ...updatedModule } : m
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar módulo');
    } finally {
      setLoading(false);
    }
  }, [modules, courseId, apiService, updateModules]);

  const deleteModule = useCallback(async (moduleId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await apiService.deleteModule(courseId, moduleId);
      
      updateModules(modules.filter(m => m.id !== moduleId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar módulo');
    } finally {
      setLoading(false);
    }
  }, [modules, courseId, apiService, updateModules]);

  const reorderModules = useCallback(async (newOrder: Module[]) => {
    setLoading(true);
    setError(null);
    
    try {
      // Atualiza a ordem dos módulos
      const updatedModules = newOrder.map((module, index) => ({
        ...module,
        order: index
      }));
      
      updateModules(updatedModules);
      
      // TODO: Implementar chamada API para persistir a ordem
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reordenar módulos');
    } finally {
      setLoading(false);
    }
  }, [updateModules]);

  // Métodos para aulas
  const createLesson = useCallback(async (moduleId: string, data: LessonFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const module = modules.find(m => m.id === moduleId);
      if (!module) throw new Error('Módulo não encontrado');
      
      const newLesson = await apiService.createLesson(
        courseId,
        moduleId,
        {
          ...data,
          order: module.contents.length,
          contents: []
        }
      );
      
      updateModules(modules.map(m => 
        m.id === moduleId 
          ? { ...m, contents: [...m.contents, newLesson] }
          : m
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar aula');
    } finally {
      setLoading(false);
    }
  }, [modules, courseId, apiService, updateModules]);

  const updateLesson = useCallback(async (moduleId: string, lessonId: string, data: LessonFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedLesson = await apiService.updateLesson(
        courseId,
        moduleId,
        lessonId,
        data
      );
      
      updateModules(modules.map(m => 
        m.id === moduleId 
          ? {
              ...m,
              contents: m.contents.map(l => 
                l.id === lessonId ? { ...l, ...updatedLesson } : l
              )
            }
          : m
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar aula');
    } finally {
      setLoading(false);
    }
  }, [modules, courseId, apiService, updateModules]);

  const deleteLesson = useCallback(async (moduleId: string, lessonId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await apiService.deleteLesson(courseId, moduleId, lessonId);
      
      updateModules(modules.map(m => 
        m.id === moduleId 
          ? { ...m, contents: m.contents.filter(l => l.id !== lessonId) }
          : m
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar aula');
    } finally {
      setLoading(false);
    }
  }, [modules, courseId, apiService, updateModules]);

  const reorderLessons = useCallback(async (moduleId: string, newOrder: Lesson[]) => {
    setLoading(true);
    setError(null);
    
    try {
      updateModules(modules.map(m => 
        m.id === moduleId 
          ? { ...m, contents: newOrder }
          : m
      ));
      
      // TODO: Implementar chamada API para persistir a ordem
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reordenar aulas');
    } finally {
      setLoading(false);
    }
  }, [modules, updateModules]);

  // Utilidades
  const getModuleById = useCallback((moduleId: string) => 
    modules.find(m => m.id === moduleId),
    [modules]
  );

  const getLessonById = useCallback((moduleId: string, lessonId: string) => {
    const module = modules.find(m => m.id === moduleId);
    return module?.contents.find(l => l.id === lessonId);
  }, [modules]);

  const toggleModuleExpansion = useCallback((moduleId: string) => {
    updateModules(modules.map(m => 
      m.id === moduleId 
        ? { ...m, isExpanded: !m.isExpanded }
        : m
    ));
  }, [modules, updateModules]);

  return {
    modules,
    loading,
    error,
    
    // Métodos para módulos
    createModule,
    updateModule,
    deleteModule,
    reorderModules,
    
    // Métodos para aulas
    createLesson,
    updateLesson,
    deleteLesson,
    reorderLessons,
    
    // Utilidades
    getModuleById,
    getLessonById,
    toggleModuleExpansion
  };
};
