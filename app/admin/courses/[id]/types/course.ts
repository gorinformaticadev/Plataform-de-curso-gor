// Tipos para o sistema de cursos

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  duration: number; // em minutos
  order: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
  order: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  category: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  image?: string;
  thumbnail?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration?: number;
  modules: Module[];
  instructorId: string;
  instructor?: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  enrolledStudents?: number;
  rating?: number;
  totalLessons?: number;
  totalDuration?: number; // em minutos
}

export interface CourseCreateInput {
  title: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  published?: boolean;
  level: 'beginner' | 'intermediate' | 'advanced';
  modules: ModuleCreateInput[];
}

export interface ModuleCreateInput {
  title: string;
  description?: string;
  lessons: LessonCreateInput[];
}

export interface LessonCreateInput {
  title: string;
  description?: string;
  videoUrl?: string;
  duration: number;
}

export interface CourseUpdateInput extends Partial<CourseCreateInput> {
  id: string;
}

// Tipos para estatísticas
export interface CourseStats {
  totalStudents: number;
  completedStudents: number;
  averageProgress: number;
  averageRating: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

// Tipos para filtros
export interface CourseFilters {
  category?: string;
  level?: string;
  published?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'title' | 'price' | 'enrolledStudents';
  sortOrder?: 'asc' | 'desc';
}

// Tipos para paginação
export interface PaginatedCourses {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tipos para categorias
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  courseCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para progresso do aluno
export interface StudentProgress {
  courseId: string;
  studentId: string;
  completedLessons: string[];
  currentLesson?: string;
  progress: number; // 0-100
  lastAccessedAt: Date;
  completedAt?: Date;
}

// Tipos para avaliações
export interface CourseReview {
  id: string;
  courseId: string;
  studentId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para certificados
export interface Certificate {
  id: string;
  courseId: string;
  studentId: string;
  issuedAt: Date;
  expiresAt?: Date;
  downloadUrl: string;
  verificationCode: string;
}

// Tipos para analytics
export interface CourseAnalytics {
  courseId: string;
  dailyViews: Array<{
    date: string;
    views: number;
  }>;
  enrollmentTrend: Array<{
    date: string;
    enrollments: number;
  }>;
  completionRate: number;
  averageSessionDuration: number;
  topLessons: Array<{
    lessonId: string;
    title: string;
    views: number;
    completionRate: number;
  }>;
}

// Tipos para webhooks
export interface CourseWebhookEvent {
  type: 'course.created' | 'course.updated' | 'course.published' | 'course.deleted';
  data: Course;
  timestamp: Date;
}

// Tipos para integração com plataformas externas
export interface ExternalCourse {
  id: string;
  title: string;
  description: string;
  instructor: string;
  platform: string;
  url: string;
  price?: number;
  duration: number;
  rating: number;
  enrolled: number;
  lastUpdated: Date;
}

// Tipos para importação/exportação
export interface CourseExport {
  course: Course;
  modules: Module[];
  lessons: Lesson[];
  students: Array<{
    id: string;
    email: string;
    progress: number;
    completedAt?: Date;
  }>;
  reviews: CourseReview[];
}

export interface CourseImport {
  course: CourseCreateInput;
  importOptions: {
    skipExisting: boolean;
    updateExisting: boolean;
    notifyStudents: boolean;
  };
}

// Tipos para configurações do curso
export interface CourseSettings {
  allowDiscussions: boolean;
  allowReviews: boolean;
  certificateEnabled: boolean;
  certificateTemplate?: string;
  welcomeMessage?: string;
  completionMessage?: string;
  prerequisites: string[];
  tags: string[];
}

// Tipos para notificações
export interface CourseNotification {
  id: string;
  courseId: string;
  type: 'new_lesson' | 'course_update' | 'course_completion' | 'certificate_ready';
  title: string;
  message: string;
  sentAt: Date;
  readBy: string[];
}
