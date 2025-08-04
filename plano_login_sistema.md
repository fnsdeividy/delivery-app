# 🔐 Plano de Implementação - Sistema de Login

## 📋 Resumo da Alteração

Implementar sistema de autenticação completo que impede usuários não logados de finalizar pedidos, usando Context API + localStorage, com modal de login sobrepondo o checkout e funcionalidades de login, registro e autenticação social.

## 🎯 Objetivos

### Objetivo Principal
- **Proteger checkout**: Apenas usuários logados podem finalizar pedidos
- **UX fluida**: Modal de login preserva carrinho e contexto do checkout

### Objetivos Secundários  
- Sistema de autenticação persistente
- Login social (Google/Facebook)
- Gerenciamento de estado global de usuário
- Integração com sistema de perfil existente

## 🏗️ Arquitetura da Solução

### 1. **Context API para Estado Global**
```typescript
AuthContext {
  user: User | null
  isAuthenticated: boolean
  login: (credentials) => Promise<void>
  loginWithGoogle: () => Promise<void> 
  loginWithFacebook: () => Promise<void>
  register: (userData) => Promise<void>
  logout: () => void
  loading: boolean
}
```

### 2. **Componentes Novos**
- `components/LoginModal.tsx` - Modal principal de login
- `components/auth/LoginForm.tsx` - Formulário de login
- `components/auth/RegisterForm.tsx` - Formulário de registro
- `components/auth/SocialLogin.tsx` - Botões login social
- `contexts/AuthContext.tsx` - Context de autenticação
- `hooks/useAuth.tsx` - Hook customizado para auth

### 3. **Modificações em Componentes Existentes**
- `app/page.tsx` - Wrapper com AuthProvider
- `components/CheckoutModal.tsx` - Verificação de auth
- `components/UserProfile.tsx` - Botão logout + dados dinâmicos
- Header (em `app/page.tsx`) - Botão Login/Perfil condicional

## 🔄 Fluxo de Autenticação

### **Fluxo Principal**
1. **Usuário não logado** clica "Finalizar Pedido"
2. **CheckoutModal detecta** usuário não autenticado
3. **LoginModal sobrepõe** o CheckoutModal (mantém dados)
4. **Usuário faz login/registro** com sucesso
5. **LoginModal fecha**, CheckoutModal volta ao foco
6. **Usuário continua** o checkout normalmente

### **Estados de Interface**
```typescript
// Header - Condicional
{isAuthenticated ? (
  <button onClick={() => setIsProfileOpen(true)}>
    <User /> Perfil
  </button>
) : (
  <button onClick={() => setIsLoginOpen(true)}>
    <User /> Login  
  </button>
)}
```

### **Persistência**
- `localStorage.setItem('auth_user', JSON.stringify(user))`
- Verificação automática no carregamento da página
- Token/sessão persiste entre refreshes

## 📱 Especificações dos Componentes

### **LoginModal.tsx**
```typescript
interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void // Callback para fechar e continuar checkout
}

// Features:
- Tabs: Login / Registro
- Validação de formulários
- Loading states
- Error handling
- Social login buttons
- Responsive design
```

### **AuthContext.tsx**
```typescript
// Responsabilidades:
- Gerenciar estado do usuário logado
- Persistir dados no localStorage
- Simular autenticação (mock API calls)
- Integrar com mockUser data
- Loading/error states
- Auto-logout (opcional)
```

### **Modificação CheckoutModal.tsx**
```typescript
// Adicionar verificação:
const { isAuthenticated } = useAuth()
const [showLogin, setShowLogin] = useState(false)

const handleSubmit = (e) => {
  e.preventDefault()
  
  if (!isAuthenticated) {
    setShowLogin(true)
    return
  }
  
  // Continuar com checkout normal...
}

// Renderizar LoginModal condicionalmente
{showLogin && (
  <LoginModal 
    isOpen={showLogin}
    onClose={() => setShowLogin(false)}
    onSuccess={() => {
      setShowLogin(false)
      // Checkout continua automaticamente
    }}
  />
)}
```

## 🔧 Implementação Técnica

### **1. Context + localStorage**
- **SOLID**: Single Responsibility - Context só gerencia auth
- **Clean Architecture**: Separação de concerns
- **DRY**: Hook customizado reutilizável

### **2. Mock Authentication**
```typescript
// Simular delay de API
const mockLogin = async (email: string, password: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const user = mockUsers.find(u => u.email === email)
  if (!user || password !== 'demo123') {
    throw new Error('Credenciais inválidas')
  }
  
  return user
}
```

### **3. Social Login (Mock)**
```typescript
// Simular Google/Facebook OAuth
const mockSocialLogin = async (provider: 'google' | 'facebook') => {
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // Retornar usuário mock baseado no provider
  return {
    ...mockUser,
    email: `user@${provider}.com`,
    name: `Usuário ${provider}`
  }
}
```

## 📋 Lista de Tarefas

### **Fase 1: Core Authentication**
- [ ] Criar AuthContext com todas as funções
- [ ] Implementar hook useAuth
- [ ] Criar sistema de persistência localStorage
- [ ] Integrar com dados mockUser existentes

### **Fase 2: UI Components**  
- [ ] Criar LoginModal com design responsivo
- [ ] Implementar LoginForm com validação
- [ ] Implementar RegisterForm com validação
- [ ] Criar SocialLogin buttons

### **Fase 3: Integração**
- [ ] Modificar CheckoutModal para verificar auth
- [ ] Atualizar Header com botão condicional
- [ ] Adicionar logout no UserProfile
- [ ] Testar fluxo completo

### **Fase 4: Polimento**
- [ ] Loading states em todos os componentes
- [ ] Error handling e mensagens
- [ ] Animações de transição
- [ ] Testes manuais completos

## 🎨 Design System

### **Cores (seguindo padrão existente)**
- Primary: `text-orange-500`, `bg-orange-500`
- Borders: `border-orange-500` 
- Focus: `focus:ring-orange-500`
- Success: `text-green-600`, `bg-green-50`
- Error: `text-red-600`, `bg-red-50`

### **Layout**
- Modal com `max-w-md` (menor que checkout)
- Tabs superiores para Login/Registro
- Social buttons com ícones
- Formulários com validação visual
- Responsivo mobile-first

## 🔒 Segurança (Mock)

### **Validações**
- Email format validation
- Password strength (mínimo 6 chars)
- Campos obrigatórios
- Rate limiting simulado

### **Dados Sensíveis**
- Senhas não persistidas (apenas demo)
- Dados em localStorage (development only)
- Sanitização de inputs

## 📊 Métricas de Sucesso

### **Funcionais**
- ✅ Usuário não logado é bloqueado no checkout
- ✅ Login preserva contexto do carrinho
- ✅ Logout limpa dados e volta ao estado inicial
- ✅ Registro cria nova conta funcional
- ✅ Social login funciona (simulado)

### **UX**
- ✅ Transições fluidas entre modals
- ✅ Loading states informativos
- ✅ Mensagens de erro claras
- ✅ Design consistente com app
- ✅ Responsividade mobile

## 🚀 Próximos Passos

1. **Aprovar este plano** ✋
2. **Implementar Fase 1** (Core Auth)
3. **Implementar Fase 2** (UI Components) 
4. **Implementar Fase 3** (Integração)
5. **Implementar Fase 4** (Polimento)
6. **Testes completos** e ajustes finais

---

**Estimativa de implementação**: 4-6 horas de desenvolvimento
**Complexidade**: Média (seguindo padrões estabelecidos)
**Impacto**: Alto (funcionalidade crítica para negócio)