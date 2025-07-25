"use client";

import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  onFilter: () => void;
}

export function UserFilters({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  onFilter,
}: UserFiltersProps) {
  useEffect(() => {
    const handler = setTimeout(() => {
      onFilter();
    }, 500); 

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, roleFilter, onFilter]);

  return (
    <div className="flex gap-4 items-center">
      <Input
        placeholder="Buscar por nome ou email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <Select value={roleFilter} onValueChange={setRoleFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por função" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="ADMIN">Administradores</SelectItem>
          <SelectItem value="INSTRUCTOR">Instrutores</SelectItem>
          <SelectItem value="STUDENT">Alunos</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
