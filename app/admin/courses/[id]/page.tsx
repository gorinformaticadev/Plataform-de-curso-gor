"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import axios from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Save, Eye, Settings, Users, BookOpen, Star } from "lucide-react";
import Link from "next/link";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface Category {
  id: string;
  name: string;
  icon?: string;
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
  categoryId: string;
  category: {
    name: string;
    icon?: string;
  };
  instructor: {
    name: string;
    avatar?: string;
  };
  modulesCount: number;
  enrollmentsCount: number;
  reviewsCount: number;
  averageRating?: number;
  createdAt: string;
  updatedAt: string;
}

const formSchema = z.object({
  title: z.string().min(3, "Título muito curto"),
  slug: z.string().min(3, "Slug muito curto").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido: use apenas letras minúsculas, números e hífens"),
  description: z.string().min(10, "Descrição muito curta"),
  thumbnail: z.string().optional(),
  price: z.number().min(0, "Preço inválido"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  duration: z.number().min(0, "Duração inválida").optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [modules, setModules] = useState<any[]>([]);
  const [newModuleName, setNewModuleName] = useState("");
  const [editModuleOpen, setEditModuleOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number | null>(null);
  const [editedModuleName, setEditedModuleName] = useState("");
  const [editedModuleDescription, setEditedModuleDescription] = useState("");
  const [addContentOpen, setAddContentOpen] = useState(false);
  const [contentType, setContentType] = useState<"VIDEO" | "PDF" | "QUIZ">("VIDEO");
  const [contentTitle, setContentTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoLink, setVideoLink] = useState("");
  const [videoCoverFile, setVideoCoverFile] = useState<File | null>(null);
  const [videoCoverPreviewUrl, setVideoCoverPreviewUrl] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfLink, setPdfLink] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      thumbnail: "",
      price: 0,
      level: "BEGINNER",
      categoryId: "",
      duration: 0,
      status: "DRAFT",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !params.id) return;

      try {
        const [courseResponse, categoriesResponse] = await Promise.all([
          axios.get(`/api/courses/${params.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('/api/categories', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const courseData = courseResponse.data;
        setCourse(courseData);
        setCategories(categoriesResponse.data);

        // Preencher o formulário com os dados do curso
        form.reset({
          title: courseData.title,
          slug: courseData.slug,
          description: courseData.description,
          thumbnail: courseData.thumbnail || "",
          price: courseData.price,
          level: courseData.level,
          categoryId: courseData.categoryId,
          duration: courseData.duration || 0,
          status: courseData.status,
        });

        if (courseData.thumbnail) {
          setThumbnailPreviewUrl(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}${courseData.thumbnail}`);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        toast.error("Erro ao carregar dados do curso");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, params.id, form]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue('title', title);
    if (title) {
      form.setValue('slug', generateSlug(title));
    }
  };

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
        title: values.title,
        description: values.description,
        thumbnail: thumbnailUrl,
        price: values.price,
        level: values.level,
        duration: values.duration,
        status: values.status,
        categoryId: values.categoryId,
      };

      await axios.patch(`/api/courses/${params.id}`, courseData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Salvar módulos e vídeos no backend
      await saveModulesAndLessons(modules, params.id as string);

      toast.success("Curso atualizado com sucesso!");
      router.push('/admin/courses');
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error("Erro ao atualizar curso");
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveModulesAndLessons = async (modules: any[], courseId: string) => {
    try {
      // Primeiro, buscar os módulos existentes do curso
      const existingModulesResponse = await axios.get(`/api/courses/${courseId}/modules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const existingModules = existingModulesResponse.data;

      // Para cada módulo, verificar se já existe ou precisa ser criado
      for (const module of modules) {
        let moduleId: string;
        
        // Se o módulo já tem um ID, é um módulo existente
        if (module.id) {
          // Atualizar o módulo existente
          await axios.patch(`/api/modules/${module.id}`, {
            title: module.name,
            description: module.description,
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          moduleId = module.id;
        } else {
          // Criar um novo módulo
          const moduleResponse = await axios.post('/api/modules', {
            title: module.name,
            description: module.description,
            courseId: courseId,
            order: modules.indexOf(module) + 1,
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          moduleId = moduleResponse.data.id;
        }

        // Salvar as lições (conteúdos) do módulo
        if (module.contents && module.contents.length > 0) {
          for (const content of module.contents) {
            let contentData: any = {
              title: content.title,
              moduleId: moduleId,
              order: module.contents.indexOf(content) + 1,
              type: content.type,
            };

            if (content.type === 'VIDEO') {
              contentData.videoUrl = content.url;
              contentData.videoCoverUrl = content.coverUrl;
            } else if (content.type === 'PDF') {
              contentData.pdfUrl = content.url;
            } else if (content.type === 'QUIZ') {
              contentData.quizTitle = content.quizTitle;
              contentData.quizDescription = content.quizDescription;
            }

            await axios.post('/api/lessons', contentData, {
              headers: { Authorization: `Bearer ${token}` },
            });
          }
        }
      }
    } catch (error) {
      console.error("Error saving modules and lessons:", error);
      throw error;
    }
  };

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

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (!course) {
    return <div className="text-center py-8 text-red-600">Curso não encontrado</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/courses">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Curso</h1>
            <p className="text-gray-600">Modifique as informações do curso</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusBadgeVariant(course.status)}>
            {course.status === 'PUBLISHED' ? 'Publicado' :
             course.status === 'DRAFT' ? 'Rascunho' : 'Arquivado'}
          </Badge>
          <Badge variant={getLevelBadgeVariant(course.level)}>
            {course.level === 'BEGINNER' ? 'Iniciante' :
             course.level === 'INTERMEDIATE' ? 'Intermediário' : 'Avançado'}
          </Badge>
        </div>
      </div>

      {/* Course Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Informações do Curso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={course.thumbnail ? `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}${course.thumbnail}` : undefined}
                alt={course.title}
              />
              <AvatarFallback>{course.title.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{course.title}</h2>
              <p className="text-gray-600">por {course.instructor.name}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course.enrollmentsCount} alunos
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {course.modulesCount} módulos
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  {course.averageRating ? course.averageRating.toFixed(1) : 'N/A'} ({course.reviewsCount})
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Título do curso"
                            {...field}
                            onChange={handleTitleChange}
                          />
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <TiptapEditor
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
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setThumbnailFile(file);
                                  setThumbnailPreviewUrl(URL.createObjectURL(file));
                                  field.onChange(file.name);
                                } else {
                                  setThumbnailFile(null);
                                  setThumbnailPreviewUrl(null);
                                  field.onChange("");
                                }
                              }}
                              className="hidden"
                              id="thumbnail-upload"
                            />
                            <Button
                              type="button"
                              onClick={() => document.getElementById('thumbnail-upload')?.click()}
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
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DRAFT">Rascunho</SelectItem>
                            <SelectItem value="PUBLISHED">Publicado</SelectItem>
                            <SelectItem value="ARCHIVED">Arquivado</SelectItem>
                          </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  <div className="flex justify-end gap-2 pt-4">
                    <Link href="/admin/courses">
                      <Button variant="outline" type="button">
                        Cancelar
                      </Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting}>
                      <Save className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Conteúdo</CardTitle>
            </CardHeader>
            <CardContent>
              <AlertDialog open={open} onOpenChange={setOpen}>
                <div className="flex justify-end mb-4">
                  <AlertDialogTrigger asChild>
                    <Button>Adicionar Módulo</Button>
                  </AlertDialogTrigger>
                </div>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Adicionar Novo Módulo</AlertDialogTitle>
                    <AlertDialogDescription>
                      Digite o nome do novo módulo.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Input
                    placeholder="Nome do módulo"
                    className="mb-4"
                    value={newModuleName}
                    onChange={(e) => setNewModuleName(e.target.value)}
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        setModules([...modules, { name: newModuleName, contents: [] }]);
                        setNewModuleName("");
                        setOpen(false);
                      }}
                    >
                      Salvar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              {modules.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Módulos:</h3>
                  <ul>
                    {modules.map((module, index) => (
                      <li key={index} className="py-2 border-b">
                        <div className="flex items-center justify-between">
                          <span>{module.name}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedModule(module);
                              setSelectedModuleIndex(index);
                              setEditedModuleName(module.name);
                              setEditedModuleDescription(module.description || "");
                              setEditModuleOpen(true);
                            }}
                          >
                            Editar
                          </Button>
                        </div>
                        {module.contents && module.contents.length > 0 && (
                          <div className="mt-2 ml-4">
                            <h4 className="text-sm font-medium text-gray-600">Conteúdo:</h4>
                            <ul className="mt-1">
                              {module.contents.map((content: any, contentIndex: number) => (
                                <li key={contentIndex} className="text-sm text-gray-500 flex items-center">
                                  <span className="mr-2">•</span>
                                  {content.title} <span className="ml-2 text-xs">({content.type})</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </li >
                    ))}
                  </ul>
                </div>
              )}
              <AlertDialog open={editModuleOpen} onOpenChange={setEditModuleOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Editar Módulo</AlertDialogTitle>
                    <AlertDialogDescription>
                      Edite o nome e a descrição do módulo.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Input
                    placeholder="Nome do módulo"
                    className="mb-4"
                    value={editedModuleName}
                    onChange={(e) => setEditedModuleName(e.target.value)}
                  />
                  <TiptapEditor
                    value={editedModuleDescription}
                    onChange={setEditedModuleDescription}
                  />
                  <div className="mt-4">
                    <h4 className="text-md font-semibold mb-2">Conteúdo do Módulo</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mb-2"
                      onClick={() => setAddContentOpen(true)}
                    >
                      Adicionar Conteúdo
                    </Button>
                    {selectedModule?.contents?.map((content: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded mb-1">
                        <div>
                          <span className="font-medium">{content.title}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({content.type})
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updatedModules = [...modules];
                            if (selectedModuleIndex !== null) {
                              updatedModules[selectedModuleIndex] = {
                                ...updatedModules[selectedModuleIndex],
                                contents: updatedModules[selectedModuleIndex].contents.filter((_: any, i: number) => i !== index)
                              };
                              setModules(updatedModules);
                            }
                          }}
                        >
                          Remover
                        </Button>
                      </div>
                    ))}
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setEditModuleOpen(false)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        const updatedModules = modules.map((module, index) => {
                          if (index === selectedModuleIndex) {
                            return {
                              ...module,
                              name: editedModuleName,
                              description: editedModuleDescription,
                            };
                          }
                          return module;
                        });
                        setModules(updatedModules);
                        setEditModuleOpen(false);
                        setSelectedModuleIndex(null);
                      }}
                    >
                      Salvar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
               {/* Modal para adicionar conteúdo */}
               <AlertDialog open={addContentOpen} onOpenChange={setAddContentOpen}>
                 <AlertDialogContent>
                   <AlertDialogHeader>
                     <AlertDialogTitle>Adicionar Conteúdo</AlertDialogTitle>
                     <AlertDialogDescription>
                       Adicione um novo conteúdo ao módulo.
                     </AlertDialogDescription>
                   </AlertDialogHeader>
                   <div className="space-y-4">
                     <div>
                       <label className="text-sm font-medium">Título do Conteúdo</label>
                       <Input
                         placeholder="Título do conteúdo"
                         value={contentTitle}
                         onChange={(e) => setContentTitle(e.target.value)}
                       />
                     </div>
                     <div>
                       <label className="text-sm font-medium">Tipo de Conteúdo</label>
                       <div className="flex gap-2 mt-1">
                         <Button
                           variant={contentType === "VIDEO" ? "default" : "outline"}
                           onClick={() => setContentType("VIDEO")}
                           className="flex-1"
                         >
                           Vídeo
                         </Button>
                         <Button
                           variant={contentType === "PDF" ? "default" : "outline"}
                           onClick={() => setContentType("PDF")}
                           className="flex-1"
                         >
                           PDF
                         </Button>
                         <Button
                           variant={contentType === "QUIZ" ? "default" : "outline"}
                           onClick={() => setContentType("QUIZ")}
                           className="flex-1"
                         >
                           Questionário
                         </Button>
                       </div>
                     </div>
                     {contentType === "VIDEO" && (
                       <div className="space-y-4">
                         <div>
                           <label className="text-sm font-medium">Capa do Vídeo</label>
                           <Input
                             type="file"
                             accept="image/*"
                             onChange={(e) => {
                               const file = e.target.files?.[0];
                               if (file) {
                                 setVideoCoverFile(file);
                                 setVideoCoverPreviewUrl(URL.createObjectURL(file));
                               } else {
                                 setVideoCoverFile(null);
                                 setVideoCoverPreviewUrl(null);
                               }
                             }}
                           />
                           {videoCoverPreviewUrl && (
                             <div className="mt-2">
                               <img src={videoCoverPreviewUrl} alt="Preview da Capa" className="w-24 h-24 object-cover rounded-md" />
                             </div>
                           )}
                         </div>
                         <div>
                           <label className="text-sm font-medium">Arquivo de Vídeo</label>
                           <Input
                             type="file"
                             accept="video/*"
                             onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                           />
                         </div>
                         <div>
                           <label className="text-sm font-medium">Link do Vídeo (opcional)</label>
                           <Input
                             placeholder="https://exemplo.com/video.mp4"
                             value={videoLink}
                             onChange={(e) => setVideoLink(e.target.value)}
                           />
                         </div>
                       </div>
                     )}
                     {contentType === "PDF" && (
                       <div>
                         <label className="text-sm font-medium">Arquivo PDF</label>
                         <Input
                           type="file"
                           accept="application/pdf"
                           onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                         />
                         <div>
                           <label className="text-sm font-medium">Link do PDF (opcional)</label>
                           <Input
                             placeholder="https://exemplo.com/documento.pdf"
                             value={pdfLink}
                             onChange={(e) => setPdfLink(e.target.value)}
                           />
                         </div>
                       </div>
                     )}
                     {contentType === "QUIZ" && (
                       <div className="space-y-4">
                         <div>
                           <label className="text-sm font-medium">Título do Questionário</label>
                           <Input
                             placeholder="Título do questionário"
                             value={quizTitle}
                             onChange={(e) => setQuizTitle(e.target.value)}
                           />
                         </div>
                         <div>
                           <label className="text-sm font-medium">Descrição do Questionário</label>
                           <TiptapEditor
                             value={quizDescription}
                             onChange={setQuizDescription}
                           />
                         </div>
                       </div>
                     )}
                   </div>
                   <AlertDialogFooter>
                     <AlertDialogCancel>Cancelar</AlertDialogCancel>
                     <AlertDialogAction
                       onClick={async () => {
                         if (!contentTitle) {
                           toast.error("Por favor, preencha o título do conteúdo.");
                           return;
                         }

                         let contentUrl = "";
                         let contentCoverUrl = "";

                         if (contentType === "VIDEO") {
                           if (videoFile) {
                             const formData = new FormData();
                             formData.append('file', videoFile);
                             const uploadResponse = await axios.post('/api/uploads/video', formData, {
                               headers: {
                                 'Content-Type': 'multipart/form-data',
                                 'Authorization': `Bearer ${token}`,
                               },
                             });
                             contentUrl = uploadResponse.data.url;
                           } else if (videoLink) {
                             try {
                               new URL(videoLink);
                               contentUrl = videoLink;
                             } catch (e) {
                               toast.error("Por favor, insira um link de vídeo válido.");
                               return;
                             }
                           } else {
                             toast.error("Por favor, faça upload de um vídeo ou forneça um link.");
                             return;
                           }

                           if (videoCoverFile) {
                             const formData = new FormData();
                             formData.append('file', videoCoverFile);
                             const uploadResponse = await axios.post('/api/uploads/video-cover', formData, {
                               headers: {
                                 'Content-Type': 'multipart/form-data',
                                 'Authorization': `Bearer ${token}`,
                               },
                             });
                             contentCoverUrl = uploadResponse.data.url;
                           }
                         } else if (contentType === "PDF") {
                           if (pdfFile) {
                             const formData = new FormData();
                             formData.append('file', pdfFile);
                             const uploadResponse = await axios.post('/api/uploads/pdf', formData, {
                               headers: {
                                 'Content-Type': 'multipart/form-data',
                                 'Authorization': `Bearer ${token}`,
                               },
                             });
                             contentUrl = uploadResponse.data.url;
                           } else if (pdfLink) {
                             try {
                               new URL(pdfLink);
                               contentUrl = pdfLink;
                             } catch (e) {
                               toast.error("Por favor, insira um link de PDF válido.");
                               return;
                             }
                           } else {
                             toast.error("Por favor, faça upload de um PDF ou forneça um link.");
                             return;
                           }
                         } else if (contentType === "QUIZ") {
                           if (!quizTitle || !quizDescription) {
                             toast.error("Por favor, preencha o título e a descrição do questionário.");
                             return;
                           }
                         }

                         const newContent: any = {
                           title: contentTitle,
                           type: contentType,
                         };

                         if (contentType === "VIDEO") {
                           newContent.url = contentUrl;
                           newContent.coverUrl = contentCoverUrl;
                         } else if (contentType === "PDF") {
                           newContent.url = contentUrl;
                         } else if (contentType === "QUIZ") {
                           newContent.quizTitle = quizTitle;
                           newContent.quizDescription = quizDescription;
                         }
                         
                         const updatedModules = [...modules];
                         if (selectedModuleIndex !== null) {
                           if (!updatedModules[selectedModuleIndex].contents) {
                             updatedModules[selectedModuleIndex].contents = [];
                           }
                           updatedModules[selectedModuleIndex].contents.push(newContent);
                           setModules(updatedModules);
                         }
                         
                         // Resetar os estados
                         setContentTitle("");
                         setContentType("VIDEO");
                         setVideoFile(null);
                         setVideoLink("");
                         setVideoCoverFile(null);
                         setVideoCoverPreviewUrl(null);
                         setPdfFile(null);
                         setPdfLink("");
                         setQuizTitle("");
                         setQuizDescription("");
                         setAddContentOpen(false);
                       }}
                     >
                       Adicionar
                     </AlertDialogAction>
                   </AlertDialogFooter>
                 </AlertDialogContent>
               </AlertDialog>
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Configurações avançadas do curso serão implementadas em breve.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics e Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Analytics e relatórios do curso serão implementados em breve.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
