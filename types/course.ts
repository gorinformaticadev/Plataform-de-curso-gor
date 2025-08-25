// Tipos para o sistema de cursos

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;
  thumbnail?: string;
  modules: Module[];
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  title: string;
  content?: string;
  videoUrl?: string;
  duration?: number;
  order: number;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  resources?: Resource[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'image' | 'link';
  url: string;
  size?: number;
  createdAt: Date;
}

export interface CourseFormData {
  title: string;
  description: string;
  price: number;
  duration: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;
  thumbnail?: string;
  modules: Module[];
  published: boolean;
}

// Tipos para formulário
export interface FormModule {
  id: string;
  title: string;
  description?: string;
  lessons: FormLesson[];
}

export interface FormLesson {
  id: string;
  title: string;
  content?: string;
  videoUrl?: string;
  duration?: number;
  type: 'video' | 'text' | 'quiz' | 'assignment';
}

// Tipos para upload
export interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
}

export interface MediaUploadResponse {
  url: string;
  publicId: string;
  type: 'image' | 'video';
  size: number;
}
