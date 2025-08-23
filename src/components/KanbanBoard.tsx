import React, { useState } from 'react';
import { Task } from '../types/Task';
import { TaskCard } from './modules/TaskCard';
import { AddTaskForm } from './modules/AddTaskForm';
import { useTaskService } from '../hooks/useTaskService';

// Componente principal do quadro Kanban
const KanbanBoard: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask } = useTaskService();
  const [filter, setFilter] = useState<string>('all');

  // Filtra tarefas por status
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  // Agrupa tarefas por status
  const tasksByStatus = {
    todo: filteredTasks.filter(task => task.status === 'todo'),
    inProgress: filteredTasks.filter(task => task.status === 'inProgress'),
    done: filteredTasks.filter(task => task.status === 'done'),
  };

  return (
    <div className="kanban-board">
      <h1>Quadro Kanban</h1>
      
      <div className="controls">
        <AddTaskForm onAddTask={addTask} />
        
        <div className="filter-section">
          <label>Filtrar por status:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todas</option>
            <option value="todo">A Fazer</option>
            <option value="inProgress">Em Progresso</option>
            <option value="done">Concluído</option>
          </select>
        </div>
      </div>

      <div className="board-columns">
        <div className="column">
          <h2>A Fazer ({tasksByStatus.todo.length})</h2>
          <div className="task-list">
            {tasksByStatus.todo.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={updateTask}
                onDelete={deleteTask}
              />
            ))}
          </div>
        </div>

        <div className="column">
          <h2>Em Progresso ({tasksByStatus.inProgress.length})</h2>
          <div className="task-list">
            {tasksByStatus.inProgress.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={updateTask}
                onDelete={deleteTask}
              />
            ))}
          </div>
        </div>

        <div className="column">
          <h2>Concluído ({tasksByStatus.done.length})</h2>
          <div className="task-list">
            {tasksByStatus.done.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={updateTask}
                onDelete={deleteTask}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
