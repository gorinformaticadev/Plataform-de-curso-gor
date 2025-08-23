# 📋 Quadro Kanban - Plataforma de Gerenciamento de Tarefas

Uma aplicação moderna de gerenciamento de tarefas estilo Kanban, desenvolvida com React, TypeScript e React Query.

## 🚀 Funcionalidades

- **Interface Drag & Drop**: Organize tarefas entre colunas (A Fazer, Em Progresso, Concluído)
- **Gerenciamento de Tarefas**: Adicionar, editar e excluir tarefas
- **Priorização**: Defina prioridades (Alta, Média, Baixa) para cada tarefa
- **Datas de Vencimento**: Acompanhe prazos com alertas visuais
- **Estado Persistente**: Tarefas salvas localmente no navegador
- **Design Responsivo**: Funciona perfeitamente em desktop e mobile
- **Notificações**: Feedback visual para todas as ações do usuário

## 🛠️ Tecnologias Utilizadas

- **React 18** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **React Query** - Gerenciamento de estado e cache
- **React Hot Toast** - Notificações
- **CSS3** - Estilização moderna
- **LocalStorage** - Persistência de dados

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── KanbanBoard.tsx          # Componente principal
│   └── modules/
│       ├── TaskCard.tsx         # Card de tarefa individual
│       └── AddTaskForm.tsx      # Formulário de adição
├── services/
│   └── TaskService.ts          # Serviço de gerenciamento de tarefas
├── hooks/
│   └── useTaskService.ts       # Hook customizado para tarefas
├── types/
│   └── Task.ts                 # Definições de tipos TypeScript
├── styles/
│   └── KanbanBoard.css         # Estilos do componente
└── App.tsx                     # Componente raiz
```

## 🎯 Como Usar

1. **Adicionar Tarefa**: Clique no botão "Adicionar Nova Tarefa"
2. **Editar Tarefa**: Clique no botão "Editar" em qualquer card
3. **Mover Tarefa**: Arraste e solte cards entre as colunas
4. **Definir Prioridade**: Use o seletor de prioridade ao criar/editar
5. **Definir Prazo**: Adicione uma data de vencimento

## 🎨 Design

O design segue os princípios de Material Design com:
- Cores intuitivas para cada status
- Cards com sombras sutis
- Animações suaves
- Layout responsivo

## 🚀 Instalação e Execução

```bash
# Clone o repositório
git clone [url-do-repositorio]

# Instale as dependências
npm install

# Execute o projeto
npm start

# Build para produção
npm run build
```

## 📱 Responsividade

- **Desktop**: Layout de 3 colunas lado a lado
- **Tablet**: Layout adaptativo com 2 colunas
- **Mobile**: Layout vertical empilhado

## 🔧 Personalização

### Cores das Colunas
- **A Fazer**: Vermelho (#dc3545)
- **Em Progresso**: Amarelo (#ffc107)
- **Concluído**: Verde (#28a745)

### Prioridades
- **Alta**: Badge vermelho
- **Média**: Badge amarelo
- **Baixa**: Badge verde

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📄 Licença

Este projeto está sob a licença MIT.
