# 🗄️ **Configurar Banco de Dados PostgreSQL**

## 🚀 **Opção 1: Docker (Recomendado - Mais Fácil)**

### **1. Iniciar PostgreSQL no Docker**
```bash
# Iniciar banco PostgreSQL
docker-compose up -d postgres

# Verificar se está rodando
docker ps
```

### **2. Configurar variáveis de ambiente**
Crie o arquivo `.env.local` com estas credenciais:
```bash
cp env.local.example .env.local
```

Edite `.env.local` e use:
```env
# Configuração para Docker
DATABASE_URL="postgresql://cardapio_user:cardapio_123@localhost:5432/delivery_app?schema=public"
NEXTAUTH_SECRET="sabor-express-secret-key-2024"
NEXTAUTH_URL="http://localhost:3000"
```

### **3. Executar setup**
```bash
npm run db:setup
```

---

## 🖥️ **Opção 2: PostgreSQL Local**

### **1. Instalar PostgreSQL**
```bash
# macOS (Homebrew)
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Windows
# Baixar do site oficial: https://www.postgresql.org/download/
```

### **2. Criar banco e usuário**
```bash
# Conectar como superuser
psql postgres

# No prompt do PostgreSQL:
CREATE DATABASE delivery_app;
CREATE USER cardapio_user WITH ENCRYPTED PASSWORD 'sua_senha_aqui';
GRANT ALL PRIVILEGES ON DATABASE delivery_app TO cardapio_user;
\q
```

### **3. Configurar .env.local**
```env
DATABASE_URL="postgresql://cardapio_user:sua_senha_aqui@localhost:5432/delivery_app?schema=public"
NEXTAUTH_SECRET="sabor-express-secret-key-2024"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 🌐 **Opção 3: Banco em Nuvem (Supabase)**

### **1. Criar projeto no Supabase**
1. Acesse [supabase.com](https://supabase.com)
2. Crie novo projeto
3. Anote a string de conexão

### **2. Configurar .env.local**
```env
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@[SEU-HOST]:5432/postgres?schema=public"
NEXTAUTH_SECRET="sabor-express-secret-key-2024"
NEXTAUTH_URL="http://localhost:3000"
```

---

## ✅ **Após Configurar - Executar Setup**

```bash
# Setup completo
npm run db:setup

# Se der erro, resetar e tentar novamente
npm run db:reset
```

---

## 🔧 **Comandos Úteis**

### **Docker**
```bash
# Parar banco
docker-compose down

# Ver logs
docker-compose logs postgres

# Backup
docker exec cardapio-db pg_dump -U cardapio_user delivery_app > backup.sql
```

### **PostgreSQL Local**
```bash
# Conectar ao banco
psql -U cardapio_user -d delivery_app -h localhost

# Backup
pg_dump -U cardapio_user delivery_app > backup.sql
```

---

## 📊 **Interface Gráfica (Opcional)**

### **pgAdmin via Docker**
```bash
# Iniciar pgAdmin
docker-compose up -d pgadmin

# Acessar: http://localhost:8080
# Email: admin@cardapio.com
# Senha: admin123
```

### **Prisma Studio**
```bash
# Interface do Prisma (após setup)
npm run db:studio
```

---

## 🆘 **Solução de Problemas**

### **"Authentication failed"**
- Verificar credenciais no `.env.local`
- Testar conexão: `psql "postgresql://user:pass@localhost:5432/delivery_app"`

### **"database does not exist"**
```bash
# Criar banco manualmente
createdb -U postgres delivery_app
```

### **"Connection refused"**
- PostgreSQL não está rodando
- Verificar porta 5432
- Docker: `docker-compose ps`

---

**🎯 Escolha a opção que preferir e execute o setup!**