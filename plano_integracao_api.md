# 🔗 Plano de Integração API - Delivery App

## 📊 Situação Atual

### Frontend (delivery-app - Porta 3000)
- ✅ Next.js 14 com App Router
- ✅ Cliente API já implementado (`lib/api-client.ts`)
- ✅ React Query configurado
- ✅ NextAuth.js para autenticação
- ⚠️ Configurado para `localhost:3000/api/v1` (incorreto)

### Backend (delivery-back - Porta 3001)
- ✅ NestJS com Prisma
- ✅ Endpoints funcionais (`/api/v1/*`)
- ✅ JWT Authentication
- ✅ Swagger documentação
- ✅ CORS configurado para frontend

## 🎯 Objetivos da Integração

1. **Corrigir URL da API** para apontar para `localhost:3001`
2. **Unificar autenticação** usando o backend NestJS
3. **Remover API routes duplicadas** do frontend
4. **Testar integração completa** de todos os endpoints
5. **Implementar tratamento de erros** robusto

## 🔧 Tarefas de Implementação

### Fase 1: Configuração Base
- [ ] Atualizar URL base do api-client para `localhost:3001`
- [ ] Verificar/ajustar configuração CORS no backend
- [ ] Testar conectividade básica

### Fase 2: Autenticação
- [ ] Configurar fluxo de login com backend NestJS
- [ ] Adaptar middleware de autenticação
- [ ] Remover rotas de auth do frontend que conflitam
- [ ] Testar fluxo completo de login/logout

### Fase 3: Endpoints de Negócio
- [ ] Integrar endpoints de lojas (CRUD)
- [ ] Integrar endpoints de produtos
- [ ] Integrar endpoints de pedidos
- [ ] Integrar endpoints de usuários
- [ ] Remover API routes correspondentes do frontend

### Fase 4: Testes e Validação
- [ ] Criar/atualizar testes unitários
- [ ] Testar integração end-to-end
- [ ] Validar tratamento de erros
- [ ] Testar performance

### Fase 5: Documentação e Deploy
- [ ] Atualizar README com nova configuração
- [ ] Documentar endpoints utilizados
- [ ] Configurar variáveis de ambiente
- [ ] Preparar para deploy

## 🚨 Pontos de Atenção

1. **Conflito de Portas**: Backend configurado para 3000, mas rodando em 3001
2. **Duplicação de Auth**: NextAuth.js vs JWT do NestJS
3. **API Routes Duplicadas**: Frontend tem `/api/*` que podem conflitar
4. **Dados Existentes**: Verificar se há dados a migrar
5. **CORS**: Garantir configuração correta para produção

## 🛠️ Arquivos a Modificar

### Frontend
- `lib/api-client.ts` - Atualizar URL base
- `middleware.ts` - Ajustar para nova auth
- `app/(api)/api/*` - Remover rotas duplicadas
- `hooks/*` - Ajustar para novos endpoints
- `package.json` - Ajustar porta de start se necessário

### Backend
- `src/main.ts` - Confirmar porta 3001
- `prisma/schema.prisma` - Verificar modelos
- Endpoints específicos conforme necessário

## 📋 Checklist de Validação

- [ ] ✅ Frontend conecta com backend na porta 3001
- [ ] ✅ Login funciona com JWT do backend
- [ ] ✅ CRUD de lojas funciona
- [ ] ✅ CRUD de produtos funciona
- [ ] ✅ CRUD de pedidos funciona
- [ ] ✅ Tratamento de erros funciona
- [ ] ✅ Testes passam
- [ ] ✅ Não há conflitos de endpoints
- [ ] ✅ Performance adequada
- [ ] ✅ Documentação atualizada

## 🔮 Resultado Esperado

Sistema unificado onde:
- Frontend (3000) consome exclusivamente backend (3001)
- Autenticação centralizada no NestJS
- API routes do frontend removidas
- Performance otimizada
- Código limpo e testado