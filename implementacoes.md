# Plano de Melhorias para a Página de Administração de Usuários

Este documento descreve o plano de ação para implementar as melhorias sugeridas na funcionalidade de gerenciamento de usuários.

## 1. Implementar Paginação

**Objetivo:** Melhorar a performance da listagem de usuários, carregando os dados em lotes (páginas) em vez de todos de uma vez.

**Passos:**

1.  **Backend (API):**
    *   Modificar o método `findAll` em `api/src/users/users.service.ts` para aceitar parâmetros de paginação (`page` e `pageSize`).
    *   Utilizar as opções `skip` e `take` do Prisma para buscar apenas a porção de dados correspondente à página solicitada.
    *   Fazer com que o endpoint `GET /api/users` retorne, além da lista de usuários, o número total de registros para que o frontend possa calcular o número total de páginas.

2.  **Frontend:**
    *   Atualizar o hook `useUsers` (`hooks/use-users.ts`) para enviar os parâmetros de página atual e tamanho da página na requisição.
    *   Adicionar um estado no componente `app/admin/users/page.tsx` para controlar a página atual.
    *   Adicionar um componente de paginação na interface (`components/admin/user-list-table.tsx` ou diretamente em `app/admin/users/page.tsx`) para permitir que o usuário navegue entre as páginas.

## 2. Implementar "Desativar Conta" (Soft Delete)

**Objetivo:** Permitir a desativação de usuários sem removê-los permanentemente do banco de dados, preservando o histórico.

**Passos:**

1.  **Backend (Banco de Dados):**
    *   Adicionar um campo `isActive` (booleano, com valor padrão `true`) ao `schema.prisma` na tabela `User`.
    *   Executar uma migração do Prisma para aplicar a alteração no banco de dados.

2.  **Backend (API):**
    *   Criar um novo endpoint `PATCH /api/users/:id/deactivate` no `users.controller.ts`.
    *   Implementar a lógica no `users.service.ts` para alterar o campo `isActive` do usuário para `false`.
    *   Modificar o método `findAll` para buscar por padrão apenas usuários com `isActive: true`.

3.  **Frontend:**
    *   Implementar a função `onClick` no item de menu "Desativar conta" em `components/admin/user-list-table.tsx`.
    *   A função deve chamar o novo endpoint da API e, em caso de sucesso, atualizar a lista de usuários.
    *   Adicionar um modal de confirmação para evitar desativações acidentais.

## 3. Melhorar Feedback ao Usuário com Toasts

**Objetivo:** Fornecer confirmações visuais claras (sucesso ou erro) após ações como criar, editar ou desativar um usuário.

**Passos:**

1.  **Frontend:**
    *   Garantir que o `Toaster` (do `sonner`) esteja configurado no layout principal (`app/layout.tsx`).
    *   No componente `app/admin/users/page.tsx`, nos callbacks `onSuccess` dos formulários `UserCreateForm` e `UserEditForm`, chamar a função `toast.success("Usuário criado/atualizado com sucesso!")`.
    *   Implementar o tratamento de erros para exibir `toast.error("Ocorreu um erro.")` caso a API retorne uma falha.

## 4. Implementar Controle de Acesso por Função (RBAC)

**Objetivo:** Restringir ações críticas, como alterar a função de um usuário para `ADMIN`, apenas a administradores.

**Passos:**

1.  **Backend (API):**
    *   Criar um `RolesGuard` em `api/src/auth/guards/` que verifique se o usuário logado possui a função (`role`) necessária para acessar um determinado endpoint.
    *   Aplicar este `Guard` nas rotas críticas do `users.controller.ts`, como no método `update`, para garantir que apenas um `ADMIN` possa alterar a função de outro usuário.

## 5. Padronizar Filtros

**Objetivo:** Garantir consistência nos valores de filtro entre o frontend e o backend.

**Passos:**

1.  **Backend e Frontend:**
    *   Decidir por um valor padrão (ex: `all`).
    *   No `hooks/use-users.ts`, garantir que o valor enviado seja o correto.
    *   No `api/src/users/users.service.ts`, ajustar a condição para ignorar o filtro de `role` quando o valor for `all`.
