import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import KanbanBoard from './components/KanbanBoard';
import './App.css';
import './styles/KanbanBoard.css';

// Configuração do QueryClient para gerenciamento de estado
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <header className="App-header">
          <h1>Quadro Kanban</h1>
        </header>
        <main>
          <KanbanBoard />
        </main>
        <Toaster position="top-right" />
      </div>
    </QueryClientProvider>
  );
}

export default App;
