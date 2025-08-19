import { z } from 'zod';

// Schemas de validação para formulários
export const moduleSchema = z.object({
  title: z.string()
    .min(3, 'O título deve ter pelo menos 3 caracteres')
    .max(100, 'O título não pode exceder 100 caracteres'),
  description: z.string()
    .max(500, 'A descrição não pode exceder 500 caracteres')
    .optional(),
});

export const lessonSchema = z.object({
  title: z.string()
    .min(3, 'O título deve ter pelo menos 3 caracteres')
    .max(100, 'O título não pode exceder 100 caracteres'),
  description: z.string()
    .max(500, 'A descrição não pode exceder 500 caracteres')
    .optional(),
});

export const contentSchema = z.object({
  type: z.enum(['video', 'text', 'file', 'quiz', 'assignment']),
  title: z.string()
    .min(3, 'O título deve ter pelo menos 3 caracteres')
    .max(100, 'O título não pode exceder 100 caracteres'),
  content: z.string()
    .max(10000, 'O conteúdo não pode exceder 10000 caracteres')
    .optional(),
  file: z.any().optional(),
  fileUrl: z.string().url().optional(),
});

// Tipos inferidos dos schemas
export type ModuleFormData = z.infer<typeof moduleSchema>;
export type LessonFormData = z.infer<typeof lessonSchema>;
export type ContentFormData = z.infer<typeof contentSchema>;
