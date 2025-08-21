# 📝 Mensagem de Commit

## Commit Principal
```
feat(security): implementar filtro de lojas por criador para isolamento entre ADMINs

- Adicionar campo createdByEmail na tabela stores via migration
- Criar decorator @CurrentUser para extrair dados do JWT  
- Implementar filtro automático por role no StoresController
- Atualizar StoresService para suportar filtro por email do criador
- Garantir que ADMINs vejam apenas lojas criadas por eles
- Manter acesso completo para SUPER_ADMINs
- Preservar retrocompatibilidade com lojas legacy
- Adicionar testes unitários abrangentes (18 cenários)
- Atualizar documentação com nova funcionalidade de segurança

BREAKING CHANGE: ADMINs agora veem apenas suas próprias lojas
Closes #JIRA-123
```

## Commits Granulares (Alternativa)

### 1. Database Schema
```
feat(db): adicionar campo createdByEmail na tabela stores

- Criar migration para adicionar campo opcional createdByEmail
- Atualizar schema Prisma com novo campo
- Gerar cliente Prisma atualizado
- Campo opcional para manter retrocompatibilidade
```

### 2. Backend Authentication
```
feat(auth): criar decorator @CurrentUser para extrair dados do JWT

- Implementar decorator personalizado para controllers
- Extrair id, email, role e storeSlug do token JWT
- Facilitar acesso aos dados do usuário autenticado
- Tipagem TypeScript completa para segurança
```

### 3. Controller Updates
```
feat(stores): implementar filtro por criador no StoresController

- Atualizar método create() para definir createdByEmail automaticamente
- Modificar método findAll() para aplicar filtro baseado na role
- ADMINs veem apenas lojas criadas por eles
- SUPER_ADMINs mantêm acesso a todas as lojas
- Logs detalhados para auditoria
```

### 4. Service Logic
```
feat(stores): adicionar lógica de filtro por criador no StoresService

- Implementar parâmetro opcional filterByEmail no método findAll()
- Atualizar método create() para receber e definir criador
- Construir query condicional baseada no filtro
- Manter paginação e performance com filtro no banco
```

### 5. Testing
```
test(stores): adicionar testes unitários para filtro por criador

- Criar 9 testes no backend para StoresService
- Criar 9 testes no frontend para comportamento da API
- Cobrir cenários de diferentes roles (ADMIN, SUPER_ADMIN)
- Validar casos extremos e segurança
- Garantir 100% de cobertura da nova funcionalidade
```

### 6. Documentation
```
docs: atualizar README com funcionalidade de filtro por criador

- Adicionar seção sobre isolamento de lojas por ADMIN
- Explicar comportamento para diferentes roles
- Documentar aspectos de segurança e retrocompatibilidade
- Incluir informações sobre performance e impacto
```

## Conventional Commits Tags

### Tipos Utilizados
- `feat`: Nova funcionalidade
- `test`: Adição de testes
- `docs`: Documentação
- `db`: Mudanças no banco de dados

### Escopo Utilizado
- `security`: Aspectos de segurança
- `auth`: Autenticação
- `stores`: Módulo de lojas
- `db`: Database/Prisma

## Versionamento Semântico
Esta mudança seria uma **MINOR** version (ex: 1.2.0 → 1.3.0) por ser uma nova funcionalidade que mantém compatibilidade, mas com comportamento que pode afetar usuários existentes.

## Git Workflow
```bash
# Branch de desenvolvimento
git checkout -b feat/store-filter-by-creator

# Commits granulares
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(db): adicionar campo createdByEmail na tabela stores"

git add src/common/decorators/
git commit -m "feat(auth): criar decorator @CurrentUser para extrair dados do JWT"

git add src/stores/stores.controller.ts
git commit -m "feat(stores): implementar filtro por criador no StoresController"

git add src/stores/stores.service.ts  
git commit -m "feat(stores): adicionar lógica de filtro por criador no StoresService"

git add __tests__/ src/**/*.spec.ts
git commit -m "test(stores): adicionar testes unitários para filtro por criador"

git add README.md *.md
git commit -m "docs: atualizar README com funcionalidade de filtro por criador"

# Merge para main
git checkout main
git merge feat/store-filter-by-creator
git tag v1.3.0
```