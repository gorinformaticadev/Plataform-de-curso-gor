
#### 2. Crie os arquivos Docker

**2.1. Dockerfile para API:**
```dockerfile
# API Dockerfile
FROM node:18 AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run nest
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs

# Copy the bundled code from the build stage to the production image
COPY --from=builder --chown=nestjs:nestjs /app/dist ./dist
COPY --from=builder --chown=nestjs:nestjs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nestjs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nestjs /app/prisma ./prisma

USER nestjs

EXPOSE 3001

ENV PORT 3001

CMD ["npm", "run", "start:prod"]

```

**2.3. Docker Compose:**
```yaml
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
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 30s
      timeout: 10s
      retries: 3

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
      - "5555:5555" # Changed mapping for Prisma Studio to avoid port conflict
    depends_on:
      postgres:
        condition: service_healthy
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
      - /app/.next
    networks:
      - eduplatform-network
    command: npm run dev

  # pgAdmin - Interface gráfica para PostgreSQL
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: eduplatform-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@eduplatform.com
      PGADMIN_DEFAULT_PASSWORD: admin123
      PGADMIN_CONFIG_SERVER_MODE: 'False'
    ports:
      - "5050:80"
    depends_on:
      - postgres
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
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/eduplatform"
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

**4.4. Seed do Banco tem quer ser executado na pasta raiz**
```bash
docker-compose exec api npx prisma db seed
```

**4.5. Instalar Dependências na pasta raiz**
```bash
npm install
```

**4.6. Iniciar o Servidor**
```bash
npm run dev
```

#### Acessar a Aplicação
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Documentação**: http://localhost:3001/api/docs

**5. Acessando o Prisma Studio( se a primeita opção não der, tente a segunda):**
    O Prisma Studio oferece uma interface gráfica para visualizar e manipular seus dados. Você pode acessá-lo de duas maneiras:

- **Opção 1: Dentro do Contêiner Docker (Recomendado)**
- 1.  Certifique-se de que a `DATABASE_URL` no seu arquivo `api/.env` aponta para o hostname `postgres`.
- 2.  Execute o seguinte comando no seu terminal (na raiz do projeto),
- **após os serviços do Docker estarem rodando**:
```bash
docker-compose exec api npx prisma studio
```
- 3.  Isso iniciará o Prisma Studio dentro do contêiner da API. O terminal exibirá a URL onde o Prisma Studio está disponível. Geralmente, é:
*   **Prisma Studio:** http://localhost:5555

**Opção 2: Localmente (Fora do Docker)**
1.  Certifique-se de que a `DATABASE_URL` no seu arquivo `api/.env` aponta para `localhost`.
2.  Execute o comando `docker-compose up -d` para garantir que o contêiner do banco de dados esteja em execução.
3.  Execute o seguinte comando no seu terminal (na raiz do projeto):
```bash
npx prisma studio --schema=api/prisma/schema.prisma
```
4.  Isso iniciará o Prisma Studio na sua máquina local, conectando-se ao banco de dados que está rodando no Docker. O terminal exibirá a URL de acesso.

#### Acessos da Aplicação
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

#iniciar prisma studio localmente (deve estra na pasta raiz do projeto)
npx prisma studio --schema=api/prisma/schema.prisma

# Limpar tudo (cuidado: apaga dados!)
docker-compose down -v
docker system prune -a
```

---