/**
 * Componente reutilizável para exibição de imagens de curso
 * Implementa fallback robusto e tratamento de erros
 */

'use client';

import { useState, useCallback } from 'react';
import { ImageUrlBuilder } from '@/lib/image-config';
import { cn } from '@/lib/utils';

interface CourseImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function CourseImage({ 
  src, 
  alt, 
  className,
  fallbackSrc,
  onError,
  onLoad,
  width,
  height,
  priority = false
}: CourseImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(
    ImageUrlBuilder.buildImageUrl(src) || undefined
  );
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const defaultFallback = fallbackSrc || ImageUrlBuilder.getDefaultFallbackUrl();

  const handleError = useCallback(() => {
    console.warn(`Erro ao carregar imagem: ${currentSrc}`);
    
    if (!hasError && currentSrc !== defaultFallback) {
      setHasError(true);
      setCurrentSrc(defaultFallback);
      onError?.();
    }
  }, [currentSrc, defaultFallback, hasError, onError]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  // Se não há src e nem fallback, não renderiza nada
  if (!currentSrc && !defaultFallback) {
    return null;
  }

  const imageProps = {
    src: currentSrc || defaultFallback,
    alt,
    onError: handleError,
    onLoad: handleLoad,
    className: cn(
      'transition-opacity duration-200',
      isLoading && 'opacity-50',
      className
    ),
    ...(width && { width }),
    ...(height && { height }),
  };

  return (
    <img
      {...imageProps}
      loading={priority ? 'eager' : 'lazy'}
    />
  );
}

/**
 * Variante especializada para thumbnails de curso
 */
interface CourseThumbnailProps extends Omit<CourseImageProps, 'alt'> {
  courseTitle: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  rounded?: boolean;
}

export function CourseThumbnail({
  courseTitle,
  size = 'md',
  rounded = true,
  src,
  className,
  ...props
}: CourseThumbnailProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  };

  const baseClasses = [
    'object-cover',
    'bg-gray-100',
    className || sizeClasses[size],  // Usar className se fornecida, senão usar tamanho padrão
    rounded && 'rounded-lg'
  ].filter(Boolean).join(' ');

  return (
    <CourseImage
      src={src}
      alt={`Thumbnail do curso: ${courseTitle}`}
      className={baseClasses}
      {...props}
    />
  );
}

/**
 * Hook personalizado para gerenciar estado de imagem
 */
export function useCourseImageState(initialSrc?: string | null) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(
    ImageUrlBuilder.buildImageUrl(initialSrc) || undefined
  );
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(!!initialSrc);

  const updateImageSrc = useCallback((newSrc?: string | null) => {
    const processedSrc = ImageUrlBuilder.buildImageUrl(newSrc);
    setImageSrc(processedSrc);
    setHasError(false);
    setIsLoading(!!processedSrc);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  return {
    imageSrc,
    hasError,
    isLoading,
    updateImageSrc,
    handleError,
    handleLoad
  };
}