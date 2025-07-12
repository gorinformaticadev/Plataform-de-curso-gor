'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  Play,
  Users,
  Star,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Header } from '@/components/layout/header';
import Link from 'next/link';

// Mock data - replace with real API calls
const mockCourses = [
  {
    id: '1',
    title: 'JavaScript Completo do Zero ao Avançado',
    thumbnail: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=300',
    progress: 65,
    totalLessons: 45,
    completedLessons: 29,
    instructor: 'João Silva',
    lastAccessed: '2024-01-15',
    nextLesson: 'Promises e Async/Await'
  },
  {
    id: '2',
    title: 'React.js e Next.js - Desenvolvimento Moderno',
    thumbnail: 'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=300',
    progress: 30,
    totalLessons: 38,
    completedLessons: 11,
    instructor: 'Maria Santos',
    lastAccessed: '2024-01-12',
    nextLesson: 'Componentes e Props'
  }
];

const mockStats = {
  totalCourses: 3,
  completedCourses: 1,
  totalHours: 120,
  certificates: 1
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState(mockCourses);
  const [stats, setStats] = useState(mockStats);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso negado</h1>
          <p className="text-gray-600 mb-4">Você precisa estar logado para acessar esta página.</p>
          <Button asChild>
            <Link href="/login">Fazer Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo de volta, {user.name}! 👋
          </h1>
          <p className="text-gray-600">
            Continue sua jornada de aprendizado onde parou
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cursos Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Concluídos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedCourses}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Horas Estudadas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalHours}h</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Certificados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.certificates}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Continue Learning */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Continue Aprendendo
                </CardTitle>
                <CardDescription>
                  Retome seus cursos onde parou
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {courses.map((course) => (
                  <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">por {course.instructor}</p>
                        
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>{course.completedLessons} de {course.totalLessons} aulas</span>
                              <span>{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            Próxima: {course.nextLesson}
                          </div>
                          <Button size="sm">
                            Continuar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Award className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Certificado obtido!</p>
                      <p className="text-xs text-gray-600">Marketing Digital Completo</p>
                    </div>
                    <span className="text-xs text-gray-500">2 dias atrás</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Play className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Aula concluída</p>
                      <p className="text-xs text-gray-600">Promises e Async/Await</p>
                    </div>
                    <span className="text-xs text-gray-500">1 semana atrás</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Novo curso iniciado</p>
                      <p className="text-xs text-gray-600">React.js e Next.js</p>
                    </div>
                    <span className="text-xs text-gray-500">2 semanas atrás</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Learning Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Metas de Aprendizado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Meta semanal</span>
                    <span>5/7 dias</span>
                  </div>
                  <Progress value={71} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Horas este mês</span>
                    <span>18/25h</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Recommended Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recomendados para Você</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-3">
                  <img 
                    src="https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=200" 
                    alt="Curso"
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                  <h4 className="font-medium text-sm mb-1">Node.js Avançado</h4>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">4.8 (120)</span>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    Ver Curso
                  </Button>
                </div>
                
                <div className="border rounded-lg p-3">
                  <img 
                    src="https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=200" 
                    alt="Curso"
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                  <h4 className="font-medium text-sm mb-1">Python para Data Science</h4>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">4.9 (89)</span>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    Ver Curso
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Explorar Cursos
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Award className="w-4 h-4 mr-2" />
                  Meus Certificados
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Comunidade
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}