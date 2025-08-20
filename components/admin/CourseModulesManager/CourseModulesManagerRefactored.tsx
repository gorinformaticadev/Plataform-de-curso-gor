'use client';

import React, { useState, useCallback } from 'react';
import { Module as ModuleType, Lesson as LessonType } from '@/app/types/course';
import { useModuleManager } from '@/app/hooks/course-modules/useModuleManager';
import { useLessonManager } from '@/app/hooks/course-modules/useLessonManager';
import { 
  ModuleCard, 
  LessonCard, 
  ModuleForm, 
  CompactModuleForm,
  LessonForm,
  CompactLessonForm 
} from './index';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface CourseModulesManagerRefactoredProps {
  /** Lista inicial de módulos */
  modules: ModuleType[];
  /** Callback quando módulos mudam */
  onModulesChange: (modules: ModuleType[]) => void;
  /** Token de autenticação */
  token: string;
  /** ID do curso */
  courseId: string;
}

/**
 * Versão refatorada do CourseModulesManager usando os novos componentes
 * e hooks customizados da Fase 3
 */
export default function CourseModulesManagerRefactored({
  modules,
  onModulesChange,
  token,
  courseId
}: CourseModulesManagerRefactoredProps) {
  
  // Estados para controle de modais
  const [isAddModuleDialogOpen, setIsAddModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleType | null>(null);
  const [isAddLessonDialogOpen, setIsAddLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonType | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // Hook para gerenciamento de módulos
  const {
    addModule,
    updateModule,
    deleteModule,
    reorderModules,
    loading: moduleLoading,
    error: moduleError
  } = useModuleManager({
    initialModules: modules,
    onModulesChange
  });

  // Hook para gerenciamento de aulas (será usado dinamicamente)
  const getLessonManager = useCallback((moduleId: string) => {
    const moduleData = modules.find(m => m.id === moduleId);
    return useLessonManager({
      moduleId,
      initialLessons: moduleData?.lessons || [],
      onLessonsChange: (lessons) => {
        const updatedModules = modules.map(module => 
          module.id === moduleId 
            ? { ...module, lessons } 
            : module
        );
        onModulesChange(updatedModules);
      }
    });
  }, [modules, onModulesChange]);

  /**
   * Manipula a adição de um novo módulo
   */
  const handleAddModule = async (data: { title: string; description?: string }) => {
    try {
      await addModule({
        ...data,
        lessons: [],
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setIsAddModuleDialogOpen(false);
      toast.success('Módulo adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar módulo:', error);
      toast.error('Erro ao adicionar módulo. Tente novamente.');
    }
  };

  /**
   * Manipula a edição de um módulo
   */
  const handleEditModule = (module: ModuleType) => {
    setEditingModule(module);
  };

  /**
   * Salva as alterações do módulo
   */
  const handleSaveModule = async (data: { title: string; description?: string }) => {
    if (!editingModule) return;

    try {
      await updateModule(editingModule.id, {
        ...data,
        updatedAt: new Date()
      });
      setEditingModule(null);
      toast.success('Módulo atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar módulo:', error);
      toast.error('Erro ao atualizar módulo. Tente novamente.');
    }
  };

  /**
   * Manipula a exclusão de um módulo
   */
  const handleDeleteModule = async (moduleId: string) => {
    try {
      await deleteModule(moduleId);
      toast.success('Módulo excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir módulo:', error);
      toast.error('Erro ao excluir módulo. Tente novamente.');
    }
  };

  /**
   * Alterna publicação do módulo
   */
  const handleToggleModulePublish = async (moduleId: string, isPublished: boolean) => {
    try {
      await updateModule(moduleId, { 
        isPublished,
        updatedAt: new Date()
      });
      toast.success(`Módulo ${isPublished ? 'publicado' : 'despublicado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao alterar publicação do módulo:', error);
      toast.error('Erro ao alterar publicação do módulo.');
    }
  };

  /**
   * Manipula a adição de uma nova aula
   */
  const handleAddLesson = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setEditingLesson(null);
    setIsAddLessonDialogOpen(true);
  };

  /**
   * Manipula a edição de uma aula
   */
  const handleEditLesson = (lesson: LessonType) => {
    setEditingLesson(lesson);
    setIsAddLessonDialogOpen(true);
  };

  /**
   * Salva uma nova aula ou edita uma existente
   */
  const handleSaveLesson = async (data: { title: string; description?: string; duration?: number }) => {
    if (!selectedModuleId) return;

    const lessonManager = getLessonManager(selectedModuleId);

    try {
      if (editingLesson) {
        await lessonManager.updateLesson(editingLesson.id, {
          ...data,
          updatedAt: new Date()
        });
        toast.success('Aula atualizada com sucesso!');
      } else {
        await lessonManager.addLesson({
          ...data,
          contents: [],
          isPublished: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        toast.success('Aula adicionada com sucesso!');
      }
      setIsAddLessonDialogOpen(false);
      setEditingLesson(null);
      setSelectedModuleId(null);
    } catch (error) {
      console.error('Erro ao salvar aula:', error);
      toast.error('Erro ao salvar aula. Tente novamente.');
    }
  };

  /**
   * Manipula a exclusão de uma aula
   */
  const handleDeleteLesson = async (lessonId: string, moduleId: string) => {
    const lessonManager = getLessonManager(moduleId);
    
    try {
      await lessonManager.deleteLesson(lessonId);
      toast.success('Aula excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir aula:', error);
      toast.error('Erro ao excluir aula. Tente novamente.');
    }
  };

  /**
   * Duplica uma aula
   */
  const handleDuplicateLesson = async (lessonId: string, moduleId: string) => {
    const lessonManager = getLessonManager(moduleId);
    
    try {
      await lessonManager.duplicateLesson(lessonId);
      toast.success('Aula duplicada com sucesso!');
    } catch (error) {
      console.error('Erro ao duplicar aula:', error);
      toast.error('Erro ao duplicar aula. Tente novamente.');
    }
  };

  /**
   * Alterna publicação da aula
   */
  const handleToggleLessonPublish = async (lessonId: string, isPublished: boolean, moduleId: string) => {
    const lessonManager = getLessonManager(moduleId);
    
    try {
      await lessonManager.updateLesson(lessonId, { 
        isPublished,
        updatedAt: new Date()
      });
      toast.success(`Aula ${isPublished ? 'publicada' : 'despublicada'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao alterar publicação da aula:', error);
      toast.error('Erro ao alterar publicação da aula.');
    }
  };

  /**
   * Alterna expansão do módulo
   */
  const toggleModuleExpansion = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      {/* Cabeçalho com botão de adicionar módulo */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Módulos do Curso</h3>
        <Dialog open={isAddModuleDialogOpen} onOpenChange={setIsAddModuleDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Módulo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Módulo</DialogTitle>
            </DialogHeader>
            <CompactModuleForm
              onSubmit={handleAddModule}
              onCancel={() => setIsAddModuleDialogOpen(false)}
              loading={moduleLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de módulos */}
      <div className="space-y-3">
        {modules.map((module) => (
          <Collapsible
            key={module.id}
            open={expandedModules.has(module.id)}
            onOpenChange={() => toggleModuleExpansion(module.id)}
            className="border-2 hover:border-gray-300 transition-colors rounded-md"
          >
            <div className="flex items-center justify-between p-4 bg-white rounded-t-md">
              <div className="flex items-center space-x-3">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {expandedModules.has(module.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <ModuleCard
                  module={module}
                  onEdit={handleEditModule}
                  onDelete={handleDeleteModule}
                  onTogglePublish={handleToggleModulePublish}
                  dragEnabled={true}
                />
              </div>
            </div>

            <CollapsibleContent>
              <div className="p-4 pt-0 bg-gray-50 rounded-b-md">
                {/* Botão para adicionar aula */}
                <div className="mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddLesson(module.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Aula
                  </Button>
                </div>

                {/* Lista de aulas */}
                {module.lessons && module.lessons.length > 0 ? (
                  <div className="space-y-2">
                    {module.lessons.map((lesson) => (
                      <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        onEdit={handleEditLesson}
                        onDelete={(lessonId) => handleDeleteLesson(lessonId, module.id)}
                        onDuplicate={(lessonId) => handleDuplicateLesson(lessonId, module.id)}
                        onTogglePublish={(lessonId, isPublished) => 
                          handleToggleLessonPublish(lessonId, isPublished, module.id)
                        }
                        dragEnabled={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Nenhuma aula neste módulo</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => handleAddLesson(module.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar primeira aula
                    </Button>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      {/* Estado vazio */}
      {modules.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum módulo ainda
            </h3>
            <p className="text-gray-500 mb-4">
              Comece adicionando o primeiro módulo do seu curso
            </p>
            <Dialog open={isAddModuleDialogOpen} onOpenChange={setIsAddModuleDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Módulo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Módulo</DialogTitle>
                </DialogHeader>
                <CompactModuleForm
                  onSubmit={handleAddModule}
                  onCancel={() => setIsAddModuleDialogOpen(false)}
                  loading={moduleLoading}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Modal de edição de módulo */}
      <Dialog open={!!editingModule} onOpenChange={() => setEditingModule(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Módulo</DialogTitle>
          </DialogHeader>
          {editingModule && (
            <ModuleForm
              initialData={{
                title: editingModule.title,
                description: editingModule.description
              }}
              onSubmit={handleSaveModule}
              onCancel={() => setEditingModule(null)}
              loading={moduleLoading}
              title="Editar Módulo"
              submitText="Salvar Alterações"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de adição/edição de aula */}
      <Dialog open={isAddLessonDialogOpen} onOpenChange={setIsAddLessonDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? 'Editar Aula' : 'Adicionar Nova Aula'}
            </DialogTitle>
          </DialogHeader>
          <LessonForm
            initialData={editingLesson ? {
              title: editingLesson.title,
              description: editingLesson.description,
              duration: editingLesson.duration
            } : undefined}
            onSubmit={handleSaveLesson}
            onCancel={() => {
              setIsAddLessonDialogOpen(false);
              setEditingLesson(null);
              setSelectedModuleId(null);
            }}
            loading={false}
            title={editingLesson ? 'Editar Aula' : 'Nova Aula'}
            submitText={editingLesson ? 'Salvar Alterações' : 'Criar Aula'}
          />
        </DialogContent>
      </Dialog>

      {/* Exibir erros se houver */}
      {moduleError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{moduleError}</p>
        </div>
      )}
    </div>
  );
}
