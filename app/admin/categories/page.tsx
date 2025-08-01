"use client";

import { useState } from "react";
import React from "react";
import { 
  Plus, 
  Loader2,
  Book,
  Code,
  Laptop,
  GraduationCap,
  Atom,
  FlaskConical,
  Palette,
  Music,
  Calculator,
  Globe,
  Microscope
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

const iconComponents: Record<string, LucideIcon> = {
  book: Book,
  code: Code,
  laptop: Laptop,
  'graduation-cap': GraduationCap,
  atom: Atom,
  flask: FlaskConical,
  palette: Palette,
  music: Music,
  calculator: Calculator,
  globe: Globe,
  microscope: Microscope
};
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/app/admin/categories/data-table";
import { columns } from "@/app/admin/categories/columns";
import { useCategories, useCreateCategory } from "./categories.service";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const categorySchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  icon: z.string().min(1, "Ícone é obrigatório"),
});

type CategoryForm = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  const { data: categories = [], isLoading, error } = useCategories();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      icon: ""
    }
  });

  const createCategory = useCreateCategory();

  const onSubmit = async (data: CategoryForm) => {
    try {
      await createCategory.mutateAsync(data);
      toast.success("Categoria criada com sucesso!");
      setShowAddDialog(false);
      form.reset();
    } catch {
      toast.error("Erro ao criar categoria");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Erro ao carregar categorias</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <DataTable columns={columns} data={categories} />

      {/* Add Category Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nova Categoria</h2>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block mb-1">Nome</label>
                <Input {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-1">Slug</label>
                <Input {...form.register("slug")} />
                {form.formState.errors.slug && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.slug.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-1">Descrição</label>
                <Input {...form.register("description")} />
                {form.formState.errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-1">Ícone</label>
                <div className="grid grid-cols-6 gap-2">
                  {['book', 'code', 'laptop', 'graduation-cap', 'atom', 'flask', 
                     'palette', 'music', 'calculator', 'globe', 'microscope'].map((icon) => (
                    <button
                      type="button"
                      key={icon}
                      className={`p-2 border rounded-md ${
                        form.watch('icon') === icon 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-accent'
                      }`}
                      onClick={() => form.setValue('icon', icon)}
                    >
                      {iconComponents[icon] ? (
                        React.createElement(iconComponents[icon], { className: "w-5 h-5" })
                      ) : (
                        <span className="text-xs">{icon}</span>
                      )}
                    </button>
                  ))}
                </div>
                <Input 
                  {...form.register("icon")} 
                  className="mt-2"
                  placeholder="Ou digite o nome do ícone"
                />
                {form.formState.errors.icon && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.icon.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddDialog(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createCategory.isPending}>
                  {createCategory.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : "Salvar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
