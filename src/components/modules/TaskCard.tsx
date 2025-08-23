import React, { useState } from 'react';
import { Task } from '../../types/Task';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
}

// Componente para exibir uma tarefa individual
export const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);

  // Função para salvar alterações
  const handleSave = () => {
    onUpdate(task.id, editedTask);
    setIsEditing(false);
  };

  // Função para cancelar edição
  const handleCancel = () => {
    setEditedTask(task);
    setIsEditing(false);
  };

  // Função para mudar status
  const handleStatusChange = (newStatus: 'todo' | 'inProgress' | 'done') => {
    onUpdate(task.id, { status: newStatus });
  };

  // Função para mudar prioridade
  const handlePriorityChange = (newPriority: 'low' | 'medium' | 'high') => {
    onUpdate(task.id, { priority: newPriority });
  };

  if (isEditing) {
    return (
      <div className="task-card editing">
        <input
          type="text"
          value={editedTask.title}
          onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
          className="task-title-input"
        />
        <textarea
          value={editedTask.description || ''}
          onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
          className="task-description-input"
          placeholder="Descrição"
        />
        <div className="task-actions">
          <button onClick={handleSave} className="btn-save">Salvar</button>
          <button onClick={handleCancel} className="btn-cancel">Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`task-card priority-${task.priority}`}>
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <span className={`priority-badge ${task.priority}`}>
          {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
        </span>
      </div>
      
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}
      
      <div className="task-meta">
        <span className="task-date">
          Criado: {task.createdAt.toLocaleDateString('pt-BR')}
        </span>
        {task.dueDate && (
          <span className="task-due-date">
            Vencimento: {task.dueDate.toLocaleDateString('pt-BR')}
          </span>
        )}
      </div>

      <div className="task-status">
        <label>Status:</label>
        <select 
          value={task.status} 
          onChange={(e) => handleStatusChange(e.target.value as any)}
          className="status-select"
        >
          <option value="todo">A Fazer</option>
          <option value="inProgress">Em Progresso</option>
          <option value="done">Concluído</option>
        </select>
      </div>

      <div className="task-actions">
        <button onClick={() => setIsEditing(true)} className="btn-edit">
          Editar
        </button>
        <button onClick={() => onDelete(task.id)} className="btn-delete">
          Excluir
        </button>
      </div>
    </div>
  );
};
