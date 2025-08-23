// Definição do tipo Task para representar uma tarefa no quadro Kanban
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'inProgress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt?: Date;
  dueDate?: Date;
}

// Tipo para criar uma nova tarefa (sem ID)
export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

// Tipo para atualizar uma tarefa
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: 'todo' | 'inProgress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
}
