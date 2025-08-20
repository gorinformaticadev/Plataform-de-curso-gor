import { useState, useCallback } from 'react';
import { Module, moduleSchema } from '../../schemas/course';
import { z } from 'zod';

interface UseModuleManagerProps {
  initialModules?: Module[];
  onModulesChange?: (modules: Module[]) => void;
}

interface UseModuleManagerReturn {
  modules: Module[];
  addModule: (module: Omit<Module, 'id' | 'order'>) => Promise<Module>;
  updateModule: (id: string, updates: Partial<Module>) => Promise<Module>;
  deleteModule: (id: string) => Promise<void>;
  reorderModules: (startIndex: number, endIndex: number) => void;
  loading: boolean;
  error: string | null;
}

/**
 * Hook customizado para gerenciar módulos do curso
 * @param initialModules - Módulos iniciais
 * @param onModulesChange - Callback quando módulos mudam
 * @returns Objeto com métodos e estados dos módulos
 */
export function useModuleManager({
  initialModules = [],
  onModulesChange
}: UseModuleManagerProps): UseModuleManagerReturn {
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Adiciona um novo módulo
   */
  const addModule = useCallback(async (moduleData: Omit<Module, 'id' | 'order'>): Promise<Module> => {
    setLoading(true);
    setError(null);

    try {
      // Valida os dados do módulo
      const validatedData = moduleSchema.parse({
        ...moduleData,
        id: crypto.randomUUID(),
        order: modules.length
      });

      const newModule: Module = {
        ...validatedData,
        id: crypto.randomUUID(),
        order: modules.length,
        lessons: []
      };

      const updatedModules = [...modules, newModule];
      setModules(updatedModules);
      onModulesChange?.(updatedModules);
      
      return newModule;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0]?.message || 'Erro de validação');
      } else {
        setError('Erro ao adicionar módulo');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [modules, onModulesChange]);

  /**
   * Atualiza um módulo existente
   */
  const updateModule = useCallback(async (id: string, updates: Partial<Module>): Promise<Module> => {
    setLoading(true);
    setError(null);

    try {
      const updatedModules = modules.map(module => 
        module.id === id ? { ...module, ...updates } : module
      );
      
      setModules(updatedModules);
      onModulesChange?.(updatedModules);
      
      const updatedModule = updatedModules.find(m => m.id === id);
      if (!updatedModule) throw new Error('Módulo não encontrado');
      
      return updatedModule;
    } catch (err) {
      setError('Erro ao atualizar módulo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [modules, onModulesChange]);

  /**
   * Remove um módulo
   */
  const deleteModule = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const updatedModules = modules
        .filter(module => module.id !== id)
        .map((module, index) => ({ ...module, order: index }));
      
      setModules(updatedModules);
      onModulesChange?.(updatedModules);
    } catch (err) {
      setError('Erro ao remover módulo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [modules, onModulesChange]);

  /**
   * Reordena os módulos
   */
  const reorderModules = useCallback((startIndex: number, endIndex: number) => {
    const newModules = Array.from(modules);
    const [removed] = newModules.splice(startIndex, 1);
    newModules.splice(endIndex, 0, removed);
    
    const reorderedModules = newModules.map((module, index) => ({
      ...module,
      order: index
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
    loading,
    error
  };
}
