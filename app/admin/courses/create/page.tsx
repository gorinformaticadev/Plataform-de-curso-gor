'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCourseForm } from './hooks/useCourseForm';
import { CourseFormData } from '@/types/course';

// Componentes do formulário
import { RichTextEditor } from './components/RichTextEditor';
import { ImageUpload } from './components/ImageUpload';
import { CategorySelect } from './components/CategorySelect';
import { DifficultySelect } from './components/DifficultySelect';

export default function CreateCoursePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'basic' | 'modules' | 'settings'>('basic');
  
  const {
    formData,
    errors,
    isLoading,
    updateField,
    handleSubmit,
    saveAsDraft,
    validateForm
  } = useCourseForm({});

  const handleTabChange = (tab: 'basic' | 'modules' | 'settings') => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Criar Novo Curso</h1>
          <p className="mt-2 text-gray-600">
            Preencha as informações abaixo para criar um novo curso
          </p>
        </div>

        {/* Abas de navegação */}
        <div className="mb-6">
          <nav className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'basic', label: 'Informações Básicas' },
              { id: 'modules', label: 'Módulos' },
              { id: 'settings', label: 'Configurações' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Aba: Informações Básicas */}
          {activeTab === 'basic' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Informações Básicas do Curso
              </h2>
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                {/* Título */}
                <div className="sm:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Título do Curso *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    } focus:border-blue-500 focus:ring-blue-500`}
                    placeholder="Ex: Curso Completo de JavaScript"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Descrição */}
                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Descrição *
                  </label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) => updateField('description', value)}
                    placeholder="Descreva detalhadamente o que o aluno vai aprender..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                {/* Categoria */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Categoria *
                  </label>
                  <CategorySelect
                    value={formData.category}
                    onChange={(value) => updateField('category', value)}
                  />
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                  )}
                </div>

                {/* Nível */}
                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                    Nível de Dificuldade *
                  </label>
                  <DifficultySelect
                    value={formData.level}
                    onChange={(value) => updateField('level', value)}
                  />
                  {errors.level && (
                    <p className="mt-1 text-sm text-red-600">{errors.level}</p>
                  )}
                </div>

                {/* Preço */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => updateField('price', parseFloat(e.target.value))}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.price ? 'border-red-300' : 'border-gray-300'
                    } focus:border-blue-500 focus:ring-blue-500`}
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                  )}
                </div>

                {/* Duração */}
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                    Duração *
                  </label>
                  <input
                    type="text"
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => updateField('duration', e.target.value)}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      errors.duration ? 'border-red-300' : 'border-gray-300'
                    } focus:border-blue-500 focus:ring-blue-500`}
                    placeholder="Ex: 10 horas, 2 semanas"
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                  )}
                </div>

                {/* Thumbnail */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Imagem de Capa
                  </label>
                  <ImageUpload
                    value={formData.thumbnail}
                    onChange={(url) => updateField('thumbnail', url)}
                    type="course"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Aba: Módulos */}
          {activeTab === 'modules' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Módulos do Curso
              </h2>
              
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Gerenciamento de módulos
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Os módulos serão adicionados após criar o curso básico.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Voltar para Informações Básicas
                </button>
              </div>
            </div>
          )}

          {/* Aba: Configurações */}
          {activeTab === 'settings' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Configurações do Curso
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => updateField('published', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Publicar curso imediatamente
                    </span>
                  </label>
                </div>
                
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Você poderá adicionar módulos e lições após criar o curso básico.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={saveAsDraft}
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : 'Salvar como Rascunho'}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Criando...' : 'Criar Curso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
