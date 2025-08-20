'use client';

import React from 'react';
import { Module } from '@/app/types/course';
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
  BookOpen,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ModuleCardProps {
  /** Dados do módulo */
  module: Module;
  /** Callback para editar módulo */
  onEdit?: (module: Module) => void;
  /** Callback para deletar módulo */
  onDelete?: (moduleId: string) => void;
  /** Callback para alternar publicação */
  onTogglePublish?: (moduleId: string, isPublished: boolean) => void;
  /** Callback para visualizar módulo */
  onView?: (module: Module) => void;
  /** Se o card está sendo arrastado */
  isDragging?: boolean;
  /** Se o drag está habilitado */
  dragEnabled?: boolean;
  /** Props para drag and drop */
  dragProps?: any;
}

/**
 * Componente de card para exibir informações de um módulo
 * Inclui ações de edição, exclusão e publicação
 */
export function ModuleCard({
  module,
  onEdit,
  onDelete,
  onTogglePublish,
  onView,
  isDragging = false,
  dragEnabled = false,
  dragProps
}: ModuleCardProps) {
  
  /**
   * Calcula a duração total do módulo baseado nas aulas
   */
  const totalDuration = React.useMemo(() => {
    return module.lessons.reduce((total, lesson) => {
      return total + (lesson.duration || 0);
    }, 0);
  }, [module.lessons]);

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

  return (
    <Card 
      className={`
        transition-all duration-200 hover:shadow-md
        ${isDragging ? 'opacity-50 rotate-2 shadow-lg' : ''}
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
              <CardTitle className="text-lg font-semibold line-clamp-2">
                {module.title}
              </CardTitle>
              
              {module.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {module.description}
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
                <DropdownMenuItem onClick={() => onView(module)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </DropdownMenuItem>
              )}
              
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(module)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              
              {onTogglePublish && (
                <DropdownMenuItem 
                  onClick={() => onTogglePublish(module.id, !module.isPublished)}
                >
                  {module.isPublished ? (
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
                    onClick={() => onDelete(module.id)}
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
            {/* Número de aulas */}
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{module.lessons.length} aula{module.lessons.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Duração total */}
            {totalDuration > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(totalDuration)}</span>
              </div>
            )}
          </div>

          {/* Status de publicação */}
          <Badge 
            variant={module.isPublished ? "default" : "secondary"}
            className="text-xs"
          >
            {module.isPublished ? 'Publicado' : 'Rascunho'}
          </Badge>
        </div>

        {/* Ordem do módulo */}
        <div className="mt-2 text-xs text-muted-foreground">
          Módulo {module.order + 1}
        </div>
      </CardContent>
    </Card>
  );
}
