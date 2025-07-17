# Guia de Configuração Docker - EduPlatform

Este documento detalha os passos para configurar e executar a plataforma EduPlatform utilizando Docker.

## 🚀 Tecnologias Utilizadas (Contexto Docker)

*   **Backend:** NestJS, Prisma, PostgreSQL
*   **Frontend:** Next.js, Tailwind CSS, shadcn/ui

## 📋 Pré-requisitos

*   **Docker Desktop:** Instalado e em execução. [Download](https://www.docker.com/products/docker-desktop/)
*   **Git:** Instalado para clonar o repositório. [Download](https://git-scm.com/)
*   **Portas Disponíveis:** Certifique-se de que as portas 3000, 3001 e 5432 não estejam em uso.

## 🛠️ Instalação e Configuração via Docker

### 1. Clonar o Repositório
Abra seu terminal e clone o projeto:
```bash
git clone https://github.com/gorinformaticadev/Plataform-de-curso-gor.git
cd Plataform-de-curso-gor
```

### 2. Configurar Arquivos Docker e Variáveis de Ambiente

O repositório contém os arquivos necessários para a configuração Docker. Você precisará configurar as variáveis de ambiente:

*   **`api/.env`**: Crie este arquivo dentro do diretório `api/`.
    ```env
    DATABASE_URL="postgresql://postgres:SUA_SENHA@postgres:5432/eduplatform"
    JWT_SECRET="seu-jwt-secret-super-seguro"
    JWT_EXPIRES_IN="7d"
    PORT=3001
    FRONTEND_URL="http://localhost:3000"
    ```
    *Substitua `SUA_SENHA` pela senha do seu usuário PostgreSQL.*

*   **`.env.local` (na raiz do projeto)**: Crie este arquivo na raiz do projeto.
    ```env
    NEXT_PUBLIC_API_URL="http://localhost:3001/api"
    NEXT_PUBLIC_APP_URL="http://localhost:3000"
    ```

### 3. Iniciar os Serviços Docker
Execute o comando a seguir na raiz do projeto para iniciar todos os contêineres (banco de dados, API e frontend) em segundo plano:
```bash
docker-compose up -d
```

### 4. Executar Migrações do Banco de Dados
Após iniciar os contêineres, aplique as migrações do Prisma para configurar o schema do banco de dados:
```bash
docker-compose exec api npx prisma migrate dev
```
*(Este comando garante que o banco de dados esteja sincronizado com o schema definido.)*

### 5. Acessar a Aplicação
Após a inicialização e migração bem-sucedidas:
*   **Frontend:** http://localhost:3000
*   **API:** http://localhost:3001
*   **Documentação da API:** http://localhost:3001/api/docs

### 6. Iniciando a Aplicação (Modos de Execução)

Para rodar a aplicação após a configuração, você pode escolher entre o modo de desenvolvimento ou produção.

#### 🚀 Modo de Desenvolvimento (com Docker)

Para o desenvolvimento, o ideal é ter o backend rodando em um contêiner e o frontend rodando localmente para aproveitar o hot-reloading do Next.js.

1.  **Backend (API):**
    *   O comando `docker-compose up -d` já inicia a API no modo de desenvolvimento (`npm run start:dev`), conforme definido no `docker-compose.yml`. Você pode verificar os logs com `docker-compose logs -f api`.

2.  **Frontend:**
    *   Para rodar o frontend em modo de desenvolvimento, navegue até a raiz do projeto no seu terminal (fora do Docker) e execute:
        ```bash
        npm run dev
        ```
    *   Isso iniciará o servidor de desenvolvimento do Next.js, geralmente em `http://localhost:3000`.

#### 🏭 Modo de Produção (com Docker)

Para rodar a aplicação em modo de produção usando Docker, o processo é mais direto com o `docker-compose`:

1.  **Iniciar todos os serviços:**
    ```bash
    docker-compose up -d
    ```
    *   Este comando irá construir as imagens (se necessário) e iniciar todos os contêineres.
    *   O frontend será iniciado em modo de produção (`npm start` após `npm run build`).
    *   A API, conforme configurado no `docker-compose.yml`, iniciará com `npm run start:dev`. Para um ambiente de produção estritamente falando, o comando da API no `docker-compose.yml` (`command: sh -c "npx prisma migrate deploy && npm run start:dev"`) poderia ser ajustado para `npm run start:prod`.

## Comandos Docker Úteis

*   **Parar todos os serviços:**
    ```bash
    docker-compose down
    ```
*   **Reconstruir contêineres (útil após alterações nos Dockerfiles):**
    ```bash
    docker-compose build --no-cache
    ```
*   **Ver logs em tempo real:**
    ```bash
    docker-compose logs -f
    ```
*   **Acessar o shell do contêiner da API:**
    ```bash
    docker-compose exec api sh
    ```
*   **Resetar o banco de dados (CUIDADO: apaga todos os dados!):**
    ```bash
    docker-compose down -v && docker-compose up -d && docker-compose exec api npx prisma migrate dev
    ```

---

⭐ **Se este guia foi útil, considere dar uma estrela ao projeto no GitHub!**
