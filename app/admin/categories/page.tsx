"use client";

import { useState } from "react";
import { MoreHorizontal, Search, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Category {
  id: string;
  name: string;
  description: string;
  coursesCount: number;
  createdAt: string;
  isActive: boolean;
}

const mockCategories: Category[] = [
  {
    id: "1",
    name: "Desenvolvimento Web",
    description: "Cursos de desenvolvimento web moderno",
    coursesCount: 15,
    createdAt: "2024-01-15",
    isActive: true,
  },
  {
    id: "2",
    name: "Programação",
    description: "Fundamentos e linguagens de programação",
    coursesCount: 12,
    createdAt: "2024-01-10",
    isActive: true,
  },
  {
    id: "3",
    name: "Design",
    description: "Design gráfico e UX/UI",
    coursesCount: 8,
    createdAt: "2024-01-05",
    isActive: false,
  },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? "default" : "secondary";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Categorias</h1>
          <p className="text-gray-600 mt-2">Visualize e gerencie todas as categorias de cursos</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Categoria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Categoria</Label>
                <Input id="name" placeholder="Ex: Desenvolvimento Web" />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" placeholder="Descrição da categoria" />
              </div>
              <Button type="submit" className="w-full">
                Criar Categoria
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por nome ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Cursos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{category.coursesCount} cursos</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(category.isActive)}>
                      {category.isActive ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(category.createdAt).toLocaleDateString("pt-BR")}
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
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar categoria
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Ver cursos da categoria
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          {category.isActive ? "Desativar" : "Ativar"} categoria
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
