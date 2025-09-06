# Guia de Login por Telefone

Este documento descreve como funciona o novo sistema de autenticação por telefone implementado no projeto, similar ao sistema usado pelo Anota Aí.

## 🎯 Funcionalidades

### Para o Cliente
- **Login sem senha**: Apenas com número de telefone
- **Cadastro automático**: Se for primeira vez, conta é criada automaticamente
- **Formato brasileiro**: Suporte a números com DDD
- **Validação em tempo real**: Máscara de telefone e validação de formato
- **Interface amigável**: Modal responsivo com boa UX

### Para o Sistema
- **Criação automática de usuários**: Novos clientes são criados automaticamente
- **Atualização de dados**: Usuários existentes têm dados atualizados no login
- **JWT tokens**: Sistema de autenticação seguro mantido
- **Compatibilidade**: Funciona junto com sistema de login por email/senha existente

## 🏗️ Arquitetura

### Backend

#### Modelo de Dados
```prisma
model User {
  // ... outros campos
  phone String? @unique  // Telefone único e opcional
  email String? @unique  // Email agora opcional
  // ... resto do modelo
}
```

#### Endpoints
- `POST /auth/phone-login`: Endpoint para login/cadastro por telefone
  - Body: `{ phone: string, name?: string }`
  - Resposta: Token JWT e dados do usuário

#### Serviços
- `AuthService.loginByPhone()`: Cria ou atualiza usuário pelo telefone
- `UsersService.createOrUpdateByPhone()`: Lógica de criação/atualização
- `UsersService.findByPhone()`: Busca usuário pelo telefone

### Frontend

#### Componentes
- `PhoneLoginModal`: Modal de login por telefone
- Integração com `AuthContext` existente

#### API Client
- `apiClient.authenticateByPhone()`: Método para login por telefone
- Mantém compatibilidade com métodos existentes

## 🚀 Como Usar

### 1. Para Desenvolvedores

#### Importar o componente
```tsx
import { PhoneLoginModal } from "@/components/PhoneLoginModal";
```

#### Usar no componente
```tsx
const [isPhoneLoginOpen, setIsPhoneLoginOpen] = useState(false);
const { user, loginByPhone } = useAuthContext();

// No JSX
<PhoneLoginModal
  isOpen={isPhoneLoginOpen}
  onClose={() => setIsPhoneLoginOpen(false)}
  onSuccess={(authData) => {
    console.log("Login realizado:", authData);
    // Lógica após login bem-sucedido
  }}
  storeSlug="minha-loja" // opcional
/>
```

#### Usar diretamente o hook
```tsx
const { loginByPhone } = useAuthContext();

const handleLogin = async () => {
  try {
    const result = await loginByPhone("11999999999", "Nome do Cliente");
    console.log("Login realizado:", result);
  } catch (error) {
    console.error("Erro no login:", error);
  }
};
```

### 2. Para Usuários Finais

#### Processo de Login
1. Clicar em "Login" na página da loja
2. Digitar número de telefone (com DDD)
3. Opcionalmente, digitar nome
4. Clicar em "Entrar"
5. Sistema cria conta automaticamente se for primeira vez

#### Formato de Telefone
- **Aceita**: `11999999999`, `(11) 99999-9999`, `11 99999-9999`
- **Normaliza para**: `+5511999999999`
- **Valida**: 10-11 dígitos (DDD + número)

## 🔧 Configuração

### Variáveis de Ambiente (Backend)
Nenhuma configuração adicional necessária. O sistema usa as mesmas configurações JWT existentes.

### Banco de Dados
Execute a migration criada:
```bash
npx prisma migrate dev
```

## 🧪 Testes

### Testar Localmente
1. Inicie o backend: `npm run start:dev`
2. Inicie o frontend: `npm run dev`
3. Acesse uma loja: `http://localhost:3000/store/loja-exemplo`
4. Clique em "Login" e teste o fluxo

### Casos de Teste
- ✅ Novo usuário: cria conta automaticamente
- ✅ Usuário existente: faz login e atualiza lastLogin
- ✅ Telefone inválido: mostra erro de validação
- ✅ Telefone duplicado: funciona normalmente (login)
- ✅ Nome opcional: funciona com ou sem nome

## 🔒 Segurança

### Validações
- **Frontend**: Validação de formato e máscara
- **Backend**: Validação de formato e sanitização
- **Banco**: Constraint de telefone único

### Autenticação
- Mantém sistema JWT existente
- Tokens têm mesma validade que login por email
- Usuários criados têm role `CLIENTE` por padrão

## 📱 UX/UI

### Design
- Modal responsivo
- Máscara de telefone em tempo real
- Feedback visual para erros
- Loading states
- Acessibilidade (labels, focus, etc.)

### Fluxo
1. **Estado inicial**: Botão "Login"
2. **Modal aberto**: Campo telefone + nome opcional
3. **Validação**: Feedback em tempo real
4. **Loading**: Indicador durante requisição
5. **Sucesso**: Modal fecha + toast de boas-vindas
6. **Erro**: Mensagem de erro contextual

## 🔄 Compatibilidade

### Sistema Existente
- ✅ Login por email/senha continua funcionando
- ✅ Usuários existentes podem usar ambos os métodos
- ✅ Roles e permissões mantidas
- ✅ Lojas e associações preservadas

### Migração
Nenhuma migração de dados necessária. Usuários existentes podem começar a usar telefone imediatamente.

## 🐛 Troubleshooting

### Problemas Comuns

#### "Telefone deve ter pelo menos 10 dígitos"
- Verificar se está digitando DDD
- Remover caracteres especiais extras

#### "Erro ao fazer login"
- Verificar se backend está rodando
- Verificar logs do servidor para detalhes

#### Modal não abre
- Verificar se `isOpen` está sendo controlado corretamente
- Verificar imports do componente

### Logs Úteis
```bash
# Backend
tail -f logs/app.log

# Frontend (console do navegador)
Network > XHR > auth/phone-login
```

## 🚀 Próximos Passos

### Melhorias Futuras
- [ ] Verificação por SMS (opcional)
- [ ] Histórico de telefones por usuário
- [ ] Rate limiting para prevenir spam
- [ ] Integração com WhatsApp Business API
- [ ] Analytics de conversão por telefone

### Configurações Avançadas
- [ ] Configurar formatos de telefone por país
- [ ] Personalizar mensagens de erro
- [ ] Configurar timeout de sessão específico

