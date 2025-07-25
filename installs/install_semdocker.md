# 💻 Instalação Local (Sem Docker)

Guia para configurar o ambiente de desenvolvimento localmente sem o uso de Docker.

## 📋 Pré-requisitos
- **Node.js** (versão 18 ou superior) - [Download](https://nodejs.org/)
- **npm** ou **yarn**
- **PostgreSQL** (versão 12 ou superior) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

## 🛠️ Passos de Instalação

### 1. Clone o Repositório
```bash
git clone https://github.com/gorinformaticadev/Plataform-de-curso-gor.git
cd Plataform-de-curso-gor
```

### 2. Configuração do Backend (API)

**2.1. Navegue até a pasta da API e instale as dependências:**
```bash
cd api
npm install
```

**2.2. Configuração do Banco de Dados PostgreSQL**

Siga os passos abaixo para criar o banco de dados que a aplicação usará.

**Passo 1: Instale o PostgreSQL**
- **Windows:** Baixe o instalador no [site oficial](https://www.postgresql.org/download/windows/). Anote a senha definida para o usuário `postgres`.
- **Linux (Ubuntu/Debian):** `sudo apt update && sudo apt install postgresql postgresql-contrib`
- **macOS (Homebrew):** `brew install postgresql && brew services start postgresql`

**Passo 2: Crie o Banco de Dados `eduplatform`**
- **Via Terminal (`psql`):**
  1. Acesse o psql: `sudo -u postgres psql` (Linux/Mac) ou use o "SQL Shell" (Windows).
  2. Execute: `CREATE DATABASE eduplatform;`
  3. Saia: `\q`
- **Via Interface Gráfica (pgAdmin):**
  1. Conecte-se ao seu servidor local.
  2. Clique com o botão direito em "Databases" > "Create" > "Database...".
  3. Dê o nome `eduplatform` e salve.

**2.3. Configurar Variáveis de Ambiente**
Dentro da pasta `api`, copie o arquivo de exemplo:
```bash
cp .env.example .env
```
Agora, edite o arquivo `api/.env` e **substitua `SUA_SENHA`** pela senha que você definiu para o usuário `postgres` na instalação do PostgreSQL:
```env
# api/.env

# Database
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/eduplatform"

# JWT
JWT_SECRET="seu-jwt-secret-super-seguro"
JWT_EXPIRES_IN="7d"

# API
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

**2.4. Executar Migrações e Seed**
Este comando prepara o banco de dados, criando as tabelas e populando com dados iniciais.
```bash
npm run db:setup
```
*Este comando executa `prisma migrate dev` e `prisma db seed` internamente.*

**2.5. Iniciar o Servidor da API**
```bash
npm run start:dev
```
A API estará rodando em `http://localhost:3001`.

### 3. Configuração do Frontend

**3.1. Volte para a pasta raiz e instale as dependências:**
```bash
# Se estiver na pasta 'api', volte para a raiz
cd .. 
npm install
```

**3.2. Configurar Variáveis de Ambiente**
Na raiz do projeto, copie o arquivo de exemplo:
```bash
cp .env.example .env.local
```
O conteúdo do `.env.local` já deve estar correto:
```env
# .env.local
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**3.3. Iniciar o Servidor do Frontend**
```bash
npm run dev
```
O frontend estará acessível em `http://localhost:3000`.

### 🚀 Executando a Aplicação Completa

Para rodar a aplicação, você precisará de **dois terminais** abertos simultaneamente:
- **Terminal 1 (na pasta `api`):** `npm run start:dev`
- **Terminal 2 (na pasta raiz do projeto):** `npm run dev`

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador para usar a plataforma.

### 🐛 Solução de Problemas Comuns

- **Erro de Conexão com o Banco:**
  - Verifique se o serviço do PostgreSQL está rodando no seu sistema.
  - Confirme se a senha no arquivo `api/.env` está correta.
  - Se necessário, reinicie o banco com `npx prisma migrate reset`.
- **Erro de Dependências:** Delete `node_modules` e `package-lock.json` e rode `npm install` novamente.
- **Erro de Porta em Uso:** Verifique qual processo está usando a porta (ex: `3000` ou `3001`) e finalize-o.
