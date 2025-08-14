# Plano de Correção - Problema de Redirecionamento após Login

## Resumo do Problema
Usuário não é redirecionado para o dashboard após login bem-sucedido devido a conflitos entre sistemas de autenticação e problemas de implementação.

## Problemas Identificados

### 1. Conflito de Sistemas de Autenticação
- **Frontend**: Usa JWT customizado via `useCardapioAuth`
- **Middleware**: Configurado para NextAuth.js
- **Resultado**: Middleware não reconhece tokens JWT customizados

### 2. Incompatibilidade de Status HTTP
- **Backend**: Retorna 201 Created para login
- **Frontend**: Espera 200 OK (padrão REST)
- **Resultado**: Possível falha na validação de resposta

### 3. Falta de storeSlug no Token
- **Token JWT**: Não contém storeSlug necessário para redirecionamento
- **Redirecionamento**: Falha ao tentar construir URL do dashboard

## Solução Proposta

### Fase 1: Padronização do Backend
- Alterar status de retorno do login de 201 para 200
- Garantir que o token JWT contenha storeSlug
- Validar estrutura da resposta de autenticação

### Fase 2: Correção do Frontend
- Ajustar `useCardapioAuth` para aceitar status 201 e 200
- Implementar fallback para storeSlug quando não presente no token
- Melhorar tratamento de erros e logging

### Fase 3: Correção do Middleware
- Refatorar middleware para trabalhar com JWT customizado
- Remover dependências do NextAuth.js
- Implementar validação JWT própria

### Fase 4: Testes e Validação
- Testes unitários para hooks de autenticação
- Testes de integração para fluxo completo
- Validação de redirecionamento em diferentes cenários

## Arquivos a Modificar

### Backend
- `src/auth/auth.service.ts` - Ajustar status de retorno
- `src/auth/auth.controller.ts` - Validar resposta

### Frontend
- `hooks/useCardapioAuth.ts` - Melhorar tratamento de resposta
- `lib/api-client.ts` - Ajustar validação de status
- `middleware.ts` - Refatorar para JWT customizado

## Critérios de Aceite
- [ ] Login retorna status 200 OK
- [ ] Token JWT contém storeSlug
- [ ] Usuário é redirecionado corretamente após login
- [ ] Middleware protege rotas adequadamente
- [ ] Testes unitários passando
- [ ] Testes de integração validados

## Estimativa de Tempo
- **Desenvolvimento**: 4-6 horas
- **Testes**: 2-3 horas
- **Total**: 6-9 horas

## Riscos
- **Baixo**: Mudanças são principalmente em lógica de negócio
- **Médio**: Refatoração do middleware pode afetar outras funcionalidades
- **Mitigação**: Testes abrangentes e implementação incremental