# 🚀 Deploy em Produção com Docker

Este guia descreve como construir e executar a aplicação em um ambiente de produção utilizando Docker. O `docker-compose.yml` já está configurado para suportar um build de produção.

## 🛠️ Passos para o Deploy

### 1. Configuração do `docker-compose.yml` para Produção

O `docker-compose.yml` fornecido no projeto já contém as definições para produção. A principal diferença está no comando executado pelos contêineres da `api` and `web`.

- **API (`api` service):** Em vez de `npm run start:dev`, o comando para produção é `npm run start:prod`, que executa o código transpilado a partir da pasta `dist`. O `Dockerfile` da API já é multi-stage, criando uma imagem otimizada para produção.

- **Frontend (`web` service):** Em vez de `npm run dev`, o comando para produção é `npm run build` seguido por `npm run start`.

Para um ambiente de produção real, você deve modificar o `command` no `docker-compose.yml`.

**Exemplo de modificação para produção no `docker-compose.yml`:**

```yaml
services:
  # ... (serviço do postgres)

  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    container_name: eduplatform-api-prod
    # ... (resto da configuração)
    command: sh -c "npx prisma migrate deploy && npm run start:prod" # Comando de produção

  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: eduplatform-web-prod
    # ... (resto da configuração)
    command: sh -c "npm run build && npm run start" # Comando de produção
```
*Nota: Para um deploy real, considere remover os volumes de código-fonte para garantir que o contêiner execute apenas o código da imagem construída.*

### 2. Configurar Variáveis de Ambiente para Produção

Certifique-se de que suas variáveis de ambiente estão configuradas para produção.

**2.1. API (`api/.env`):**
Use segredos fortes e URLs de produção.
```bash
# api/.env
DATABASE_URL="postgresql://postgres:SENHA_FORTE_PROD@postgres:5432/eduplatform"
JWT_SECRET="SEGREDO_JWT_MUITO_FORTE_E_LONGO"
JWT_EXPIRES_IN="1d"
PORT=3001
FRONTEND_URL="https://seudominio.com"
NODE_ENV=production
```

**2.2. Frontend (`.env.local`):**
Aponte para o domínio da sua API.
```bash
# .env.local
NEXT_PUBLIC_API_URL="https://api.seudominio.com/api"
NEXT_PUBLIC_APP_URL="https://seudominio.com"
```

### 3. Construir e Iniciar os Contêineres de Produção

Use o `docker-compose` para construir as imagens e iniciar os serviços.
```bash
docker-compose up -d --build
```
O argumento `--build` força a reconstrução das imagens, o que é essencial para aplicar as mudanças de código e os comandos de produção.

### 4. Executar Migrações em Produção

Após os contêineres estarem no ar, aplique as migrações do banco de dados de forma segura.
```bash
docker-compose exec api npx prisma migrate deploy
```
O comando `migrate deploy` é o recomendado para ambientes de produção, pois ele não gera novas migrações nem altera o schema, apenas aplica as migrações existentes.

### 5. Acessando a Aplicação em Produção

Sua aplicação estará disponível nos domínios que você configurou, através de um reverse proxy como Nginx ou Traefik, que direcionará o tráfego para as portas `3000` e `3001` dos seus contêineres.

### 🚨 Considerações de Segurança para Produção

- **Segredos:** Nunca comite arquivos `.env` com credenciais de produção no Git. Use um sistema de gerenciamento de segredos (como Docker Secrets, HashiCorp Vault, ou variáveis de ambiente do provedor de nuvem).
- **Banco de Dados:** Use senhas fortes para o banco de dados e restrinja o acesso a ele.
- **HTTPS:** Configure um reverse proxy (Nginx, Traefik, Caddy) para habilitar HTTPS/SSL em seu domínio.
- **Otimização de Imagens:** Garanta que seus `Dockerfile`s sejam multi-stage para criar imagens Docker pequenas e seguras para produção.
