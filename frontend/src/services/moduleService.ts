import axios from 'axios';
import { 
  Module, 
  Lesson, 
  ApiResponse, 
  ModuleFormData, 
  LessonFormData,
  ReorderItem,
  API_BASE_URL 
} from '../types/module.types';

// Configuração do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Serviço para Módulos
export const moduleService = {
  // Buscar todos os módulos de um curso
  async getModulesByCourse(courseId: string): Promise<Module[]> {
    const response = await api.get<ApiResponse<Module[]>>(`/courses/${courseId}/modules`);
    return response.data.data;
  },

  // Buscar módulo específico
  async getModule(moduleId: string): Promise<Module> {
    const response = await api.get<ApiResponse<Module>>(`/modules/${moduleId}`);
    return response.data.data;
  },

  // Criar novo módulo
  async createModule(moduleData: ModuleFormData): Promise<Module> {
    const response = await api.post<ApiResponse<Module>>('/modules', moduleData);
    return response.data.data;
  },

  // Atualizar módulo
  async updateModule(moduleId: string, moduleData: Partial<ModuleFormData>): Promise<Module> {
    const response = await api.patch<ApiResponse<Module>>(`/modules/${moduleId}`, moduleData);
    return response.data.data;
  },

  // Deletar módulo (com deleção em cascata das aulas)
  async deleteModule(moduleId: string): Promise<void> {
    await api.delete(`/modules/${moduleId}`);
  },

  // Reordenar módulos
  async reorderModules(courseId: string, reorderData: ReorderItem[]): Promise<void> {
    await api.patch(`/courses/${courseId}/modules/reorder`, { modules: reorderData });
  },
};

// Serviço para Aulas
export const lessonService = {
  // Buscar todas as aulas de um módulo
  async getLessonsByModule(moduleId: string): Promise<Lesson[]> {
    const response = await api.get<ApiResponse<Lesson[]>>(`/modules/${moduleId}/lessons`);
    return response.data.data;
  },

  // Buscar aula específica
  async getLesson(lessonId: string): Promise<Lesson> {
    const response = await api.get<ApiResponse<Lesson>>(`/lessons/${lessonId}`);
    return response.data.data;
  },

  // Criar nova aula
  async createLesson(lessonData: LessonFormData): Promise<Lesson> {
    const response = await api.post<ApiResponse<Lesson>>('/lessons', lessonData);
    return response.data.data;
  },

  // Atualizar aula
  async updateLesson(lessonId: string, lessonData: Partial<LessonFormData>): Promise<Lesson> {
    const response = await api.patch<ApiResponse<Lesson>>(`/lessons/${lessonId}`, lessonData);
    return response.data.data;
  },

  // Deletar aula
  async deleteLesson(lessonId: string): Promise<void> {
    await api.delete(`/lessons/${lessonId}`);
  },

  // Reordenar aulas
  async reorderLessons(moduleId: string, reorderData: ReorderItem[]): Promise<void> {
    await api.patch(`/modules/${moduleId}/lessons/reorder`, { lessons: reorderData });
  },
};

// Serviço para upload de arquivos
export const uploadService = {
  async uploadVideo(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<{ url: string }>>('/uploads/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data.url;
  },
};
