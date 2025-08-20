/**
 * Tipos TypeScript para o sistema de cursos e módulos
 */

export interface Content {
  id: string;
  type: 'video' | 'text' | 'quiz' | 'assignment' | 'file';
  title: string;
  description?: string;
  url?: string;
  content?: string;
  duration?: number; // em minutos
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  order: number;
  duration?: number; // em minutos
  contents: Content[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  modules: Module[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para formulários
export interface ModuleFormData {
  title: string;
  description?: string;
}

export interface LessonFormData {
  title: string;
  description?: string;
  duration?: number;
}

export interface ContentFormData {
  type: Content['type'];
  title: string;
  description?: string;
  url?: string;
  content?: string;
  duration?: number;
}

// Tipos para drag and drop
export interface DragItem {
  id: string;
  type: 'module' | 'lesson' | 'content';
  index: number;
}

// Tipos para upload de arquivos
export interface FileUploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
}

// Tipos para estado de carregamento
export interface LoadingState {
  loading: boolean;
  error: string | null;
}
