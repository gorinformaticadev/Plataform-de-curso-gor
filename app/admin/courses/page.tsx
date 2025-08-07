"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal, Plus, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import axios from "axios";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CourseCreateModal } from "@/components/admin/course-create-modal";

interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface Instructor {
  id: string;
  name: string;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  price: number;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  duration?: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  instructor?: {
    name: string;
    avatar?: string;
  };
  instructorId?: string;
  category: {
    name: string;
    icon?: string;
  };
  modulesCount: number;
  enrollmentsCount: number;
  reviewsCount: number;
  averageRating?: number;
  createdAt: string;
  updatedAt: string;
}

export default function CoursesPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course.instructor?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || course.status === statusFilter;
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;
    const matchesCategory = categoryFilter === "all" || course.category.name === categoryFilter;
    const matchesPrice = course.price >= priceRange[0] && course.price <= priceRange[1];
    
    return matchesSearch && matchesStatus && matchesLevel && matchesCategory && matchesPrice;
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
      };

      try {
        // Fetch Cursos
        const coursesResponse = await axios.get('/api/courses/my-courses', { headers });
        setCourses(coursesResponse.data);

        // Fetch Categorias
        const categoriesResponse = await axios.get('/api/categories', { headers });
        setCategories(categoriesResponse.data);

        // Fetch Instrutores
        const instructorsResponse = await axios.get('/api/users/instructors', { headers });
        setInstructors(instructorsResponse.data);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, [token]);

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

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatRating = (rating?: number) => {
    if (!rating) return '-';
    return rating.toFixed(1);
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "secondary";
      case "INTERMEDIATE":
        return "default";
      case "ADVANCED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleCourseCreated = () => {
    // Recarregar os cursos após a criação
    const fetchCourses = async () => {
      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
      };

      try {
        const coursesResponse = await axios.get('/api/courses/my-courses', { headers });
        setCourses(coursesResponse.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Cursos</h1>
          <p className="text-gray-600 mt-2">Visualize e gerencie todos os cursos da plataforma</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Curso
        </Button>

        <CourseCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          categories={categories}
          onCourseCreated={handleCourseCreated}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Buscar</label>
            <Input
              placeholder="Título ou instrutor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Todos</option>
              <option value="PUBLISHED">Publicados</option>
              <option value="DRAFT">Rascunho</option>
              <option value="ARCHIVED">Arquivados</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nível</label>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Todos</option>
              <option value="BEGINNER">Iniciante</option>
              <option value="INTERMEDIATE">Intermediário</option>
              <option value="ADVANCED">Avançado</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Categoria</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Todas</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium">
              Faixa de preço: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
            </label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                min="0"
              />
              <span>até</span>
              <Input
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                min={priceRange[0]}
              />
            </div>
          </div>
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
                <TableHead>Nível</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Módulos</TableHead>
                <TableHead>Alunos</TableHead>
                <TableHead>Avaliação</TableHead>
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
                  <TableCell>
                    {course.instructor ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={course.instructor.avatar} />
                          <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {course.instructor.name}
                      </div>
                    ) : 'Sem instrutor'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {course.category.icon && <span>{course.category.icon}</span>}
                      {course.category.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getLevelBadgeVariant(course.level)}>
                      {course.level === 'BEGINNER' ? 'Iniciante' : 
                       course.level === 'INTERMEDIATE' ? 'Intermediário' : 'Avançado'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDuration(course.duration)}</TableCell>
                  <TableCell>{formatPrice(course.price)}</TableCell>
                  <TableCell>{course.modulesCount}</TableCell>
                  <TableCell>{course.enrollmentsCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span>★</span>
                      <span>{formatRating(course.averageRating)}</span>
                      <span className="text-sm text-gray-500">({course.reviewsCount})</span>
                    </div>
                  </TableCell>
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
