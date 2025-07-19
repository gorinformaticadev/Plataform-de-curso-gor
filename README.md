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

### Opção 1: Instalação Local (Windows/Linux/Mac)
- **Node.js** (versão 18 ou superior) - [Download](https://nodejs.org/)
- **npm** ou **yarn**
- **PostgreSQL** (versão 12 ou superior) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

### Opção 2: Docker (Recomendado para Windows)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download](https://git-scm.com/)

## 🛠️ Instalação e Configuração

### 🐳 **OPÇÃO 1: Docker (Recomendado para Windows)**

#### 1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/eduplatform.git
cd eduplatform
```

#### 2. Crie os arquivos Docker

**2.1. Dockerfile para API:**
```dockerfile
# api/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Expor porta
EXPOSE 3001

# Comando para iniciar
CMD ["npm", "run", "start:prod"]
```

**2.2. Dockerfile para Frontend:**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package.json
COPY package*.json ./
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Expor porta
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "start"]
```

**2.3. Docker Compose:**
```yaml
# docker-compose.yml
version: '3.8'

services:
  # Banco de dados PostgreSQL
  postgres:
    image: postgres:15-alpine
    container_name: eduplatform-db
    environment:
      POSTGRES_DB: eduplatform
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - eduplatform-network

  # API Backend
  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    container_name: eduplatform-api
    environment:
      DATABASE_URL: "postgresql://postgres:postgres123@postgres:5432/eduplatform"
      JWT_SECRET: "seu-jwt-secret-super-seguro"
      JWT_EXPIRES_IN: "7d"
      PORT: 3001
      FRONTEND_URL: "http://localhost:3000"
    ports:
      - "3001:3001"
    depends_on:
      - postgres
    volumes:
      - ./api:/app
      - /app/node_modules
    networks:
      - eduplatform-network
    command: sh -c "npx prisma migrate deploy && npm run start:dev"

  # Frontend
  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: eduplatform-web
    environment:
      NEXT_PUBLIC_API_URL: "http://localhost:3001/api"
      NEXT_PUBLIC_APP_URL: "http://localhost:3000"
    ports:
      - "3000:3000"
    depends_on:
      - api
    volumes:
      - .:/app
      - /app/node_modules
    networks:
      - eduplatform-network

volumes:
  postgres_data:

networks:
  eduplatform-network:
    driver: bridge
```

#### 3. Configurar Variáveis de Ambiente

**3.1. API (.env):**
```bash
# api/.env
DATABASE_URL="postgresql://postgres:postgres123@postgres:5432/eduplatform"
JWT_SECRET="seu-jwt-secret-super-seguro"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

**3.2. Frontend (.env.local):**
```bash
# .env.local
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### 4. Executar com Docker

**4.1. Iniciar todos os serviços:**
```bash
docker-compose up -d
```

**4.2. Verificar se está funcionando:**
```bash
# Verificar containers
docker-compose ps

# Ver logs
docker-compose logs -f api
docker-compose logs -f web
```

**4.3. Executar migrações (primeira vez):**
```bash
docker-compose exec api npx prisma migrate dev
```

**4.4. Seed do Banco tem quer ser executado na pasta da api**
```bash
cd api
npx prisma db seed
```

**4.5. Instalar Dependências**
```bash
npm install
```

**4.6. Iniciar o Servidor**
```bash
npm run dev
```

#### 5. Acessar a Aplicação
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Documentação**: http://localhost:3001/api/docs

#### 6. Comandos Úteis Docker

```bash
# Parar todos os serviços
docker-compose down

# Rebuild e restart
docker-compose up --build

# Ver logs em tempo real
docker-compose logs -f

# Executar comandos no container da API
docker-compose exec api npm run prisma:studio

# Limpar tudo (cuidado: apaga dados!)
docker-compose down -v
docker system prune -a
```

---

### 💻 **OPÇÃO 2: Instalação Local (Windows/Linux/Mac)**

#### 1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/eduplatform.git
cd eduplatform
```

#### 2. Configuração do Backend (API)

**2.1. Instalar Dependências**
```bash
cd api
npm install
```

**2.2. Configurar Banco de Dados**

**No Windows:**
1. Baixe e instale PostgreSQL: https://www.postgresql.org/download/windows/
2. Durante a instalação, defina senha para o usuário `postgres`
3. Abra o pgAdmin ou psql e crie o banco:

```sql
CREATE DATABASE eduplatform;
```

**No Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (com Homebrew)
brew install postgresql
brew services start postgresql

# Criar banco
sudo -u postgres createdb eduplatform
```

**2.3. Configurar Variáveis de Ambiente**
```bash
# Copiar arquivo de exemplo
cp .env.example .env
```

Edite o arquivo `.env`:
```env
# Database
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/eduplatform"

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

**2.4. Executar Migrações**
```bash
npx prisma generate
npx prisma migrate dev
```

**2.5. Seed do Banco (Opcional)**
```bash
npx prisma db seed
```

**2.6. Iniciar o Servidor**
```bash
npm run start:dev
```

**2.7. Resetar Migrações**
```bash
docker-compose exec --user root api npx prisma migrate reset
```
**2.8. Resetar Banco de Dados**
```bash
docker-compose exec --user root api npx prisma db reset
```
**2.9. Inciar prisma studio**
```bash
docker-compose exec --user root api npx prisma studio --hostname 0.0.0.0
```

#### 3. Configuração do Frontend

**3.1. Instalar Dependências**
```bash
# Na raiz do projeto
npm install
```

**3.2. Configurar Variáveis de Ambiente**
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local`:
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**3.3. Iniciar o Servidor de Desenvolvimento**
```bash
npm run dev
```

---

- __Email:__ `admin@eduplatform.com`

- __Senha:__ `admin123`


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
│   ├── Dockerfile               # Docker para API
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
├── docker-compose.yml           # Configuração Docker
├── Dockerfile                   # Docker para Frontend
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

### Docker
```bash
docker-compose up -d           # Iniciar todos os serviços
docker-compose down            # Parar todos os serviços
docker-compose logs -f api     # Ver logs da API
docker-compose exec api bash   # Acessar container da API
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
### ✅ Interface do administrador
### 🔄 Em Desenvolvimento
- [ ] Dashboard interativo exclusivo de administração com Design responsivo Layout profissional
- [ ] Menu administrativo na lateral esquerda
- [ ] Controle de usuários
      - [ ] Pagina de controle de alunos
      - [ ] Pagina de controle de instrutores
      - [ ] Pagina de controle de administradores
- [ ] Controle de cursos
      - [ ] Pagina de controle de cursos
      - [ ] Controle de categorias
      - [ ] Controle de módulos e aulas
      - [ ] Controle de progressos
      - [ ] Controle de compras

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

### Docker

**Erro de porta em uso:**
```bash
# Verificar o que está usando a porta
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Parar containers
docker-compose down
```

**Erro de permissão (Windows):**
```bash
# Executar PowerShell como Administrador
# Verificar se Docker Desktop está rodando
```

**Banco não conecta:**
```bash
# Verificar se PostgreSQL container está rodando
docker-compose ps

# Ver logs do banco
docker-compose logs postgres
```

### Instalação Local

**Erro de Conexão com Banco:**
```bash
# Windows - verificar se PostgreSQL está rodando
services.msc # Procurar por PostgreSQL

# Linux/Mac
sudo service postgresql status

# Recriar banco se necessário
npx prisma migrate reset
```

**Erro de Dependências:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

**Erro de CORS:**
Verifique se `FRONTEND_URL` está configurado corretamente no `.env` da API.

**Erro de Porta em Uso (Windows):**
```bash
# Verificar o que está usando a porta
netstat -ano | findstr :3000

# Matar processo (substitua PID)
taskkill /PID 1234 /F
```

## 📚 Documentação Adicional

- [Documentação do NestJS](https://nestjs.com/)
- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do Prisma](https://www.prisma.io/docs)
- [Documentação do Docker](https://docs.docker.com/)
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