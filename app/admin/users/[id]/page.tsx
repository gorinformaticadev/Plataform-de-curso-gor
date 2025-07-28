"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserEditForm } from "@/components/admin/user-edit-form";

interface User {
  id: string;
  name: string;
  email: string;
  cpf: string | null;
  role: "ADMIN" | "INSTRUCTOR" | "STUDENT";
  createdAt: string;
  updatedAt: string;
  avatar: string | null;
  bio: string | null;
  enrollments: { course: { title: string } }[];
  student: {
    studentCode: string;
    enrollmentDate: string;
    status: string;
  } | null;
  instructorProfile: {
    expertise: string[];
    experience: string | null;
    website: string | null;
    linkedin: string | null;
    approved: boolean;
  } | null;
}

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  const { token } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3001/api/users/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          notFound();
        }
        throw new Error("Falha ao buscar detalhes do usuário");
      }

      const data = await response.json();
      setUser(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token, params.id]);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive";
      case "INSTRUCTOR":
        return "default";
      case "STUDENT":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return <div className="text-center">Carregando...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar ? `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}${user.avatar}` : undefined} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>
            <Button onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-500">Função</h3>
            <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-500">Data de Cadastro</h3>
            <p>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-500">Última Atualização</h3>
            <p>{new Date(user.updatedAt).toLocaleDateString("pt-BR")}</p>
          </div>
          {user.bio && (
            <div className="space-y-2 md:col-span-2">
              <h3 className="font-semibold text-gray-500">Biografia</h3>
              <p>{user.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {user.student && (
        <Card>
          <CardHeader>
            <CardTitle>Informações do Aluno</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {user.cpf && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-500">CPF</h3>
                <p>{user.cpf}</p>
              </div>
            )}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-500">Código do Aluno</h3>
              <p>{user.student.studentCode}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-500">Data de Matrícula</h3>
              <p>{new Date(user.student.enrollmentDate).toLocaleDateString("pt-BR")}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-500">Status</h3>
              <Badge>{user.student.status}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {user.instructorProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Informações do Instrutor</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-500">Aprovado</h3>
              <Badge variant={user.instructorProfile.approved ? "default" : "destructive"}>
                {user.instructorProfile.approved ? "Sim" : "Não"}
              </Badge>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-500">Especialidades</h3>
              <div className="flex flex-wrap gap-2">
                {user.instructorProfile.expertise.map((exp, i) => (
                  <Badge key={i} variant="secondary">{exp}</Badge>
                ))}
              </div>
            </div>
            {user.instructorProfile.experience && (
              <div className="space-y-2 md:col-span-2">
                <h3 className="font-semibold text-gray-500">Experiência</h3>
                <p>{user.instructorProfile.experience}</p>
              </div>
            )}
            {user.instructorProfile.website && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-500">Website</h3>
                <a href={user.instructorProfile.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                  {user.instructorProfile.website}
                </a>
              </div>
            )}
            {user.instructorProfile.linkedin && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-500">LinkedIn</h3>
                <a href={user.instructorProfile.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                  {user.instructorProfile.linkedin}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Cursos Matriculados</CardTitle>
        </CardHeader>
        <CardContent>
          {user.enrollments && user.enrollments.length > 0 ? (
            <ul className="space-y-2">
              {user.enrollments.map((enrollment, index) => (
                <li key={index} className="rounded-md border p-3">
                  {enrollment.course.title}
                </li>
              ))}
            </ul>
          ) : (
            <p>Este usuário não está matriculado em nenhum curso.</p>
          )}
        </CardContent>
      </Card>

      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
        </DialogHeader>
        <UserEditForm
          user={user}
          onSuccess={() => {
            setIsEditDialogOpen(false);
            fetchUser();
          }}
          onCancel={() => setIsEditDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
    </div>
  );
}
