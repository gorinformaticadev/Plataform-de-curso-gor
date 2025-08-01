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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

  const handleToggleActive = (user: User) => {
    setSelectedUser(user);
    setIsDeactivateAlertOpen(true);
  };

  const handleToggleActiveConfirm = async () => {
    if (!selectedUser || !token) return;

    const endpoint = selectedUser.isActive 
      ? `deactivate` 
      : `activate`;

    const promise = fetch(
      `http://localhost:3001/api/users/${selectedUser.id}/${endpoint}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ).then((res) => {
      if (!res.ok) {
        throw new Error(`Falha ao ${endpoint === 'deactivate' ? 'desativar' : 'ativar'} usuário.`);
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: selectedUser.isActive 
        ? "Desativando usuário..." 
        : "Ativando usuário...",
      success: () => {
        onActionSuccess();
        return selectedUser.isActive 
          ? "Usuário desativado com sucesso!" 
          : "Usuário ativado com sucesso!";
      },
      error: selectedUser.isActive 
        ? "Erro ao desativar usuário." 
        : "Erro ao ativar usuário.",
    });

    setIsDeactivateAlertOpen(false);
    setSelectedUser(null);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Avatar</TableHead>
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
              <TableRow key={user.id} className={!user.isActive ? "bg-gray-100" : ""}>
                <TableCell>
                  <Avatar>
                    <AvatarImage 
                      src={user.avatar ? `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}${user.avatar}` : undefined}
                      alt={user.name}
                    />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user._count?.inscricoes || 0}</TableCell>
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
                        className={`flex items-center cursor-pointer ${
                          user.isActive ? 'text-red-600' : 'text-green-600'
                        }`}
                        onClick={() => handleToggleActive(user)}
                      >
                        {user.isActive ? (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Desativar conta
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Ativar conta
                          </>
                        )}
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
          {selectedUser?.isActive
            ? "Esta ação irá desativar a conta do usuário. Ele não poderá mais acessar a plataforma."
            : "Esta ação irá reativar a conta do usuário. Ele poderá acessar a plataforma novamente."}
        </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeactivateAlertOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleActiveConfirm}
              className={selectedUser?.isActive 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-green-600 hover:bg-green-700"}
            >
              {selectedUser?.isActive 
                ? "Confirmar Desativação" 
                : "Confirmar Ativação"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
