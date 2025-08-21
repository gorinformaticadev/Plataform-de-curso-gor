// Tipos de arquivo permitidos para vídeo
export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  'video/3gpp',
  'video/x-matroska'
];

// Tamanho máximo de arquivo (200MB para 4K)
export const MAX_FILE_SIZE = 200 * 1024 * 1024;

// Duração máxima do vídeo (em segundos)
export const MAX_VIDEO_DURATION = 3600; // 1 hora

// Interface para resultado da validação
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Valida o tipo de arquivo
 * @param file - Arquivo a ser validado
 * @returns ValidationResult
 */
export const validateFileType = (file: File): ValidationResult => {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Tipo de arquivo não suportado. Formatos aceitos: MP4, MPEG, MOV, AVI, WEBM, 3GP, MKV`
    };
  }
  return { isValid: true };
};

/**
 * Valida o tamanho do arquivo
 * @param file - Arquivo a ser validado
 * @returns ValidationResult
 */
export const validateFileSize = (file: File): ValidationResult => {
  if (file.size > MAX_FILE_SIZE) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `Arquivo muito grande (${sizeInMB}MB). Tamanho máximo permitido: 200MB`
    };
  }
  return { isValid: true };
};

/**
 * Valida a duração do vídeo
 * @param file - Arquivo de vídeo
 * @returns Promise<ValidationResult>
 */
export const validateVideoDuration = (file: File): Promise<ValidationResult> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      
      if (video.duration > MAX_VIDEO_DURATION) {
        const durationInMinutes = Math.floor(video.duration / 60);
        resolve({
          isValid: false,
          error: `Vídeo muito longo (${durationInMinutes} minutos). Duração máxima permitida: 60 minutos`
        });
      } else {
        resolve({ isValid: true });
      }
    };
    
    video.onerror = () => {
      resolve({
        isValid: false,
        error: 'Não foi possível verificar a duração do vídeo'
      });
    };
    
    video.src = URL.createObjectURL(file);
  });
};

/**
 * Validação completa do arquivo
 * @param file - Arquivo a ser validado
 * @returns Promise<ValidationResult>
 */
export const validateVideoFile = async (file: File): Promise<ValidationResult> => {
  // Valida tipo
  const typeValidation = validateFileType(file);
  if (!typeValidation.isValid) {
    return typeValidation;
  }

  // Valida tamanho
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }

  // Valida duração
  const durationValidation = await validateVideoDuration(file);
  if (!durationValidation.isValid) {
    return durationValidation;
  }

  return { isValid: true };
};

/**
 * Validação de formulário de módulo
 * @param data - Dados do formulário
 * @returns ValidationResult
 */
export const validateModuleForm = (data: {
  title: string;
  description?: string;
  order: number;
}): ValidationResult => {
  if (!data.title.trim()) {
    return {
      isValid: false,
      error: 'Título do módulo é obrigatório'
    };
  }

  if (data.title.length > 100) {
    return {
      isValid: false,
      error: 'Título do módulo deve ter no máximo 100 caracteres'
    };
  }

  if (data.description && data.description.length > 500) {
    return {
      isValid: false,
      error: 'Descrição do módulo deve ter no máximo 500 caracteres'
    };
  }

  if (data.order < 0) {
    return {
      isValid: false,
      error: 'Ordem do módulo deve ser um número positivo'
    };
  }

  return { isValid: true };
};

/**
 * Validação de formulário de aula
 * @param data - Dados do formulário
 * @returns ValidationResult
 */
export const validateLessonForm = (data: {
  title: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  order: number;
}): ValidationResult => {
  if (!data.title.trim()) {
    return {
      isValid: false,
      error: 'Título da aula é obrigatório'
    };
  }

  if (data.title.length > 100) {
    return {
      isValid: false,
      error: 'Título da aula deve ter no máximo 100 caracteres'
    };
  }

  if (data.description && data.description.length > 1000) {
    return {
      isValid: false,
      error: 'Descrição da aula deve ter no máximo 1000 caracteres'
    };
  }

  if (data.videoUrl && !isValidUrl(data.videoUrl)) {
    return {
      isValid: false,
      error: 'URL do vídeo inválida'
    };
  }

  if (data.duration && (data.duration < 0 || data.duration > MAX_VIDEO_DURATION)) {
    return {
      isValid: false,
      error: 'Duração da aula inválida'
    };
  }

  if (data.order < 0) {
    return {
      isValid: false,
      error: 'Ordem da aula deve ser um número positivo'
    };
  }

  return { isValid: true };
};

/**
 * Valida se uma URL é válida
 * @param url - URL a ser validada
 * @returns boolean
 */
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitiza texto para prevenir XSS
 * @param text - Texto a ser sanitizado
 * @returns string sanitizada
 */
export const sanitizeText = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Validação de imagem
 * @param file - Arquivo de imagem
 * @returns ValidationResult
 */
export const validateImageFile = (file: File): ValidationResult => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Formato de imagem não suportado. Use JPG, PNG, WEBP ou GIF'
    };
  }

  if (file.size > maxSize) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `Imagem muito grande (${sizeInMB}MB). Tamanho máximo: 5MB`
    };
  }

  return { isValid: true };
};
