"use client";

import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp,
  Activity,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Total de Usuários",
    value: "1,234",
    icon: Users,
    change: "+12%",
    trend: "up",
    color: "from-blue-500 to-blue-600"
  },
  {
    title: "Cursos Ativos",
    value: "45",
    icon: BookOpen,
    change: "+5%",
    trend: "up",
    color: "from-green-500 to-green-600"
  },
  {
    title: "Receita Total",
    value: "R$ 45,678",
    icon: DollarSign,
    change: "+23%",
    trend: "up",
    color: "from-purple-500 to-purple-600"
  },
  {
    title: "Taxa de Conversão",
    value: "3.2%",
    icon: TrendingUp,
    change: "+0.5%",
    trend: "up",
    color: "from-orange-500 to-orange-600"
  }
];

const recentActivity = [
  {
    user: "João Silva",
    action: "Comprou o curso React Avançado",
    time: "2 minutos atrás",
    type: "purchase"
  },
  {
    user: "Maria Santos",
    action: "Concluiu o módulo 3 de JavaScript",
    time: "5 minutos atrás",
    type: "progress"
  },
  {
    user: "Pedro Oliveira",
    action: "Cadastrou novo curso de Node.js",
    time: "10 minutos atrás",
    type: "course"
  }
];

export default function AdminDashboard() {
  const router = useRouter();
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="text-gray-600 mt-2">Bem-vindo ao painel de controle da EduPlatform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
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
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <p className="text-xs text-muted-foreground">
                  {stat.change} vs mês anterior
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
            Gerenciar Usuários
          </Button>
          <Button 
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            onClick={() => router.push('/admin/courses')}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Gerenciar Cursos
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
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'purchase' ? 'bg-green-500' :
                    activity.type === 'progress' ? 'bg-blue-500' : 'bg-purple-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Vendas Mensais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
              <div className="text-center">
                <Activity className="h-12 w-12 text-blue-400 mx-auto mb-2" />
                <p className="text-gray-600">Gráfico de vendas será implementado</p>
                <p className="text-sm text-gray-500 mt-1">Com Chart.js em breve</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Cursos Mais Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="font-medium">React Avançado</span>
                <span className="text-sm text-gray-600 bg-blue-100 px-2 py-1 rounded">234 alunos</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="font-medium">JavaScript Completo</span>
                <span className="text-sm text-gray-600 bg-green-100 px-2 py-1 rounded">189 alunos</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="font-medium">Node.js Backend</span>
                <span className="text-sm text-gray-600 bg-purple-100 px-2 py-1 rounded">156 alunos</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
