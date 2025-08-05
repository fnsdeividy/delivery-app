# 🗄️ **Setup do Banco de Dados - Cardap.IO**

## 📋 **Pré-requisitos**

### 1. **PostgreSQL Instalado**
- **Local:** PostgreSQL 12+ rodando em `localhost:5432`
- **Cloud:** Supabase, Railway, PlanetScale ou similar
- **Docker:** `docker run --name cardapio-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=delivery_app -p 5432:5432 -d postgres:15`

### 2. **Variáveis de Ambiente**
Copie o arquivo de exemplo e configure suas credenciais:
```bash
cp env.local.example .env.local
```

**Configuração mínima necessária:**
```env
# .env.local
DATABASE_URL="postgresql://username:password@localhost:5432/delivery_app?schema=public"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 🚀 **Instalação Automática**

### **Opção 1: Setup Completo (Recomendado)**
```bash
# Instalar dependências
npm install

# Setup automático do banco
npm run db:setup
```

Este comando irá:
- ✅ Criar todas as tabelas do banco
- ✅ Gerar cliente Prisma
- ✅ Migrar dados dos JSONs existentes
- ✅ Criar usuários de teste

### **Opção 2: Passo a Passo**
```bash
# 1. Gerar cliente Prisma
npx prisma generate

# 2. Criar tabelas
npx prisma migrate dev --name init

# 3. Migrar dados
npm run db:migrate
```

---

## 📊 **Comandos Úteis**

### **Gerenciamento do Banco**
```bash
# Visualizar dados (Prisma Studio)
npm run db:studio

# Reset completo do banco
npm run db:reset

# Apenas migrar dados novamente
npm run db:migrate

# Ver status das migrations
npx prisma migrate status
```

### **Desenvolvimento**
```bash
# Gerar cliente após mudanças no schema
npx prisma generate

# Criar nova migration
npx prisma migrate dev --name nome-da-migration

# Deploy em produção
npx prisma migrate deploy
```

---

## 👤 **Usuários de Teste Criados**

Após o setup, você terá estes usuários disponíveis:

### **🔑 Super Admin**
- **Email:** `superadmin@cardap.io`
- **Senha:** `admin123`
- **Acesso:** Painel administrativo completo

### **🏪 Lojista (Boteco do João)**
- **Email:** `admin@boteco.com`
- **Senha:** `123456`
- **Loja:** `boteco-do-joao`
- **Acesso:** Dashboard da loja

### **👤 Cliente**
- **Email:** `cliente@teste.com`
- **Senha:** `123456`
- **Acesso:** Fazer pedidos na loja

---

## 📁 **Estrutura do Banco**

### **Principais Tabelas**
- `users` - Usuários do sistema (clientes, lojistas, admin)
- `stores` - Lojas (multi-tenant)
- `products` - Produtos do cardápio
- `categories` - Categorias de produtos
- `inventory` - Controle de estoque
- `stock_movements` - Movimentações de estoque
- `customers` - Dados de clientes por loja
- `orders` - Pedidos realizados
- `order_items` - Itens dos pedidos

### **Relacionamentos**
- Cada loja (`stores`) tem seus próprios produtos, clientes e pedidos
- Usuários podem ser associados a lojas específicas (lojistas)
- Sistema de estoque vinculado aos produtos
- Histórico completo de movimentações

---

## 🔧 **Troubleshooting**

### **Erro: "database does not exist"**
```bash
# Criar banco manualmente
createdb delivery_app

# Ou via SQL
psql -c "CREATE DATABASE delivery_app;"
```

### **Erro: "relation does not exist"**
```bash
# Resetar migrations
npx prisma migrate reset
npm run db:setup
```

### **Erro: "P1001: Can't reach database server"**
- Verificar se PostgreSQL está rodando
- Conferir URL de conexão no `.env.local`
- Testar conexão: `psql postgresql://username:password@localhost:5432/delivery_app`

### **Erro de permissão**
```bash
# Dar permissões ao usuário
psql -c "GRANT ALL PRIVILEGES ON DATABASE delivery_app TO username;"
```

---

## 🌐 **Deploy em Produção**

### **Supabase (Recomendado)**
1. Criar projeto no [Supabase](https://supabase.com)
2. Copiar string de conexão
3. Configurar variável `DATABASE_URL`
4. Executar: `npx prisma migrate deploy`

### **Railway**
1. Criar projeto no [Railway](https://railway.app)
2. Adicionar PostgreSQL addon
3. Configurar variáveis de ambiente
4. Deploy automático via GitHub

### **Vercel + PlanetScale**
1. Criar banco no [PlanetScale](https://planetscale.com)
2. Configurar no Vercel
3. Usar `prisma migrate deploy` no build

---

## 📚 **Próximos Passos**

Após o setup do banco, você pode:

1. **🚀 Iniciar aplicação:** `npm run dev`
2. **🏪 Testar loja:** `http://localhost:3000/store/boteco-do-joao`
3. **📊 Acessar dashboard:** `http://localhost:3000/login/lojista`
4. **👑 Painel admin:** `http://localhost:3000/login/super-admin`
5. **📈 Ver dados:** `npm run db:studio`

---

**✅ Banco configurado com sucesso! Agora você pode usar toda a funcionalidade do Cardap.IO com persistência real.**