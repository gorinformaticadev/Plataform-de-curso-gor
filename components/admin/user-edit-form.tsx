"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/auth-context";
import { useMemoryLeakDetector } from "@/hooks/useMemoryLeakDetector";
import { toast } from "sonner";

// Function to validate CPF
const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]+/g, ""); // Remove non-numeric characters

  if (cpf.length !== 11) return false; // CPF must have 11 digits
  // Check for known invalid CPFs (all digits are the same)
  if (cpf === "00000000000" ||
      cpf === "11111111111" ||
      cpf === "22222222222" ||
      cpf === "33333333333" ||
      cpf === "44444444444" ||
      cpf === "55555555555" ||
      cpf === "66666666666" ||
      cpf === "77777777777" ||
      cpf === "88888888888" ||
      cpf === "99999999999") {
    return false;
  }

  // Validate first digit
  let sum = 0;
  let remainder;
  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if ((remainder === 10) || (remainder === 11)) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if ((remainder === 10) || (remainder === 11)) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;

  return true;
};

const formSchema = z
  .object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
    email: z.string().email("Email inválido."),
    bio: z.string().optional(),
    role: z.enum(["ADMIN", "INSTRUCTOR", "STUDENT"]),
    avatar: z.instanceof(File).optional().nullable(),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres.").optional().or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
    cpf: z.string().optional().or(z.literal("")).refine(
      (val) => !val || validateCPF(val),
      "CPF inválido."
    ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

import { User } from "@/types";

interface UserEditFormProps {
  user: User;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserEditForm({ user, onSuccess, onCancel }: UserEditFormProps) {
  const { token, reloadUser, user: currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCompleted, setSubmitCompleted] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.avatar ? `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}${user.avatar}` : null
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      bio: user.bio || "",
      role: user.role,
      avatar: null,
      password: "",
      confirmPassword: "",
      cpf: user.cpf || "",
    },
  });

  useEffect(() => {
    form.reset({
      name: user.name,
      email: user.email,
      bio: user.bio || "",
      role: user.role,
      avatar: null,
      password: "",
      confirmPassword: "",
      cpf: user.cpf || "",
    });
  }, [user, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Proteção contra dupla submissão
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Anexa o arquivo de avatar se existir
      if (values.avatar) {
        formData.append('file', values.avatar);
      }

      // Anexa outros campos de texto
      formData.append('name', values.name);
      formData.append('email', values.email);
      formData.append('role', values.role);
      
      if (values.bio) {
        formData.append('bio', values.bio);
      }

      if (values.cpf) {
        formData.append('cpf', values.cpf.replace(/\D/g, ''));
      }

      // Apenas anexa a senha se ela for fornecida
      if (values.password) {
        formData.append('password', values.password);
      }

      console.log('[UserEditForm] Enviando requisição para API...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          // Não defina 'Content-Type', o navegador fará isso automaticamente para multipart/form-data
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Falha ao atualizar os dados do usuário.' }));
        throw new Error(errorData.message || 'Falha ao atualizar os dados do usuário.');
      }

      const updatedUser = await response.json();
      
      // Executa ações pós-sucesso sequencialmente conforme design doc
      toast.success("Usuário atualizado com sucesso!");
      
      // Primeiro: atualiza contexto se necessário (de forma síncrona)
      if (currentUser && currentUser.id === user.id) {
        await reloadUser();
      }
      
      // Segundo: notifica componente pai (que pode fechar modal e atualizar dados)
      onSuccess();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('[UserEditForm] Erro durante submit:', error);
      form.setError("root", { message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-h-screen overflow-y-auto p-4 relative">
      {isSubmitting && (
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full max-w-lg mx-auto">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl>
                <Input placeholder="000.000.000-00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biografia</FormLabel>
              <FormControl>
                <Textarea placeholder="Fale um pouco sobre o usuário..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col items-center">
          <img 
            src={avatarPreview || (user.avatar ? `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}${user.avatar}` : undefined)}
            alt="Avatar" 
            className="w-32 h-32 rounded-full object-cover" 
          />
        </div>
        <FormField
          control={form.control}
          name="avatar"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel>Novo Avatar</FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  <label htmlFor="avatar-upload" className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    Selecionar Imagem
                  </label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    className="hidden"
                    accept=".jpg, .png"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      onChange(file);
                      if (file) {
                        setAvatarPreview(URL.createObjectURL(file));
                      }
                    }}
                    {...rest}
                  />
                  {avatarPreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        onChange(null);
                        setAvatarPreview(null);
                        // Resetar o input de arquivo
                        const input = document.getElementById('avatar-upload') as HTMLInputElement;
                        if (input) input.value = '';
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </Button>
                  )}
                </div>
              </FormControl>
              <p className="text-sm text-muted-foreground">
                Formatos permitidos: JPG, PNG. Tamanho ideal: 200x200px.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nova Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Deixe em branco para não alterar" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Nova Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Confirme a nova senha" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Função</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="STUDENT">Aluno</SelectItem>
                  <SelectItem value="INSTRUCTOR">Instrutor</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </div>
      </form>
    </Form>
    </div>
  );
}
