export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "INSTRUCTOR" | "STUDENT";
  createdAt: string;
  bio: string | null;
  avatar: string | null;
  cpf?: string | null;
  isActive: boolean;
  _count: {
    inscricoes: number;
  };
}
