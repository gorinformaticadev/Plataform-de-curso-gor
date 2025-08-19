// Tipos para o gerenciamento de módulos e aulas

export interface Content {
  id: string;
  type: 'video' | 'text' | 'file' | 'quiz' | 'assignment';
  title: string;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  order: number;
  isCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  order: number;
  isPublished: boolean;
  content: Content[];
  duration: number;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  isPublished: boolean;
  lessons: Lesson[];
  totalDuration: number;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  totalDuration: number;
  totalLessons: number;
  createdAt: string;
  updatedAt: string;
}

// Tipos para formulários
export interface ModuleFormData {
  title: string;
  description?: string;
}

export interface LessonFormData {
  title: string;
  description?: string;
}

export interface ContentFormData {
  type: Content['type'];
  title: string;
  content?: string;
  file?: File;
  fileUrl?: string;
}
