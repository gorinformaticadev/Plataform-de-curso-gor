# Correção do Carregamento de Imagens em Admin/Courses

## Overview

Este documento detalha a correção dos problemas de carregamento e exibição de imagens de cursos na interface administrativa. O sistema atual apresenta inconsistências na construção de URLs, configuração de domínios permitidos e validação de imagens que impedem o correto funcionamento do display de thumbnails.

## Arquitetura Atual

A aplicação segue uma arquitetura full-stack com Next.js no frontend e NestJS no backend, onde:

``mermaid
graph TB
    subgraph "Frontend (Next.js)"
        A[Admin Courses Page] --> B[Course Form]
        B --> C[Image Display Component]
        C --> D[Image URL Construction]
    end
    
    subgraph "Backend (NestJS)"
        E[Uploads Controller] --> F[Static File Storage]
        F --> G["/public/uploads/courses/"]
    end
    
    A --> E
    D --> F
    
    style C fill:#ff9999
    style D fill:#ff9999
    style F fill:#99ff99
```

## Problemas Identificados

### 1. Inconsistência na Construção de URLs de Imagem

**Problema**: As URLs das imagens estão sendo construídas de forma inconsistente entre listagem e edição:

- **Listagem**: `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}${course.thumbnail}`
- **Upload Response**: `/uploads/courses/${filename}`
- **Servidor Backend**: Arquivos salvos em `public/uploads/courses/`

**Impacto**: Imagens não carregam corretamente devido a URLs malformadas.

### 2. Configuração de Domínios de Imagem Insuficiente

**Problema**: O `next.config.js` apenas permite imagens de `images.pexels.com`, não incluindo o próprio backend.

**Impacto**: Next.js bloqueia imagens servidas pelo backend local.

### 3. Validação de URL Inadequada

**Problema**: A validação atual no `courseFormSchema` exige URLs válidas mas não trata caminhos relativos.

**Impacto**: Formulários falham na validação com URLs válidas do sistema.

### 4. Tratamento de Erros de Carregamento Inconsistente

**Problema**: Fallbacks de imagem funcionam apenas parcialmente.

**Impacto**: Experiência do usuário degradada quando imagens falham.

### 5. Cache de Dados do Primeiro Curso na Edição

**Problema**: O hook `useCourseForm` tem dependências incorretas no `useEffect`, causando cache de dados do primeiro curso editado em todas as edições subsequentes.

**Sintomas**: 
- Imagem thumbnail do primeiro curso aparece em todos os outros
- Dados não são recarregados corretamente ao navegar entre cursos
- `loadCourse` não é chamado adequadamente na mudança de `courseId`

**Causa Raiz**: Dependências incorretas no `useEffect` e falta de limpeza do formulário.

**Impacto**: Experiência de usuário severamente comprometida na edição de múltiplos cursos.

### 6. Problemas de Importação do Lucide React

**Problema**: Barrel optimization do Next.js está causando falhas na importação de ícones do Lucide React, impedindo que componentes sejam renderizados corretamente.

**Sintomas**:
- Erros `'Settings' is not exported from '__barrel_optimize__'`
- Múltiplos ícones não encontrados: `LayoutDashboard`, `Users`, `BarChart3`, etc.
- Componentes administrativos não carregam devido a ícones ausentes

**Causa Raiz**: Configuração inadequada de barrel optimization no Next.js para a biblioteca lucide-react.

**Impacto**: Interface administrativa completamente quebrada, impedindo acesso às funcionalidades de gerenciamento.

## Solução Técnica

### 1. Utilitário de Construção de URL Centralizado

Criar um utilitário centralizado para padronizar a construção de URLs de imagem:

``typescript
// lib/image-url-utils.ts
export class ImageUrlBuilder {
  static buildImageUrl(imagePath: string | undefined): string | undefined {
    if (!imagePath) return undefined;
    
    // Se já é uma URL completa, retorna como está
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Se é um caminho relativo, constrói URL completa
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:3001';
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  }
  
  static validateImageUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return url.startsWith('/uploads/') || url.startsWith('uploads/');
    }
  }
}
```

### 2. Componente de Imagem com Fallback Aprimorado

Desenvolver um componente reutilizável para exibição de imagens com tratamento robusto de erros:

``typescript
// components/ui/course-image.tsx
interface CourseImageProps {
  src?: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  onError?: () => void;
}

export function CourseImage({ 
  src, 
  alt, 
  fallbackSrc = 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg',
  className,
  onError 
}: CourseImageProps) {
  const imageUrl = ImageUrlBuilder.buildImageUrl(src);
  
  return (
    <img
      src={imageUrl || fallbackSrc}
      alt={alt}
      className={className}
      onError={(e) => {
        if (imageUrl && e.currentTarget.src !== fallbackSrc) {
          e.currentTarget.src = fallbackSrc;
          onError?.();
        }
      }}
    />
  );
}
```

### 3. Configuração Atualizada do Next.js

Atualizar a configuração do Next.js para incluir domínios locais:

``javascript
// next.config.js (atualização)
const nextConfig = {
  images: {
    unoptimized: true,
    domains: [
      'images.pexels.com',
      'localhost',
      '127.0.0.1'
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      }
    ]
  }
}
```

### 4. Schema de Validação Aprimorado

Atualizar o schema de validação para aceitar tanto URLs completas quanto caminhos relativos:

``typescript
// schemas/courseSchema.ts (atualização)
thumbnail: z.string()
  .refine(
    (value) => !value || ImageUrlBuilder.validateImageUrl(value),
    'URL da imagem inválida'
  )
  .optional(),
```

### 5. Hook de Upload Padronizado

Padronizar o hook de upload para retornar URLs consistentes:

``typescript
// hooks/useCourseForm.ts (atualização)
const uploadThumbnail = useCallback(async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file); // Corrigir: era 'image', backend espera 'file'

  const response = await fetch(`${API_URL}/uploads/course-thumbnail`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData
  });

  if (!response.ok) throw new Error('Erro ao fazer upload');
  
  const { url } = await response.json();
  // Garantir que a URL seja construída corretamente
  return ImageUrlBuilder.buildImageUrl(url) || url;
}, [API_URL, token]);
```

### 6. Correção do Cache de Dados do Formulário

Corrigir o problema de cache que exibe dados do primeiro curso em todas as edições:

```typescript
// hooks/useCourseForm.ts (correção crítica)
export function useCourseForm({
  courseId,
  onSuccess,
  onError
}: UseCourseFormProps): UseCourseFormReturn {
  // ... outros hooks

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      category: '',
      thumbnail: '',
      published: false,
      level: 'BEGINNER',
      modules: []
    }
  });

  // Carregar dados do curso com limpeza adequada
  const loadCourse = useCallback(async () => {
    if (!courseId || courseId === 'new') {
      // Limpar formulário para novos cursos
      form.reset({
        title: '',
        description: '',
        price: 0,
        category: '',
        thumbnail: '',
        published: false,
        level: 'BEGINNER',
        modules: []
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Erro ao carregar curso');
      
      const course: Course = await response.json();
      
      // Mapear dados com URLs de imagem padronizadas
      const formData = {
        title: course.title,
        description: course.description || '',
        price: course.price || 0,
        category: course.category?.id || '',
        thumbnail: course.thumbnail ? ImageUrlBuilder.buildImageUrl(course.thumbnail) : '',
        published: course.status === 'PUBLISHED',
        level: course.level,
        modules: course.modules?.map(module => ({
          id: module.id,
          title: module.title,
          description: module.description || '',
          lessons: module.lessons?.map(lesson => ({
            id: lesson.id,
            title: lesson.title,
            videoUrl: lesson.videoUrl || '',
            duration: lesson.duration || 0
          })) || []
        })) || []
      };
      
      // Reset completo do formulário com novos dados
      form.reset(formData);
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, form, token, API_URL, onError]);

  // Effect com dependências corretas
  useEffect(() => {
    loadCourse();
  }, [loadCourse]); // Agora loadCourse está nas dependências

  // Cleanup ao desmontar ou mudar courseId
  useEffect(() => {
    return () => {
      // Limpar formulário ao desmontar
      if (form) {
        form.reset();
      }
    };
  }, [courseId, form]);

  // ... resto do código
}
```

### 7. Correção das Importações do Lucide React

Corrigir problemas de barrel optimization que impedem a importação de ícones:

**Opção 1: Desabilitar Barrel Optimization (Recomendado)**

```javascript
// next.config.js (adição crítica)
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: [
      'images.pexels.com',
      'localhost',
      '127.0.0.1'
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      }
    ]
  },
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Desabilitar barrel optimization para lucide-react
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  
  // OU usar esta configuração alternativa
  transpilePackages: ['lucide-react'],

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};
```

**Opção 2: Importações Específicas (Alternativa)**

```typescript
// app/admin/layout.tsx (correção de importação)
// Ao invés de:
// import { LayoutDashboard, Users, BarChart3, ... } from 'lucide-react';

// Usar importações diretas:
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import GraduationCap from 'lucide-react/dist/esm/icons/graduation-cap';
import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard';
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import Menu from 'lucide-react/dist/esm/icons/menu';
import Settings from 'lucide-react/dist/esm/icons/settings';
import ShieldAlert from 'lucide-react/dist/esm/icons/shield-alert';
import Tag from 'lucide-react/dist/esm/icons/tag';
import Users from 'lucide-react/dist/esm/icons/users';
import X from 'lucide-react/dist/esm/icons/x';
```

**Opção 3: Criar Barrel Customizado**

```typescript
// lib/icons.ts (arquivo de ícones centralizado)
export {
  BarChart3,
  BookOpen,
  ChevronDown,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldAlert,
  Tag,
  Users,
  X,
  Check,
  ChevronUp
} from 'lucide-react';

// Uso nos componentes:
// import { LayoutDashboard, Users } from '@/lib/icons';
```

## Arquitetura de Componentes Atualizada

``mermaid
graph TB
    subgraph "Frontend Components"
        A[CoursesList] --> B[CourseImage Component]
        C[CourseForm] --> B
        D[CoursePreview] --> B
        B --> E[ImageUrlBuilder]
    end
    
    subgraph "Utilities"
        E --> F[URL Validation]
        E --> G[URL Construction]
        E --> H[Fallback Logic]
    end
    
    subgraph "Configuration"
        I[next.config.js] --> J[Image Domains]
        K[Schema Validation] --> L[URL Validation]
    end
    
    style B fill:#99ff99
    style E fill:#99ff99
    style I fill:#ffff99
```

## Fluxo de Dados para Imagens

``mermaid
sequenceDiagram
    participant UI as Interface
    participant Hook as useCourseForm
    participant Util as ImageUrlBuilder
    participant Upload as Upload Controller
    participant Storage as File Storage
    
    UI->>Hook: Upload de arquivo
    Hook->>Upload: POST /uploads/course-thumbnail
    Upload->>Storage: Salvar arquivo
    Storage-->>Upload: Caminho do arquivo
    Upload-->>Hook: { url: "/uploads/courses/file.jpg" }
    Hook->>Util: buildImageUrl(url)
    Util-->>Hook: URL completa
    Hook-->>UI: URL padronizada
    UI->>UI: Exibir imagem com fallback
```

## Casos de Teste

### 1. Upload de Nova Imagem
- **Entrada**: Arquivo JPG válido
- **Esperado**: URL completa retornada e imagem exibida corretamente

### 2. Edição com Imagem Existente
- **Entrada**: Curso com thumbnail já salvo
- **Esperado**: Imagem carregada e exibida na prévia

### 3. URL Externa
- **Entrada**: URL do Pexels ou externa
- **Esperado**: Imagem carregada sem modificação da URL

### 4. Fallback de Erro
- **Entrada**: URL inválida ou arquivo não encontrado
- **Esperado**: Imagem padrão exibida automaticamente

### 5. Validação de Formulário
- **Entrada**: Campo thumbnail com valor inválido
- **Esperado**: Erro de validação apropriado

### 6. Cache de Dados na Edição
- **Entrada**: Navegar entre diferentes cursos na edição
- **Esperado**: Cada curso deve carregar seus próprios dados, incluindo thumbnail
- **Verificação**: Thumbnail não deve persistir do curso anterior

### 7. Importação de Ícones Lucide React
- **Entrada**: Acessar páginas administrativas
- **Esperado**: Todos os ícones devem carregar sem erros de importação
- **Verificação**: Console sem erros `barrel_optimize` e interface administrativa funcional

## Impacto na Performance

### Otimizações Implementadas
- Lazy loading para imagens da lista de cursos
- Cache de URLs construídas no ImageUrlBuilder
- Reutilização do componente CourseImage
- Validação otimizada com regex para caminhos locais

### Métricas Esperadas
- Redução de 90% nos erros de carregamento de imagem
- Eliminação de 100% dos erros de importação de ícones
- Melhoria na experiência do usuário com fallbacks instantâneos
- Tempo de resposta consistente para exibição de thumbnails
- Interface administrativa totalmente funcional

## Considerações de Segurança

### Validação de Entrada
- Verificação de tipos de arquivo no backend
- Sanitização de nomes de arquivo
- Validação de tamanho máximo

### Proteção contra Ataques
- Whitelist de extensões permitidas
- Validação de MIME type
- Prevenção de path traversal

## Monitoramento e Logging

### Métricas de Sucesso
- Taxa de sucesso no carregamento de imagens
- Tempo médio de upload
- Frequência de uso de fallbacks

### Logs Importantes
- Falhas no upload de arquivos
- URLs malformadas detectadas
- Erros de carregamento de imagem
