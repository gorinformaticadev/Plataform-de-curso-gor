"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Tag, 
  BarChart3, 
  Settings,
  Menu,
  X,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Usuários", href: "/admin/users" },
  { icon: BookOpen, label: "Cursos", href: "/admin/courses" },
  { icon: Tag, label: "Categorias", href: "/admin/categories" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: Settings, label: "Configurações", href: "/admin/settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Verificar autenticação e permissão de admin
    if (!isAuthenticated) {
      router.push("/login?redirect=/admin");
      return;
    }

    if (user?.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    setLoading(false);
  }, [user, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-5 w-5 animate-spin" />
              <span>Verificando permissões...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100">
      {/* Sidebar */}
      <div className={cn(
        "bg-gradient-to-b from-blue-900 to-blue-950 border-r border-blue-800 transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-blue-800">
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                {user.avatar ? (
                  <img
                    src={user.avatar.startsWith('http') ? 
                         user.avatar : 
                         `http://localhost:3001${user.avatar.replace('/api', '')}`}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {user.name?.charAt(0) || "A"}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold text-white">{user.name}</h1>
                  <p className="text-xs text-blue-300">{user.role}</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="ml-auto text-blue-200 hover:text-white hover:bg-blue-800"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-blue-100 hover:text-white hover:bg-blue-800",
                      sidebarOpen ? "justify-start" : "justify-center"
                    )}
                    onClick={() => router.push(item.href)}
                  >
                    <item.icon className="h-5 w-5" />
                    {sidebarOpen && <span className="ml-3">{item.label}</span>}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-blue-800">
            <div className="flex items-center space-x-3">
              {sidebarOpen && (
                <div>
                  <p className="text-xs text-blue-300">Painel Administrativo</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
