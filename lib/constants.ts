import { 
  Code2, 
  Palette, 
  Camera, 
  Music, 
  BookOpen, 
  Briefcase, 
  Heart, 
  Globe,
  TrendingUp,
  Megaphone
} from 'lucide-react'

export const CATEGORY_OPTIONS = [
  { value: 'programming', label: 'Programação', icon: Code2 },
  { value: 'design', label: 'Design', icon: Palette },
  { value: 'photography', label: 'Fotografia', icon: Camera },
  { value: 'music', label: 'Música', icon: Music },
  { value: 'business', label: 'Negócios', icon: Briefcase },
  { value: 'marketing', label: 'Marketing', icon: Megaphone },
  { value: 'health', label: 'Saúde', icon: Heart },
  { value: 'languages', label: 'Idiomas', icon: Globe },
  { value: 'finance', label: 'Finanças', icon: TrendingUp },
  { value: 'other', label: 'Outros', icon: BookOpen }
] as const

export type CourseCategory = typeof CATEGORY_OPTIONS[number]['value']

export const DIFFICULTY_LEVELS = [
  { value: 'BEGINNER', label: 'Iniciante', color: 'text-green-600 bg-green-100' },
  { value: 'INTERMEDIATE', label: 'Intermediário', color: 'text-yellow-600 bg-yellow-100' },
  { value: 'ADVANCED', label: 'Avançado', color: 'text-red-600 bg-red-100' }
] as const

export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number]['value']

export const COURSE_STATUS = {
  draft: { label: 'Rascunho', color: 'text-gray-600 bg-gray-100' },
  published: { label: 'Publicado', color: 'text-green-600 bg-green-100' },
  archived: { label: 'Arquivado', color: 'text-red-600 bg-red-100' }
} as const

export type CourseStatus = keyof typeof COURSE_STATUS

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
