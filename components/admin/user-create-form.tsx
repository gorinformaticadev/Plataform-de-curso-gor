"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";

interface UserCreateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserCreateForm({ onSuccess, onCancel }: UserCreateFormProps) {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpf, setCpf] = useState("");
  const [userRole, setUserRole] = useState<"ADMIN" | "INSTRUCTOR" | "STUDENT">("STUDENT");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3001/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          password,
          cpf,
          role: userRole,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao criar usuário");
      }

      onSuccess();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <label
            htmlFor="name"
            className="text-right text-sm font-medium leading-none text-gray-800"
          >
            Nome
          </label>
          <Input
            id="name"
            className="col-span-3"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <label
            htmlFor="email"
            className="text-right text-sm font-medium leading-none text-gray-800"
          >
            Email
          </label>
          <Input
            id="email"
            className="col-span-3"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <label
            htmlFor="role"
            className="text-right text-sm font-medium leading-none text-gray-800"
          >
            Função
          </label>
          <Select onValueChange={(value) => setUserRole(value as "ADMIN" | "INSTRUCTOR" | "STUDENT")}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Selecione uma função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Administrador</SelectItem>
              <SelectItem value="INSTRUCTOR">Instrutor</SelectItem>
              <SelectItem value="STUDENT">Aluno</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <label
            htmlFor="cpf"
            className="text-right text-sm font-medium leading-none text-gray-800"
          >
            CPF
          </label>
          <Input
            id="cpf"
            className="col-span-3"
            type="text"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <label
            htmlFor="password"
            className="text-right text-sm font-medium leading-none text-gray-800"
          >
            Senha
          </label>
          <Input
            id="password"
            className="col-span-3"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
