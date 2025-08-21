# 📋 Plano: Filtro de Lojas por Criador

## 🎯 Objetivo
Implementar filtro para que usuários ADMIN vejam apenas as lojas criadas por eles mesmos, baseado no email do criador.

## 📋 Critérios de Aceite
- ✅ Usuário ADMIN logado vê apenas lojas criadas com seu email
- ✅ Não visualiza lojas de outros administradores
- ✅ Query filtra pelo campo `createdByEmail` associado ao ADMIN logado
- ✅ SUPER_ADMIN continua vendo todas as lojas

## 🔧 Decisões Técnicas

### 1. Campo de Rastreamento
- **Escolha**: `createdByEmail` (string) na tabela Store
- **Justificativa**: Simples, direto e atende ao critério específico de filtrar por email

### 2. Escopo do Filtro
- **ADMIN**: Vê apenas suas lojas
- **SUPER_ADMIN**: Vê todas as lojas (sem filtro)
- **Outros roles**: Comportamento atual mantido

### 3. Retrocompatibilidade
- Lojas existentes sem `createdByEmail` ficam visíveis apenas para SUPER_ADMIN
- Campo opcional no schema para não quebrar dados existentes

### 4. Preenchimento Automático
- Campo `createdByEmail` preenchido automaticamente no backend
- Usa o email do JWT do usuário logado
- Não permite override pelo frontend (segurança)

## 🏗️ Implementação

### Fase 1: Schema e Migration
```prisma
model Store {
  // ... campos existentes
  createdByEmail  String?  // Email do usuário que criou a loja
  // ... resto do modelo
}
```

### Fase 2: Backend (NestJS)
1. **Decorator CurrentUser**
   - Extrair dados do usuário do JWT
   - Disponibilizar email e role para controllers

2. **StoresService.findAll()**
   - Adicionar parâmetro opcional `userEmail`
   - Filtrar lojas por `createdByEmail` se fornecido
   - Aplicar apenas para role ADMIN

3. **StoresService.create()**
   - Definir `createdByEmail` automaticamente
   - Usar email do usuário logado

4. **StoresController**
   - Usar `@CurrentUser()` decorator
   - Passar email para service baseado na role

### Fase 3: Testes
- Teste unitário: filtro por criador funciona
- Teste integração: diferentes roles comportamento correto
- Teste criação: criador definido automaticamente

### Fase 4: Documentação
- Atualizar README com nova funcionalidade
- Documentar comportamento por role

## 📁 Arquivos Afetados

### Novos Arquivos
- `delivery-back/src/common/decorators/current-user.decorator.ts`
- `delivery-back/prisma/migrations/.../add_created_by_email.sql`
- `delivery-app/__tests__/store-filter-by-creator.test.ts`

### Arquivos Modificados
- `delivery-back/prisma/schema.prisma`
- `delivery-back/src/stores/stores.service.ts`
- `delivery-back/src/stores/stores.controller.ts`
- `delivery-app/README.md`

## 🧪 Cenários de Teste

### Cenário 1: Admin vê apenas suas lojas
- **Dado**: Admin com email "admin@loja1.com" logado
- **Quando**: Acessa listagem de lojas
- **Então**: Vê apenas lojas com `createdByEmail = "admin@loja1.com"`

### Cenário 2: Super Admin vê todas
- **Dado**: Super Admin logado
- **Quando**: Acessa listagem de lojas
- **Então**: Vê todas as lojas (sem filtro)

### Cenário 3: Criação automática de criador
- **Dado**: Admin com email "admin@loja2.com" logado
- **Quando**: Cria nova loja
- **Então**: Loja criada com `createdByEmail = "admin@loja2.com"`

### Cenário 4: Lojas legacy
- **Dado**: Lojas existentes sem `createdByEmail`
- **Quando**: Admin acessa listagem
- **Então**: Não vê lojas legacy
- **E**: Super Admin vê lojas legacy

## 📊 Impacto

### Compatibilidade
- ✅ Não quebra funcionalidade existente
- ✅ Super Admins mantêm acesso total
- ✅ Frontend não precisa mudanças

### Performance
- ✅ Filtro no banco (eficiente)
- ✅ Índice automático em campo string
- ✅ Sem queries adicionais

### Segurança
- ✅ Isolamento completo entre admins
- ✅ Não permite bypass no frontend
- ✅ Validação no backend

## ⏱️ Estimativa
- **Schema + Migration**: 30min
- **Backend Implementation**: 2h
- **Testes**: 1h
- **Documentação**: 30min
- **Total**: ~4h