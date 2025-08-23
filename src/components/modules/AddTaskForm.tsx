import React, { useState } from 'react';
import { CreateTaskInput } from '../../types/Task';

interface AddTaskFormProps {
  onAddTask: (input: CreateTaskInput) => void;
}

// Componente para adicionar uma nova tarefa
export const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAddTask }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<CreateTaskInput>({
    title: '',
    description: '',
    priority: 'medium',
  });

  // Função para lidar com mudanças no formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Função para lidar com envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Por favor, insira um título para a tarefa');
      return;
    }

    onAddTask({
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
    });

    // Limpa o formulário
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
    });
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)} 
        className="btn-add-task"
      >
        + Nova Tarefa
      </button>
    );
  }

  return (
    <div className="add-task-form">
      <h3>Adicionar Nova Tarefa</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Título *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={100}
            placeholder="Digite o título da tarefa"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descrição</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            maxLength={500}
            placeholder="Descrição opcional da tarefa"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="priority">Prioridade</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Data de Vencimento</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit">
            Adicionar Tarefa
          </button>
          <button 
            type="button" 
            onClick={() => setIsOpen(false)} 
            className="btn-cancel"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
