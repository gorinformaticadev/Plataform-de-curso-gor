import { Task, CreateTaskInput, UpdateTaskInput } from '../types/Task';

// Serviço para gerenciar operações de tarefas
export class TaskService {
  private readonly STORAGE_KEY = 'kanban_tasks';
  private tasks: Task[] = [];

  constructor() {
    this.loadFromStorage();
  }

  // Carrega tarefas do localStorage
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.tasks = parsed.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: task.updatedAt ? new Date(task.updatedAt) : undefined,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas do localStorage:', error);
      this.tasks = [];
    }
  }

  // Salva tarefas no localStorage
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks));
    } catch (error) {
      console.error('Erro ao salvar tarefas no localStorage:', error);
    }
  }

  // Gera ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Retorna todas as tarefas
  async getAllTasks(): Promise<Task[]> {
    return [...this.tasks];
  }

  // Cria uma nova tarefa
  async createTask(input: CreateTaskInput): Promise<Task> {
    const newTask: Task = {
      id: this.generateId(),
      title: input.title,
      description: input.description,
      status: 'todo',
      priority: input.priority,
      createdAt: new Date(),
      dueDate: input.dueDate,
    };

    this.tasks.push(newTask);
    this.saveToStorage();
    return newTask;
  }

  // Atualiza uma tarefa existente
  async updateTask(id: string, updates: UpdateTaskInput): Promise<Task> {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new Error('Tarefa não encontrada');
    }

    const updatedTask: Task = {
      ...this.tasks[taskIndex],
      ...updates,
      updatedAt: new Date(),
    };

    this.tasks[taskIndex] = updatedTask;
    this.saveToStorage();
    return updatedTask;
  }

  // Deleta uma tarefa
  async deleteTask(id: string): Promise<void> {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new Error('Tarefa não encontrada');
    }

    this.tasks.splice(taskIndex, 1);
    this.saveToStorage();
  }

  // Busca tarefas por status
  async getTasksByStatus(status: 'todo' | 'inProgress' | 'done'): Promise<Task[]> {
    return this.tasks.filter(task => task.status === status);
  }

  // Busca tarefas por prioridade
  async getTasksByPriority(priority: 'low' | 'medium' | 'high'): Promise<Task[]> {
    return this.tasks.filter(task => task.priority === priority);
  }
}
