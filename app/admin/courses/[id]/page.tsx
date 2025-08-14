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
import CourseModulesManager from "@/components/admin/CourseModulesManager";

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
  const [modules, setModules] = useState<any[]>([]);

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
        const [courseResponse, categoriesResponse, modulesResponse] = await Promise.all([
          axios.get(`/api/courses/${params.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('/api/categories', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`/api/courses/${params.id}/modules`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const courseData = courseResponse.data;
        setCourse(courseData);
        setCategories(categoriesResponse.data);
        setModules(modulesResponse.data);

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

  const saveModulesAndLessons = async (updatedModules: any[], courseId: string) => {
    try {
      const existingModulesResponse = await axios.get(`/api/courses/${courseId}/modules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const existingModules = existingModulesResponse.data;

      const existingModuleIds = new Set(existingModules.map((m: any) => m.id));
      const updatedModuleIds = new Set(updatedModules.map((m: any) => m.id).filter(Boolean));

      // Deletar módulos removidos
      for (const existingModule of existingModules) {
        if (!updatedModuleIds.has(existingModule.id)) {
          await axios.delete(`/api/modules/${existingModule.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }

      // Criar ou atualizar módulos e suas lições
      for (const module of updatedModules) {
        let moduleId: string;
        let existingLessonsInModule: any[] = [];

        if (module.id && existingModuleIds.has(module.id)) {
          // Atualizar módulo existente
          await axios.patch(`/api/modules/${module.id}`, {
            title: module.name,
            description: module.description,
            order: updatedModules.indexOf(module) + 1,
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          moduleId = module.id;

          // Buscar lições existentes para este módulo
          const lessonsResponse = await axios.get(`/api/modules/${moduleId}/lessons`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          existingLessonsInModule = lessonsResponse.data;
        } else {
          // Criar novo módulo
          const moduleResponse = await axios.post('/api/modules', {
            title: module.name,
            description: module.description,
            courseId: courseId,
            order: updatedModules.indexOf(module) + 1,
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          moduleId = moduleResponse.data.id;
        }

        const existingLessonIds = new Set(existingLessonsInModule.map((l: any) => l.id));
        const updatedLessonIds = new Set(module.contents.map((c: any) => c.id).filter(Boolean));

        // Deletar lições removidas
        for (const existingLesson of existingLessonsInModule) {
          if (!updatedLessonIds.has(existingLesson.id)) {
            await axios.delete(`/api/lessons/${existingLesson.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          }
        }

        // Criar ou atualizar lições
        if (module.contents && module.contents.length > 0) {
          for (const content of module.contents) {
            const lessonData: any = {
              title: content.title,
              moduleId: moduleId,
              order: module.contents.indexOf(content) + 1,
              type: content.type,
              content: content.contents, // Adicionado para TiptapEditor
            };

            if (content.type === 'VIDEO') {
              lessonData.videoUrl = content.url;
              lessonData.videoCoverUrl = content.coverUrl;
            } else if (content.type === 'PDF') {
              lessonData.pdfUrl = content.url;
            } else if (content.type === 'QUIZ') {
              lessonData.quizTitle = content.quizTitle;
              lessonData.quizDescription = content.quizDescription;
            }

            if (content.id && existingLessonIds.has(content.id)) {
              // Atualizar lição existente
              await axios.patch(`/api/lessons/${content.id}`, lessonData, {
                headers: { Authorization: `Bearer ${token}` },
              });
            } else {
              // Criar nova lição
              await axios.post('/api/lessons', lessonData, {
                headers: { Authorization: `Bearer ${token}` },
              });
            }
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
              <CourseModulesManager 
                modules={modules}
                onModulesChange={setModules}
                token={token || ""}
                courseId={params.id as string}
              />
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