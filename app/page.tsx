'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Users, Clock, Play, BookOpen, Award, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const featuredCourses = [
  {
    id: '1',
    title: 'JavaScript Completo do Zero ao Avançado',
    description: 'Aprenda JavaScript moderno com projetos práticos e reais',
    thumbnail: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=500',
    price: 199.99,
    originalPrice: 299.99,
    instructor: {
      name: 'João Silva',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    rating: 4.8,
    students: 1250,
    duration: '40h',
    level: 'Iniciante',
    category: 'Programação'
  },
  {
    id: '2',
    title: 'React.js e Next.js - Desenvolvimento Moderno',
    description: 'Construa aplicações web modernas com React e Next.js',
    thumbnail: 'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=500',
    price: 249.99,
    originalPrice: 349.99,
    instructor: {
      name: 'Maria Santos',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    rating: 4.9,
    students: 890,
    duration: '35h',
    level: 'Intermediário',
    category: 'Programação'
  },
  {
    id: '3',
    title: 'Marketing Digital Completo 2024',
    description: 'Estratégias comprovadas para vender online',
    thumbnail: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=500',
    price: 179.99,
    originalPrice: 249.99,
    instructor: {
      name: 'Carlos Oliveira',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    rating: 4.7,
    students: 2100,
    duration: '25h',
    level: 'Iniciante',
    category: 'Marketing'
  }
];

const categories = [
  { name: 'Programação', icon: '💻', courses: 45 },
  { name: 'Marketing', icon: '📈', courses: 32 },
  { name: 'Design', icon: '🎨', courses: 28 },
  { name: 'Negócios', icon: '💼', courses: 38 },
  { name: 'Fotografia', icon: '📸', courses: 22 },
  { name: 'Música', icon: '🎵', courses: 18 }
];

const stats = [
  { label: 'Cursos Disponíveis', value: '500+', icon: BookOpen },
  { label: 'Alunos Ativos', value: '50K+', icon: Users },
  { label: 'Instrutores', value: '200+', icon: Award },
  { label: 'Taxa de Conclusão', value: '94%', icon: TrendingUp }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Transforme seu
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {' '}conhecimento{' '}
            </span>
            em sucesso
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A plataforma completa para criar, vender e aprender. Mais de 500 cursos de alta qualidade 
            com certificação reconhecida no mercado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Play className="w-5 h-5 mr-2" />
              Começar Agora
            </Button>
            <Button size="lg" variant="outline">
              Explorar Cursos
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mb-4">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore por Categoria</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Encontre o curso perfeito para suas necessidades em nossas categorias especializadas
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">{category.courses} cursos</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cursos em Destaque</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Os cursos mais populares e bem avaliados da nossa plataforma
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                <div className="relative">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/90 text-gray-900">
                      {course.category}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-600 hover:bg-green-700">
                      {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% OFF
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={course.instructor.avatar} />
                      <AvatarFallback>{course.instructor.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">{course.instructor.name}</span>
                  </div>
                  
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.students}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        R$ {course.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        R$ {course.originalPrice.toFixed(2)}
                      </span>
                    </div>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                  
                  <Button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Ver Curso
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Ver Todos os Cursos
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para começar sua jornada?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a milhares de alunos que já transformaram suas carreiras
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Criar Conta Grátis
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
              Falar com Vendas
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}