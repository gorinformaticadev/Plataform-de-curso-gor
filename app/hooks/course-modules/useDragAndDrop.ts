import { useState, useCallback } from 'react';

export interface DragItem {
  id: string;
  type: 'module' | 'lesson' | 'content';
  index: number;
  sourceId?: string; // ID do container pai (módulo para aulas, aula para conteúdos)
}

interface UseDragAndDropProps {
  onReorder?: (item: DragItem, targetIndex: number, targetSourceId?: string) => void;
  onMove?: (item: DragItem, targetSourceId: string, targetIndex: number) => void;
}

interface UseDragAndDropReturn {
  draggedItem: DragItem | null;
  isDragging: boolean;
  handleDragStart: (item: DragItem) => void;
  handleDragEnd: () => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, targetIndex: number, targetSourceId?: string) => void;
  getDragProps: (item: DragItem) => {
    draggable: boolean;
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: () => void;
    className?: string;
  };
  getDropProps: (targetIndex: number, targetSourceId?: string) => {
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    className?: string;
  };
}

/**
 * Hook customizado para gerenciar drag and drop de módulos, aulas e conteúdos
 * @param onReorder - Callback para reordenação dentro do mesmo container
 * @param onMove - Callback para mover entre containers diferentes
 * @returns Objeto com métodos e estados do drag and drop
 */
export function useDragAndDrop({
  onReorder,
  onMove
}: UseDragAndDropProps = {}): UseDragAndDropReturn {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Inicia o drag
   */
  const handleDragStart = useCallback((item: DragItem) => {
    setDraggedItem(item);
    setIsDragging(true);
  }, []);

  /**
   * Finaliza o drag
   */
  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setIsDragging(false);
  }, []);

  /**
   * Permite o drop
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  /**
   * Executa o drop
   */
  const handleDrop = useCallback((
    e: React.DragEvent, 
    targetIndex: number, 
    targetSourceId?: string
  ) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    // Verifica se é uma reordenação no mesmo container
    if (draggedItem.sourceId === targetSourceId || (!draggedItem.sourceId && !targetSourceId)) {
      // Reordenação no mesmo container
      if (draggedItem.index !== targetIndex) {
        onReorder?.(draggedItem, targetIndex, targetSourceId);
      }
    } else {
      // Movimento entre containers diferentes
      if (targetSourceId) {
        onMove?.(draggedItem, targetSourceId, targetIndex);
      }
    }

    handleDragEnd();
  }, [draggedItem, onReorder, onMove, handleDragEnd]);

  /**
   * Retorna props para elementos arrastáveis
   */
  const getDragProps = useCallback((item: DragItem) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      handleDragStart(item);
      // Adiciona dados para compatibilidade com outras implementações
      e.dataTransfer.setData('text/plain', JSON.stringify(item));
      e.dataTransfer.effectAllowed = 'move';
    },
    onDragEnd: handleDragEnd,
    className: isDragging && draggedItem?.id === item.id ? 'opacity-50 cursor-grabbing' : 'cursor-grab'
  }), [handleDragStart, handleDragEnd, isDragging, draggedItem]);

  /**
   * Retorna props para zonas de drop
   */
  const getDropProps = useCallback((targetIndex: number, targetSourceId?: string) => ({
    onDragOver: handleDragOver,
    onDrop: (e: React.DragEvent) => handleDrop(e, targetIndex, targetSourceId),
    className: isDragging ? 'border-2 border-dashed border-blue-300 bg-blue-50' : ''
  }), [handleDragOver, handleDrop, isDragging]);

  return {
    draggedItem,
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    getDragProps,
    getDropProps
  };
}

/**
 * Hook simplificado para drag and drop básico
 */
export function useSimpleDragAndDrop<T extends { id: string }>(
  items: T[],
  onReorder: (newItems: T[]) => void
) {
  const { getDragProps, getDropProps } = useDragAndDrop({
    onReorder: (draggedItem, targetIndex) => {
      const newItems = [...items];
      const draggedIndex = draggedItem.index;
      
      // Remove o item da posição original
      const [removed] = newItems.splice(draggedIndex, 1);
      
      // Insere na nova posição
      newItems.splice(targetIndex, 0, removed);
      
      onReorder(newItems);
    }
  });

  return {
    getDragProps: (item: T, index: number) => getDragProps({
      id: item.id,
      type: 'module', // Tipo genérico
      index
    }),
    getDropProps: (index: number) => getDropProps(index)
  };
}
