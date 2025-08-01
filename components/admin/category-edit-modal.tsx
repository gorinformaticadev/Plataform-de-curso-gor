"use client";

import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AccessibleDialogContent } from "@/components/ui/accessible-dialog-content";
import { CategoryEditForm } from "./category-edit-form";

interface CategoryEditModalProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    isActive: boolean;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CategoryEditModal({
  category,
  open,
  onOpenChange,
  onSuccess,
}: CategoryEditModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AccessibleDialogContent 
        className="sm:max-w-[425px]"
        descriptionId="edit-category-description"
        descriptionText="Formulário para edição de categoria"
      >
        <DialogHeader>
          <DialogTitle>Editar Categoria</DialogTitle>
        </DialogHeader>
        <CategoryEditForm
          category={category}
          onSuccess={() => {
            onSuccess();
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </AccessibleDialogContent>
    </Dialog>
  );
}

