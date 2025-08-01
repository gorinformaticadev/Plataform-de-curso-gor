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
  const { token, reloadUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setIsSubmitting(true);

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

    const promise = fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/users/${user.id}`, {
      method: "PATCH",
      headers: {
        // Não defina 'Content-Type', o navegador fará isso automaticamente para multipart/form-data
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Falha ao atualizar os dados do usuário.' }));
        throw new Error(errorData.message || 'Falha ao atualizar os dados do usuário.');
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Salvando alterações...",
      success: async () => {
        await reloadUser();
        onSuccess();
        return "Usuário atualizado com sucesso!";
      },
      error: (err) => {
        form.setError("root", { message: err.message });
        return err.message;
      },
      finally: () => {
        setIsSubmitting(false);
      },
    });
  }

  return (
    <div className="max-h-screen overflow-y-auto p-4">
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
          render={({ field: { onChange, onBlur, name, ref } }) => (
            <FormItem>
              <FormLabel>Novo Avatar</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  name={name}
                  onBlur={onBlur}
                  ref={ref}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    onChange(file);
                    if (file) {
                      setAvatarPreview(URL.createObjectURL(file));
                    } else {
                      setAvatarPreview(user.avatar ? `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}${user.avatar}` : null);
                    }
                  }}
                />
              </FormControl>
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
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </Form>
    </div>
  );
}
