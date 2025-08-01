# Guia de Configuração Docker - EduPlatform

## 📋 Pré-requisitos
- Docker Desktop instalado ([Download](https://www.docker.com/products/docker-desktop/))
- Git instalado ([Download](https://git-scm.com/))
- Portas 3000, 3001 e 5432 disponíveis

## 🛠️ Configuração Inicial
1. Clone o repositório:
```bash
git clone https://github.com/gorinformaticadev/Plataform-de-curso-gor.git
cd Plataform-de-curso-gor
```

2. Configure os arquivos de ambiente:
- `api/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/eduplatform"
JWT_SECRET="seu-jwt-secret-super-seguro"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

## 🚀 Executando a Aplicação
1. Inicie os containers:
```bash
docker-compose up -d
```

2. Execute as migrações do banco:
```bash
docker-compose exec api npx prisma migrate dev
```

3. Popule o banco com dados iniciais:
```bash
docker-compose exec api npx prisma db seed
```

## 🔌 Acessos
- Frontend: http://localhost:3000
- API: http://localhost:3001
- Prisma Studio: http://localhost:5555
- pgAdmin: http://localhost:5050

## 🔧 Comandos Úteis
```bash
# Ver logs da API
docker-compose logs -f api

# Acessar container da API
docker-compose exec api bash

# Executar testes
docker-compose exec api npm run test

# Parar todos os serviços
docker-compose down
```

## 🛑 Solução de Problemas
### Erros comuns:
1. **Portas em uso**:
```bash
netstat -ano | findstr :3000
docker-compose down
```

2. **Banco não conecta**:
```bash
docker-compose ps
docker-compose logs postgres
```

3. **Problemas de login**:
- Verifique se o seed foi executado
- Credenciais padrão:
  - Email: `admin@eduplatform.com`
  - Senha: `admin123`

---

⭐ **Se este guia foi útil, considere dar uma estrela ao projeto no GitHub!**
