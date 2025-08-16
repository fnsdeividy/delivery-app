# Plano de Conexão da Tela de Login ao Backend

## Objetivo
Conectar a tela de login do frontend Next.js ao backend NestJS, garantindo autenticação JWT funcional e redirecionamento correto baseado no role do usuário.

## Análise Atual

### Frontend (Next.js)
- ✅ Tela de login implementada com `useCardapioAuth` hook
- ✅ Cliente API configurado (`apiClient`)
- ✅ Tratamento de erros robusto
- ✅ Redirecionamento baseado em role
- ✅ Configuração de ambiente para `NEXT_PUBLIC_CARDAPIO_API_URL`

### Backend (NestJS)
- ✅ Sistema de autenticação com JWT
- ✅ Estratégia local (email/password)
- ✅ Validação de usuário com bcrypt
- ✅ Rota `/auth/login` funcional
- ✅ Configuração de CORS

## Problemas Identificados

1. **Mismatch de Rotas**: Frontend tenta `/api/v1/auth/login`, backend expõe `/auth/login`
2. **Configuração de CORS**: Backend não está configurado para aceitar requisições do frontend na porta 3001
3. **Estrutura de Resposta**: Backend retorna dados no formato correto, mas pode haver incompatibilidade

## Soluções Propostas

### 1. Ajustar Configuração de CORS no Backend
- Adicionar `http://localhost:3001` às origens permitidas
- Configurar CORS para aceitar credenciais

### 2. Padronizar Estrutura de Rotas
- Opção A: Adicionar prefixo `/api/v1` no backend
- Opção B: Ajustar frontend para usar `/auth/login`
- **Recomendação**: Opção A (manter padrão RESTful)

### 3. Verificar Compatibilidade de Dados
- Validar se o backend aceita `storeSlug` opcional
- Garantir que a resposta `AuthResponse` seja compatível

### 4. Testar Fluxo Completo
- Login com usuário válido
- Validação de token JWT
- Redirecionamento baseado em role
- Tratamento de erros

## Implementação

### Fase 1: Configuração do Backend
1. Ajustar CORS para aceitar frontend
2. Adicionar prefixo `/api/v1` às rotas
3. Verificar validação de dados de entrada

### Fase 2: Teste de Integração
1. Testar endpoint de login
2. Validar formato de resposta
3. Testar autenticação JWT

### Fase 3: Teste do Frontend
1. Testar login com credenciais válidas
2. Validar redirecionamento
3. Testar tratamento de erros

## Arquivos a Modificar

### Backend
- `src/main.ts` - Configuração de CORS
- `src/app.module.ts` - Prefixo global de rotas
- `src/auth/auth.controller.ts` - Verificar estrutura de dados

### Frontend
- `env.example` - Atualizar URL da API
- `lib/api-client.ts` - Verificar compatibilidade de dados

## Testes Necessários

1. **Teste Unitário**: Validação de dados de entrada
2. **Teste de Integração**: Endpoint de login
3. **Teste E2E**: Fluxo completo de login
4. **Teste de Segurança**: Validação de JWT

## Critérios de Sucesso

- ✅ Login funcional com credenciais válidas
- ✅ Token JWT gerado e armazenado
- ✅ Redirecionamento correto baseado em role
- ✅ Tratamento adequado de erros
- ✅ CORS configurado corretamente
- ✅ Testes passando

## Próximos Passos

1. Implementar ajustes no backend
2. Testar endpoints
3. Validar integração frontend-backend
4. Executar testes automatizados
5. Documentar mudanças 