"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { notFound } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "INSTRUCTOR" | "STUDENT";
  createdAt: string;
  enrollments: { course: { title: string } }[];
}

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  const { token } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
        <CardHeader className="flex flex-row items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={`https://github.com/shadcn.png`} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Função</h3>
            <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
          </div>
          <div>
            <h3 className="font-semibold">Data de Cadastro</h3>
            <p>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</p>
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
}
