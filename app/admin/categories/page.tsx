"use client";

import { useState } from "react";
import React from "react";
import { Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/app/admin/categories/data-table";
import { CategoryEditModal } from "@/components/admin/category-edit-modal";
import { CategoryAddModal } from "@/app/admin/categories/category-add-modal";
import { columns } from "@/app/admin/categories/columns";
import { useCategories } from "./categories.service";

export default function CategoriesPage() {
  const { data: categories = [], isLoading, error } = useCategories();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    isActive: boolean;
  } | null>(null);

  // Expor a função para ser acessível pelo DataTable
  React.useEffect(() => {
    (window as any).setEditingCategory = setEditingCategory;
    return () => {
      delete (window as any).setEditingCategory;
    };
  }, []);

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

      {/* Add Category Modal */}
      <CategoryAddModal
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => {
          // O react-query irá automaticamente atualizar a lista
        }}
      />

      {/* Edit Category Modal */}
      {editingCategory && (
        <CategoryEditModal
          category={editingCategory}
          open={!!editingCategory}
          onOpenChange={(open) => !open && setEditingCategory(null)}
          onSuccess={() => {
            // O react-query irá automaticamente atualizar a lista
          }}
        />
      )}
    </div>
  );
}
