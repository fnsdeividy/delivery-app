# 🔐 Configuração de Sessão ADMIN - 2 Horas

## 📋 **Resumo das Alterações**

Implementamos configurações para manter usuários ADMIN logados no dashboard por **2 horas (7200 segundos)** em vez de 30 dias, melhorando a segurança do sistema.

## 🎯 **Arquivos Modificados**

### **Frontend (delivery-app/)**

#### 1. **`lib/auth.ts`**

- **Sessão NextAuth**: Alterado de 30 dias para 2 horas
- **Cookie**: Expiração alterada de 24 horas para 2 horas
- **Configuração**: `maxAge: 2 * 60 * 60` (7200 segundos)

#### 2. **`hooks/useTokenSync.ts`**

- **Sincronização de Token**: Cookie com expiração de 2 horas
- **Consistência**: Mantém sincronização entre localStorage e cookies

#### 3. **`lib/api-client.ts`**

- **Cookie de Autenticação**: Expiração de 2 horas
- **Segurança**: Configurações robustas de cookie

#### 4. **`scripts/test-token-persistence.js`**

- **Teste de Persistência**: Ajustado para 2 horas

### **Backend (delivery-back/)**

#### 1. **`env.example`**

- **JWT_EXPIRES_IN**: `"2h"` (2 horas)
- **SESSION_TTL**: `7200` (2 horas em segundos)

#### 2. **`env.local.example`**

- **JWT_EXPIRES_IN**: `"2h"` (2 horas)
- **SESSION_TTL**: `7200` (2 horas em segundos)

#### 3. **`env.production.example`**

- **JWT_EXPIRES_IN**: `"2h"` (2 horas)
- **SESSION_TTL**: `7200` (2 horas em segundos)

## ⚙️ **Configurações Técnicas**

### **Tempos de Expiração**

- **JWT Token**: 2 horas (7200 segundos)
- **Sessão NextAuth**: 2 horas (7200 segundos)
- **Cookies**: 2 horas (7200 segundos)
- **Sessões Backend**: 2 horas (7200 segundos)

### **Formato de Tempo**

- **Backend**: `"2h"` (formato JWT padrão)
- **Frontend**: `2 * 60 * 60` (7200 segundos)

## 🔒 **Benefícios de Segurança**

1. **Redução de Risco**: Tokens expiram mais rapidamente
2. **Sessões Curtas**: Menor janela de vulnerabilidade
3. **Consistência**: Mesmo tempo em todas as camadas
4. **Compliance**: Adequado para ambientes corporativos

## 🚀 **Como Aplicar**

### **1. Backend**

```bash
cd delivery-back
# Copiar arquivo de exemplo
cp env.example .env
# Reiniciar aplicação
npm run start:dev
```

### **2. Frontend**

```bash
cd delivery-app
# Reiniciar aplicação
npm run dev
```

## 📝 **Notas Importantes**

- **Reinicialização Necessária**: Backend e frontend devem ser reiniciados
- **Usuários Existentes**: Serão deslogados automaticamente após 2 horas
- **Desenvolvimento**: Configuração aplicada em todos os ambientes
- **Produção**: Mesma configuração para consistência

## 🔍 **Verificação**

Para verificar se as configurações estão funcionando:

1. **Login como ADMIN**
2. **Aguardar 2 horas**
3. **Verificar se foi deslogado automaticamente**
4. **Confirmar redirecionamento para login**

## 🛠️ **Troubleshooting**

### **Problema**: Usuário não é deslogado após 2 horas

**Solução**: Verificar se todos os arquivos foram atualizados e aplicação reiniciada

### **Problema**: Sessão expira muito rapidamente

**Solução**: Verificar configurações de ambiente e reiniciar aplicação

### **Problema**: Inconsistência entre frontend e backend

**Solução**: Garantir que ambos usem a mesma configuração de tempo

## 📚 **Referências**

- [NextAuth.js Session Configuration](https://next-auth.js.org/configuration/options#session)
- [JWT Expiration Formats](https://github.com/auth0/node-jsonwebtoken#usage)
- [Cookie max-age Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#max-age)
