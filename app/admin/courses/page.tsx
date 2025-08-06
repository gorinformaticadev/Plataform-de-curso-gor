"use client";

import { useState, useEffect, useRef } from "react";
import { MoreHorizontal, Plus, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { QuillEditor } from "@/components/ui/quill-editor";
import axios from "axios";
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
import { Checkbox } from "@/components/ui/checkbox";

interface Category {
  id: string;
  name: string;
  icon?: string;
}

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
  instructorId?: string; // Add instructorId to the interface
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
  const formSchema = z.object({
    title: z.string().min(3, "Título muito curto"),
    slug: z.string().min(3, "Slug muito curto").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido: use apenas letras minúsculas, números e hífens"),
    shortDescription: z.string().min(10, "Descrição curta muito curta").max(150, "Descrição curta muito longa"),
    description: z.string().min(10, "Descrição muito curta"),
    thumbnail: z.string().optional(), // This will store the URL after upload
    price: z.number().min(0, "Preço inválido"),
    level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
    categoryId: z.string().min(1, "Selecione uma categoria"),
    duration: z.number().min(0, "Duração inválida"),
    isPublished: z.boolean().default(false),
    instructorId: z.string().optional(), // Novo campo para o instrutor
  });

  const router = useRouter();
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      shortDescription: "",
      description: "",
      thumbnail: "",
      price: 0,
      level: "BEGINNER",
      categoryId: "",
      duration: 0,
      isPublished: false,
      instructorId: "", // Default value for instructor
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      let thumbnailUrl = values.thumbnail;

      if (thumbnailFile) {
        const formData = new FormData();
        formData.append('file', thumbnailFile);
        const uploadResponse = await axios.post('/api/uploads/course-thumbnail', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        });
        thumbnailUrl = uploadResponse.data.url;
      }

      const courseData = {
        ...values,
        thumbnail: thumbnailUrl,
        status: values.isPublished ? "PUBLISHED" : "DRAFT",
        instructorId: values.instructorId === 'none' ? null : values.instructorId,
      };
      
      const response = await axios.post('/api/courses', courseData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const newCourse = response.data;

      // Atualizar a lista de cursos com o novo curso
      // Idealmente, a API retornaria o curso completo com o instrutor e categoria populados
      // Por enquanto, vamos adicionar uma versão simplificada e recarregar
      setCourses(prevCourses => [...prevCourses, { ...newCourse, category: { name: categories.find(c => c.id === newCourse.categoryId)?.name || 'N/A' }, instructor: { name: instructors.find(i => i.id === newCourse.instructorId)?.name || 'N/A' }, modulesCount: 0, enrollmentsCount: 0, reviewsCount: 0 }]);
      setIsCreateModalOpen(false);
      form.reset();
      setThumbnailFile(null);
      setThumbnailPreviewUrl(null);
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

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [instructors, setInstructors] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingInstructors, setIsLoadingInstructors] = useState(true);

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
        setIsLoadingCategories(false);

        // Fetch Instrutores
        const instructorsResponse = await axios.get('/api/users/instructors', { headers });
        setInstructors(instructorsResponse.data);
        setIsLoadingInstructors(false);

      } catch (error) {
        console.error("Error fetching initial data:", error);
        // Lidar com erros de forma mais granular se necessário
        setIsLoadingCategories(false);
        setIsLoadingInstructors(false);
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
          <DialogContent
            className="sm:max-w-[600px] overflow-y-auto max-h-[80vh]"
            aria-describedby="create-course-description"
          >
            <DialogHeader>
              <p id="create-course-description" className="sr-only">
                Formulário para criação de um novo curso
              </p>
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
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="slug-do-curso" {...field} />
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
                        <QuillEditor
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
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
                      <FormLabel>Thumbnail do Curso</FormLabel>
                      <FormControl>
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setThumbnailFile(file);
                                setThumbnailPreviewUrl(URL.createObjectURL(file));
                                field.onChange(file.name); // Store filename or a temporary identifier
                              } else {
                                setThumbnailFile(null);
                                setThumbnailPreviewUrl(null);
                                field.onChange("");
                              }
                            }}
                            className="hidden" // Hide the default file input
                          />
                          <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                          >
                            Escolher Arquivo
                          </Button>
                          {thumbnailPreviewUrl && (
                            <div className="mt-2">
                              <img src={thumbnailPreviewUrl} alt="Preview" className="w-24 h-24 object-cover rounded-md" />
                            </div>
                          )}
                        </div>
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
                    name="categoryId"
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
                            {isLoadingCategories ? (
                              <SelectItem value="loading" disabled>Carregando...</SelectItem>
                            ) : (
                              categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="instructorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instrutor (Opcional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um instrutor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem> {/* Option for no instructor */}
                            {isLoadingInstructors ? (
                              <SelectItem value="loading" disabled>Carregando instrutores...</SelectItem>
                            ) : (
                              instructors.map((instructor) => (
                                <SelectItem key={instructor.id} value={instructor.id}>
                                  {instructor.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Publicar Curso
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

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
                  <option key={category.id} value={category.name}>{category.name}</option>
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
