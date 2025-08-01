"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccessibleDialogContent } from "@/components/ui/accessible-dialog-content";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserListTable } from "@/components/admin/user-list-table";
import { UserCreateForm } from "@/components/admin/user-create-form";
import { UserFilters } from "@/components/admin/user-filters";
import { UserEditForm } from "@/components/admin/user-edit-form";
import { useUsers } from "@/hooks/use-users";
import { useAuth } from "@/contexts/auth-context";
import { User } from "@/types";

export default function UsersPage() {
  const { users, pagination, isLoading, error, fetchUsers } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isFetchingEditUser, setIsFetchingEditUser] = useState(false);
  const { token } = useAuth();

  const fetchUsersRef = useRef(fetchUsers);
  useEffect(() => {
    fetchUsersRef.current = fetchUsers;
  });

  useEffect(() => {
    fetchUsersRef.current(searchTerm, roleFilter, currentPage, 10, statusFilter);
  }, [searchTerm, roleFilter, currentPage, statusFilter]);

  const handleEdit = (user: User) => {
    setSelectedUser(user); // Mantemos o usuário básico para o título
    setIsEditDialogOpen(true);
    
    // Busca os dados completos do usuário para edição
    const fetchFullUser = async () => {
      if (!token) return;
      setIsFetchingEditUser(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('Falha ao buscar detalhes do usuário para edição.');
        }
        const fullUserData = await response.json();
        setEditingUser(fullUserData);
      } catch (error) {
        console.error(error);
        // Opcional: mostrar um toast de erro
      } finally {
        setIsFetchingEditUser(false);
      }
    };

    fetchFullUser();
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedUser(null);
    setEditingUser(null);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSuccess = () => {
    setIsCreateModalOpen(false);
    closeEditDialog();
    fetchUsersRef.current(searchTerm, roleFilter, currentPage);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
          <p className="text-gray-600 mt-2">Visualize e gerencie todos os usuários da plataforma</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>Adicionar Usuário</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <UserFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onFilter={() => setCurrentPage(1)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <UserListTable
            users={users}
            isLoading={isLoading}
            error={error}
            onEdit={handleEdit}
            onActionSuccess={handleSuccess}
          />
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-600">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage === pagination.totalPages ? "pointer-events-none opacity-50" : undefined}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
      <AccessibleDialogContent 
        className="sm:max-w-[425px]"
        descriptionId="create-user-description"
        descriptionText="Formulário para criação de novo usuário"
      >
          <DialogHeader>
            <DialogTitle>Criar Usuário</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para criar um novo usuário na plataforma.
            </DialogDescription>
          </DialogHeader>
          <UserCreateForm
            onSuccess={handleSuccess}
            onCancel={() => setIsCreateModalOpen(false)}
          />
      </AccessibleDialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={closeEditDialog}>
      <AccessibleDialogContent 
        className="sm:max-w-[625px]"
        descriptionId="edit-user-description"
        descriptionText="Formulário detalhado para edição de usuário"
      >
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Modifique as informações do usuário {selectedUser?.name} conforme necessário.
            </DialogDescription>
          </DialogHeader>
          {isFetchingEditUser && <div className="text-center">Carregando...</div>}
          {!isFetchingEditUser && editingUser && (
            <UserEditForm
              user={editingUser}
              onSuccess={handleSuccess}
              onCancel={closeEditDialog}
            />
          )}
        </AccessibleDialogContent>
      </Dialog>
    </div>
  );
}
