// Componente de lista de módulos com drag-and-drop
import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { FormModule, FormLesson } from '@/types/course';

// Componente individual de módulo sortable
interface SortableModuleItemProps {
  module: FormModule;
  index: number;
  onUpdate: (id: string, updates: Partial<FormModule>) => void;
  onDelete: (id: string) => void;
  onAddLesson: (moduleId: string) => void;
}

const SortableModuleItem: React.FC<SortableModuleItemProps> = ({
  module,
  index,
  onUpdate,
  onDelete,
  onAddLesson,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          >
            <GripVertical className="w-5 h-5 text-gray-400" />
          </button>
          <span className="text-sm font-medium text-gray-500">
            Módulo {index + 1}
          </span>
        </div>
        <button
          onClick={() => onDelete(module.id)}
          className="p-1 hover:bg-red-50 rounded text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <input
        type="text"
        value={module.title}
        onChange={(e) => onUpdate(module.id, { title: e.target.value })}
        placeholder="Título do módulo"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
      />

      <textarea
        value={module.description || ''}
        onChange={(e) => onUpdate(module.id, { description: e.target.value })}
        placeholder="Descrição do módulo"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
        rows={2}
      />

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Lições</h4>
        {module.lessons.map((lesson, lessonIndex) => (
          <div key={lesson.id} className="ml-4 p-2 bg-gray-50 rounded">
            <input
              type="text"
              value={lesson.title}
              onChange={(e) => {
                const updatedLessons = [...module.lessons];
                updatedLessons[lessonIndex] = {
                  ...lesson,
                  title: e.target.value,
                };
                onUpdate(module.id, { lessons: updatedLessons });
              }}
              placeholder="Título da lição"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => onAddLesson(module.id)}
        className="mt-2 flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
      >
        <Plus className="w-4 h-4" />
        <span>Adicionar lição</span>
      </button>
    </div>
  );
};

// Componente principal da lista
interface DraggableModuleListProps {
  modules: FormModule[];
  onModulesChange: (modules: FormModule[]) => void;
  onUpdateModule: (id: string, updates: Partial<FormModule>) => void;
  onDeleteModule: (id: string) => void;
  onAddModule: () => void;
  onAddLesson: (moduleId: string) => void;
}

const DraggableModuleList: React.FC<DraggableModuleListProps> = ({
  modules,
  onModulesChange,
  onUpdateModule,
  onDeleteModule,
  onAddModule,
  onAddLesson,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = modules.findIndex((module) => module.id === active.id);
      const newIndex = modules.findIndex((module) => module.id === over?.id);

      onModulesChange(arrayMove(modules, oldIndex, newIndex));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Módulos do Curso</h3>
        <button
          onClick={onAddModule}
          className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Módulo</span>
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={modules.map((m) => m.id)}
          strategy={verticalListSortingStrategy}
        >
          {modules.map((module, index) => (
            <SortableModuleItem
              key={module.id}
              module={module}
              index={index}
              onUpdate={onUpdateModule}
              onDelete={onDeleteModule}
              onAddLesson={onAddLesson}
            />
          ))}
        </SortableContext>
      </DndContext>

      {modules.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum módulo adicionado ainda.</p>
          <p className="text-sm mt-2">Clique em "Adicionar Módulo" para começar.</p>
        </div>
      )}
    </div>
  );
};

export default DraggableModuleList;
