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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Course {
  id: string;
  title: string;
  instructor: string;
  category: string;
  price: number;
  students: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  thumbnail: string;
  createdAt: string;
}

const mockCourses: Course[] = [
  {
    id: "1",
    title: "React Avançado: Do Zero ao Profissional",
    instructor: "João Silva",
    category: "Desenvolvimento Web",
    price: 297.0,
    students: 234,
    status: "PUBLISHED",
    thumbnail: "/placeholder-course.jpg",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "JavaScript Completo: ES6+ e Moderno",
    instructor: "Maria Santos",
    category: "Programação",
    price: 197.0,
    students: 189,
    status: "PUBLISHED",
    thumbnail: "/placeholder-course.jpg",
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    title: "Node.js Backend: API RESTful",
    instructor: "Pedro Oliveira",
    category: "Backend",
    price: 247.0,
    students: 156,
    status: "DRAFT",
    thumbnail: "/placeholder-course.jpg",
    createdAt: "2024-01-05",
  },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "default";
      case "DRAFT":
        return "secondary";
      case "ARCHIVED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Cursos</h1>
          <p className="text-gray-600 mt-2">Visualize e gerencie todos os cursos da plataforma</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Curso
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por título ou instrutor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-[180px] px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">Todos os Status</option>
            <option value="PUBLISHED">Publicados</option>
            <option value="DRAFT">Rascunho</option>
            <option value="ARCHIVED">Arquivados</option>
          </select>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Cursos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead>Instrutor</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Alunos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={course.thumbnail} alt={course.title} />
                        <AvatarFallback>{course.title.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{course.title}</div>
                        <div className="text-sm text-gray-500">
                          Criado em {new Date(course.createdAt).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{course.instructor}</TableCell>
                  <TableCell>{course.category}</TableCell>
                  <TableCell>{formatPrice(course.price)}</TableCell>
                  <TableCell>{course.students}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(course.status)}>
                      {course.status}
                    </Badge>
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
                          Editar curso
                        </DropdownMenuItem>
                        <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Arquivar curso
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
