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
import { toast } from "sonner";
import { generateStudentCode } from "@/lib/studentCodeGenerator";

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

  // Gerar prévia do código de estudante
  const getPreviewStudentCode = () => {
    const currentYear = new Date().getFullYear();
    let prefix = '';
    switch (userRole) {
      case 'STUDENT':
        prefix = 'ES';
        break;
      case 'ADMIN':
        prefix = 'PRO';
        break;
      case 'INSTRUCTOR':
        prefix = 'IN';
        break;
    }
    return `RA${prefix}${currentYear}XXXX`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[UserCreateForm] Iniciando criação de usuário...', { role: userRole });
    setIsLoading(true);
    setError(null);

    try {
      // Usar sequencial padrão 1 já que não temos contagem
      const sequencial = 1;
      const studentCode = generateStudentCode(userRole, sequencial);
      console.log('[UserCreateForm] Código de estudante gerado:', studentCode);

      console.log('[UserCreateForm] Enviando requisição para API...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
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
          studentCode, // Incluir o código gerado
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Falha ao criar usuário' }));
        throw new Error(errorData.message || 'Falha ao criar usuário');
      }

      const data = await response.json();
      console.log('[UserCreateForm] Usuário criado com sucesso:', data.id);
      
      toast.success(`Usuário criado com sucesso! Código: ${studentCode}`);
      console.log('[UserCreateForm] Notificando componente pai via onSuccess...');
      onSuccess();
      console.log('[UserCreateForm] Criação concluída com sucesso!');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('[UserCreateForm] Erro durante criação:', error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      console.log('[UserCreateForm] Finalizando criação, resetando isLoading...');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50 rounded-lg">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Salvando...</span>
          </div>
        </div>
      )}
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
          <div className="col-span-3 space-y-2">
            <Select onValueChange={(value) => setUserRole(value as "ADMIN" | "INSTRUCTOR" | "STUDENT")}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Administrador</SelectItem>
                <SelectItem value="INSTRUCTOR">Instrutor</SelectItem>
                <SelectItem value="STUDENT">Aluno</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-gray-500">
              Código será gerado: <span className="font-mono font-medium">{getPreviewStudentCode()}</span>
            </div>
          </div>
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
          {isLoading ? (
            <>
              <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Salvando...
            </>
          ) : (
            "Salvar"
          )}
        </Button>
      </div>
      </form>
    </div>
  );
}
