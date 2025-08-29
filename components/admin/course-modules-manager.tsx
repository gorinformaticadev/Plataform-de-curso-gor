"use client";

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from "sonner";
import { ModuleFormModal, ModuleFormData } from './module-form-modal';
import {
  Plus,
  BookOpen,
  Edit3,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Play,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Module {
  id: string;
  title: string;
  description?: string;
  lessons: Array<{
    id: string;
    title: string;
    videoUrl?: string;
    duration?: number;
  }>;
}

interface CourseModulesManagerProps {
  modules: Module[];
  onCreateModule: (moduleData: ModuleFormData) => Promise<void>;
  onUpdateModule: (moduleId: string, moduleData: ModuleFormData) => Promise<void>;
  onDeleteModule: (moduleId: string) => Promise<void>;
  courseId: string;
  isLoading?: boolean;
}

export function CourseModulesManager({
  modules,
  onCreateModule,
  onUpdateModule,
  onDeleteModule,
  courseId,
  isLoading = false
}: CourseModulesManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Alternar expansão do módulo
  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  // Abrir modal para criar novo módulo
  const handleCreateModule = () => {
    if (courseId === 'new') {
      toast.error('Salve o curso antes de adicionar módulos');
      return;
    }
    setEditingModule(null);
    setIsModalOpen(true);
  };

  // Abrir modal para editar módulo
  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setIsModalOpen(true);
  };

  // Submeter formulário do modal
  const handleModalSubmit = async (data: ModuleFormData) => {
    setIsSubmitting(true);
    try {
      if (editingModule) {
        await onUpdateModule(editingModule.id, data);
      } else {
        await onCreateModule(data);
      }
      setIsModalOpen(false);
      setEditingModule(null);
    } catch (error) {
      // O erro já é tratado no hook, apenas mantemos o modal aberto
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirmar e deletar módulo
  const handleDeleteModule = async (module: Module) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o módulo "${module.title}"?\n\nEsta ação não pode ser desfeita e todas as aulas do módulo também serão removidas.`
    );

    if (confirmed) {
      try {
        await onDeleteModule(module.id);
      } catch (error) {
        // O erro já é tratado no hook
      }
    }
  };

  // Função de drag and drop (placeholder para futuras implementações)
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    // TODO: Implementar reordenação de módulos
    console.log('Drag end result:', result);
  };

  // Renderizar módulo vazio
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum módulo criado ainda</h3>
      <p className="text-gray-600 mb-6">Comece criando o primeiro módulo do seu curso</p>
      <Button
        onClick={handleCreateModule}
        className="flex items-center gap-2"
        disabled={isLoading}
      >
        <Plus className="w-5 h-5" />
        Criar Primeiro Módulo
      </Button>
    </div>
  );

  // Renderizar aula
  const renderLesson = (lesson: any, index: number) => (
    <div key={lesson.id} className="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0">
        {lesson.videoUrl ? (
          <Play className="w-4 h-4 text-red-500" />
        ) : (
          <FileText className="w-4 h-4 text-blue-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {lesson.title || `Aula ${index + 1}`}
        </p>
        {lesson.duration && (
          <p className="text-xs text-gray-500">
            {Math.floor(lesson.duration / 60)}:{String(lesson.duration % 60).padStart(2, '0')} min
          </p>
        )}
      </div>
    </div>
  );

  // Renderizar módulo
  const renderModule = (module: Module, index: number) => {
    const isExpanded = expandedModules.has(module.id);
    
    return (
      <div key={module.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Cabeçalho do Módulo */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {module.title || `Módulo ${index + 1}`}
                </h3>
                <p className="text-sm text-gray-500">
                  Módulo {index + 1} • {module.lessons?.length || 0} aulas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditModule(module)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteModule(module)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleModuleExpansion(module.id)}
                className="text-gray-600 hover:text-gray-800"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Descrição do Módulo (quando expandido) */}
        {isExpanded && module.description && (
          <div className="px-6 py-3 bg-blue-50 border-b border-gray-200">
            <div 
              className="text-sm text-gray-700 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: module.description }}
            />
          </div>
        )}

        {/* Conteúdo do Módulo - Aulas */}
        {isExpanded && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">Aulas do Módulo</h4>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Aula
              </Button>
            </div>

            {!module.lessons || module.lessons.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Play className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhuma aula criada ainda.</p>
                <p className="text-sm">Clique em "Adicionar Aula" para começar.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {module.lessons.map((lesson, lessonIndex) => 
                  renderLesson(lesson, lessonIndex)
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Módulos e Aulas</h2>
                <p className="text-sm text-gray-600 mt-1">Organize o conteúdo do seu curso em módulos e aulas</p>
              </div>
              <Button
                onClick={handleCreateModule}
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <Plus className="w-4 h-4" />
                Adicionar Módulo
              </Button>
            </div>
          </div>

          <div className="p-6">
            {modules.length === 0 ? (
              renderEmptyState()
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="modules" type="module">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-6">
                      {modules.map((module, index) => (
                        <Draggable key={module.id} draggableId={module.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              {renderModule(module, index)}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Criar/Editar Módulo */}
      <ModuleFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingModule(null);
        }}
        onSubmit={handleModalSubmit}
        initialData={editingModule ? {
          title: editingModule.title,
          description: editingModule.description
        } : undefined}
        isEditing={!!editingModule}
        isLoading={isSubmitting}
      />
    </>
  );
}