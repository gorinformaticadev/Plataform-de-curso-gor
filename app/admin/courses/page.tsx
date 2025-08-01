"use client";

import { useState, useEffect } from "react";
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

const mockCourses: Course[] = [
  {
    id: "1",
    title: "React Avançado: Do Zero ao Profissional",
    slug: "react-avancado",
    description: "<p>Curso completo de React com projetos reais</p>",
    thumbnail: "/placeholder-course.jpg",
    price: 297.0,
    level: "INTERMEDIATE",
    duration: 360,
    status: "PUBLISHED",
    instructor: {
      name: "João Silva",
      avatar: "/placeholder-instructor.jpg"
    },
    category: {
      name: "Desenvolvimento Web",
      icon: "💻"
    },
    modulesCount: 5,
    enrollmentsCount: 234,
    reviewsCount: 45,
    averageRating: 4.8,
    createdAt: "2024-01-15",
    updatedAt: "2024-06-20",
  },
  {
    id: "2",
    title: "JavaScript Completo: ES6+ e Moderno",
    slug: "javascript-completo",
    description: "<p>Domine JavaScript moderno</p>",
    thumbnail: "/placeholder-course.jpg",
    price: 197.0,
    level: "BEGINNER",
    duration: 420,
    status: "PUBLISHED",
    category: {
      name: "Programação",
      icon: "👨‍💻"
    },
    modulesCount: 6,
    enrollmentsCount: 189,
    reviewsCount: 32,
    averageRating: 4.7,
    createdAt: "2024-01-10",
    updatedAt: "2024-05-15",
  },
  {
    id: "3",
    title: "Node.js Backend: API RESTful",
    slug: "nodejs-backend",
    description: "<p>Construa APIs robustas com Node.js</p>",
    thumbnail: "/placeholder-course.jpg",
    price: 247.0,
    level: "ADVANCED",
    status: "DRAFT",
    category: {
      name: "Backend",
      icon: "⚙️"
    },
    modulesCount: 4,
    enrollmentsCount: 0,
    reviewsCount: 0,
    createdAt: "2024-01-05",
    updatedAt: "2024-01-05",
  },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
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

  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data.map((cat: any) => cat.name));
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback para categorias mockadas se a API falhar
        setCategories(['Desenvolvimento Web', 'Programação', 'Backend']);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

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
            {isLoadingCategories ? (
              <Input disabled placeholder="Carregando categorias..." />
            ) : (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">Todas</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            )}
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
