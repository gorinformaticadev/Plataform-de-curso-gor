/**
 * Exportações dos componentes do CourseModulesManager
 * Fase 3 da refatoração - Componentes reutilizáveis
 */

// Componentes de Card
export { ModuleCard } from './ModuleCard';
export { LessonCard } from './LessonCard';

// Componentes de Formulário
export { ModuleForm, CompactModuleForm } from './ModuleForm';
export { LessonForm, CompactLessonForm } from './LessonForm';

// Componentes de Preview
export { ContentPreview, ContentPreviewList } from './ContentPreview';

// Componente principal refatorado
export { default as CourseModulesManagerRefactored } from './CourseModulesManagerRefactored';

// Re-exportar tipos para conveniência
export type { 
  Module, 
  Lesson, 
  Content, 
  ModuleFormData, 
  LessonFormData,
  ContentFormData 
} from '@/app/types/course';
