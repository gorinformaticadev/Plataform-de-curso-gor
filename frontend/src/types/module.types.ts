// Tipos baseados nos testes de integração
export interface Module {
  id?: string;
  title: string;
  description: string;
  courseId: string;
  order: number;
  lessons?: Lesson[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Lesson {
  id?: string;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  duration: number;
  order: number;
  moduleId: string;
  createdAt?: string;
  updatedAt?: string;
}

// Tipos para respostas da API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Tipos para formulários
export interface ModuleFormData {
  title: string;
  description: string;
  courseId: string;
  order: number;
}

export interface LessonFormData {
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  duration: number;
  order: number;
  moduleId: string;
}

// Tipos para validação
export interface ValidationError {
  field: string;
  message: string;
}

// Tipos para reordenação
export interface ReorderItem {
  id: string;
  order: number;
}

// Configuração da API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
