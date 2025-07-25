"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { User } from "@/types";

export default function UsersPage() {
  const { users, pagination, isLoading, error, fetchUsers } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsersRef = useRef(fetchUsers);
  useEffect(() => {
    fetchUsersRef.current = fetchUsers;
  });

  useEffect(() => {
    fetchUsersRef.current(searchTerm, roleFilter, currentPage);
  }, [searchTerm, roleFilter, currentPage]);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSuccess = () => {
    setIsCreateModalOpen(false);
    setIsEditDialogOpen(false);
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Criar Usuário</DialogTitle>
          </DialogHeader>
          <UserCreateForm
            onSuccess={handleSuccess}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserEditForm
              user={selectedUser}
              onSuccess={handleSuccess}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
