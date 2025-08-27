"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import toast, { Toaster } from 'react-hot-toast';
import { useCourseForm } from './hooks/useCourseForm';
import { CategorySelect } from '@/app/admin/courses/create/components/CategorySelect';
import { CourseImage } from '@/components/ui/course-image';
import {
  Plus,
  Save,
  Eye,
  FileText,
  Video,
  HelpCircle,
  GripVertical,
  Edit3,
  Trash2,
  Upload,
  Link,
  Image,
  ChevronDown,
  ChevronUp,
  Play,
  BookOpen,
  Award,
  DollarSign,
  Tag,
  Calendar,
} from 'lucide-react';

// Types
interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Quiz {
  question: string;
  type: 'text' | 'single' | 'multiple';
  options: QuizOption[];
  textAnswer?: string;
}

interface Lesson {
  id: string;
  name: string;
  position: number;
  description: string;
  slug: string;
  thumbnail: string;
  type: 'video' | 'text' | 'quiz';
  videoUrl?: string;
  videoFile?: File;
  textContent?: string;
  quiz?: Quiz;
}

interface Module {
  id: string;
  name: string;
  position: number;
  description: string;
  lessons: Lesson[];
  isExpanded: boolean;
}

interface Course {
  name: string;
  description: string;
  price: number;
  category: string;
  level: 'iniciante' | 'intermediario' | 'avancado';
  thumbnail: string;
  isDraft: boolean;
  modules: Module[];
}

// Editor Component
interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, placeholder = "Escreva aqui..." }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Atualiza o conteúdo do editor quando a prop content muda
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex gap-2">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('bold') ? 'bg-gray-300' : ''}`}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('italic') ? 'bg-gray-300' : ''}`}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''}`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('bulletList') ? 'bg-gray-300' : ''}`}
        >
          •
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="p-4 min-h-[120px] prose max-w-none"
        placeholder={placeholder}
      />
    </div>
  );
};

// Quiz Editor Component
interface QuizEditorProps {
  quiz: Quiz;
  onChange: (quiz: Quiz) => void;
}

const QuizEditor: React.FC<QuizEditorProps> = ({ quiz, onChange }) => {
  const updateQuiz = (updates: Partial<Quiz>) => {
    onChange({ ...quiz, ...updates });
  };

  const addOption = () => {
    const newOption = {
      id: Date.now().toString(),
      text: '',
      isCorrect: false,
    };
    updateQuiz({
      options: [...quiz.options, newOption],
    });
  };

  const updateOption = (optionId: string, updates: Partial<QuizOption>) => {
    updateQuiz({
      options: quiz.options.map(opt =>
        opt.id === optionId ? { ...opt, ...updates } : opt
      ),
    });
  };

  const removeOption = (optionId: string) => {
    updateQuiz({
      options: quiz.options.filter(opt => opt.id !== optionId),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pergunta
        </label>
        <input
          type="text"
          value={quiz.question}
          onChange={(e) => updateQuiz({ question: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Digite a pergunta do quiz"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Resposta
        </label>
        <select
          value={quiz.type}
          onChange={(e) => updateQuiz({ type: e.target.value as Quiz['type'] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="text">Resposta em Texto</option>
          <option value="single">Escolha Única</option>
          <option value="multiple">Múltipla Escolha</option>
        </select>
      </div>

      {quiz.type === 'text' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resposta Correta
          </label>
          <input
            type="text"
            value={quiz.textAnswer || ''}
            onChange={(e) => updateQuiz({ textAnswer: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Digite a resposta correta"
          />
        </div>
      )}

      {(quiz.type === 'single' || quiz.type === 'multiple') && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Opções de Resposta
            </label>
            <button
              type="button"
              onClick={addOption}
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Adicionar Opção
            </button>
          </div>
          
          <div className="space-y-2">
            {quiz.options.map((option) => (
              <div key={option.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                <input
                  type={quiz.type === 'single' ? 'radio' : 'checkbox'}
                  name="quiz-options"
                  checked={option.isCorrect}
                  onChange={(e) => {
                    if (quiz.type === 'single') {
                      // Para escolha única, apenas uma opção pode ser correta
                      updateQuiz({
                        options: quiz.options.map(opt => ({
                          ...opt,
                          isCorrect: opt.id === option.id ? e.target.checked : false
                        }))
                      });
                    } else {
                      updateOption(option.id, { isCorrect: e.target.checked });
                    }
                  }}
                  className="text-green-600"
                />
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => updateOption(option.id, { text: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite a opção"
                />
                <button
                  type="button"
                  onClick={() => removeOption(option.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Lesson Component
interface LessonItemProps {
  lesson: Lesson;
  moduleId: string;
  onUpdate: (moduleId: string, lesson: Lesson) => void;
  onDelete: (moduleId: string, lessonId: string) => void;
}

const LessonItem: React.FC<LessonItemProps> = ({ lesson, moduleId, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLesson, setEditedLesson] = useState<Lesson>(lesson);

  const handleSave = () => {
    onUpdate(moduleId, editedLesson);
    setIsEditing(false);
    toast.success('Aula atualizada!');
  };

  const handleCancel = () => {
    setEditedLesson(lesson);
    setIsEditing(false);
  };

  const getTypeIcon = (type: Lesson['type']) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-red-500" />;
      case 'text': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'quiz': return <HelpCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getTypeLabel = (type: Lesson['type']) => {
    switch (type) {
      case 'video': return 'Vídeo';
      case 'text': return 'Texto';
      case 'quiz': return 'Quiz';
    }
  };

  if (!isEditing) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GripVertical className="w-4 h-4 text-gray-400" />
            {getTypeIcon(lesson.type)}
            <div>
              <h4 className="font-medium text-gray-900">{lesson.name}</h4>
              <p className="text-sm text-gray-500">{getTypeLabel(lesson.type)} • Posição {lesson.position}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-700"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm('Tem certeza que deseja excluir esta aula?')) {
                  onDelete(moduleId, lesson.id);
                  toast.success('Aula excluída!');
                }
              }}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome da Aula
          </label>
          <input
            type="text"
            value={editedLesson.name}
            onChange={(e) => setEditedLesson({ ...editedLesson, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Posição
          </label>
          <input
            type="number"
            value={editedLesson.position}
            onChange={(e) => setEditedLesson({ ...editedLesson, position: parseInt(e.target.value) || 1 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slug
          </label>
          <input
            type="text"
            value={editedLesson.slug}
            onChange={(e) => setEditedLesson({ ...editedLesson, slug: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Aula
          </label>
          <select
            value={editedLesson.type}
            onChange={(e) => setEditedLesson({
              ...editedLesson,
              type: e.target.value as Lesson['type'],
              // Reset specific fields when changing type
              videoUrl: e.target.value === 'video' ? editedLesson.videoUrl : undefined,
              textContent: e.target.value === 'text' ? editedLesson.textContent || '' : undefined,
              quiz: e.target.value === 'quiz' ? editedLesson.quiz || { question: '', type: 'text', options: [], textAnswer: '' } : undefined,
            } as Lesson)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="video">Vídeo</option>
            <option value="text">Texto</option>
            <option value="quiz">Quiz</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrição
        </label>
        <textarea
          value={editedLesson.description}
          onChange={(e) => setEditedLesson({ ...editedLesson, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Thumbnail da Aula
        </label>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="url"
              value={editedLesson.thumbnail}
              onChange={(e) => setEditedLesson({ ...editedLesson, thumbnail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="URL da imagem ou faça upload"
            />
          </div>
          <button
            type="button"
            className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </div>
      </div>

      {/* Content based on lesson type */}
      {editedLesson.type === 'video' && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vídeo
          </label>
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                type="button"
                className="flex-1 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 flex flex-col items-center gap-2"
              >
                <Upload className="w-6 h-6 text-gray-500" />
                <span className="text-sm text-gray-600">Upload de Vídeo</span>
              </button>
              <div className="text-center text-gray-500 self-center">ou</div>
              <div className="flex-1 space-y-2">
                <input
                  type="url"
                  value={editedLesson.videoUrl || ''}
                  onChange={(e) => setEditedLesson({ ...editedLesson, videoUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="URL do vídeo (YouTube, Vimeo, etc.)"
                />
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Link className="w-4 h-4" />
                  Link do vídeo
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editedLesson.type === 'text' && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conteúdo da Aula
          </label>
          <RichTextEditor
            content={editedLesson.textContent || ''}
            onChange={(content: string) => setEditedLesson({ ...editedLesson, textContent: content })}
            placeholder="Escreva o conteúdo da aula..."
          />
        </div>
      )}

      {editedLesson.type === 'quiz' && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Configuração do Quiz
          </label>
          <QuizEditor
            quiz={editedLesson.quiz || { question: '', type: 'text', options: [], textAnswer: '' }}
            onChange={(quiz: Quiz) => setEditedLesson({ ...editedLesson, quiz })}
          />
        </div>
      )}

      <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Salvar Aula
        </button>
      </div>
    </div>
  );
};

// Module Component
interface ModuleItemProps {
  module: Module;
  onUpdate: (module: Module) => void;
  onDelete: (moduleId: string) => void;
  onAddLesson: (moduleId: string) => void;
  onUpdateLesson: (moduleId: string, lesson: Lesson) => void;
  onDeleteLesson: (moduleId: string, lessonId: string) => void;
}

const ModuleItem: React.FC<ModuleItemProps> = ({ module, onUpdate, onDelete, onAddLesson, onUpdateLesson, onDeleteLesson }) => {
  const [isEditingModule, setIsEditingModule] = useState(false);
  const [editedModule, setEditedModule] = useState<Module>(module);

  const handleSaveModule = () => {
    onUpdate(editedModule);
    setIsEditingModule(false);
    toast.success('Módulo atualizado!');
  };

  const handleCancelModule = () => {
    setEditedModule(module);
    setIsEditingModule(false);
  };

  const toggleExpanded = () => {
    onUpdate({ ...module, isExpanded: !module.isExpanded });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Module Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GripVertical className="w-5 h-5 text-gray-400" />
            <BookOpen className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {module.name}
              </h3>
              <p className="text-sm text-gray-500">
                Módulo {module.position} • {module.lessons.length} aulas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingModule(true)}
              className="text-blue-600 hover:text-blue-700 p-2"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm('Tem certeza que deseja excluir este módulo e todas as suas aulas?')) {
                  onDelete(module.id);
                  toast.success('Módulo excluído!');
                }
              }}
              className="text-red-600 hover:text-red-700 p-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={toggleExpanded}
              className="text-gray-600 hover:text-gray-800 p-2"
            >
              {module.isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Module Edit Form */}
      {isEditingModule && (
        <div className="p-6 border-b border-gray-200 bg-blue-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Módulo
              </label>
              <input
                type="text"
                value={editedModule.name}
                onChange={(e) => setEditedModule({ ...editedModule, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posição do Módulo
              </label>
              <input
                type="number"
                value={editedModule.position}
                onChange={(e) => setEditedModule({ ...editedModule, position: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição do Módulo
            </label>
            <RichTextEditor
              content={editedModule.description}
              onChange={(content: string) => setEditedModule({ ...editedModule, description: content })}
              placeholder="Descreva o módulo..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancelModule}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveModule}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Salvar Módulo
            </button>
          </div>
        </div>
      )}

      {/* Module Content - Lessons */}
      {module.isExpanded && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">Aulas do Módulo</h4>
            <button
              onClick={() => onAddLesson(module.id)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Aula
            </button>
          </div>

          {module.lessons.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhuma aula criada ainda.</p>
              <p className="text-sm">Clique em "Adicionar Aula" para começar.</p>
            </div>
          ) : (
            <Droppable droppableId={module.id} type="lesson">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {module.lessons
                    .sort((a, b) => a.position - b.position)
                    .map((lesson, index) => (
                      <Draggable
                        key={lesson.id}
                        draggableId={lesson.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <LessonItem
                              lesson={lesson}
                              moduleId={module.id}
                              onUpdate={onUpdateLesson}
                              onDelete={onDeleteLesson}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </div>
      )}
    </div>
  );
};

// Main App Component
function App() {
  const params = useParams();
  const courseId = params.id as string;

  const {
    form,
    isLoading,
    isSaving,
    saveCourse,
    addModule,
    removeModule,
    addLesson,
    removeLesson,
  } = useCourseForm({
    courseId,
    onSuccess: (data) => {
      toast.success('Curso salvo com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao salvar curso: ${error.message}`);
    },
  });

  const { watch, control, setValue, getValues } = form;

  const course = watch(); // Observa todas as alterações do formulário

  const [activeTab, setActiveTab] = useState<'course' | 'modules'>('course');


  const handleSave = (publish: boolean) => {
    const currentData = getValues();
    saveCourse({ ...currentData, published: publish });
  };

  const handleDragEnd = (result: any) => {
    // Lógica de Drag and Drop a ser implementada se necessário
    console.log(result);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Editor de Curso</h1>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                !watch('published')
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {!watch('published') ? 'Rascunho' : 'Publicado'}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Eye className="w-4 h-4" />
                {isSaving ? 'Publicando...' : 'Publicar Curso'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('course')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'course'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Informações do Curso
              </div>
            </button>
            <button
              onClick={() => setActiveTab('modules')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'modules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Módulos e Aulas
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                  {watch('modules')?.length || 0}
                </span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'course' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Informações do Curso</h2>
              <p className="text-sm text-gray-600 mt-1">Configure as informações básicas do seu curso</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <BookOpen className="w-4 h-4" />
                      Nome do Curso *
                    </label>
                    <input
                      type="text"
                      {...form.register('title')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Desenvolvimento Web Completo"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <FileText className="w-4 h-4" />
                      Descrição do Curso *
                    </label>
                    <RichTextEditor
                      content={watch('description')}
                      onChange={(content: string) => setValue('description', content)}
                      placeholder="Descreva detalhadamente o que o aluno irá aprender..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <DollarSign className="w-4 h-4" />
                        Preço (R$)
                      </label>
                      <input
                        type="number"
                        {...form.register('price', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Award className="w-4 h-4" />
                        Nível
                      </label>
                      <select
                        {...form.register('level')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="BEGINNER">Iniciante</option>
                        <option value="INTERMEDIATE">Intermediário</option>
                        <option value="ADVANCED">Avançado</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Tag className="w-4 h-4" />
                      Categoria
                    </label>
                    <CategorySelect
                      value={watch('category')}
                      onChange={(value: string) => setValue('category', value)}
                      error={form.formState.errors.category?.message}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Image className="w-4 h-4" />
                      Thumbnail do Curso
                    </label>
                    <div className="border border-gray-300 rounded-lg p-4">
                      {watch('thumbnail') ? (
                        <div className="relative">
                          <CourseImage
                            src={watch('thumbnail')}
                            alt="Thumbnail do curso"
                            className="w-full h-48 object-cover rounded-lg"
                            onError={() => console.warn('Erro ao carregar thumbnail')}
                          />
                          <button
                            onClick={() => setValue('thumbnail', '')}
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <Image className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-600 mb-4">Adicione uma imagem de capa para o seu curso</p>
                          <div className="space-y-2">
                            <input
                              type="url"
                              {...form.register('thumbnail')}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="URL da imagem"
                            />
                            <button
                              type="button"
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                              <Upload className="w-4 h-4" />
                              Fazer Upload
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Course Preview Card */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Prévia do Curso</h3>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <div className="aspect-video bg-gray-200 flex items-center justify-center">
                        {watch('thumbnail') ? (
                          <CourseImage
                            src={watch('thumbnail')}
                            alt="Prévia do curso"
                            className="w-full h-full object-cover"
                            onError={() => console.warn('Erro ao carregar thumbnail na prévia')}
                          />
                        ) : (
                          <Image className="w-16 h-16 text-gray-400" />
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {watch('title') || 'Nome do curso'}
                        </h4>
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {watch('level')?.charAt(0).toUpperCase() + watch('level')?.slice(1)}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {watch('modules')?.length || 0} módulos
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-green-600">
                            R$ {(watch('price') || 0).toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {/* Removido preview estático de categoria - será exibido dinamicamente pelo CategorySelect */}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'modules' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Módulos e Aulas</h2>
                    <p className="text-sm text-gray-600 mt-1">Organize o conteúdo do seu curso em módulos e aulas</p>
                  </div>
                  <button
                    onClick={addModule}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Módulo
                  </button>
                </div>
              </div>

              <div className="p-6">
                {watch('modules')?.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum módulo criado ainda</h3>
                    <p className="text-gray-600 mb-6">Comece criando o primeiro módulo do seu curso</p>
                    <button
                      onClick={addModule}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-5 h-5" />
                      Criar Primeiro Módulo
                    </button>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="modules" type="module">
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-6">
                          {watch('modules')
                            // .sort((a, b) => a.position - b.position) // position não existe no form
                            .map((module, index) => (
                              <Draggable key={module.id} draggableId={module.id} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    {/* O componente ModuleItem precisa ser adaptado para usar react-hook-form */}
                                    {/* Por enquanto, vamos exibir apenas o título */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                      <h3 className="font-semibold">{module.title || 'Novo Módulo'}</h3>
                                    </div>
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
        )}
      </div>
    </div>
  );
}

export default App;