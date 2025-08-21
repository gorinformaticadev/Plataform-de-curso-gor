import { z } from 'zod';

// Validação para lição
const lessonSchema = z.object({
  id: z.string().uuid('ID da lição inválido').optional(),
  title: z.string().min(1, 'Título da lição é obrigatório'),
  description: z.string().optional(),
  videoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  duration: z.number().min(1, 'Duração deve ser maior que 0'),
  order: z.number().min(0).default(0),
  published: z.boolean().default(true),
  isFree: z.boolean().default(false)
});

// Validação para módulo
const moduleSchema = z.object({
  id: z.string().uuid('ID do módulo inválido').optional(),
  title: z.string().min(1, 'Título do módulo é obrigatório'),
  description: z.string().optional(),
  lessons: z.array(lessonSchema).min(1, 'O módulo deve ter pelo menos uma lição'),
  order: z.number().min(0).default(0),
  published: z.boolean().default(true)
});

// Validação principal do curso
export const courseSchema = z.object({
  title: z.string()
    .min(5, 'Título deve ter pelo menos 5 caracteres')
    .max(100, 'Título não pode exceder 100 caracteres'),
  description: z.string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(1000, 'Descrição não pode exceder 1000 caracteres'),
  shortDescription: z.string()
    .max(200, 'Descrição curta não pode exceder 200 caracteres')
    .optional(),
  price: z.number()
    .min(0, 'Preço deve ser maior ou igual a 0')
    .max(10000, 'Preço não pode exceder R$ 10.000'),
  category: z.string()
    .min(2, 'Categoria deve ter pelo menos 2 caracteres')
    .max(50, 'Categoria não pode exceder 50 caracteres'),
  subcategory: z.string().optional(),
  image: z.string().url('URL da imagem inválida').optional().or(z.literal('')),
  thumbnail: z.string().url('URL da thumbnail inválida').optional().or(z.literal('')),
  published: z.boolean().default(false),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  language: z.string().default('pt-BR'),
  duration: z.number().min(0).optional(),
  modules: z.array(moduleSchema).min(1, 'O curso deve ter pelo menos um módulo'),
  tags: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  whatYouLearn: z.array(z.string()).default([]),
  targetAudience: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  instructorName: z.string().min(2, 'Nome do instrutor é obrigatório'),
  instructorBio: z.string().optional(),
  instructorAvatar: z.string().url('URL do avatar inválida').optional().or(z.literal(''))
});

// Validação para atualização de curso
export const courseUpdateSchema = courseSchema.partial().extend({
  id: z.string().uuid('ID do curso inválido')
});

// Validação para filtros
export const courseFiltersSchema = z.object({
  category: z.string().optional(),
  subcategory: z.string().optional(),
  level: z.enum(['beginner', 'mediate', 'advanced']).optional(),
  published: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'title', 'price', 'enrolledStudents']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Validação para importação de curso
export const courseImportSchema = z.object({
  course: courseSchema,
  importOptions: z.object({
    skipExisting: z.boolean().default(true),
    updateExisting: z.boolean().default(false),
    notifyStudents: z.boolean().default(false)
  })
});

// Validação para configurações do curso
export const courseSettingsSchema = z.object({
  allowDiscussions: z.boolean().default(true),
  allowReviews: z.boolean().default(true),
  certificateEnabled: z.boolean().default(false),
  certificateTemplate: z.string().optional(),
  welcomeMessage: z.string().optional(),
  completionMessage: z.string().optional(),
  prerequisites: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  showProgress: z.boolean().default(true),
  showDuration: z.boolean().default(true),
  allowDownload: z.boolean().default(false),
  maxStudents: z.number().min(0).optional()
});

// Validação para avaliação de curso
export const courseReviewSchema = z.object({
  courseId: z.string().uuid('ID do curso inválido'),
  rating: z.number()
    .min(1, 'Avaliação mínima é 1 estrela')
    .max(5, 'Avaliação máxima é 5 estrelas'),
  comment: z.string()
    .max(500, 'Comentário não pode exceder 500 caracteres')
    .optional()
});

// Validação para progresso do aluno
export const studentProgressSchema = z.object({
  courseId: z.string().uuid('ID do curso inválido'),
  studentId: z.string().uuid('ID do aluno inválido'),
  completedLessons: z.array(z.string().uuid()).default([]),
  currentLesson: z.string().uuid('ID da lição atual inválido').optional(),
  progress: z.number()
    .min(0, 'Progresso mínimo é 0%')
    .max(100, 'Progresso máximo é 100%')
    .default(0),
  lastAccess: z.date().optional(),
  completedAt: z.date().optional()
});

// Validação para certificado
export const certificateSchema = z.object({
  courseId: z.string().uuid('ID do curso inválido'),
  studentId: z.string().uuid('ID do aluno inválido'),
  issuedAt: z.date().default(() => new Date()),
  expiresAt: z.date().optional(),
  downloadUrl: z.string().url('URL de download inválida').optional(),
  verificationCode: z.string().min(10, 'Código de verificação inválido')
});

// Validação para webhook de curso
export const courseWebhookSchema = z.object({
  type: z.enum([
    'course.created',
    'course.updated',
    'course.published',
    'course.deleted'
  ]),
  data: courseSchema,
  timestamp: z.date().default(() => new Date())
});

// Validação para notificação de curso
export const courseNotificationSchema = z.object({
  courseId: z.string().uuid('ID do curso inválido'),
  type: z.enum([
    'new_lesson',
    'course_update',
    'course_completion',
    'certificate_ready'
  ]),
  title: z.string().min(1, 'Título da notificação é obrigatório'),
  message: z.string().min(1, 'Mensagem da notificação é obrigatória'),
  sentAt: z.date().default(() => new Date())
});

// Validação para estatísticas do curso
export const courseStatsSchema = z.object({
  totalStudents: z.number().min(0).default(0),
  completedStudents: z.number().min(0).default(0),
  averageProgress: z.number().min(0).max(100).default(0),
  averageRating: z.number().min(0).max(5).default(0),
  totalRevenue: z.number().min(0).default(0),
  monthlyRevenue: z.number().min(0).default(0),
  completionRate: z.number().min(0).max(100).default(0),
  activeStudents: z.number().min(0).default(0)
});

// Validação para análises do curso
export const courseAnalyticsSchema = z.object({
  courseId: z.string().uuid('ID do curso inválido'),
  dailyViews: z.array(z.object({
    date: z.date(),
    views: z.number().min(0)
  })).default([]),
  enrollmentTrend: z.array(z.object({
    date: z.date(),
    enrollments: z.number().min(0)
  })).default([]),
  completionRate: z.number().min(0).max(100).default(0),
  averageSessionDuration: z.number().min(0).default(0),
  topLessons: z.array(z.object({
    lessonId: z.string().uuid('ID da lição inválido'),
    title: z.string().min(1, 'Título da lição é obrigatório'),
    views: z.number().min(0).default(0),
    completionRate: z.number().min(0).max(100).default(0)
  })).default([])
});

// Validação para categoria
export const categorySchema = z.object({
  id: z.string().uuid('ID da categoria inválido'),
  name: z.string()
    .min(2, 'Nome da categoria deve ter pelo menos 2 caracteres')
    .max(50, 'Nome da categoria não pode exceder 50 caracteres'),
  slug: z.string()
    .min(2, 'Slug da categoria deve ter pelo menos 2 caracteres')
    .max(50, 'Slug da categoria não pode exceder 50 caracteres'),
  description: z.string()
    .max(200, 'Descrição não pode exceder 200 caracteres')
    .optional(),
  image: z.string().url('URL da imagem inválida').optional(),
  courseCount: z.number().min(0).default(0),
  isActive: z.boolean().default(true)
});

// Validação para curso externo
export const externalCourseSchema = z.object({
  id: z.string().min(1, 'ID do curso externo é obrigatório'),
  title: z.string()
    .min(5, 'Título deve ter pelo menos 5 caracteres')
    .max(100, 'Título não pode exceder 100 caracteres'),
  description: z.string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(1000, 'Descrição não pode exceder 1000 caracteres'),
  instructor: z.string()
    .min(2, 'Nome do instrutor deve ter pelo menos 2 caracteres')
    .max(100, 'Nome do instrutor não pode exceder 100 caracteres'),
  platform: z.string()
    .min(2, 'Nome da plataforma deve ter pelo menos 2 caracteres')
    .max(50, 'Nome da plataforma não pode exceder 50 caracteres'),
  url: z.string().url('URL do curso externo inválida'),
  price: z.number().min(0).optional(),
  duration: z.number().min(0).default(0),
  rating: z.number().min(0).max(5).default(0),
  enrolled: z.number().min(0).default(0),
  lastUpdated: z.date().default(() => new Date())
});

// Validação para importação/exportação de curso
export const courseExportSchema = z.object({
  course: courseSchema,
  modules: z.array(moduleSchema),
  lessons: z.array(lessonSchema),
  students: z.array(z.object({
    id: z.string().uuid('ID do aluno inválido'),
    email: z.string().email('Email do aluno inválido'),
    progress: z.number().min(0).max(100).default(0),
    completedAt: z.date().optional()
  })),
  reviews: z.array(courseReviewSchema)
});

// Validação para configuração de curso
export const courseConfigSchema = z.object({
  courseId: z.string().uuid('ID do curso inválido'),
  config: courseSettingsSchema,
  updatedAt: z.date().default(() => new Date())
});

// Validação para evento de curso
export const courseEventSchema = z.object({
  type: z.enum([
    'course.created',
    'course.updated',
    'course.published',
    'course.deleted',
    'course.completed',
    'course.enrolled',
    'course.unenrolled'
  ]),
  courseId: z.string().uuid('ID do curso inválido'),
  userId: z.string().uuid('ID do usuário inválido'),
  timestamp: z.date().default(() => new Date()),
  metadata: z.record(z.any()).optional()
});

// Validação para erro de curso
export const courseErrorSchema = z.object({
  code: z.string().min(1, 'Código de erro é obrigatório'),
  message: z.string().min(1, 'Mensagem de erro é obrigatória'),
  details: z.record(z.any()).optional(),
  timestamp: z.date().default(() => new Date())
});

// Validação para resposta de curso
export const courseResponseSchema = z.object({
  success: z.boolean().default(true),
  data: z.any().optional(),
  message: z.string().optional(),
  error: courseErrorSchema.optional(),
  timestamp: z.date().default(() => new Date())
});

// Validação para paginação de cursos
export const coursePaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  total: z.number().min(0).default(0),
  totalPages: z.number().min(0).default(0),
  hasNext: z.boolean().default(false),
  hasPrev: z.boolean().default(false)
});

// Validação para resposta de cursos paginados
export const paginatedCoursesSchema = z.object({
  courses: z.array(courseSchema),
  pagination: coursePaginationSchema
});

// Validação para estatísticas de cursos
export const coursesStatsSchema = z.object({
  totalCourses: z.number().min(0).default(0),
  publishedCourses: z.number().min(0).default(0),
  draftCourses: z.number().min(0).default(0),
  totalStudents: z.number().min(0).default(0),
  totalRevenue: z.number().min(0).default(0),
  averageRating: z.number().min(0).max(5).default(0),
  mostPopularCategory: z.string().optional(),
  mostActiveInstructor: z.string().optional()
});

// Tipos derivados
export type Course = z.infer<typeof courseSchema>;
export type CourseUpdate = z.infer<typeof courseUpdateSchema>;
export type CourseFilters = z.infer<typeof courseFiltersSchema>;
export type CourseSettings = z.infer<typeof courseSettingsSchema>;
export type CourseReview = z.infer<typeof courseReviewSchema>;
export type StudentProgress = z.infer<typeof studentProgressSchema>;
export type Certificate = z.infer<typeof certificateSchema>;
export type CourseStats = z.infer<typeof courseStatsSchema>;
export type CourseAnalytics = z.infer<typeof courseAnalyticsSchema>;
export type Category = z.infer<typeof categorySchema>;
