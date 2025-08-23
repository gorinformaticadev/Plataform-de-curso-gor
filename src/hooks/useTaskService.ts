import { useState, useEffect } from 'react';
import { Task, CreateTaskInput, UpdateTaskInput } from '../types/Task';
import { TaskService } from '../services/TaskService';

// Hook personalizado para gerenciar tarefas
export const useTaskService = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const taskService = new TaskService();

  // Carrega tarefas ao montar o componente
  useEffect(() => {
    loadTasks();
  }, []);

  // Função para carregar todas as tarefas
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskService.getAllTasks();
      setTasks(data);
    } catch (err) {
      setError('Erro ao carregar tarefas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Função para adicionar uma nova tarefa
  const addTask = async (input: CreateTaskInput) => {
    try {
      setError(null);
      const newTask = await taskService.createTask(input);
      setTasks(prev => [...prev, newTask]);
    } catch (err) {
      setError('Erro ao adicionar tarefa');
      console.error(err);
    }
  };

  // Função para atualizar uma tarefa existente
  const updateTask = async (id: string, updates: UpdateTaskInput) => {
    try {
      setError(null);
      const updatedTask = await taskService.updateTask(id, updates);
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));
    } catch (err) {
      setError('Erro ao atualizar tarefa');
      console.error(err);
    }
  };

  // Função para deletar uma tarefa
  const deleteTask = async (id: string) => {
    try {
      setError(null);
      await taskService.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      setError('Erro ao deletar tarefa');
      console.error(err);
    }
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    refreshTasks: loadTasks
  };
};
