"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import axios from "axios";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccessibleDialogContent } from "@/components/ui/accessible-dialog-content";
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
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  icon?: string;
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
  isPublished: z.boolean().default(false),
});

interface CourseCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onCourseCreated: () => void;
}

export function CourseCreateModal({
  isOpen,
  onClose,
  categories,
  onCourseCreated,
}: CourseCreateModalProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      isPublished: false,
    },
  });

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

      // Preparar os dados para envio à API
      const courseData = {
        title: values.title,
        description: values.description,
        thumbnail: thumbnailUrl,
        price: values.price,
        level: values.level,
        duration: values.duration,
        status: values.isPublished ? "PUBLISHED" : "DRAFT",
        categoryId: values.categoryId,
      };

      const response = await axios.post('/api/courses', courseData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      toast.success("Curso criado com sucesso!");
      onCourseCreated();
      onClose();
      form.reset();
      setThumbnailFile(null);
      setThumbnailPreviewUrl(null);
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Erro ao criar curso");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <AccessibleDialogContent
        className="sm:max-w-[600px] overflow-y-auto max-h-[80vh]"
        descriptionId="create-course-description"
        descriptionText="Preencha as informações do novo curso"
      >
        <DialogHeader>
          <DialogTitle>Adicionar Novo Curso</DialogTitle>
          <DialogDescription id="create-course-description">
            Preencha as informações do novo curso
          </DialogDescription>
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
                        ref={fileInputRef}
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
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar Curso"}
              </Button>
            </div>
          </form>
        </Form>
      </AccessibleDialogContent>
    </Dialog>
  );
}