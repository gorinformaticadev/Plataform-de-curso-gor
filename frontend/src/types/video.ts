// Tipos de resolução de vídeo
export type VideoResolution = '720p' | '1080p' | '4K' | 'unknown';

// Interface para informações do vídeo
export interface VideoInfo {
  width: number;
  height: number;
  resolution: VideoResolution;
  duration: number;
  size: number;
}

// Limites de tamanho por resolução (em bytes)
export const RESOLUTION_SIZE_LIMITS = {
  '720p': 50 * 1024 * 1024,      // 50MB
  '1080p': 100 * 1024 * 1024,    // 100MB
  '4K': 200 * 1024 * 1024,      // 200MB
  'unknown': 50 * 1024 * 1024   // 50MB padrão para resoluções desconhecidas
};

// Função para determinar a resolução baseada nas dimensões
export const getVideoResolution = (width: number, height: number): VideoResolution => {
  // 4K: 3840x2160 ou superior
  if (width >= 3840 && height >= 2160) {
    return '4K';
  }
  
  // 1080p: 1920x1080 ou superior (mas menor que 4K)
  if (width >= 1920 && height >= 1080) {
    return '1080p';
  }
  
  // 720p: 1280x720 ou superior (mas menor que 1080p)
  if (width >= 1280 && height >= 720) {
    return '720p';
  }
  
  // Para resoluções menores que 720p, consideramos como 720p com limite reduzido
  return '720p';
};
