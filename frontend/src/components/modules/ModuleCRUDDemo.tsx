import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ChevronUp, ChevronDown, BookOpen, Video } from 'lucide-react';

// Interfaces para tipagem
interface Module {
  id: string;
  title: string;
  description: string;
  courseId: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  duration: number;
  order: number;
}

// Componente de demonstração de CRUD de Módulos
const ModuleCRUDDemo: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([
    {
      id: '1',
      title: 'Introdução ao Curso',
      description: 'Conceitos fundamentais e visão geral do curso',
      courseId: 'course-123',
      order: 1,
      lessons: [
        {
          id: '1-1',
          title: 'Bem-vindo ao Curso',
          description: 'Apresentação do curso e objetivos',
                  content: 'Neste curso você aprenderá os conceitos fundamentais...',
                  videoUrl: 'https://example.com/video1.mp4',
                  duration: 15,
                  order: 1
        },
        {
          id: '1-2',
          title: 'Configuração do Ambiente',
          description: 'Como preparar seu ambiente de desenvolvimento',
          content: 'Passo a passo para configurar o ambiente...',
          duration: 25
        }
      ]
    },
    {
      id: '2',
      title: 'Módulo Intermediário',
      description: 'Avançando nos conceitos',
      courseId: 'course-123',
      order: 2,
      lessons: []
    }
  ]);

  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [newModule, setNewModule] = useState({ title: '', description: '' });
  const [newLesson, setNewLesson] = useState({ title: '', description: '', content: '', duration: 0 });

  // Função para criar novo módulo
  const handleCreateModule = () => {
    if (!newModule.title.trim() || !newModule.description.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const module: Module = {
      id: Date.now().toString(),
      title: newModule.title,
      description: newModule.description,
      courseId: 'course-123',
      order: modules.length + 1,
      lessons: []
    };

    setModules([...modules, module]);
    setNewModule({ title: '', description: '' });
    setShowModuleForm(false);
  };

  // Função para atualizar módulo
  const handleUpdateModule = () => {
    if (!editingModule || !newModule.title.trim()) return;

    setModules(modules.map(m => 
      m.id === editingModule.id 
        ? { ...m, title: newModule.title, description: newModule.description }
        : m
    ));
    setEditingModule(null);
    setNewModule({ title: '', description: '' });
    setShowModuleForm(false);
  };

  // Função para deletar módulo
  const handleDeleteModule = (moduleId: string) => {
    if (window.confirm('Tem certeza que deseja deletar este módulo e todas as suas aulas?')) {
      setModules(modules.filter(m => m.id !== moduleId));
    }
  };

  // Função para criar nova aula
  const handleCreateLesson = () => {
    if (!selectedModuleId || !newLesson.title.trim()) return;

    const lesson: Lesson = {
      id: Date.now().toString(),
      title: newLesson.title,
      description: newLesson.description,
      content: newLesson.content,
      duration: newLesson.duration,
      order: (modules.find(m => m.id === selectedModuleId)?.lessons.length || 0) + 1
    };

    setModules(modules.map(m => 
      m.id === selectedModuleId 
        ? { ...m, lessons: [...m.lessons, lesson] }
        : m
    ));
    setNewLesson({ title: '', description: '', content: '', duration: 0 });
    setShowLessonForm(false);
    setSelectedModuleId(null);
  };

  // Função para reordenar módulos
  const handleReorderModules = (moduleId: string, direction: 'up' | 'down') => {
    const index = modules.findIndex(m => m.id === moduleId);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === modules.length - 1)) {
      return;
    }

    const newModules = [...modules];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newModules[index], newModules[newIndex]] = [newModules[newIndex], newModules[index]];
    
    setModules(newModules.map((m, i) => ({ ...m, order: i + 1 })));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Gerenciamento de Módulos e Aulas</h1>
          <button
            onClick={() => {
              setShowModuleForm(true);
              setEditingModule(null);
              setNewModule({ title: '', description: '' });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            Novo Módulo
          </button>
        </div>

        {/* Lista de Módulos */}
        <div className="space-y-4">
          {modules.map((module, index) => (
            <div key={module.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="text-blue-600" size={20} />
                    <h3 className="text-xl font-semibold">{module.title}</h3>
                    <span className="text-sm text-gray-500">Ordem: {module.order}</span>
                  </div>
                  <p className="text-gray-600 mb-2">{module.description}</p>
                  <p className="text-sm text-gray-500">
                    {module.lessons.length} aula{module.lessons.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReorderModules(module.id, 'up')}
                    disabled={index === 0}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => handleReorderModules(module.id, 'down')}
                    disabled={index === modules.length - 1}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingModule(module);
                      setNewModule({ title: module.title, description: module.description });
                      setShowModuleForm(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteModule(module.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Aulas do Módulo */}
              <div className="mt-4 pl-6 border-l-2 border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-700">Aulas</h4>
                  <button
                    onClick={() => {
                      setSelectedModuleId(module.id);
                      setShowLessonForm(true);
                    }}
                    className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    <Plus size={14} className="inline mr-1" />
                    Adicionar Aula
                  </button>
                </div>
                
                {module.lessons.length > 0 ? (
                  <div className="space-y-2">
                    {module.lessons.map((lesson) => (
                      <div key={lesson.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <Video size={16} className="text-gray-600" />
                        <span className="text-sm">{lesson.title}</span>
                        <span className="text-xs text-gray-500">({lesson.duration}min)</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Nenhuma aula cadastrada</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Formulário de Módulo */}
        {showModuleForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingModule ? 'Editar Módulo' : 'Novo Módulo'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título *</label>
                  <input
                    type="text"
                    value={newModule.title}
                    onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Título do módulo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição *</label>
                  <textarea
                    value={newModule.description}
                    onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Descrição do módulo"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={editingModule ? handleUpdateModule : handleCreateModule}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {editingModule ? 'Atualizar' : 'Criar'}
                </button>
                <button
                  onClick={() => {
                    setShowModuleForm(false);
                    setEditingModule(null);
                    setNewModule({ title: '', description: '' });
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Formulário de Aula */}
        {showLessonForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Nova Aula</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título *</label>
                  <input
                    type="text"
                    value={newLesson.title}
                    onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Título da aula"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <input
                    type="text"
                    value={newLesson.description}
                    onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Descrição da aula"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Conteúdo</label>
                  <textarea
                    value={newLesson.content}
                    onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Conteúdo da aula"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duração (minutos)</label>
                  <input
                    type="number"
                    value={newLesson.duration}
                    onChange={(e) => setNewLesson({ ...newLesson, duration: parseInt(e.target.value) || 0 })}
                    className="w-full border rounded px-3 py-2"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleCreateLesson}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Criar Aula
                </button>
                <button
                  onClick={() => {
                    setShowLessonForm(false);
                    setSelectedModuleId(null);
                    setNewLesson({ title: '', description: '', content: '', duration: 0 });
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instruções de uso */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Como usar este componente:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Clique em "Novo Módulo" para adicionar um novo módulo ao curso</li>
          <li>• Use as setas para cima/baixo para reordenar os módulos</li>
          <li>• Clique no ícone de lápis para editar um módulo existente</li>
          <li>• Clique no ícone de lixeira para deletar um módulo (com confirmação)</li>
          <li>• Dentro de cada módulo, use "Adicionar Aula" para criar novas aulas</li>
          <li>• A deleção de módulos remove também todas as aulas associadas (cascata)</li>
        </ul>
      </div>
    </div>
  );
};

export default ModuleCRUDDemo;
