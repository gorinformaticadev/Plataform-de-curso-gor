/**
 * Schemas de validação Zod para o sistema de cursos
 */
import { z } from 'zod';

// Schema para conteúdo
export const contentSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['video', 'text', 'quiz', 'assignment', 'file']),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  url: z.string().url().optional(),
  content: z.string().optional(),
  duration: z.number().positive().optional(),
  order: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Schema para aula
export const lessonSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Título da aula é obrigatório'),
  description: z.string().optional(),
  order: z.number().int().nonnegative(),
  duration: z.number().positive().optional(),
  contents: z.array(contentSchema),
  isPublished: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Schema para módulo
export const moduleSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Título do módulo é obrigatório'),
  description: z.string().optional(),
  order: z.number().int().nonnegative(),
  lessons: z.array(lessonSchema),
  isPublished: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Schema para curso
export const courseSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Título do curso é obrigatório'),
  description: z.string().optional(),
  thumbnail: z.string().url().optional(),
  modules: z.array(moduleSchema),
  isPublished: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Schemas para formulários
export const moduleFormSchema = z.object({
  title: z.string().min(1, 'Título do módulo é obrigatório'),
  description: z.string().optional()
});

export const lessonFormSchema = z.object({
  title: z.string().min(1, 'Título da aula é obrigatório'),
  description: z.string().optional(),
  duration: z.number().positive().optional()
});

export const contentFormSchema = z.object({
  type: z.enum(['video', 'text', 'quiz', 'assignment', 'file']),
  title: z.string().min(1, 'Título do conteúdo é obrigatório'),
  description: z.string().optional(),
  url: z.string().url().optional(),
  content: z.string().optional(),
  duration: z.number().positive().optional()
});

// Tipos inferidos dos schemas
export type Content = z.infer<typeof contentSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type Module = z.infer<typeof moduleSchema>;
export type Course = z.infer<typeof courseSchema>;
export type ModuleFormData = z.infer<typeof moduleFormSchema>;
export type LessonFormData = z.infer<typeof lessonFormSchema>;
export type ContentFormData = z.infer<typeof contentFormSchema>;
