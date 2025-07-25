# 🐳 Instalação com Docker (Recomendado)

Siga os passos abaixo para configurar e executar o ambiente de desenvolvimento completo usando Docker.

## 📋 Pré-requisitos
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download](https://git-scm.com/)

## 🛠️ Passos de Instalação

### 1. Clone o Repositório
```bash
git clone https://github.com/gorinformaticadev/Plataform-de-curso-gor.git
cd Plataform-de-curso-gor
```

### 2. Crie os arquivos de configuração
O projeto já inclui os `Dockerfile` necessários para a API e para o Frontend, assim como o `docker-compose.yml`. Você não precisa criá-los.

### 3. Configurar Variáveis de Ambiente

Crie os arquivos `.env` necessários a partir dos exemplos fornecidos.

**3.1. API (`api/.env`):**
Crie um arquivo chamado `.env` dentro da pasta `api` e adicione o seguinte conteúdo:
```bash
# api/.env
DATABASE_URL="postgresql://postgres:postgres123@postgres:5432/eduplatform"
JWT_SECRET="seu-jwt-secret-super-seguro"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

**3.2. Frontend (`.env.local`):**
Na raiz do projeto, crie um arquivo chamado `.env.local` e adicione:
```bash
# .env.local
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Executar com Docker

**4.1. Iniciar todos os serviços:**
Este comando irá construir as imagens e iniciar os contêineres em segundo plano.
```bash
docker-compose up -d --build
```

**4.2. Verificar se os contêineres estão rodando:**
```bash
docker-compose ps
```
Você deve ver os contêineres `eduplatform-db`, `eduplatform-api`, `eduplatform-web`, e `eduplatform-pgadmin` com o status "Up" ou "running".

**4.3. Executar as migrações do banco de dados (apenas na primeira vez):**
Este comando executa o `prisma migrate dev` dentro do contêiner da API para criar as tabelas no banco de dados.
```bash
docker-compose exec api npx prisma migrate dev
```

**4.4. Popular o banco de dados com dados iniciais (seed):**
Este comando executa o script de seed para adicionar dados de exemplo, como o usuário administrador.
```bash
docker-compose exec api npx prisma db seed
```

### 5. Acessar a Aplicação
Após a inicialização bem-sucedida:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API**: [http://localhost:3001](http://localhost:3001)
- **Documentação da API (Swagger)**: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- **pgAdmin (Admin do Banco)**: [http://localhost:5050](http://localhost:5050)
  - **Email:** `admin@eduplatform.com`
  - **Senha:** `admin123`
- **Prisma Studio (Visualizador de Dados)**: [http://localhost:5555](http://localhost:5555)

Para acessar o Prisma Studio, execute o comando:
```bash
docker-compose exec api npx prisma studio
```

### 6. Comandos Úteis do Docker

- **Parar todos os serviços:**
  ```bash
  docker-compose down
  ```
- **Ver logs em tempo real (ex: da API):**
  ```bash
  docker-compose logs -f api
  ```
- **Acessar o terminal de um contêiner (ex: da API):**
  ```bash
  docker-compose exec api bash
  ```
- **Limpar tudo (cuidado: apaga os dados do banco!):**
  ```bash
  docker-compose down -v
  ```

### 🐛 Solução de Problemas Comuns

- **Erro de porta em uso:** Verifique se nenhuma outra aplicação está usando as portas `3000`, `3001`, `5432`, ou `5050`. Você pode parar os contêineres com `docker-compose down`.
- **Erro de permissão (Windows):** Execute o terminal (PowerShell/CMD) como Administrador.
- **API não conecta com o banco:** Verifique os logs do contêiner `postgres` e `api` com `docker-compose logs postgres` e `docker-compose logs api`. Certifique-se que o contêiner do `postgres` está saudável antes da `api` iniciar.
