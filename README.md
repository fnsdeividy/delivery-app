# 🍕 **Cardap.IO - Plataforma Multi-tenant de Delivery**

Uma plataforma moderna e robusta para delivery de comida com sistema multi-tenant, controle de estoque e gestão completa de clientes.

![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

---

## 📸 **Preview**

<div align="center">

### 🏪 **Interface da Loja**
Interface pública personalizada para cada estabelecimento

### 📊 **Dashboard Administrativo**  
Painel completo para gestão da loja

### 👑 **Painel Super Admin**
Controle centralizado de todas as lojas

</div>

---

## 🚀 **Características Principais**

### ✨ **Funcionalidades Implementadas**
- 🏪 **Sistema Multi-tenant** - Cada loja com seus dados isolados
- 🔐 **Autenticação Robusta** - NextAuth + Prisma com múltiplas roles
- 📦 **Controle de Estoque** - Sistema completo com movimentações
- 👥 **Gestão de Clientes** - CRM integrado por loja
- 🛒 **Sistema de Pedidos** - Fluxo completo de vendas
- 📊 **Dashboard Administrativo** - Interface moderna para lojistas
- 👑 **Painel Super Admin** - Gestão centralizada de todas as lojas
- 🎨 **Personalização Visual** - Temas dinâmicos por loja
- 📱 **Design Responsivo** - Funciona em todos os dispositivos

### 🛠️ **Stack Tecnológica**
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes + Prisma ORM
- **Banco de Dados:** PostgreSQL
- **Autenticação:** NextAuth.js com Prisma Adapter
- **Estilização:** Tailwind CSS + CSS Modules
- **Ícones:** Lucide React
- **Deploy:** Vercel Ready

---

## 🔧 **Instalação e Configuração**

### **📋 Pré-requisitos**
- Node.js 18+ 
- PostgreSQL 12+ (ou Docker)
- npm ou yarn

### **🚀 Instalação Rápida**

#### **1. Clone o repositório**
```bash
git clone <repository-url>
cd delivery-app
npm install
```

#### **2. Configure o banco de dados**

**Opção A: Docker (Recomendado)**
```bash
# Iniciar PostgreSQL no Docker
docker-compose up -d postgres

# Configurar variáveis de ambiente
cp env.local.example .env.local
```

Edite `.env.local`:
```env
DATABASE_URL="postgresql://cardapio_user:cardapio_123@localhost:5432/delivery_app?schema=public"
NEXTAUTH_SECRET="sabor-express-secret-key-2024"
NEXTAUTH_URL="http://localhost:3000"
```

**Opção B: PostgreSQL Local**
```bash
# Criar banco e usuário
createdb delivery_app
psql delivery_app -c "CREATE USER cardapio_user WITH ENCRYPTED PASSWORD 'sua_senha';"
psql delivery_app -c "GRANT ALL PRIVILEGES ON DATABASE delivery_app TO cardapio_user;"
```

**Opção C: Supabase (Nuvem)**
1. Crie projeto no [Supabase](https://supabase.com)
2. Use a string de conexão no `.env.local`

#### **3. Setup automático do banco**
```bash
# Executar migrations e seed inicial
npm run db:setup

# Ou manualmente:
npx prisma migrate dev
npx prisma generate
```

#### **4. Criar dados de exemplo (opcional)**
```bash
# Criar categorias padrão
npx tsx scripts/create-default-categories.ts

# Adicionar mais categorias específicas
npx tsx scripts/add-more-categories.ts

# Criar produtos de exemplo
npx tsx scripts/create-sample-products.ts
```
```bash
# Executar migrations e seed
npm run db:reset
npm run db:seed
```

#### **4. Iniciar o servidor**
```bash
npm run dev
```

#### **5. Acessar a aplicação**
- 🌐 **Homepage:** http://localhost:3000
- 🏪 **Loja Demo:** http://localhost:3000/store/boteco-do-joao
  - Link curto: http://localhost:3000/boteco-do-joao (redireciona)
- 🔐 **Login:** http://localhost:3000/login
- 📊 **Dashboard:** http://localhost:3000/dashboard
- 👑 **Super Admin:** http://localhost:3000/admin

## 🔐 **Sistema de Autenticação**
## 🔎 **Busca por Itens (com Cache)**

- Endpoint: `GET /api/stores/[slug]/search?q=texto`
- Cache: Redis (TTL 60s)
- Habilitar Redis (opcional):
  1. Docker: `docker-compose up -d redis`
  2. `.env.local`: `REDIS_URL="redis://localhost:6379"`


### **👥 Tipos de Usuário**
- **👑 Super Admin:** Controle total do sistema
- **🏪 Lojista (ADMIN):** Gestão da própria loja
- **👤 Cliente:** Acesso ao cardápio e pedidos

### **🧪 Usuários de Teste**

#### **👑 Super Admins**
```bash
Email: superadmin@cardap.io
Senha: admin123
Tipo: super-admin
```

#### **🏪 Lojistas**
```bash
Email: teste@teste.com
Senha: 123456
Tipo: lojista

Email: admin@burgerstation.com
Senha: 123456
Tipo: lojista
```

#### **👤 Clientes**
```bash
Email: cliente@teste.com
Senha: 123456
Tipo: cliente
```

### **🔍 Scripts de Teste**
```bash
# Listar todos os usuários
npm run list-users

# Testar autenticação
npm run test-login

# Ver dados de demonstração
npm run demo

# Testar fluxo completo
npm run test-store
```
```bash
# Criar tabelas e migrar dados
npm run db:setup
```

#### **4. Iniciar aplicação**
```bash
npm run dev
```

🎉 **Pronto!** Acesse [http://localhost:3000](http://localhost:3000)

---

## 👤 **Usuários de Teste**

Após o setup, você terá estes usuários disponíveis:

| Tipo | Email | Senha | Acesso |
|------|-------|-------|--------|
| 🔑 **Super Admin** | `superadmin@cardap.io` | `admin123` | [/login/super-admin](http://localhost:3000/login/super-admin) |
| 👑 **Dev Master** | `dev@cardap.io` | `dev123456` | [/login/super-admin](http://localhost:3000/login/super-admin) |
| 🏪 **Lojista** | `admin@boteco.com` | `123456` | [/login/lojista](http://localhost:3000/login/lojista) |
| 👤 **Cliente** | `cliente@teste.com` | `123456` | [/login](http://localhost:3000/login) |

### **🧪 Criar Usuários Adicionais**
```bash
# Criar usuário master para desenvolvimento
npm run create-dev-master

# Testar fluxo completo + criar usuários de teste
npm run test-auth
```

### **🏪 URLs da Loja Demo**
- **Loja Pública:** [/store/boteco-do-joao](http://localhost:3000/store/boteco-do-joao)
- **Dashboard:** [/dashboard/boteco-do-joao](http://localhost:3000/dashboard/boteco-do-joao)

---

## 📊 **Estrutura do Projeto**

```
delivery-app/
├── 📁 app/                    # Next.js App Router
│   ├── (api)/api/            # API Routes
│   ├── (auth)/               # Páginas de autenticação
│   ├── (dashboard)/          # Dashboard administrativo
│   ├── (store)/              # Interface pública das lojas
│   └── (superadmin)/         # Painel super admin
├── 📁 components/            # Componentes reutilizáveis
├── 📁 lib/                   # Utilities e configurações
│   ├── generated/prisma/     # Cliente Prisma gerado
│   ├── auth.ts              # Configuração NextAuth
│   └── db.ts                # Conexão banco de dados
├── 📁 prisma/               # Schema e migrations
├── 📁 scripts/              # Scripts de setup e migração
├── 📁 types/                # Definições TypeScript
├── 📁 config/               # Configurações das lojas
└── 📁 data/                 # Dados para migração
```

---

## 🗄️ **Arquitetura do Banco de Dados**

### **📋 Principais Tabelas**

| Tabela | Descrição | Relacionamentos |
|--------|-----------|----------------|
| `users` | Usuários do sistema | Lojas, Pedidos, Estoque |
| `stores` | Lojas (multi-tenant) | Produtos, Pedidos, Clientes |
| `products` | Produtos do cardápio | Categoria, Estoque, Pedidos |
| `categories` | Categorias de produtos | Produtos |
| `inventory` | Controle de estoque | Produtos, Movimentações |
| `stock_movements` | Movimentações de estoque | Produtos, Usuários |
| `customers` | Clientes por loja | Pedidos, Usuários |
| `orders` | Pedidos realizados | Clientes, Itens |
| `order_items` | Itens dos pedidos | Pedidos, Produtos |

### **🔐 Sistema de Roles**
- **SUPER_ADMIN:** Controle total, gestão de todas as lojas
- **ADMIN:** Lojista, gestão da própria loja
- **MANAGER:** Gerente da loja
- **EMPLOYEE:** Funcionário
- **CLIENTE:** Consumidor final

---

## 🎨 **Personalização por Loja**

Cada loja pode personalizar:
- 🎨 **Cores:** Primary, secondary, accent
- 🖼️ **Logo e Favicon**
- 📝 **Informações de contato**
- ⏰ **Horários de funcionamento**  
- 🚚 **Configurações de entrega**
- 💳 **Métodos de pagamento**
- 🍔 **Cardápio e produtos**

---

## 📱 **Funcionalidades da Interface**

### **🏪 Loja Pública**
- ✅ Cardápio personalizado por loja
- ✅ Sistema de busca e filtros
- ✅ Carrinho inteligente com customizações
- ✅ Modal de personalização de produtos
- ✅ Notificações de ações
- ✅ Tema dinâmico por loja
- ✅ Status de funcionamento (aberto/fechado)

### **📊 Dashboard Administrativo**
- ✅ Visão geral com métricas
- ✅ Gestão de produtos e categorias
- ✅ Controle de estoque em tempo real
- ✅ Gerenciamento de pedidos
- ✅ Cadastro de clientes
- ✅ Configurações da loja
- ✅ Relatórios de vendas
- ✅ Interface responsiva

### **👑 Painel Super Admin**
- ✅ Dashboard centralizado
- ✅ Gestão de todas as lojas
- ✅ Controle de usuários lojistas
- ✅ Analytics consolidadas
- ✅ Configurações globais

---

## 🛠️ **Scripts Disponíveis**

### **Desenvolvimento**
```bash
npm run dev          # Servidor de desenvolvimento + Prisma Studio
npm run dev:next     # Apenas servidor Next.js
npm run dev:studio   # Apenas Prisma Studio
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linter ESLint
```

### **Banco de Dados**
```bash
npm run db:setup     # Setup completo (criar tabelas + migrar dados)
npm run db:migrate   # Apenas migrar dados dos JSONs
npm run db:reset     # Reset completo e migração
npm run db:studio    # Interface visual do banco (Prisma Studio)
```

### **🔍 Prisma Studio - Interface Visual do Banco**

**🚀 Início Automático:**
```bash
npm run dev          # Abre Next.js + Prisma Studio automaticamente
```

**🔧 Comandos Individuais:**
```bash
npm run dev:studio   # Apenas Prisma Studio
npm run db:studio    # Alternativa
npx prisma studio    # Comando direto
```

**🌐 URLs de Acesso:**
- **Next.js:** http://localhost:3000
- **Prisma Studio:** http://localhost:5555

**✨ Funcionalidades do Prisma Studio:**
- 👀 **Visualizar** todas as tabelas
- ✏️ **Editar** dados diretamente
- 🔍 **Fazer consultas** SQL
- 📊 **Ver relacionamentos** entre tabelas
- ➕ **Adicionar** novos registros
- 🗑️ **Deletar** dados
- 🔄 **Atualizar** em tempo real
- 📋 **Filtrar** e ordenar dados

### **Usuários e Autenticação**
```bash
npm run create-dev-master  # Criar usuário master para desenvolvimento
npm run test-auth          # Testar fluxo de autenticação completo
```

### **Demo**
```bash
npm run demo         # Mostrar URLs e dados de teste
```

---

## 🚀 **Deploy em Produção**

### **Vercel (Recomendado)**
```bash
# 1. Conectar repositório no Vercel
# 2. Configurar variáveis de ambiente
# 3. Deploy automático

# Variáveis necessárias:
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="sua-chave-secreta"
NEXTAUTH_URL="https://seu-dominio.vercel.app"
```

### **Banco de Dados**
- **Supabase:** Gratuito até 500MB
- **Railway:** PostgreSQL gerenciado
- **PlanetScale:** MySQL serverless
- **Neon:** PostgreSQL serverless

---

## 📈 **Roadmap de Desenvolvimento**

### **✅ Fase 1: Infraestrutura (CONCLUÍDA)**
- ✅ Setup Prisma + PostgreSQL
- ✅ Autenticação com NextAuth
- ✅ Sistema multi-tenant
- ✅ Migração de dados
- ✅ Schema completo do banco

### **🚧 Fase 2: Controle de Estoque (EM DESENVOLVIMENTO)**
- 🔄 APIs de estoque (CRUD)
- 🔄 Interface de gestão no dashboard
- 🔄 Alertas de estoque baixo
- 🔄 Relatórios de movimentação

### **📅 Fase 3: Gestão de Clientes**
- 📋 CRUD completo de clientes
- 📋 Histórico de pedidos por cliente
- 📋 Segmentação por loja
- 📋 Sistema de preferências

### **📅 Fase 4: Painel Super Admin**
- 📋 Dashboard centralizado
- 📋 Gestão de lojistas
- 📋 Analytics consolidadas
- 📋 Configurações globais

### **📅 Fase 5: Funcionalidades Avançadas**
- 📋 Sistema de pagamento (Stripe)
- 📋 Notificações push
- 📋 Geolocalização
- 📋 Sistema de cupons
- 📋 Programa de fidelidade
- 📋 Analytics avançadas

---

## 🧪 **Testes**

### **Executar Testes**
```bash
npm run test         # Testes unitários
npm run test:e2e     # Testes end-to-end
npm run test:watch   # Modo watch
```

### **Testar Funcionalidades**
1. **Loja Pública:** Navegar no cardápio, adicionar ao carrinho
2. **Dashboard:** Login como lojista, gerenciar produtos
3. **Super Admin:** Login como admin, visualizar todas as lojas
4. **Banco de Dados:** `npm run db:studio` para ver dados

### **🔍 Visualizar Dados no Prisma Studio**
```bash
# Abrir interface visual do banco
npm run db:studio

# Acessar no navegador
http://localhost:5555
```

**Tabelas disponíveis:**
- 👥 `users` - Usuários do sistema
- 🏪 `stores` - Lojas cadastradas
- 🍔 `products` - Produtos do cardápio
- 📂 `categories` - Categorias de produtos
- 📦 `inventory` - Controle de estoque
- 👤 `customers` - Clientes das lojas
- 🛒 `orders` - Pedidos realizados

---

## 🤝 **Contribuição**

### **Como Contribuir**
1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

### **Padrões de Código**
- **TypeScript:** Código 100% tipado
- **ESLint:** Seguir regras configuradas
- **Prettier:** Formatação automática
- **Commits:** Conventional Commits

---

## 📚 **Documentação Adicional**

- 📖 **[Configuração do Banco](CONFIGURAR_BANCO.md)** - Setup detalhado PostgreSQL
- 🚀 **[Guia de Deploy](DEPLOY.md)** - Deploy em produção
- 🏗️ **[Arquitetura](ARQUITETURA.md)** - Detalhes técnicos
- 🧪 **[Testes](TESTES.md)** - Guia de testes
- 📊 **[Fase 1 Concluída](FASE1_CONCLUIDA.md)** - Resumo da implementação

---

## 🆘 **Suporte e Problemas**

### **Problemas Comuns**
- **Erro de banco:** Verificar credenciais no `.env.local`
- **Erro de build:** Executar `npm run build` para diagnóstico
- **Erro de auth:** Verificar `NEXTAUTH_SECRET` configurado
- **Dashboard 404:** Verificar se usuário tem role correto (ADMIN/SUPER_ADMIN)
- **Redirecionamento incorreto:** Verificar se lojista tem loja associada

### **Logs e Debug**
```bash
# Ver logs do banco
docker-compose logs postgres

# Debug do Prisma
DEBUG=prisma:* npm run dev

# Verificar variáveis
echo $DATABASE_URL
```

### **Contato**
- 🐛 **Issues:** Abra uma issue no GitHub
- 💬 **Discussões:** Use GitHub Discussions
- 📧 **Email:** suporte@cardap.io

---

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🙏 **Agradecimentos**

- Next.js team pelo framework incrível
- Prisma team pela excelente DX
- Vercel pela plataforma de deploy
- Comunidade open source

---

<div align="center">

**🍕 Feito com ❤️ para revolucionar o delivery de comida**

[⭐ Dar uma estrela](https://github.com/seu-usuario/delivery-app) • [🐛 Reportar Bug](https://github.com/seu-usuario/delivery-app/issues) • [✨ Solicitar Feature](https://github.com/seu-usuario/delivery-app/issues)

</div>