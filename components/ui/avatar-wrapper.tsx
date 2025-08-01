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
  return (
    <Avatar className={cn('h-10 w-10', className)}>
      {src ? (
        <AvatarImage 
          src={src} 
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
