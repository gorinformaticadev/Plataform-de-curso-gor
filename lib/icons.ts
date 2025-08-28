import { 
  LayoutDashboard,
  Users,
  BarChart3,
  BookOpen,
  Tag,
  Settings,
  Menu,
  X,
  ShieldAlert,
  LogOut,
  ChevronDown,
  ChevronUp,
  Check,
  FileText,
  GraduationCap,
  Plus,
  Loader2,
  MoreHorizontal,
  Edit,
  Trash2,
  Upload,
  GripVertical,
  Eye,
  EyeOff,
  Star,
  Clock,
  Play,
  Award,
  TrendingUp,
  Pencil,
  Save,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ShoppingCart,
  Gift,
  Bookmark,
  ChevronRight
} from 'lucide-react';

export interface IconComponent {
  (props: { className?: string; size?: number; [key: string]: any }): JSX.Element;
}

// Mapeamento centralizado de ícones
export const Icons: Record<string, IconComponent> = {
  // Administração
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  ShieldAlert,
  
  // Navegação
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  
  // Cursos e Educação
  BookOpen,
  GraduationCap,
  FileText,
  Tag,
  
  // Ações
  Plus,
  Edit,
  Trash2,
  Save,
  Upload,
  Eye,
  EyeOff,
  LogOut,
  Check,
  
  // Interface
  Loader2,
  MoreHorizontal,
  GripVertical,
  Pencil,
  
  // Conteúdo
  Star,
  Clock,
  Play,
  Award,
  TrendingUp,
  
  // Social
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  
  // E-commerce
  ShoppingCart,
  Gift,
  Bookmark,
};

// Função utilitária para obter ícone com fallback
export function getIcon(name: string): IconComponent | null {
  return Icons[name] || null;
}

// Lista de todos os ícones disponíveis
export const availableIcons = Object.keys(Icons);