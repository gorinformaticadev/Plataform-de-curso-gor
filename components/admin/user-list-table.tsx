"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { MoreHorizontal, Eye, Pencil } from "lucide-react";
import Link from "next/link";
import { User } from "@/types";

interface UserListTableProps {
  users: User[];
  isLoading: boolean;
  error: string | null;
  onEdit: (user: User) => void;
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

export function UserListTable({ users, isLoading, error, onEdit }: UserListTableProps) {
  return (
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
                      <Link href={`/admin/users/${user.id}`} className="flex items-center cursor-pointer">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalhes
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(user)} className="flex items-center cursor-pointer">
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
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
  );
}
