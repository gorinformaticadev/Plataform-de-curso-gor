"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Category } from "./categories.service";
import { useToggleCategoryStatus, useDeleteCategory } from "./categories.service";
import { toast } from "sonner";

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "description", 
    header: "Descrição",
  },
  {
    accessorKey: "coursesCount",
    header: "Cursos",
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.getValue("coursesCount")} cursos
      </Badge>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.getValue("isActive") ? "default" : "secondary"}>
        {row.getValue("isActive") ? "Ativa" : "Inativa"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const category = row.original;
      const toggleStatus = useToggleCategoryStatus();
      const deleteCategory = useDeleteCategory();

      const handleToggle = async () => {
        try {
          await toggleStatus.mutateAsync({ 
            id: category.id, 
            isActive: category.isActive 
          });
          toast.success(`Categoria ${category.isActive ? "desativada" : "ativada"}!`);
        } catch {
          toast.error("Erro ao alterar status");
        }
      };

      const handleDelete = async () => {
        try {
          await deleteCategory.mutateAsync(category.id);
          toast.success("Categoria removida!");
        } catch {
          toast.error("Erro ao remover categoria");
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggle}>
              <Trash2 className="mr-2 h-4 w-4" />
              {category.isActive ? "Desativar" : "Ativar"}
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600" 
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
