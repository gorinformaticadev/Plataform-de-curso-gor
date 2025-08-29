"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { toast } from "sonner";
import { Toaster } from '@/components/ui/sonner';
import { useCourseForm } from './hooks/useCourseForm';
import { CategorySelect } from '@/app/admin/courses/create/components/CategorySelect';
import { CourseImage } from '@/components/ui/course-image';
import { CourseModulesManager } from '@/components/admin/course-modules-manager';
import {
  Save,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  FileText,
  Upload,
  Image,
  BookOpen,
  Play,
  Award,
  DollarSign,
  Tag,
  Trash2,
} from 'lucide-react';

// Função de formatação de duração
const formatDuration = (minutes: number): string => {
  if (!minutes || minutes === 0) return '0 min';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
};

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

// Main App Component
function App() {
  const params = useParams();
  const courseId = params.id as string;

  const {
    form,
    isLoading,
    isSaving,
    isTogglingStatus,
    saveCourse,
    toggleCourseStatus,
    addModule,
    removeModule,
    addLesson,
    removeLesson,
    createModule,
    updateModule,
    deleteModule,
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


  // Função para salvar dados do formulário (sem alterar status)
  const handleSave = () => {
    const currentData = getValues();
    saveCourse(currentData);
  };

  // Função para alternar apenas o status do curso
  const handleToggleStatus = () => {
    const currentStatus = watch('published');
    toggleCourseStatus(!currentStatus);
  };

  // Funções auxiliares para textos dos botões
  const getSaveButtonText = () => {
    if (isSaving) return 'Salvando...';
    return 'Salvar Dados';
  };

  const getToggleButtonText = () => {
    if (isTogglingStatus) {
      return watch('published') ? 'Desativando...' : 'Publicando...';
    }
    return watch('published') ? 'Desativar Curso' : 'Publicar Curso';
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
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${
                !watch('published')
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  : 'bg-green-100 text-green-800 border-green-200'
              }`}>
                {!watch('published') ? (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Rascunho
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Publicado
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 flex items-center gap-2 disabled:opacity-50"
                aria-label="Salvar dados do formulário"
              >
                <Save className="w-4 h-4" />
                {getSaveButtonText()}
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={isTogglingStatus}
                className={`px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 ${
                  watch('published')
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                aria-label={watch('published') ? 'Desativar curso' : 'Publicar curso'}
              >
                {watch('published') ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                {getToggleButtonText()}
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
                      content={watch('description') || ''}
                      onChange={(content: string) => setValue('description', content)}
                      placeholder="Descreva detalhadamente o que o aluno irá aprender..."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
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

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Clock className="w-4 h-4" />
                        Duração (minutos)
                      </label>
                      <input
                        type="number"
                        {...form.register('duration', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        max="10080"
                        placeholder="Ex: 120"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Tag className="w-4 h-4" />
                      Categoria
                    </label>
                    <CategorySelect
                      value={watch('category') || ''}
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
                            <Clock className="w-3 h-3" />
                            {formatDuration(watch('duration') || 0)}
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
          <CourseModulesManager
            modules={(watch('modules') || []).map(module => ({
              id: module.id,
              title: module.title || '',
              description: module.description || '',
              lessons: (module.lessons || []).map(lesson => ({
                id: lesson.id,
                title: lesson.title || '',
                videoUrl: lesson.videoUrl || '',
                duration: lesson.duration || 0
              }))
            }))}
            onCreateModule={createModule}
            onUpdateModule={updateModule}
            onDeleteModule={deleteModule}
            courseId={courseId}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}

export default App;