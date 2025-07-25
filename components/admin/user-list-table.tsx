"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { User } from "@/types";

interface UserListTableProps {
  users: User[];
  isLoading: boolean;
  error: string | null;
  onEdit: (user: User) => void;
  onActionSuccess: () => void;
}

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "destructive";
    case "INSTRUCTOR":
      return "default";
    case "STUDENT":
      return "secondary";
    default:
      return "outline";
  }
};

export function UserListTable({
  users,
  isLoading,
  error,
  onEdit,
  onActionSuccess,
}: UserListTableProps) {
  const { token } = useAuth();
  const [isDeactivateAlertOpen, setIsDeactivateAlertOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleDeactivateClick = (user: User) => {
    setSelectedUser(user);
    setIsDeactivateAlertOpen(true);
  };

  const handleDeactivateConfirm = async () => {
    if (!selectedUser || !token) return;

    const promise = fetch(
      `http://localhost:3001/api/users/${selectedUser.id}/deactivate`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ).then((res) => {
      if (!res.ok) {
        throw new Error("Falha ao desativar usuário.");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Desativando usuário...",
      success: () => {
        onActionSuccess();
        return "Usuário desativado com sucesso!";
      },
      error: "Erro ao desativar usuário.",
    });

    setIsDeactivateAlertOpen(false);
    setSelectedUser(null);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Função</TableHead>
            <TableHead>Cursos</TableHead>
            <TableHead>Data de Cadastro</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Carregando...
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-red-600">
                {error}
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user._count?.enrollments || 0}</TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="flex items-center cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onEdit(user)}
                        className="flex items-center cursor-pointer"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 flex items-center cursor-pointer"
                        onClick={() => handleDeactivateClick(user)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Desativar conta
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <AlertDialog
        open={isDeactivateAlertOpen}
        onOpenChange={setIsDeactivateAlertOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá desativar a conta do usuário. Ele não poderá mais
              acessar a plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeactivateAlertOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivateConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirmar Desativação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
