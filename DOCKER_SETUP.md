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

### 5. Acessos da Aplicação
Após a inicialização e migração bem-sucedidas:
*   **Frontend:** http://localhost:3000
*   **API:** http://localhost:3001
*   **Documentação da API:** http://localhost:3001/api/docs
*   **pgAdmin:** http://localhost:5050
*   **Prisma Studio:** http://localhost:5555

--- 
Acesso do pgadmin:
Aba Geral: dê um nome a ele
Aba Connection:
Host: postgres
Port: 5432
Maintenance Database: eduplatform
User: postgres
Password: postgres123

### 6. Iniciando a Aplicação (Modos de Execução)

Para rodar a aplicação após a configuração, você pode escolher entre o modo de desenvolvimento ou produção.

#### 6.1 🚀 Modo de Desenvolvimento (com Docker)

Para o desenvolvimento, o ideal é ter o backend rodando em um contêiner e o frontend rodando localmente para aproveitar o hot-reloading do Next.js.

1.  **Backend (API):**
    *   O comando `docker-compose up -d` já inicia a API no modo de desenvolvimento (`npm run start:dev`), conforme definido no `docker-compose.yml`. Você pode verificar os logs com `docker-compose logs -f api`.

2.  **Frontend:**
    *   Para rodar o frontend em modo de desenvolvimento, navegue até a raiz do projeto no seu terminal (fora do Docker) e execute:
        ```bash
        npm run dev
        ```
    *   Isso iniciará o servidor de desenvolvimento do Next.js, geralmente em `http://localhost:3000`.

3.  **Seed do Banco de Dados:**
    Após a configuração inicial e antes de tentar o login, é crucial garantir que o banco de dados esteja populado com dados iniciais. 
    Rode o comando:
    
    `docker-compose exec api npx prisma db seed` 
    
    Ele irá executar o seed e popular o banco de dados, criando os usuários admin (`admin@eduplatform.com` e `admin@admin.com`). 
    
    Se você encontrar problemas de login, certifique-se de que este comando foi executado após iniciar os contêineres.

4.  **Senhas de acesso ao sistema:**
    
    Usuário: `admin@eduplatform.com` 
    Senha: `admin123`

    Usuário: `admin@admin.com` 
    Senha: `admin123`

5.  **Acessando o Prisma Studio:**
    O Prisma Studio oferece uma interface gráfica para visualizar e manipular seus dados. Para acessá-lo com o Docker:
    1.  Execute o seguinte comando no seu terminal (na raiz do projeto), **após os serviços do Docker estarem rodando**:
        ```bash
        docker-compose exec api npx prisma studio
        ```
    2.  Isso iniciará o Prisma Studio dentro do contêiner da API. O terminal exibirá a URL onde o Prisma Studio está disponível. Geralmente, é:
        *   **Prisma Studio:** http://localhost:5555

#### 7. 🏭 Modo de Produção (com Docker)

Para rodar a aplicação em modo de produção usando Docker, o processo é mais direto com o `docker-compose`:

1.  **Iniciar todos os serviços:**
    ```bash
    docker-compose up -d
    ```
    *   Este comando irá construir as imagens (se necessário) e iniciar todos os contêineres.
    *   O frontend será iniciado em modo de produção (`npm start` após `npm run build`).
    *   A API, conforme configurado no `docker-compose.yml`, iniciará com `npm run start:dev`. Para um ambiente de produção estritamente falando, o comando da API no `docker-compose.yml` (`command: sh -c "npx prisma migrate deploy && npm run start:dev"`) poderia ser ajustado para `npm run start:prod`.

### 8. Seed do Banco de Dados e Acesso ao Prisma Studio

*   **Seed do Banco de Dados:**
    Após a configuração inicial e antes de tentar o login, é crucial garantir que o banco de dados esteja populado com dados iniciais. O comando `docker-compose exec api npx prisma db seed` foi executado com sucesso, criando os usuários admin (`admin@eduplatform.com` e `admin@admin.com`). Se você encontrar problemas de login, certifique-se de que este comando foi executado após iniciar os contêineres.

*   **Acessando o Prisma Studio:**
    O Prisma Studio oferece uma interface gráfica para visualizar e manipular seus dados. Para acessá-lo com o Docker:
    1.  Execute o seguinte comando no seu terminal (na raiz do projeto):
        ```bash
        docker-compose exec api npx prisma studio
        ```
    2.  Isso iniciará o Prisma Studio dentro do contêiner da API. Ele geralmente fica disponível em:
        *   **Prisma Studio:** http://localhost:5555

*   **Executando Comandos no Contêiner da API:**
    Para executar outros comandos do npm ou do Prisma dentro do contêiner da API (por exemplo, para verificar logs específicos, rodar testes, ou executar migrações manuais), use:
    ```bash
    docker-compose exec api [seu-comando-aqui]
    ```
    Exemplo: `docker-compose exec api npm run test`

---

⭐ **Se este guia foi útil, considere dar uma estrela ao projeto no GitHub!**
