import Link from 'next/link';
import { GraduationCap, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const footerLinks = {
    platform: [
      { name: 'Sobre Nós', href: '/about' },
      { name: 'Como Funciona', href: '/how-it-works' },
      { name: 'Preços', href: '/pricing' },
      { name: 'Afiliados', href: '/affiliates' },
    ],
    courses: [
      { name: 'Programação', href: '/categories/programming' },
      { name: 'Marketing', href: '/categories/marketing' },
      { name: 'Design', href: '/categories/design' },
      { name: 'Negócios', href: '/categories/business' },
    ],
    support: [
      { name: 'Central de Ajuda', href: '/help' },
      { name: 'Contato', href: '/contact' },
      { name: 'Status do Sistema', href: '/status' },
      { name: 'Política de Privacidade', href: '/privacy' },
    ],
    instructor: [
      { name: 'Seja Instrutor', href: '/become-instructor' },
      { name: 'Recursos para Instrutores', href: '/instructor-resources' },
      { name: 'Comunidade', href: '/community' },
      { name: 'Blog', href: '/blog' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">EduPlatform</span>
            </Link>
            <p className="text-gray-400 mb-4">
              A plataforma completa para transformar conhecimento em sucesso.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold mb-4">Plataforma</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h3 className="font-semibold mb-4">Categorias</h3>
            <ul className="space-y-2">
              {footerLinks.courses.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructor */}
          <div>
            <h3 className="font-semibold mb-4">Para Instrutores</h3>
            <ul className="space-y-2">
              {footerLinks.instructor.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-blue-500" />
              <span className="text-gray-400">contato@eduplatform.com</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-blue-500" />
              <span className="text-gray-400">+55 (11) 9999-9999</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-blue-500" />
              <span className="text-gray-400">São Paulo, SP - Brasil</span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 EduPlatform. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Termos de Uso
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacidade
            </Link>
            <Link href="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}