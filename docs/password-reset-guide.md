# Guia de Recuperação de Senha - Cardap

Este documento descreve como usar a funcionalidade de recuperação de senha implementada no sistema Cardap.

## Funcionalidades Implementadas

### 1. Solicitação de Recuperação de Senha

**Frontend:**
- Página dedicada: `/forgot-password`
- Modal reutilizável: `ForgotPasswordModal`
- Link na página de login

**Backend:**
- Endpoint: `POST /auth/request-password-reset`
- Gera token único com validade de 1 hora
- Envia email com link de recuperação

### 2. Redefinição de Senha

**Frontend:**
- Página dedicada: `/reset-password?token=<token>`
- Validação de senha com confirmação
- Redirecionamento para login após sucesso

**Backend:**
- Endpoint: `POST /auth/reset-password`
- Valida token e tempo de expiração
- Atualiza senha e limpa token

### 3. Alteração de Senha (Usuário Logado)

**Frontend:**
- Modal reutilizável: `ChangePasswordModal`
- Validação de senha atual
- Confirmação de nova senha

**Backend:**
- Endpoint: `POST /auth/change-password`
- Requer autenticação JWT
- Valida senha atual antes da alteração

## Como Usar

### Para Desenvolvedores

#### 1. Configurar Variáveis de Ambiente

No backend (`delivery-back/.env`):
```env
# Email de origem para envios
EMAIL_FROM="noreply@cardap.com.br"

# URL do frontend para links de recuperação
FRONTEND_URL="http://localhost:3000"

# Configurações SMTP (fallback se sendmail não disponível)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

#### 2. Instalar Sendmail (Recomendado)

**Ubuntu/Debian:**
```bash
sudo apt-get install sendmail
```

**macOS:**
```bash
# Sendmail geralmente já vem instalado
# Verificar se está funcionando:
echo "Test" | sendmail your-email@example.com
```

**CentOS/RHEL:**
```bash
sudo yum install sendmail
```

#### 3. Usar os Componentes

**Modal de Recuperação de Senha:**
```tsx
import { ForgotPasswordModal } from '@/components/ForgotPasswordModal';

function MyComponent() {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Esqueceu a senha?
      </button>
      
      <ForgotPasswordModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
}
```

**Modal de Alteração de Senha:**
```tsx
import { ChangePasswordModal } from '@/components/ChangePasswordModal';

function UserSettings() {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Alterar Senha
      </button>
      
      <ChangePasswordModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
}
```

### Para Usuários Finais

#### 1. Recuperar Senha Esquecida

1. Acesse a página de login
2. Clique em "Esqueceu a senha?"
3. Digite seu email e clique em "Enviar Instruções"
4. Verifique seu email (incluindo spam)
5. Clique no link recebido
6. Digite sua nova senha
7. Faça login com a nova senha

#### 2. Alterar Senha (Usuário Logado)

1. Acesse as configurações da conta
2. Clique em "Alterar Senha"
3. Digite sua senha atual
4. Digite a nova senha
5. Confirme a nova senha
6. Clique em "Alterar Senha"

## Segurança

### Medidas Implementadas

1. **Token de Reset:**
   - Gerado com `crypto.randomBytes(32)`
   - Válido por apenas 1 hora
   - Único por usuário (sobrescreve tokens anteriores)
   - Limpo após uso ou expiração

2. **Validações:**
   - Email deve existir no sistema
   - Token deve ser válido e não expirado
   - Senha atual deve ser correta (para alteração)
   - Nova senha deve ter pelo menos 6 caracteres

3. **Hash de Senhas:**
   - Usando bcrypt com 12 rounds
   - Senhas nunca são armazenadas em texto plano

4. **Rate Limiting:**
   - Recomenda-se implementar rate limiting nos endpoints
   - Especialmente em `/auth/request-password-reset`

### Boas Práticas

1. **Emails:**
   - Não revelar se o email existe ou não
   - Sempre mostrar mensagem de sucesso
   - Incluir aviso sobre verificar spam

2. **Tokens:**
   - Usar HTTPS em produção
   - Tokens devem ser únicos e imprevisíveis
   - Limpar tokens após uso

3. **UX:**
   - Feedback claro para o usuário
   - Loading states durante operações
   - Validação em tempo real

## Estrutura de Arquivos

### Backend
```
src/auth/
├── auth.service.ts          # Lógica de recuperação de senha
├── auth.controller.ts       # Endpoints REST
├── email.service.ts         # Serviço de envio de emails
├── auth.module.ts          # Módulo atualizado
└── dto/
    └── password-reset.dto.ts # DTOs para validação
```

### Frontend
```
app/
├── (auth)/
│   ├── forgot-password/page.tsx    # Página de solicitação
│   └── reset-password/page.tsx     # Página de redefinição
└── components/
    ├── ForgotPasswordModal.tsx     # Modal de solicitação
    └── ChangePasswordModal.tsx     # Modal de alteração
```

## Endpoints da API

### POST /auth/request-password-reset
```json
{
  "email": "user@example.com"
}
```

**Resposta:**
```json
{
  "message": "Se o email existir em nossa base, você receberá instruções para redefinir sua senha."
}
```

### POST /auth/reset-password
```json
{
  "token": "abc123...",
  "newPassword": "newpassword123"
}
```

**Resposta:**
```json
{
  "message": "Senha redefinida com sucesso!"
}
```

### POST /auth/change-password
**Requer:** Header `Authorization: Bearer <jwt-token>`

```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

**Resposta:**
```json
{
  "message": "Senha alterada com sucesso!"
}
```

## Troubleshooting

### Problemas Comuns

1. **Emails não chegam:**
   - Verificar configuração do sendmail
   - Verificar variáveis de ambiente
   - Verificar logs do backend
   - Testar configuração SMTP como fallback

2. **Token inválido:**
   - Verificar se o token não expirou (1 hora)
   - Verificar se o token não foi usado anteriormente
   - Verificar se o usuário existe

3. **Erro de compilação:**
   - Executar `npx prisma generate` após mudanças no schema
   - Verificar se todas as dependências estão instaladas

### Logs Úteis

O sistema gera logs detalhados:
- ✅ Sucesso no envio de emails
- ❌ Erros de configuração
- 📧 Fallback para SMTP
- 🔒 Tentativas de reset

## Próximos Passos

### Melhorias Sugeridas

1. **Rate Limiting:**
   - Implementar limite de tentativas por IP
   - Limite de solicitações por email

2. **Templates de Email:**
   - Melhorar design dos templates
   - Adicionar mais informações contextuais

3. **Auditoria:**
   - Log de tentativas de reset
   - Notificação de alterações de senha

4. **Testes:**
   - Testes unitários para os serviços
   - Testes de integração para os endpoints
   - Testes E2E para o fluxo completo

## Suporte

Para dúvidas ou problemas:
1. Verificar os logs do backend
2. Consultar este documento
3. Verificar configurações de email
4. Testar endpoints via Postman/Insomnia
