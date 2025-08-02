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

## 🛠️ Instalação e Configuração

Para instruções detalhadas de instalação, escolha uma das opções abaixo:

- 📖 **[Instalação com Docker (Recomendado)](./installs/install_docker.md)**
- 📖 **[Instalação Local (Sem Docker)](./installs/install_semdocker.md)**
- 📖 **[Deploy em Produção com Docker](./installs/install_production_docker.md)**

Após a instalação, você pode usar as seguintes credenciais para acessar a plataforma:
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

### ✅ Interface Administrativa
- [x] Dashboard administrativo
- [x] Controle de usuários (CRUD)
- [x] Controle de categorias
- [x] Paginação e filtros avançados
- [x] Soft delete para usuários

## 🔄 Em Desenvolvimento
- [ ] Player de vídeo avançado
- [ ] Sistema de avaliações
- [ ] Chat/comentários
- [ ] Certificados digitais

## 📋 Roadmap Futuro
- [ ] Integração Mercado Pago/Stripe
- [ ] Sistema de afiliados
- [ ] Live streaming
- [ ] Mobile app (React Native)
- [ ] Analytics avançado

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

Este projeto está sob a licença AGPL v3. Veja o arquivo [LICENSE](https://www.gnu.org/licenses/agpl-3.0.html) para mais detalhes.

## 👥 Equipe

- **Desenvolvedor** - [Gilson Oliveira](https://github.com/gorinformaticadev)

## 📞 Suporte

Para suporte, envie um email para suporte@eduplatform.com ou abra uma issue no GitHub.

---

⭐ **Se este projeto foi útil para você, considere dar uma estrela no GitHub!**
