"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MenuItem {
  icon: string; // Mudou de React.ComponentType para string
  label: string;
  href: string;
  subItems?: MenuItem[];
}

interface MenuGroup {
  label?: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    label: "Administração",
    items: [
      { icon: "LayoutDashboard", label: "Dashboard", href: "/admin" },
      { icon: "Users", label: "Usuários", href: "/admin/users" },
      { icon: "BarChart3", label: "Analytics", href: "/admin/analytics" },
    ]
  },
  {
    label: "Produtos",
    items: [
      { 
        icon: "BookOpen", 
        label: "Cursos", 
        href: "/admin/courses",
        subItems: [
          { icon: "BookOpen", label: "Todos os Cursos", href: "/admin/courses" },
          { icon: "Tag", label: "Categorias", href: "/admin/categories" },
          { icon: "GraduationCap", label: "Aulas", href: "/admin/lessons" },
          { icon: "FileText", label: "Certificados", href: "/admin/certificates" },
        ]
      },
    ]
  },
  {
    items: [
      { icon: "Settings", label: "Configurações", href: "/admin/settings" },
      { icon: "LogOut", label: "Sair", href: "/logout" },
    ]
  }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

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
              {Icons.ShieldAlert && <Icons.ShieldAlert className="h-5 w-5 animate-spin" />}
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
    <div className="flex bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100">
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed h-screen bg-gradient-to-b from-blue-900 to-blue-950 border-r border-blue-800 transition-all duration-300",
          "w-16 hover:w-64 group z-50"
        )}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <div className="flex flex-col h-full">
          {/* Logo - Área fixa no topo */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-blue-800">
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                {user.avatar ? (
                  <img
                    src={user.avatar.startsWith('http') ? 
                         user.avatar : 
                         `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}${user.avatar.replace('/api', '')}`}
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
              {sidebarOpen ? 
                (Icons.X && <Icons.X size={20} />) : 
                (Icons.Menu && <Icons.Menu size={20} />)
              }
            </Button>
            {!sidebarOpen && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-blue-900 rounded-md text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                Menu
              </div>
            )}
          </div>

          {/* Navigation - Área rolável */}
          <nav className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <ul className="space-y-4">
              {menuGroups.map((group, groupIndex) => (
                <li key={groupIndex}>
                  {group.label && (
                    <div className={cn(
                      "px-4 py-2 text-xs font-semibold text-blue-300 uppercase tracking-wider border-b border-blue-800",
                      !sidebarOpen && "hidden"
                    )}>
                      {group.label}
                    </div>
                  )}
                  <ul className="space-y-1">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full text-blue-100 hover:text-white hover:bg-blue-800",
                            sidebarOpen ? "justify-start" : "justify-center"
                          )}
                          onClick={() => item.subItems ? toggleSubmenu(item.label) : router.push(item.href)}
                        >
                          <div className="flex items-center justify-center w-5 h-5">
                            {Icons[item.icon] && React.createElement(Icons[item.icon], { className: "h-5 w-5" })}
                          </div>
                          {sidebarOpen && (
                            <div className="flex items-center ml-3">
                              <span>{item.label}</span>
                              {item.subItems && (
                                Icons.ChevronDown && <Icons.ChevronDown className={cn(
                                  "ml-2 h-4 w-4 transition-transform",
                                  openSubmenu === item.label && "rotate-180"
                                )} />
                              )}
                            </div>
                          )}
                        </Button>
                        {item.subItems && sidebarOpen && openSubmenu === item.label && (
                          <ul className="ml-8 mt-1 space-y-1">
                            {item.subItems.map((subItem) => (
                              <li key={subItem.href}>
                                <Button
                                  variant="ghost"
                                  className="w-full text-blue-200 hover:text-white hover:bg-blue-800 justify-start pl-4"
                                  onClick={() => router.push(subItem.href)}
                                >
                                  <div className="flex items-center justify-center w-5 h-5">
                                    {Icons[subItem.icon] && React.createElement(Icons[subItem.icon], { className: "h-4 w-4" })}
                                  </div>
                                  <span className="ml-3 text-sm">
                                    {subItem.label}
                                  </span>
                                </Button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Info - Área fixa no rodapé */}
          <div className="flex-shrink-0 p-4 border-t border-blue-800">
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
      <div className="flex-1 overflow-auto ml-16">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
