"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal, Plus, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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
  shortDescription?: string;
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
    shortDescription: "Aprenda React do básico ao avançado com projetos reais",
    description: "<h2>Curso completo de React com projetos reais</h2><p>Este curso abrange todos os conceitos essenciais do React, desde o básico até tópicos avançados como hooks, context API e gerenciamento de estado.</p><ul><li>Componentes funcionais e de classe</li><li>Hooks como useState, useEffect, useContext</li><li>Gerenciamento de estado com Redux</li><li>Integração com APIs REST</li></ul>",
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
    shortDescription: "Domine JavaScript moderno com ES6+",
    description: "<h2>Domine JavaScript moderno</h2><p>Este curso completo de JavaScript abrange desde os fundamentos até os recursos mais avançados da linguagem, incluindo ES6+.</p><p>Você aprenderá:</p><ul><li>Sintaxe básica e tipos de dados</li><li>Funções e escopo</li><li>Programação assíncrona com Promises e async/await</li><li>Recursos modernos como arrow functions, destructuring e modules</li></ul>",
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
    shortDescription: "Construa APIs robustas com Node.js",
    description: "<h2>Construa APIs robustas com Node.js</h2><p>Este curso ensina como criar APIs RESTful escaláveis usando Node.js, Express e MongoDB.</p><p>O que você aprenderá:</p><ul><li>Configuração do ambiente Node.js</li><li>Criação de endpoints REST</li><li>Autenticação e autorização</li><li>Validação de dados e tratamento de erros</li><li>Integração com banco de dados MongoDB</li></ul>",
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
  const formSchema = z.object({
    title: z.string().min(3, "Título muito curto"),
    shortDescription: z.string().min(10, "Descrição curta muito curta").max(150, "Descrição curta muito longa"),
    description: z.string().min(10, "Descrição muito curta"),
    thumbnail: z.string().optional(),
    price: z.number().min(0, "Preço inválido"),
    level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
    category: z.string().min(1, "Selecione uma categoria"),
    duration: z.number().min(0, "Duração inválida"),
  });

  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      shortDescription: "",
      description: "",
      price: 0,
      level: "BEGINNER",
      category: "",
      duration: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      // Simular chamada à API
      const newCourse: Course = {
        id: (courses.length + 1).toString(),
        title: values.title,
        slug: values.title.toLowerCase().replace(/\s+/g, '-'),
        shortDescription: values.shortDescription,
        description: values.description, // O CKEditor já retorna HTML
        thumbnail: values.thumbnail || "",
        price: values.price,
        level: values.level,
        duration: values.duration,
        status: "DRAFT",
        category: {
          name: values.category,
        },
        modulesCount: 0,
        enrollmentsCount: 0,
        reviewsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCourses([...courses, newCourse]);
      setIsCreateModalOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      console.error("Error creating course:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
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
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Curso
        </Button>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Curso</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Título do curso" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição Curta</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Descrição curta do curso (máx. 150 caracteres)"
                          {...field}
                          maxLength={150}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <div className="border rounded-md">
                          <CKEditor
                            editor={ClassicEditor}
                            data={field.value || ""}
                            onChange={(_, editor) => {
                              field.onChange(editor.getData());
                            }}
                            config={{
                              toolbar: [
                                'heading',
                                '|',
                                'bold',
                                'italic',
                                'link',
                                'bulletedList',
                                'numberedList',
                                'blockQuote',
                                'undo',
                                'redo'
                              ],
                              heading: {
                                options: [
                                  { model: 'paragraph', title: 'Parágrafo', class: 'ck-heading_paragraph' },
                                  { model: 'heading1', view: 'h1', title: 'Cabeçalho 1', class: 'ck-heading_heading1' },
                                  { model: 'heading2', view: 'h2', title: 'Cabeçalho 2', class: 'ck-heading_heading2' },
                                  { model: 'heading3', view: 'h3', title: 'Cabeçalho 3', class: 'ck-heading_heading3' }
                                ]
                              }
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="thumbnail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail</FormLabel>
                      <FormControl>
                        <input
                          type="file"
                          accept="image/png, image/jpeg"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append('file', file);
                            try {
                              const response = await fetch(`/api/courses/${form.getValues('id') || 'new'}/thumbnail`, {
                                method: 'PATCH',
                                body: formData,
                              });
                              if (!response.ok) throw new Error('Falha no upload');
                              const data = await response.json();
                              field.onChange(data.thumbnailPath);
                            } catch (error) {
                              console.error('Erro ao fazer upload da thumbnail:', error);
                            }
                          }}
                        />
                        {field.value && (
                          <img src={field.value} alt="Thumbnail" className="mt-2 max-h-24 rounded" />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duração (minutos)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nível</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o nível" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BEGINNER">Iniciante</SelectItem>
                            <SelectItem value="INTERMEDIATE">Intermediário</SelectItem>
                            <SelectItem value="ADVANCED">Avançado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Salvando..." : "Salvar Curso"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
