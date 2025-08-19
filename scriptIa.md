# Script de Geração de Sistema: Plataforma de Cursos Online (Versão Avançada)

## 1. Visão Geral do Projeto

Este documento descreve a arquitetura e as funcionalidades de uma plataforma de cursos online (EAD) robusta, inspirada em líderes de mercado como a Hotmart. O sistema é projetado para ser escalável, seguro e oferecer uma experiência rica tanto para criadores de conteúdo (instrutores) quanto para consumidores (alunos).

A arquitetura é um monorepo composto por:
1.  **Backend (API):** Uma API RESTful completa que gerencia toda a lógica de negócios, dados, pagamentos e integrações.
2.  **Frontend (App):** Uma Single Page Application (SPA) reativa e moderna que proporciona uma interface intuitiva para todas as interações do usuário.

## 2. Tecnologias Utilizadas

### 2.1. Backend (API)

-   **Framework:** NestJS
-   **Linguagem:** TypeScript
-   **ORM:** Prisma
-   **Banco de Dados:** PostgreSQL
-   **Autenticação:** Passport.js (JWT e Local)
-   **Validação:** `class-validator`, `class-transformer`
-   **Documentação da API:** Swagger (OpenAPI)
-   **Segurança:** `bcryptjs` (hashing), `@nestjs/throttler` (rate limiting)
-   **Uploads e Mídia:** `multer`, `sharp` (processamento de imagem)

### 2.2. Frontend (App)

-   **Framework:** Next.js (App Router)
-   **Linguagem:** TypeScript
-   **UI:** React
-   **Estilização:** Tailwind CSS
-   **Componentes UI:** Radix UI, `lucide-react` (ícones)
-   **Gerenciamento de Estado:** React Query (`@tanstack/react-query`)
-   **Formulários:** React Hook Form, Zod (validação)
-   **Requisições HTTP:** Axios
-   **Editor de Texto:** Tiptap, Quill
-   **Tabelas:** `@tanstack/react-table`
-   **Gráficos:** `recharts`

## 3. Estrutura do Banco de Dados (Schema Prisma)

O schema do banco de dados é a espinha dorsal do sistema, modelado para suportar funcionalidades complexas:

-   **`User`**: Gerencia perfis de `STUDENT`, `INSTRUCTOR`, `ADMIN`.
-   **`InstructorProfile`**: Perfil detalhado para instrutores.
-   **`Category`**: Categorias para cursos.
-   **`Course`**: A entidade central, representando um produto digital.
-   **`Module`**: Módulos ordenáveis dentro de um curso.
-   **`Lesson`**: Aulas de diferentes tipos (`VIDEO`, `TEXT`, `QUIZ`) dentro dos módulos.
-   **`LessonContent`**: Conteúdo rico (JSON) para aulas de texto.
-   **`Purchase`**: Registra transações financeiras.
-   **`Enrollment`**: Gerencia o acesso dos alunos aos cursos.
-   **`Progress`**: Rastreia o avanço do aluno em nível de aula.
-   **`Review`**: Sistema de avaliação e comentários dos cursos.

## 4. Funcionalidades Avançadas (Estilo Hotmart)

Para emular uma plataforma de ponta, o sistema deve incluir as seguintes funcionalidades:

### 4.1. Para Alunos

-   **Player de Vídeo Inteligente:**
    -   Controle de velocidade de reprodução.
    -   Marcação automática de aulas concluídas.
    -   Navegação fácil entre aulas e módulos dentro do player.
-   **Espaço de Comentários por Aula:**
    -   Uma seção de discussão abaixo de cada aula para interação entre alunos e instrutores.
-   **Emissão de Certificados:**
    -   Geração automática de certificados em PDF após a conclusão de 100% do curso.
-   **Busca e Filtro de Cursos:**
    -   Mecanismo de busca avançado na página de cursos, com filtros por categoria, preço, nível e avaliação.

### 4.2. Para Instrutores (Produtores)

-   **Dashboard de Vendas:**
    -   Visão geral das vendas, receita, número de alunos e desempenho dos cursos.
    -   Gráficos para análise de vendas por período.
-   **Gestão de Conteúdo (Hotmart Club):**
    -   Interface visual para criar e organizar o conteúdo do curso.
    -   **Funcionalidade de Arrastar e Soltar:** Reordenar módulos e aulas de forma intuitiva.
    -   Suporte a múltiplos formatos de conteúdo: vídeo, texto, quizzes, arquivos para download.
-   **Relacionamento com Alunos:**
    -   Área para responder comentários e dúvidas dos alunos diretamente na plataforma.
-   **Gestão de Afiliados (Futuro):**
    -   (Planejado) Sistema para que outros usuários possam se afiliar a um curso e ganhar comissões por venda.

### 4.3. Para Administradores

-   **Painel de Controle Geral:**
    -   Visão completa da plataforma: novos usuários, vendas totais, cursos mais vendidos.
-   **Moderação de Conteúdo:**
    -   Capacidade de revisar e aprovar/reprovar cursos e comentários.
-   **Gestão de Transações:**
    -   Visualizar e gerenciar todas as compras, incluindo a capacidade de processar reembolsos.

## 5. Estrutura do Frontend e API

As funcionalidades descritas serão suportadas pela seguinte estrutura de páginas e endpoints:

### Frontend (Páginas Adicionais)
-   **`/courses/[slug]`**: Página de vendas do curso, com descrição completa, conteúdo programático, informações do instrutor e botão de compra.
-   **`/learn/[courseId]/[lessonId]`**: A página de aula, com o player de vídeo, conteúdo da aula e seção de comentários.

### API (Endpoints Adicionais)
-   **`/reviews`**: CRUD para avaliações de cursos.
-   **`/certificates`**:
    -   `POST /certificates/generate`: Endpoint para gerar o certificado de um aluno em um curso concluído.
-   **`/dashboard/instructor`**: Endpoints para fornecer dados agregados para o dashboard do instrutor.
-   **`/dashboard/admin`**: Endpoints para as estatísticas do painel de administração.

Este script detalhado serve como um blueprint completo para o desenvolvimento de uma plataforma de EAD moderna e cheia de recursos.
## 6. Integração com API de WhatsApp

Para aprimorar a comunicação com os usuários, o sistema incluirá uma integração para envio de notificações via WhatsApp. A arquitetura será flexível para suportar tanto APIs não oficiais (como Baileys) quanto APIs oficiais.

### 6.1. Provedores Suportados

-   **Baileys:** Uma biblioteca de código aberto que utiliza uma conexão direta via WebSocket. Ideal para custos reduzidos e maior flexibilidade. Requer a leitura de um QR Code para autenticar a sessão.
-   **Oficial (API Cloud da Meta):** A solução oficial, mais robusta e confiável, ideal para escala. A comunicação é feita via API Key.

A funcionalidade será implementada de forma que o administrador possa alternar entre os provedores, mas a implementação inicial via Baileys estará ativa por padrão, enquanto a oficial estará desativada.

### 6.2. Modelagem no Banco de Dados

Para gerenciar a integração, os seguintes modelos de dados serão adicionados ao `schema.prisma`:

-   **`WhatsappConfig`**: Armazena a configuração do provedor ativo, incluindo chaves de API para a versão oficial.
    -   `provider`: Enum (`BAILEYS`, `OFFICIAL`)
    -   `apiKey`, `apiSecret`: Credenciais para a API oficial.
    -   `isActive`: Flag para ativar/desativar o envio de mensagens.
-   **`WhatsappInstance`**: Gerencia as sessões de conexão do Baileys.
    -   `instanceName`: Nome da instância.
    -   `qrCode`: Armazena o QR Code gerado para autenticação.
    -   `status`: Status da conexão (`CONNECTED`, `DISCONNECTED`).
-   **`WhatsappMessageLog`**: Registra um histórico de todas as mensagens enviadas.
    -   `recipient`: Número do destinatário.
    -   `message`: Conteúdo da mensagem.
    -   `status`: Status do envio (`SENT`, `DELIVERED`, `FAILED`).
    -   `error`: Mensagem de erro, caso o envio falhe.

### 6.3. Endpoints da API (`/whatsapp`)

Um novo módulo na API NestJS será criado para gerenciar a integração:

-   `GET /whatsapp/config`: Retorna a configuração atual.
-   `PATCH /whatsapp/config`: Atualiza a configuração (ex: troca de provedor, insere API keys).
-   `GET /whatsapp/instance`: Retorna o status da instância Baileys e o QR Code, se necessário.
-   `POST /whatsapp/instance/connect`: Inicia a conexão com o Baileys.
-   `POST /whatsapp/instance/disconnect`: Desconecta a instância Baileys.
-   `POST /whatsapp/send`: Endpoint para enviar uma mensagem de teste.
-   `GET /whatsapp/logs`: Lista o histórico de mensagens enviadas.

### 6.4. Interface no Painel de Administração

No frontend, uma nova página será criada em `/admin/settings/whatsapp` para:
-   Visualizar e alterar o provedor de WhatsApp.
-   Inserir as credenciais da API oficial.
-   Para o Baileys, exibir o QR Code para escaneamento e mostrar o status da conexão.
-   Enviar mensagens de teste para validar a configuração.
-   Visualizar os logs de mensagens enviadas.