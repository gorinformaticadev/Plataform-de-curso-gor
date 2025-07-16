"use client";

import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  BookOpen,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const analyticsData = {
  revenue: {
    total: 45678.90,
    monthly: 12345.67,
    growth: 23.5,
  },
  users: {
    total: 1234,
    newThisMonth: 89,
    active: 876,
  },
  courses: {
    total: 45,
    published: 38,
    draft: 7,
  },
  sales: {
    total: 567,
    thisMonth: 123,
    averageOrder: 80.56,
  },
};

const monthlyData = [
  { month: "Jan", revenue: 12000, users: 45, courses: 3 },
  { month: "Fev", revenue: 15000, users: 67, courses: 5 },
  { month: "Mar", revenue: 18000, users: 89, courses: 7 },
  { month: "Abr", revenue: 22000, users: 123, courses: 9 },
  { month: "Mai", revenue: 19000, users: 98, courses: 6 },
  { month: "Jun", revenue: 25000, users: 145, courses: 12 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">Visualize os dados e métricas da plataforma</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(analyticsData.revenue.total)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{analyticsData.revenue.growth}% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.users.total}</div>
            <p className="text-xs text-muted-foreground">
              +{analyticsData.users.newThisMonth} este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Ativos</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.courses.published}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.courses.total} no total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.sales.total}</div>
            <p className="text-xs text-muted-foreground">
              Ticket médio: {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(analyticsData.sales.averageOrder)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Receita Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Gráfico de receita mensal</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Implementação futura com Chart.js
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crescimento de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Gráfico de crescimento</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Implementação futura com Chart.js
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Cursos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>React Avançado</span>
                    <span className="text-sm font-medium">R$ 12,345</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>JavaScript Completo</span>
                    <span className="text-sm font-medium">R$ 9,876</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Node.js Backend</span>
                    <span className="text-sm font-medium">R$ 7,654</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usuários por Função</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Alunos</span>
                    <span className="text-sm font-medium">987</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Instrutores</span>
                    <span className="text-sm font-medium">45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Administradores</span>
                    <span className="text-sm font-medium">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status dos Cursos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Publicados</span>
                    <span className="text-sm font-medium">38</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Rascunho</span>
                    <span className="text-sm font-medium">7</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Arquivados</span>
                    <span className="text-sm font-medium">2</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900">Receita Diária</h3>
                    <p className="text-2xl font-bold text-blue-600">R$ 1,234</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-900">Receita Semanal</h3>
                    <p className="text-2xl font-bold text-green-600">R$ 8,765</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-900">Receita Mensal</h3>
                    <p className="text-2xl font-bold text-purple-600">R$ 25,432</p>
                  </div>
                </div>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Gráfico detalhado de receita será implementado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900">Novos Usuários (7 dias)</h3>
                    <p className="text-2xl font-bold text-blue-600">+45</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-900">Taxa de Retenção</h3>
                    <p className="text-2xl font-bold text-green-600">78%</p>
                  </div>
                </div>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Análise detalhada de usuários será implementada</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Cursos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900">Taxa de Conclusão</h3>
                    <p className="text-2xl font-bold text-blue-600">65%</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-900">Avaliação Média</h3>
                    <p className="text-2xl font-bold text-green-600">4.7/5</p>
                  </div>
                </div>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Análise detalhada de cursos será implementada</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
