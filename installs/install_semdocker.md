#### 1. Clone o Repositório
```bash
git clone https://github.com/gorinformaticadev/Plataform-de-curso-gor.git
cd Plataform-de-curso-gor
```

#### 2. Configuração do Backend (API)

**2.1. Instalar Dependências**
```bash
cd api
npm install
```

**2.2. Configuração do Banco de Dados PostgreSQL**

Siga os passos abaixo para configurar o banco de dados PostgreSQL em seu sistema operacional.

**Passo 1: Instalar o PostgreSQL**

- **Windows:** Baixe o instalador a partir do [site oficial do PostgreSQL](https://www.postgresql.org/download/windows/). Durante a instalação, você será solicitado a definir uma senha para o superusuário `postgres`. **Anote esta senha**, pois você precisará dela para conectar a API ao banco.

- **Linux (Ubuntu/Debian):**
  ```bash
  sudo apt update
  sudo apt install postgresql postgresql-contrib
  ```

- **macOS (usando Homebrew):**
  ```bash
  brew install postgresql
  brew services start postgresql
  ```

**Passo 2: Criar o Banco de Dados**

Após a instalação, você precisa criar o banco de dados que será usado pela aplicação.

- **Opção A: Usando `psql` (Terminal)**

  1.  **Acesse o shell do PostgreSQL:**
      - **Windows:** Abra o "SQL Shell (psql)" que foi instalado junto com o PostgreSQL. Pressione Enter para os valores padrão (servidor, banco, porta, usuário) e digite a senha do usuário `postgres` que você definiu na instalação.
      - **Linux/Mac:**
        ```bash
        sudo -u postgres psql
        ```

  2.  **Execute o comando SQL para criar o banco:**
      Dentro do shell `psql`, digite o seguinte comando e pressione Enter:
      ```sql
      CREATE DATABASE eduplatform;
      ```

  3.  **(Opcional) Verifique se o banco foi criado:**
      ```sql
      \l
      ```
      Você deverá ver `eduplatform` na lista de bancos de dados.

  4.  **Saia do psql:**
      ```sql
      \q
      ```

- **Opção B: Usando pgAdmin (Interface Gráfica)**

  1.  Abra o pgAdmin (instalado junto com o PostgreSQL).
  2.  Conecte-se ao seu servidor local (geralmente criado por padrão). Você precisará da senha do usuário `postgres`.
  3.  Na árvore de navegação à esquerda, clique com o botão direito em **Databases** -> **Create** -> **Database...**.
  4.  No campo **Database**, digite `eduplatform` e clique em **Save**.

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

**2.4. Configuração Automatizada do Banco (Recomendado)**

Depois de configurar suas variáveis de ambiente, você pode rodar um único comando para executar as migrações do banco de dados e popular com dados iniciais (seed).

Dentro da pasta `api`, execute:
```bash
npm run db:setup
```
Este comando irá:
1.  Aplicar todas as migrações pendentes para criar as tabelas (`prisma migrate dev`).
2.  Executar o script de seed para popular o banco com dados iniciais (`prisma db seed`).

Se preferir executar os passos manualmente, siga as seções 2.5 e 2.6.

**2.5. Executar Migrações (Manualmente)**
```bash
npx prisma migrate dev
```

**2.6. Seed do Banco (Opcional, se não usou `db:setup`)**
```bash
npx prisma db seed
```

**2.6. Iniciar o Servidor**
```bash
npm run start:dev
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

### 🚀 Executando a Aplicação Completa

Para rodar a aplicação localmente, você precisará de **dois terminais** abertos.

**Terminal 1: Backend (API)**

1.  Navegue até a pasta da API:
    ```bash
    cd api
    ```
2.  Inicie o servidor de desenvolvimento do NestJS:
    ```bash
    npm run start:dev
    ```
    A API estará disponível em `http://localhost:3001`.

**Terminal 2: Frontend (Interface Web)**

1.  Navegue de volta para a pasta raiz do projeto (se você estava na pasta `api`):
    ```bash
    cd ..
    ```
2.  Inicie o servidor de desenvolvimento do Next.js:
    ```bash
    npm run dev
    ```
    O frontend estará acessível em `http://localhost:3000`.

Com os dois servidores rodando, você pode abrir `http://localhost:3000` no seu navegador para usar a plataforma.

---

- __Email:__ `admin@eduplatform.com`

- __Senha:__ `admin123`


### 🐛 Solução de Problemas Comuns

- **Erro de Conexão com o Banco:**
  - Verifique se o serviço do PostgreSQL está rodando no seu sistema.
  - Confirme se a senha no arquivo `api/.env` está correta.
  - Se necessário, reinicie o banco com `npx prisma migrate reset`.
- **Erro de Dependências:** Delete `node_modules` e `package-lock.json` e rode `npm install` novamente.
- **Erro de Porta em Uso:** Verifique qual processo está usando a porta (ex: `3000` ou `3001`) e finalize-o.
