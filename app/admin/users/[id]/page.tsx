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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccessibleDialogContent } from "@/components/ui/accessible-dialog-content";
import { UserEditForm } from "@/components/admin/user-edit-form";

interface User {
  id: string;
  userId: string;
  studentCode: string | null;
  name: string;
  email: string;
  cpf: string | null;
  role: "ADMIN" | "INSTRUCTOR" | "STUDENT";
  createdAt: string;
  updatedAt: string;
  avatar: string | null;
  bio: string | null;
  isActive: boolean;
  inscricoes: {
    id: string;
    course: {
      id: string;
      title: string;
      description?: string;
    };
    enrolledAt: string;
    status: string;
  }[];
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
  compras: {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    course: {
      title: string;
    };
  }[];
  progress: {
    id: string;
    courseId: string;
    progress: number;
    completedAt: string | null;
    course: {
      title: string;
    };
  }[];
  reviews: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    course: {
      title: string;
    };
  }[];
  _count: {
    inscricoes: number;
    compras: number;
    progress: number;
    reviews: number;
  };
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${params.id}`, {
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={user.avatar ? `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}${user.avatar}` : undefined}
                alt={user.name}
              />
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
          <h3 className="font-semibold text-gray-500">ID do Usuário</h3>
          <p className="font-mono text-sm">{user.userId}</p>
        </div>
        {user.studentCode && (
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-500">Código de Estudante</h3>
            <p className="font-mono text-sm">{user.studentCode}</p>
          </div>
        )}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-500">Função</h3>
          <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
        </div>
        {user.cpf && (
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-500">CPF</h3>
            <p>{user.cpf}</p>
          </div>
        )}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-500">Status do Cadastro</h3>
          <Badge variant={user.isActive ? "default" : "destructive"}>
            {user.isActive ? "Ativo" : "Inativo"}
          </Badge>
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
            <h3 className="font-semibold text-gray-500">Informações (Bio)</h3>
            <p className="text-sm leading-relaxed">{user.bio}</p>
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
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-500">Código do Estudante</h3>
            <p className="font-mono text-sm">{user.student.studentCode}</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-500">Data de Matrícula</h3>
            <p>{new Date(user.student.enrollmentDate).toLocaleDateString("pt-BR")}</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-500">Status do Aluno</h3>
            <Badge variant="secondary">{user.student.status}</Badge>
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
        <CardTitle>Cursos Inscritos</CardTitle>
      </CardHeader>
      <CardContent>
        {user.inscricoes && user.inscricoes.length > 0 ? (
          <div className="space-y-3">
            {user.inscricoes.map((inscricao, index) => (
              <div key={index} className="rounded-md border p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{inscricao.course.title}</h4>
                    {inscricao.course.description && (
                      <p className="text-sm text-gray-600 mt-1">{inscricao.course.description}</p>
                    )}
                  </div>
                  <Badge variant="outline">{inscricao.status}</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Inscrito em: {new Date(inscricao.enrolledAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Este usuário não está inscrito em nenhum curso.</p>
        )}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Compras Realizadas</CardTitle>
      </CardHeader>
      <CardContent>
        {user.compras && user.compras.length > 0 ? (
          <div className="space-y-3">
            {user.compras.map((compra, index) => (
              <div key={index} className="rounded-md border p-4 bg-blue-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{compra.course.title}</h4>
                    <p className="text-lg font-bold text-green-600 mt-1">
                      R$ {compra.amount.toFixed(2)}
                    </p>
                  </div>
                  <Badge variant={compra.status === 'COMPLETED' ? 'default' : 'secondary'}>
                    {compra.status}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Comprado em: {new Date(compra.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Este usuário não realizou nenhuma compra.</p>
        )}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Progressos</CardTitle>
      </CardHeader>
      <CardContent>
        {user.progress && user.progress.length > 0 ? (
          <div className="space-y-3">
            {user.progress.map((progresso, index) => (
              <div key={index} className="rounded-md border p-4 bg-green-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{progresso.course.title}</h4>
                  <span className="text-sm font-bold text-green-600">
                    {progresso.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progresso.progress}%` }}
                  ></div>
                </div>
                {progresso.completedAt && (
                  <p className="text-xs text-gray-500">
                    Concluído em: {new Date(progresso.completedAt).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Este usuário não possui progresso registrado.</p>
        )}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Avaliações</CardTitle>
      </CardHeader>
      <CardContent>
        {user.reviews && user.reviews.length > 0 ? (
          <div className="space-y-3">
            {user.reviews.map((review, index) => (
              <div key={index} className="rounded-md border p-4 bg-yellow-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{review.course.title}</h4>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="ml-2 text-sm font-bold">{review.rating}/5</span>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-700 mb-2 italic">"{review.comment}"</p>
                )}
                <p className="text-xs text-gray-500">
                  Avaliado em: {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Este usuário não fez nenhuma avaliação.</p>
        )}
      </CardContent>
    </Card>

    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <AccessibleDialogContent 
        className="sm:max-w-[625px]"
        descriptionId="edit-user-description"
        descriptionText="Formulário para edição de usuário"
      >
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Modifique as informações do usuário {user.name} conforme necessário.
          </DialogDescription>
        </DialogHeader>
        <UserEditForm
          user={user}
          onSuccess={() => {
            setIsEditDialogOpen(false);
            fetchUser();
          }}
          onCancel={() => setIsEditDialogOpen(false)}
        />
      </AccessibleDialogContent>
    </Dialog>
    </div>
  );
}
