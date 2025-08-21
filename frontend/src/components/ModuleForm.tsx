import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Save, Loader2 } from 'lucide-react';
import { Module, Lesson } from '../types/module.types';
import { validateModuleForm } from '../utils/validation';
import VideoUpload from './VideoUpload';

interface ModuleFormProps {
  module?: Module;
  onSave: (module: Omit<Module, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormData {
  title: string;
  description: string;
  order: number;
  courseId: string;
  lessons: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt' | 'moduleId'>[];
}

const ModuleForm: React.FC<ModuleFormProps> = ({
  module,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    order: 0,
    courseId: '',
    lessons: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingLessonIndex, setEditingLessonIndex] = useState<number | null>(null);

  useEffect(() => {
    if (module) {
      setFormData({
        title: module.title,
        description: module.description || '',
        order: module.order,
        lessons: module.lessons.map(lesson => ({
          title: lesson.title,
          description: lesson.description || '',
          videoUrl: lesson.videoUrl || '',
          duration: lesson.duration || 0,
          order: lesson.order
        }))
      });
    }
  }, [module]);

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleLessonChange = (index: number, field: keyof FormData['lessons'][0], value: string | number) => {
    const newLessons = [...formData.lessons];
    newLessons[index] = { ...newLessons[index], [field]: value };
    setFormData(prev => ({ ...prev, lessons: newLessons }));
  };

  const addLesson = () => {
    const newLesson: FormData['lessons'][0] = {
      title: '',
      description: '',
      videoUrl: '',
      duration: 0,
      order: formData.lessons.length
    };
    setFormData(prev => ({
      ...prev,
      lessons: [...prev.lessons, newLesson]
    }));
    setEditingLessonIndex(formData.lessons.length);
  };

  const removeLesson = (index: number) => {
    const newLessons = formData.lessons.filter((_, i) => i !== index);
    // Reordena as aulas
    const reorderedLessons = newLessons.map((lesson, i) => ({ ...lesson, order: i }));
    setFormData(prev => ({ ...prev, lessons: reorderedLessons }));
    
    if (editingLessonIndex === index) {
      setEditingLessonIndex(null);
    } else if (editingLessonIndex && editingLessonIndex > index) {
      setEditingLessonIndex(editingLessonIndex - 1);
    }
  };

  const handleVideoUpload = (index: number, file: File) => {
    // Aqui você faria o upload real do vídeo para seu servidor
    // Por enquanto, vamos simular com uma URL temporária
    const videoUrl = URL.createObjectURL(file);
    handleLessonChange(index, 'videoUrl', videoUrl);
    
    // Obtém a duração do vídeo
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      handleLessonChange(index, 'duration', video.duration);
    };
    video.src = videoUrl;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Valida módulo
    const moduleValidation = validateModuleForm({
      title: formData.title,
      description: formData.description,
      order: formData.order
    });

    if (!moduleValidation.isValid) {
      newErrors.module = moduleValidation.error || 'Erro no módulo';
    }

    // Valida aulas
    formData.lessons.forEach((lesson, index) => {
      if (!lesson.title.trim()) {
        newErrors[`lesson_${index}`] = `Aula ${index + 1}: Título é obrigatório`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {module ? 'Editar Módulo' : 'Novo Módulo'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Module Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informações do Módulo</h3>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o título do módulo"
            />
            {errors.module && (
              <p className="mt-1 text-sm text-red-600">{errors.module}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva o conteúdo deste módulo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordem
            </label>
            <input
              type="number"
              min="0"
              value={formData.order}
              onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
              className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Lessons */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Aulas</h3>
          <button
            type="button"
            onClick={addLesson}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Aula
          </button>
        </div>

        {formData.lessons.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhuma aula adicionada ainda. Clique em "Adicionar Aula" para começar.
          </p>
        ) : (
          <div className="space-y-4">
            {formData.lessons.map((lesson, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                {editingLessonIndex === index ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Aula {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => setEditingLessonIndex(null)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                        placeholder="Título da aula"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <textarea
                        value={lesson.description}
                        onChange={(e) => handleLessonChange(index, 'description', e.target.value)}
                        placeholder="Descrição da aula"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <VideoUpload
                        onVideoUpload={(file) => handleVideoUpload(index, file)}
                        currentVideoUrl={lesson.videoUrl}
                      />

                      <input
                        type="number"
                        min="0"
                        value={lesson.order}
                        onChange={(e) => handleLessonChange(index, 'order', parseInt(e.target.value) || 0)}
                        placeholder="Ordem"
                        className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {errors[`lesson_${index}`] && (
                      <p className="text-sm text-red-600">{errors[`lesson_${index}`]}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{lesson.title || `Aula ${index + 1}`}</h4>
                      {lesson.description && (
                        <p className="text-sm text-gray-600">{lesson.description}</p>
                      )}
                      {lesson.duration && (
                        <p className="text-xs text-gray-500">
                          Duração: {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setEditingLessonIndex(index)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeLesson(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {module ? 'Atualizar' : 'Criar'} Módulo
        </button>
      </div>
    </form>
  );
};

export default ModuleForm;
