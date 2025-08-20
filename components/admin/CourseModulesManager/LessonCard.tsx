'use client';

import React from 'react';
import { Lesson } from '@/app/types/course';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  GripVertical,
  Play,
  FileText,
  Clock,
  Copy
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LessonCardProps {
  /** Dados da aula */
  lesson: Lesson;
  /** Callback para editar aula */
  onEdit?: (lesson: Lesson) => void;
  /** Callback para deletar aula */
  onDelete?: (lessonId: string) => void;
  /** Callback para duplicar aula */
  onDuplicate?: (lessonId: string) => void;
  /** Callback para alternar publicação */
  onTogglePublish?: (lessonId: string, isPublished: boolean) => void;
  /** Callback para visualizar aula */
  onView?: (lesson: Lesson) => void;
  /** Se o card está sendo arrastado */
  isDragging?: boolean;
  /** Se o drag está habilitado */
  dragEnabled?: boolean;
  /** Props para drag and drop */
  dragProps?: any;
}

/**
 * Componente de card para exibir informações de uma aula
 * Inclui ações de edição, exclusão, duplicação e publicação
 */
export function LessonCard({
  lesson,
  onEdit,
  onDelete,
  onDuplicate,
  onTogglePublish,
  onView,
  isDragging = false,
  dragEnabled = false,
  dragProps
}: LessonCardProps) {

  /**
   * Formata a duração em minutos para horas e minutos
   */
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  /**
   * Obtém o ícone baseado no tipo de conteúdo principal
   */
  const getContentIcon = () => {
    if (lesson.contents.length === 0) {
      return <FileText className="h-4 w-4" />;
    }

    const hasVideo = lesson.contents.some(content => content.type === 'video');
    if (hasVideo) {
      return <Play className="h-4 w-4" />;
    }

    return <FileText className="h-4 w-4" />;
  };

  /**
   * Obtém a descrição dos tipos de conteúdo
   */
  const getContentDescription = () => {
    if (lesson.contents.length === 0) {
      return 'Sem conteúdo';
    }

    const contentTypes = lesson.contents.reduce((acc, content) => {
      acc[content.type] = (acc[content.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const descriptions = Object.entries(contentTypes).map(([type, count]) => {
      const typeNames = {
        video: 'vídeo',
        text: 'texto',
        quiz: 'quiz',
        assignment: 'tarefa',
        file: 'arquivo'
      };
      
      const typeName = typeNames[type as keyof typeof typeNames] || type;
      return count > 1 ? `${count} ${typeName}s` : `1 ${typeName}`;
    });

    return descriptions.join(', ');
  };

  return (
    <Card 
      className={`
        transition-all duration-200 hover:shadow-md border-l-4
        ${lesson.isPublished ? 'border-l-green-500' : 'border-l-gray-300'}
        ${isDragging ? 'opacity-50 rotate-1 shadow-lg' : ''}
        ${dragEnabled ? 'cursor-grab active:cursor-grabbing' : ''}
      `}
      {...dragProps}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2 flex-1">
            {/* Handle de drag */}
            {dragEnabled && (
              <GripVertical className="h-4 w-4 text-muted-foreground mt-1 cursor-grab" />
            )}
            
            <div className="flex-1">
              <CardTitle className="text-base font-medium line-clamp-2 flex items-center gap-2">
                {getContentIcon()}
                {lesson.title}
              </CardTitle>
              
              {lesson.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {lesson.description}
                </p>
              )}
            </div>
          </div>

          {/* Menu de ações */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(lesson)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </DropdownMenuItem>
              )}
              
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(lesson)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              
              {onDuplicate && (
                <DropdownMenuItem onClick={() => onDuplicate(lesson.id)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicar
                </DropdownMenuItem>
              )}
              
              {onTogglePublish && (
                <DropdownMenuItem 
                  onClick={() => onTogglePublish(lesson.id, !lesson.isPublished)}
                >
                  {lesson.isPublished ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Despublicar
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Publicar
                    </>
                  )}
                </DropdownMenuItem>
              )}
              
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(lesson.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {/* Duração */}
            {lesson.duration && lesson.duration > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(lesson.duration)}</span>
              </div>
            )}

            {/* Tipos de conteúdo */}
            <div className="flex items-center gap-1">
              <span>{getContentDescription()}</span>
            </div>
          </div>

          {/* Status de publicação */}
          <Badge 
            variant={lesson.isPublished ? "default" : "secondary"}
            className="text-xs"
          >
            {lesson.isPublished ? 'Publicado' : 'Rascunho'}
          </Badge>
        </div>

        {/* Ordem da aula */}
        <div className="mt-2 text-xs text-muted-foreground">
          Aula {lesson.order + 1}
        </div>

        {/* Indicador de conteúdos */}
        {lesson.contents.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {lesson.contents.slice(0, 3).map((content, index) => (
              <Badge 
                key={content.id} 
                variant="outline" 
                className="text-xs px-2 py-0"
              >
                {content.type}
              </Badge>
            ))}
            {lesson.contents.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0">
                +{lesson.contents.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
