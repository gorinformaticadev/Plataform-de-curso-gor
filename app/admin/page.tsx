"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp,
  Activity,
  ArrowUpRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  totalPurchases: number;
  usersByRole: {
    ADMIN: number;
    INSTRUCTOR: number;
    STUDENT: number;
  };
  coursesByStatus: {
    PUBLISHED: number;
    DRAFT: number;
    ARCHIVED: number;
  };
}

interface RecentActivity {
  user: string;
  action: string;
  time: string;
  type: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch('http://localhost:3001/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      setStats(data);
      
      // Buscar atividades recentes
      const activityResponse = await fetch('http://localhost:3001/admin/recent-activity', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        const allActivities = [
          ...activityData.purchases,
          ...activityData.enrollments
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);
        
        setRecentActivity(allActivities.map(item => ({
          ...item,
          time: formatTimeAgo(new Date(item.time))
        })));
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `${diffInMinutes} minutos atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} horas atrás`;
    return `${Math.floor(diffInMinutes / 1440)} dias atrás`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const retryFetch = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600 mt-2">Carregando dados...</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-red-600 mt-2">Erro: {error}</p>
        </div>
        <Button onClick={retryFetch} variant="outline">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600 mt-2">Nenhum dado disponível</p>
        </div>
        <Button onClick={retryFetch} variant="outline">
          Recarregar Dados
        </Button>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total de Usuários",
      value: stats.totalUsers.toString(),
      icon: Users,
      change: `${stats.usersByRole.STUDENT || 0} alunos`,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Cursos Ativos",
      value: stats.coursesByStatus.PUBLISHED.toString(),
      icon: BookOpen,
      change: `${stats.totalCourses} total`,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Receita Total",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      change: `${stats.totalPurchases} vendas`,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Taxa de Conversão",
      value: `${((stats.totalPurchases / stats.totalUsers) * 100).toFixed(1)}%`,
      icon: TrendingUp,
      change: "vs usuários",
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="text-gray-600 mt-2">Bem-vindo ao painel de controle da EduPlatform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="flex items-center mt-1">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <p className="text-xs text-muted-foreground">
                  {stat.change}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              onClick={() => router.push('/admin/users')}
            >
              <Users className="mr-2 h-4 w-4" />
              Gerenciar Usuários ({stats.usersByRole.STUDENT || 0} alunos)
            </Button>
            <Button 
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              onClick={() => router.push('/admin/courses')}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Gerenciar Cursos ({stats.coursesByStatus.PUBLISHED} ativos)
            </Button>
            <Button 
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
              onClick={() => router.push('/admin/analytics')}
            >
              <Activity className="mr-2 h-4 w-4" />
              Ver Analytics
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="md:col-span-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'purchase' ? 'bg-green-500' :
                      activity.type === 'enrollment' ? 'bg-blue-500' : 'bg-purple-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {activity.time}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhuma atividade recente</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Distribuição de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Administradores</span>
                <span className="font-bold">{stats.usersByRole.ADMIN || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Instrutores</span>
                <span className="font-bold">{stats.usersByRole.INSTRUCTOR || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Alunos</span>
                <span className="font-bold">{stats.usersByRole.STUDENT || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Status dos Cursos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Publicados</span>
                <span className="font-bold">{stats.coursesByStatus.PUBLISHED || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Rascunho</span>
                <span className="font-bold">{stats.coursesByStatus.DRAFT || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Arquivados</span>
                <span className="font-bold">{stats.coursesByStatus.ARCHIVED || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
