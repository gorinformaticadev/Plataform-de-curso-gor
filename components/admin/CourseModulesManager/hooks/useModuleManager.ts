import { useState, useCallback } from 'react';
import { Module, ModuleFormData } from '../types/course.types';
import { moduleSchema } from '../utils/validation';

interface UseModuleManagerProps {
  initialModules?: Module[];
  onModulesChange?: (modules: Module[]) => void;
}

interface UseModuleManagerReturn {
  modules: Module[];
  addModule: (data: ModuleFormData) => Promise<Module>;
  updateModule: (id: string, data: ModuleFormData) => Promise<Module>;
  deleteModule: (id: string) => Promise<void>;
  reorderModules: (startIndex: number, endIndex: number) => void;
  isLoading: boolean;
  error: string | null;
}

export const useModuleManager = ({
  initialModules = [],
  onModulesChange,
}: UseModuleManagerProps): UseModuleManagerReturn => {
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateId = () => `module_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addModule = useCallback(async (data: ModuleFormData): Promise<Module> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validar dados com Zod
      const validatedData = moduleSchema.parse(data);

      const newModule: Module = {
        id: generateId(),
        title: validatedData.title,
        description: validatedData.description,
        order: modules.length,
        isPublished: false,
        lessons: [],
        totalDuration: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedModules = [...modules, newModule];
      setModules(updatedModules);
      onModulesChange?.(updatedModules);

      return newModule;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar módulo');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [modules, onModulesChange]);

  const updateModule = useCallback(async (id: string, data: ModuleFormData): Promise<Module> => {
    setIsLoading(true);
    setError(null);

    try {
      const validatedData = moduleSchema.parse(data);
      
      const updatedModules = modules.map(module =>
        module.id === id
          ? {
              ...module,
              ...validatedData,
              updatedAt: new Date().toISOString(),
            }
          : module
      );

      setModules(updatedModules);
      onModulesChange?.(updatedModules);

      const updatedModule = updatedModules.find(m => m.id === id);
      if (!updatedModule) throw new Error('Módulo não encontrado');
      
      return updatedModule;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar módulo');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [modules, onModulesChange]);

  const deleteModule = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedModules = modules.filter(module => module.id !== id);
      
      // Reordenar módulos após exclusão
      const reorderedModules = updatedModules.map((module, index) => ({
        ...module,
        order: index,
      }));

      setModules(reorderedModules);
      onModulesChange?.(reorderedModules);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar módulo');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [modules, onModulesChange]);

  const reorderModules = useCallback((startIndex: number, endIndex: number) => {
    const newModules = Array.from(modules);
    const [removed] = newModules.splice(startIndex, 1);
    newModules.splice(endIndex, 0, removed);

    const reorderedModules = newModules.map((module, index) => ({
      ...module,
      order: index,
    }));

    setModules(reorderedModules);
    onModulesChange?.(reorderedModules);
  }, [modules, onModulesChange]);

  return {
    modules,
    addModule,
    updateModule,
    deleteModule,
    reorderModules,
    isLoading,
    error,
  };
};
