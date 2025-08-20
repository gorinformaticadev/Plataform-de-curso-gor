/**
 * Hooks customizados para gerenciamento de cursos e módulos
 */

export { useModuleManager } from './useModuleManager';
export { useLessonManager } from './useLessonManager';
export { useDragAndDrop, useSimpleDragAndDrop } from './useDragAndDrop';
export { useFileUpload, useImageUpload } from './useFileUpload';

// Re-exportar tipos úteis
export type { DragItem } from './useDragAndDrop';
export type { FileUploadProgress } from './useFileUpload';
