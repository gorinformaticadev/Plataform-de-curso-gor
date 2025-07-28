'use client'

import { Avatar, AvatarImage, AvatarFallback } from './avatar'
import { cn } from '@/lib/utils'

interface AvatarWrapperProps {
  src?: string
  alt?: string
  className?: string
  fallback?: React.ReactNode
}

export function AvatarWrapper({
  src,
  alt = 'Avatar',
  className,
  fallback,
}: AvatarWrapperProps) {
  // Remove a parte '/api' da URL se existir
  const correctedSrc = src?.replace('/api', '') || src

  return (
    <Avatar className={cn('h-10 w-10', className)}>
      {correctedSrc ? (
        <AvatarImage 
          src={correctedSrc} 
          alt={alt}
          className="object-cover"
        />
      ) : (
        <AvatarFallback>
          {fallback || alt.charAt(0).toUpperCase()}
        </AvatarFallback>
      )}
    </Avatar>
  )
}
