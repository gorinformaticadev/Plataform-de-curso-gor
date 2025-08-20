'use client';

import React from 'react';
import { Content } from '@/app/types/course';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  FileText, 
  HelpCircle, 
  FileCheck, 
  Download,
  Eye,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ContentPreviewProps {
  /** Dados do conteúdo */
  content: Content;
  /** Callback para visualizar conteúdo */
  onView?: (content: Content) => void;
  /** Callback para baixar conteúdo */
  onDownload?: (content: Content) => void;
  /** Se deve mostrar ações */
  showActions?: boolean;
  /** Tamanho do preview */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Componente para preview de conteúdo de aulas
 * Suporta diferentes tipos: video, text, quiz, assignment, file
 */
export function ContentPreview({
  content,
  onView,
  onDownload,
  showActions = true,
  size = 'md'
}: ContentPreviewProps) {

  /**
   * Obtém o ícone baseado no tipo de conteúdo
   */
  const getContentIcon = () => {
    const iconClass = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';
    
    switch (content.type) {
      case 'video':
        return <Play className={`${iconClass} text-red-500`} />;
      case 'text':
        return <FileText className={`${iconClass} text-blue-500`} />;
      case 'quiz':
        return <HelpCircle className={`${iconClass} text-purple-500`} />;
      case 'assignment':
        return <FileCheck className={`${iconClass} text-green-500`} />;
      case 'file':
        return <Download className={`${iconClass} text-gray-500`} />;
      default:
        return <FileText className={`${iconClass} text-gray-500`} />;
    }
  };

  /**
   * Obtém a cor do badge baseado no tipo
   */
  const getBadgeVariant = () => {
    switch (content.type) {
      case 'video':
        return 'destructive';
      case 'text':
        return 'default';
      case 'quiz':
        return 'secondary';
      case 'assignment':
        return 'outline';
      case 'file':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  /**
   * Obtém o nome amigável do tipo
   */
  const getTypeName = () => {
    const typeNames = {
      video: 'Vídeo',
      text: 'Texto',
      quiz: 'Quiz',
      assignment: 'Tarefa',
      file: 'Arquivo'
    };
    return typeNames[content.type] || content.type;
  };

  /**
   * Formata a duração em minutos
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
   * Renderiza o preview baseado no tipo de conteúdo
   */
  const renderContentPreview = () => {
    switch (content.type) {
      case 'video':
        return (
          <div className="space-y-2">
            {content.url && (
              <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                <div className="text-center">
                  <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Preview do vídeo</p>
                </div>
              </div>
            )}
            {content.duration && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(content.duration)}</span>
              </div>
            )}
          </div>
        );

      case 'text':
        return (
          <div className="space-y-2">
            {content.content && (
              <div className="bg-gray-50 p-3 rounded-md max-h-32 overflow-hidden">
                <p className="text-sm text-gray-700 line-clamp-4">
                  {content.content.substring(0, 200)}
                  {content.content.length > 200 && '...'}
                </p>
              </div>
            )}
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-2">
            <Alert>
              <HelpCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Quiz interativo com perguntas e respostas
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'assignment':
        return (
          <div className="space-y-2">
            <Alert>
              <FileCheck className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Tarefa para os alunos completarem
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'file':
        return (
          <div className="space-y-2">
            {content.url && (
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                <Download className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 flex-1">
                  Arquivo disponível para download
                </span>
                {onDownload && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDownload(content)}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center py-4 text-gray-500">
            <FileText className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Tipo de conteúdo não reconhecido</p>
          </div>
        );
    }
  };

  const cardClass = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-base' : 'text-sm';

  return (
    <Card className={`w-full ${cardClass}`}>
      <CardHeader className={size === 'sm' ? 'pb-2' : 'pb-3'}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2 flex-1">
            {getContentIcon()}
            <div className="flex-1 min-w-0">
              <CardTitle className={`${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'} font-medium line-clamp-2`}>
                {content.title}
              </CardTitle>
              {content.description && (
                <p className={`${size === 'sm' ? 'text-xs' : 'text-sm'} text-muted-foreground mt-1 line-clamp-2`}>
                  {content.description}
                </p>
              )}
            </div>
          </div>

          <Badge variant={getBadgeVariant()} className="text-xs">
            {getTypeName()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className={size === 'sm' ? 'pt-0 pb-2' : 'pt-0'}>
        {renderContentPreview()}

        {showActions && (onView || onDownload) && (
          <div className="flex gap-2 mt-3 pt-3 border-t">
            {onView && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onView(content)}
                className="flex-1"
              >
                <Eye className="mr-2 h-3 w-3" />
                Visualizar
              </Button>
            )}
            
            {onDownload && content.type === 'file' && content.url && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDownload(content)}
              >
                <Download className="mr-2 h-3 w-3" />
                Baixar
              </Button>
            )}
          </div>
        )}

        {/* Informações adicionais */}
        <div className="mt-2 text-xs text-muted-foreground">
          Posição: {content.order + 1}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Lista de previews de conteúdo
 */
interface ContentPreviewListProps {
  /** Lista de conteúdos */
  contents: Content[];
  /** Callback para visualizar conteúdo */
  onView?: (content: Content) => void;
  /** Callback para baixar conteúdo */
  onDownload?: (content: Content) => void;
  /** Tamanho dos previews */
  size?: 'sm' | 'md' | 'lg';
  /** Número máximo de itens a exibir */
  maxItems?: number;
}

export function ContentPreviewList({
  contents,
  onView,
  onDownload,
  size = 'sm',
  maxItems
}: ContentPreviewListProps) {
  
  const displayContents = maxItems ? contents.slice(0, maxItems) : contents;
  const hasMore = maxItems && contents.length > maxItems;

  if (contents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-8 w-8 mx-auto mb-2" />
        <p className="text-sm">Nenhum conteúdo adicionado</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayContents.map((content) => (
        <ContentPreview
          key={content.id}
          content={content}
          onView={onView}
          onDownload={onDownload}
          size={size}
        />
      ))}
      
      {hasMore && (
        <div className="text-center py-2">
          <p className="text-sm text-muted-foreground">
            +{contents.length - maxItems!} conteúdo{contents.length - maxItems! > 1 ? 's' : ''} adiciona{contents.length - maxItems! > 1 ? 'is' : 'l'}
          </p>
        </div>
      )}
    </div>
  );
}
