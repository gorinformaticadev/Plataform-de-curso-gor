// Tipos para o gerenciamento de módulos e aulas
export interface LessonContent {
  id?: string;
  type: "VIDEO" | "TEXT" | "QUIZ";
  videoUrl?: string;
  duration?: number;
  content?: string;
  quizData?: any;
  videoMethod?: "link" | "upload";
  thumbnailUrl?: string;
}

export interface Lesson {
  id?: string;
  title: string;
  description?: string;
  order: number;
  contents: LessonContent[];
}

export interface Module {
  id?: string;
  title: string;
  description: string;
  order: number;
  contents: Lesson[];
  isExpanded?: boolean;
}

export interface CourseModulesManagerProps {
  modules: Module[];
  onModulesChange: (modules: Module[]) => void;
  token: string;
  courseId: string;
}

// Tipos para formulários
export interface ModuleFormData {
  title: string;
  description: string;
}

export interface LessonFormData {
  title: string;
  description: string;
  selectedTypes: string[];
  videoUrl?: string;
  textContent?: string;
  videoFile?: File;
  thumbnailFile?: File;
  videoMethod?: "link" | "upload";
}
