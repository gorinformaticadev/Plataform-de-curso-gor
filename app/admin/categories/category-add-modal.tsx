"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useCreateCategory } from "./categories.service";

// Schema de validação reutilizado do page.tsx
const categorySchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  icon: z.string().min(1, "Ícone é obrigatório"),
  isActive: z.boolean().default(true),
});

type CategoryForm = z.infer<typeof categorySchema>;

// Ícones disponíveis
const availableIcons = [
  { value: "book", label: "Livro" },
  { value: "code", label: "Código" },
  { value: "laptop", label: "Laptop" },
  { value: "graduation-cap", label: "Graduação" },
  { value: "atom", label: "Átomo" },
  { value: "flask", label: "Frasco" },
  { value: "palette", label: "Paleta" },
  { value: "music", label: "Música" },
  { value: "calculator", label: "Calculadora" },
  { value: "globe", label: "Globo" },
  { value: "microscope", label: "Microscópio" },
];

interface CategoryAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CategoryAddModal({ open, onOpenChange, onSuccess }: CategoryAddModalProps) {
  const createCategory = useCreateCategory();
  
  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      icon: "book",
      isActive: true,
    },
  });

  // Função para gerar slug automaticamente
  const generateSlug = (name: string) => {
    return name
      .trim()
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove múltiplos hífens
      .substring(0, 50);
  };

  const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (name && !form.getValues("slug")) {
      form.setValue("slug", generateSlug(name));
    }
  };

  const onSubmit = async (data: CategoryForm) => {
    try {
      await createCategory.mutateAsync(data);
      toast.success("Categoria criada com sucesso!");
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error("Erro ao criar categoria");
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Categoria</DialogTitle>
          <DialogDescription>
            Crie uma nova categoria para organizar seus cursos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Categoria</Label>
            <Input
              id="name"
              {...form.register("name")}
              onBlur={handleNameBlur}
              placeholder="Ex: Programação Web"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              {...form.register("slug")}
              placeholder="ex: programacao-web"
            />
            {form.formState.errors.slug && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.slug.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Descreva brevemente o que esta categoria abrange..."
              rows={3}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="icon">Ícone</Label>
            <Select
              value={form.watch("icon")}
              onValueChange={(value) => form.setValue("icon", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um ícone" />
              </SelectTrigger>
              <SelectContent>
                {availableIcons.map((icon) => (
                  <SelectItem key={icon.value} value={icon.value}>
                    {icon.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.icon && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.icon.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              {...form.register("isActive")}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isActive" className="text-sm font-medium">
              Categoria ativa
            </Label>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            onClick={form.handleSubmit(onSubmit)}
            disabled={createCategory.isPending}
          >
            {createCategory.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Criar Categoria"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
