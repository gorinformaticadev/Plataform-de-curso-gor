# 🎓 EduPlatform - Plataforma de Cursos Online

Uma plataforma completa para criação, venda e consumo de cursos online, similar ao Hotmart, desenvolvida com tecnologias modernas.

## 🚀 Tecnologias Utilizadas

### Frontend
- **Next.js 13+** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **shadcn/ui** - Componentes UI modernos
- **Lucide React** - Ícones

### Backend
- **NestJS** - Framework Node.js robusto
- **TypeScript** - Tipagem estática
- **Prisma** - ORM moderno
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação
- **Swagger** - Documentação da API

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **PostgreSQL** (versão 12 ou superior)
- **Git**

## 🛠️ Instalação e Configuração

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/eduplatform.git
cd eduplatform
```

### 2. Configuração do Backend (API)

#### 2.1. Instalar Dependências
```bash
cd api
npm install
```

#### 2.2. Configurar Banco de Dados
1. Crie um banco PostgreSQL:
```sql
CREATE DATABASE eduplatform;
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

3. Edite o arquivo `.env`:
```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/eduplatform"

# JWT
JWT_SECRET="seu-jwt-secret-super-seguro"
JWT_EXPIRES_IN="7d"

# API
PORT=3001
FRONTEND_URL="http://localhost:3000"

# Email (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-app"

# Pagamentos (opcional)
STRIPE_SECRET_KEY="sk_test_..."
MERCADOPAGO_ACCESS_TOKEN="TEST-..."
```

#### 2.3. Executar Migrações
```bash
npx prisma generate
npx prisma migrate dev
```

#### 2.4. Seed do Banco (Opcional)
```bash
npx prisma db seed
```

#### 2.5. Iniciar o Servidor
```bash
npm run start:dev
```

A API estará disponível em: `http://localhost:3001`
Documentação Swagger: `http://localhost:3001/api/docs`

### 3. Configuração do Frontend

#### 3.1. Instalar Dependências
```bash
# Na raiz do projeto
npm install
```

#### 3.2. Configurar Variáveis de Ambiente
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local`:
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### 3.3. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

O frontend estará disponível em: `http://localhost:3000`

## 🗂️ Estrutura do Projeto

```
eduplatform/
├── api/                          # Backend NestJS
│   ├── src/
│   │   ├── auth/                # Autenticação
│   │   ├── users/               # Usuários
│   │   ├── courses/             # Cursos
│   │   ├── categories/          # Categorias
│   │   ├── payments/            # Pagamentos
│   │   ├── progress/            # Progresso
│   │   └── prisma/              # Configuração Prisma
│   ├── prisma/
│   │   └── schema.prisma        # Schema do banco
│   └── package.json
├── app/                         # Frontend Next.js
│   ├── (auth)/                  # Páginas de autenticação
│   ├── dashboard/               # Dashboard do usuário
│   └── layout.tsx
├── components/                  # Componentes React
│   ├── ui/                      # Componentes base (shadcn/ui)
│   └── layout/                  # Componentes de layout
├── contexts/                    # Contextos React
├── lib/                         # Utilitários
└── README.md
```

## 🔧 Scripts Disponíveis

### Backend (api/)
```bash
npm run start:dev      # Desenvolvimento
npm run build          # Build para produção
npm run start:prod     # Produção
npm run test           # Testes
npm run prisma:studio  # Interface visual do banco
```

### Frontend (raiz)
```bash
npm run dev           # Desenvolvimento
npm run build         # Build para produção
npm run start         # Produção
npm run lint          # Linting
```

## 🎯 Funcionalidades Implementadas

### ✅ Autenticação
- [x] Registro de usuários
- [x] Login com JWT
- [x] Proteção de rotas
- [x] Perfis (Aluno, Instrutor, Admin)

### ✅ Gestão de Cursos
- [x] CRUD completo de cursos
- [x] Sistema de módulos e aulas
- [x] Categorização
- [x] Status (Rascunho, Publicado, Arquivado)

### ✅ Sistema de Pagamentos
- [x] Estrutura para integração
- [x] Controle de compras
- [x] Histórico de transações

### ✅ Progresso do Aluno
- [x] Tracking de progresso por aula
- [x] Cálculo de conclusão
- [x] Dashboard personalizado

### ✅ Interface do Usuário
- [x] Design responsivo
- [x] Dashboard interativo
- [x] Páginas de autenticação
- [x] Layout profissional

## 🚀 Próximas Funcionalidades

### 🔄 Em Desenvolvimento
- [ ] Player de vídeo avançado
- [ ] Sistema de avaliações
- [ ] Chat/comentários
- [ ] Certificados digitais

### 📋 Planejado
- [ ] Integração Mercado Pago/Stripe
- [ ] Sistema de afiliados
- [ ] Live streaming
- [ ] Mobile app (React Native)
- [ ] Analytics avançado

## 🧪 Testando a Aplicação

### 1. Credenciais de Teste
Após executar o seed, use:
```
Email: admin@eduplatform.com
Senha: admin123
```

### 2. Endpoints da API
- **POST** `/api/auth/register` - Registro
- **POST** `/api/auth/login` - Login
- **GET** `/api/courses` - Listar cursos
- **GET** `/api/categories` - Listar categorias

### 3. Páginas Principais
- `/` - Homepage
- `/login` - Login
- `/register` - Cadastro
- `/dashboard` - Dashboard do usuário

## 🐛 Solução de Problemas

### Erro de Conexão com Banco
```bash
# Verificar se PostgreSQL está rodando
sudo service postgresql status

# Recriar banco se necessário
npx prisma migrate reset
```

### Erro de Dependências
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro de CORS
Verifique se `FRONTEND_URL` está configurado corretamente no `.env` da API.

## 📚 Documentação Adicional

- [Documentação do NestJS](https://nestjs.com/)
- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do Prisma](https://www.prisma.io/docs)
- [Documentação do Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **Desenvolvedor Full Stack** - [Seu Nome](https://github.com/seu-usuario)

## 📞 Suporte

Para suporte, envie um email para suporte@eduplatform.com ou abra uma issue no GitHub.

---

⭐ **Se este projeto foi útil para você, considere dar uma estrela no GitHub!**