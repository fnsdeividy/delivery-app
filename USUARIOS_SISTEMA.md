# 👥 **Sistema de Usuários - Cardap.IO**

## 🔐 **Tipos de Usuários Disponíveis**

### **👑 SUPER_ADMIN (Master)**
- **Descrição:** Usuário com acesso total ao sistema
- **Permissões:** 
  - ✅ Gerenciar todas as lojas
  - ✅ Criar/editar/excluir usuários
  - ✅ Acessar analytics consolidadas
  - ✅ Configurações globais do sistema
- **Acesso:** `/admin` e `/login/super-admin`

### **🏪 ADMIN (Lojista)**
- **Descrição:** Proprietário ou administrador de uma loja específica
- **Permissões:**
  - ✅ Gerenciar apenas sua loja
  - ✅ Produtos e categorias
  - ✅ Pedidos e clientes
  - ✅ Configurações da loja
  - ✅ Estoque e relatórios
- **Acesso:** `/dashboard/[slug]` e `/login/lojista`

### **👨‍💼 MANAGER (Gerente)**
- **Descrição:** Gerente de uma loja específica
- **Permissões:**
  - ✅ Gerenciar produtos e pedidos
  - ✅ Atender clientes
  - ❌ Configurações críticas da loja
- **Acesso:** `/dashboard/[slug]` (limitado)

### **👷‍♂️ EMPLOYEE (Funcionário)**
- **Descrição:** Funcionário de uma loja
- **Permissões:**
  - ✅ Visualizar pedidos
  - ✅ Atualizar status de pedidos
  - ❌ Gerenciar produtos
  - ❌ Configurações
- **Acesso:** `/dashboard/[slug]` (muito limitado)

### **👤 CLIENTE (Cliente Final)**
- **Descrição:** Cliente que faz pedidos
- **Permissões:**
  - ✅ Fazer pedidos
  - ✅ Visualizar histórico
  - ✅ Gerenciar perfil
- **Acesso:** `/login` e lojas públicas

---

## 🛠️ **Usuários para Desenvolvimento**

### **👑 Master Developer**
```
📧 Email: dev@cardap.io
🔑 Senha: dev123456
🛡️  Role: SUPER_ADMIN
🌐 URL: http://localhost:3000/login/super-admin
```

**Criação:**
```bash
npm run create-dev-master
```

### **🧪 Usuários de Teste**
```
👤 CLIENTE TESTE:
📧 Email: cliente.teste@email.com
🔑 Senha: senha123

🏪 LOJISTA TESTE:
📧 Email: lojista.teste@email.com
🔑 Senha: senha123
🏪 Loja: loja-teste
```

**Criação:**
```bash
npm run test-auth
```

---

## 📊 **Usuários Migrados (Demo)**

### **🏪 Boteco do João**
```
📧 Email: admin@boteco.com
🔑 Senha: 123456
🛡️  Role: ADMIN
🏪 Slug: boteco-do-joao
🌐 Dashboard: http://localhost:3000/dashboard/boteco-do-joao
🌐 Loja: http://localhost:3000/store/boteco-do-joao
```

### **📊 Super Admin Original**
```
📧 Email: superadmin@cardap.io
🔑 Senha: admin123
🛡️  Role: SUPER_ADMIN
🌐 URL: http://localhost:3000/login/super-admin
```

### **👤 Cliente Demo**
```
📧 Email: cliente@teste.com
🔑 Senha: 123456
🛡️  Role: CLIENTE
🌐 URL: http://localhost:3000/login
```

---

## 🔄 **Fluxo de Registro**

### **📝 Registro de Cliente**
1. **URL:** `/register`
2. **Campos:** Nome, email, senha, telefone (opcional)
3. **Processo:**
   - Validação de dados
   - Hash da senha (bcrypt)
   - Criação no banco (`role: CLIENTE`)
   - Redirecionamento para login

### **🏪 Registro de Lojista**
1. **URL:** `/register/loja`
2. **Etapas:**
   - **Passo 1:** Dados do proprietário
   - **Passo 2:** Dados da loja + endereço
   - **Passo 3:** Confirmação
3. **Processo:**
   - Validação completa
   - Criação da loja no banco
   - Criação do usuário (`role: ADMIN`)
   - Geração do arquivo de configuração
   - Redirecionamento para login

---

## 🔑 **Sistema de Autenticação**

### **🛡️ NextAuth.js + Prisma**
- **Provider:** Credentials
- **Adapter:** PrismaAdapter
- **Session:** JWT (30 dias)
- **Hash:** bcrypt (12 rounds)

### **🔐 Middleware de Proteção**
- **Dashboard:** Apenas ADMIN e SUPER_ADMIN
- **Super Admin:** Apenas SUPER_ADMIN
- **Multi-tenant:** Lojistas só acessam sua loja

### **📋 Dados da Sessão**
```typescript
interface Session {
  user: {
    id: string
    email: string
    name: string
    role: UserRole
    storeSlug?: string
    active: boolean
  }
}
```

---

## 🧪 **Scripts de Gerenciamento**

### **📋 Comandos Disponíveis**
```bash
# Criar usuário master para dev
npm run create-dev-master

# Testar fluxo completo de autenticação
npm run test-auth

# Setup completo do banco com usuários demo
npm run db:setup

# Visualizar banco de dados
npm run db:studio

# Reset completo
npm run db:reset
```

### **🔍 Verificar Usuários**
```bash
# Abrir Prisma Studio
npm run db:studio

# Ir para tabela 'users'
# Visualizar todos os usuários criados
```

---

## 🚀 **APIs de Registro**

### **👤 Cliente: POST `/api/auth/register`**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "phone": "+55 11 99999-9999",
  "userType": "cliente"
}
```

### **🏪 Lojista: POST `/api/auth/register/loja`**
```json
{
  "ownerName": "Maria Santos",
  "ownerEmail": "maria@restaurante.com",
  "ownerPhone": "+55 11 98888-8888",
  "password": "senha123",
  "storeName": "Restaurante da Maria",
  "storeSlug": "restaurante-da-maria",
  "category": "Restaurante",
  "description": "Comida caseira deliciosa",
  "address": "Rua das Flores, 123",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234-567",
  "deliveryEnabled": true,
  "deliveryFee": "5.00",
  "minimumOrder": "25.00"
}
```

---

## 📈 **Status Atual**

| Funcionalidade | Status |
|----------------|--------|
| ✅ **Criação de usuários** | IMPLEMENTADO |
| ✅ **Hash de senhas** | IMPLEMENTADO |
| ✅ **Autenticação** | IMPLEMENTADO |
| ✅ **Multi-tenant** | IMPLEMENTADO |
| ✅ **Middleware de proteção** | IMPLEMENTADO |
| ✅ **APIs de registro** | IMPLEMENTADO |
| ✅ **Usuário master** | IMPLEMENTADO |
| ✅ **Scripts de teste** | IMPLEMENTADO |

---

## ⚠️ **Importante para Produção**

### **🔒 Segurança**
- ✅ Senhas hasheadas com bcrypt
- ✅ Validação de dados
- ✅ Proteção contra ataques
- ⚠️ Alterar senha do usuário master
- ⚠️ Configurar variáveis de ambiente
- ⚠️ Usar HTTPS em produção

### **🛠️ Configuração**
```env
# .env.local
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="sua-chave-secreta-muito-segura"
NEXTAUTH_URL="https://seu-dominio.com"
```

---

**🎉 Sistema de usuários implementado com dados reais salvos no banco PostgreSQL!**