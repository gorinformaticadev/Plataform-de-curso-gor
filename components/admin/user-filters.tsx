"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

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
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <Input
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
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
      <Button onClick={onFilter}>
        <Filter className="mr-2 h-4 w-4" />
        Aplicar Filtros
      </Button>
    </div>
  );
}
