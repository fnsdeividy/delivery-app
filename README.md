# Cardap.IO Delivery App

Aplicação frontend para o sistema de delivery Cardap.IO, desenvolvida com Next.js 14, React, TypeScript e Tailwind CSS.

## 🚀 Status da Integração

**✅ INTEGRAÇÃO COMPLETA COM BACKEND EXTERNO**

O frontend está totalmente integrado com o backend Cardap.IO Delivery na porta 3001, fornecendo:
- Autenticação JWT completa via API externa
- CRUD de usuários, lojas, produtos e pedidos
- Sistema de roles e permissões
- Cache inteligente com React Query
- Tratamento de erros centralizado
- **NOVA**: Proxy reverso para backend externo na porta 3001

### 🔌 Nova Arquitetura de Conexão (Janeiro 2025)
- **Frontend**: Roda na porta 3000 (Next.js)
- **Backend**: Conecta na porta 3001 (API externa)
- **Proxy**: Next.js funciona como proxy reverso para todas as chamadas de API
- **Benefícios**: 
  - ✅ Separação clara entre frontend e backend
  - ✅ Desenvolvimento mais próximo da produção
  - ✅ Sem duplicação de lógica de API
  - ✅ Facilita testes de integração

### 🏗️ Configuração de Desenvolvimento
```bash
# Terminal 1: Backend (porta 3001)
# Seu backend deve estar rodando em http://localhost:3001

# Terminal 2: Frontend (porta 3000)
npm run dev
# Frontend estará disponível em http://localhost:3000
# Todas as chamadas de API serão redirecionadas para o backend na porta 3001
```

### 🔧 Arquivos de Configuração Atualizados
- `next.config.js` - Configurado como proxy reverso para backend 3001
- `lib/api-client.ts` - Cliente HTTP configurado para conectar ao backend externo
- `env.local.example` - Variáveis de ambiente para desenvolvimento
- `lib/backend-connection.ts` - Utilitário para verificar conectividade com backend

### 🧹 Limpeza de Rotas de API
- **Removido**: Todas as rotas de API duplicadas do Next.js
- **Mantido**: Apenas o proxy reverso para o backend externo
- **Benefícios**: 
  - ✅ Sem conflitos entre frontend e backend
  - ✅ Código mais limpo e focado
  - ✅ Melhor separação de responsabilidades

### 🐛 Correções Recentes
- **Bug Fix**: Corrigido erro `token.split is not a function` no hook `useCardapioAuth`
- **Melhorias**: Implementada validação robusta de tokens JWT e fallback para dados de usuário
- **Testes**: Adicionados testes unitários abrangentes para o hook de autenticação

### 🔧 Correção de Visualização da Loja (Janeiro 2025)
- **Problema**: Usuário ADMIN conseguia criar loja mas não conseguia visualizá-la após criação
- **Causa**: Falha na sincronização do `storeSlug` e redirecionamento após criação da loja
- **Solução**: 
  - Implementada sincronização automática do contexto de autenticação após criar loja
  - Corrigida lógica de redirecionamento baseada em roles (SUPER_ADMIN, ADMIN, CLIENTE)
  - Adicionado método `updateStoreContext` no API Client para atualizar contexto da loja
  - Melhorada lógica de fallback e tratamento de erros
- **Arquivos Afetados**: 
  - `hooks/useCardapioAuth.ts` - Lógica de autenticação e redirecionamento
  - `hooks/useCreateStore.ts` - Criação da loja e sincronização
  - `lib/api-client.ts` - Métodos de contexto da loja
- **Testes**: Todos os testes unitários passando (11/11 useCardapioAuth, 6/6 useCreateStore)

### 🚀 Correção de Aprovação de Lojas (Janeiro 2025)
- **Problema**: Erro 404 ao tentar aprovar/rejeitar lojas devido a inconsistência entre rotas
- **Causa**: Frontend chamando `/api/v1/stores/{id}/approve` mas rota existia em `/api/stores/{storeSlug}/approve`
- **Solução**: 
  - Migração completa para rotas v1 padronizadas (`/api/v1/stores/{id}/approve`, `/api/v1/stores/{id}/reject`)
  - Implementação de validações robustas para operações de aprovação/rejeição
  - Melhorias no tratamento de erros e feedback visual para usuários
  - Adicionadas validações de permissões (apenas SUPER_ADMIN pode aprovar/rejeitar)
  - Implementados logs estruturados para auditoria
- **Arquivos Afetados**: 
  - `app/(api)/api/v1/stores/[id]/approve/route.ts` - Nova rota de aprovação v1
  - `app/(api)/api/v1/stores/[id]/reject/route.ts` - Nova rota de rejeição v1
  - `lib/api-client.ts` - Atualização de rotas para v1
  - `hooks/useStores.ts` - Melhorias no tratamento de erros
  - `lib/validation.ts` - Validações para operações de lojas
  - `app/(dashboard)/dashboard/gerenciar-lojas/page.tsx` - Melhorias na UX
- **Testes**: Novos testes unitários para validações (11/11 passando)
- **Benefícios**: 
  - ✅ Erro 404 resolvido
  - ✅ Rotas padronizadas e escaláveis
  - ✅ Melhor segurança com validações
  - ✅ UX aprimorada com feedback específico
  - ✅ Logs estruturados para auditoria

### 🔧 Correção do Botão "Ver Todas as Lojas" (Janeiro 2025)
- **Problema**: Botão "Ver Todas as Lojas" no Dashboard Administrativo não funcionava
- **Causa**: Botão implementado como `<button>` simples sem funcionalidade de navegação
- **Solução**: 
  - Substituição do `<button>` por `<Link>` do Next.js com navegação para `/dashboard/gerenciar-lojas`
  - Adição de atributos de acessibilidade (`role="link"`, `aria-label`)
  - Manutenção do estilo visual consistente com outros botões de ação
- **Arquivos Afetados**: 
  - `app/(dashboard)/dashboard/page.tsx` - Correção do botão de navegação
  - `__tests__/dashboard-navigation.test.tsx` - Novos testes unitários para funcionalidade
- **Testes**: Testes unitários abrangentes para navegação (7/7 passando)
- **Benefícios**: 
  - ✅ Navegação funcional para gerenciamento de lojas
  - ✅ Melhor acessibilidade com atributos semânticos
  - ✅ Consistência visual mantida
  - ✅ UX aprimorada para administradores

### 🧹 Limpeza de Código - Console Logs (Janeiro 2025)
- **Implementação**: Remoção de todos os `console.log` e `console.error` das rotas de API
- **Arquivos Limpos**:
  - `app/(api)/api/v1/auth/login/route.ts` - Rota de autenticação
  - `app/(api)/api/v1/health/route.ts` - Rota de health check
  - `app/(api)/api/v1/stores/[storeSlug]/public/route.ts` - Rota pública de lojas
- **Benefícios**:
  - ✅ Código limpo e profissional
  - ✅ Sem logs desnecessários em produção
  - ✅ Melhor performance
  - ✅ Manutenibilidade aprimorada

### 🔧 Refatoração do ApiClient (Janeiro 2025)
- **Implementação**: Refatoração completa do cliente HTTP para melhorar estrutura, tipagem e manutenibilidade
- **Principais Mudanças**:
  - ✅ Correção de erros de TypeScript (tipagem de erros)
  - ✅ Separação de interceptors em métodos privados
  - ✅ Implementação de sistema de logging condicional
  - ✅ Melhoria no tratamento de erros com interfaces tipadas
  - ✅ Organização do código por funcionalidade
  - ✅ Redução de duplicação de código
- **Arquivos Afetados**:
  - `lib/api-client.ts` - Refatoração completa da classe ApiClient
- **Benefícios**:
  - ✅ Código mais legível e manutenível
  - ✅ Tratamento de erros mais robusto
  - ✅ Performance otimizada com logging condicional
  - ✅ Tipagem TypeScript mais robusta
  - ✅ Facilidade para adicionar novas funcionalidades
  - ✅ Todos os testes unitários passando

## 🏗️ Arquitetura

### Stack Tecnológica
- **Frontend**: Next.js 14 com App Router
- **React**: 18+ com Hooks e Context API
- **TypeScript**: Tipagem estática completa
- **Estado**: TanStack Query (React Query) para gerenciamento de estado
- **HTTP Client**: Axios com interceptors configurados
- **Estilização**: Tailwind CSS
- **Autenticação**: JWT com localStorage e cookies
- **Testes**: Jest + React Testing Library

### Estrutura do Projeto
```
delivery-app/
├── app/                    # Next.js App Router
├── components/             # Componentes React reutilizáveis
├── contexts/              # Contextos React (Auth, etc.)
├── hooks/                 # Hooks customizados com React Query
├── lib/                   # Utilitários e configurações
├── types/                 # Definições TypeScript
└── __tests__/             # Testes unitários
```

## 🔌 Integração com a API

### Endpoints Principais
- **Base URL**: `http://localhost:3001/api/v1`
- **Swagger**: `http://localhost:3001/api/docs`
- **Health Check**: `http://localhost:3001/api/v1/health`

### Recursos Integrados
- **Autenticação**: `/api/v1/auth` (login, registro, refresh)
- **Usuários**: `/api/v1/users` (CRUD completo)
- **Lojas**: `/api/v1/stores` (CRUD, aprovação, configurações)
- **Produtos**: `/api/v1/products` (CRUD, categorias, estoque)
- **Pedidos**: `/api/v1/orders` (CRUD, status, histórico)
- **Analytics**: `/api/v1/audit` (métricas e relatórios)

### Sistema de Autenticação
- JWT tokens com refresh automático
- Controle de acesso baseado em roles (SUPER_ADMIN, ADMIN, MANAGER, EMPLOYEE, CLIENTE)
- Middleware de autenticação configurado
- Gerenciamento seguro de tokens

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- API Cardap.IO Delivery rodando em `http://localhost:3001`

### Instalação
```bash
# Clonar o repositório
git clone <repository-url>
cd delivery-app

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.example .env.local
# Editar .env.local com suas configurações

# Executar em desenvolvimento
npm run dev
```

### Variáveis de Ambiente
```bash
# API Configuration
NEXT_PUBLIC_CARDAPIO_API_URL=http://localhost:3001/api/v1

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-here

# Development
NODE_ENV=development
```

## 🧪 Testes

### Executar Testes
```bash
# Todos os testes
npm test

# Testes específicos
npm test -- --testPathPattern=useAuth

# Testes em modo watch
npm run test:watch

# Testes com coverage
npm test -- --coverage
```

### Cobertura de Testes
- ✅ Hooks de autenticação (useAuth)
- ✅ Hooks de lojas (useStores)
- ✅ Hooks de produtos (useProducts)
- ✅ Hooks de pedidos (useOrders)
- ✅ Tipos TypeScript
- ✅ Cliente da API
- ✅ Componentes básicos

## 📱 Funcionalidades

### Dashboard de Administração
- Visão geral com métricas em tempo real
- Gestão de usuários e permissões
- Aprovação/rejeição de lojas
- Analytics e relatórios

### Gestão de Lojas
- CRUD completo de lojas
- Configurações personalizáveis
- Horários de funcionamento
- Métodos de pagamento
- Configurações de entrega

### Gestão de Produtos
- CRUD de produtos e categorias
- Controle de estoque
- Ingredientes e adicionais
- Informações nutricionais
- Tags e categorização

### Gestão de Pedidos
- Acompanhamento em tempo real
- Mudança de status
- Histórico completo
- Métricas de performance

## 🔧 Desenvolvimento

### Scripts Disponíveis
```bash
npm run dev          # Desenvolvimento local (porta 3001)
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linting do código
npm test             # Executar testes
npm run test:watch   # Testes em modo watch
```

### Padrões de Código
- TypeScript strict mode
- ESLint + Prettier configurados
- Componentes funcionais com Hooks
- Arquitetura limpa e SOLID
- Testes unitários para hooks e componentes

### Estrutura de Commits
```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
test: testes
refactor: refatoração
style: formatação
chore: tarefas de manutenção
```

## 📊 Performance

### Otimizações Implementadas
- React Query com cache inteligente
- Lazy loading de componentes
- Otimização de imagens
- Bundle splitting automático
- Server-side rendering quando possível

### Métricas de Performance
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms

## 🔒 Segurança

### Medidas Implementadas
- Validação de entrada em todos os endpoints
- Sanitização de dados
- Controle de acesso baseado em roles
- Tokens JWT seguros
- HTTPS em produção
- Headers de segurança configurados

## 🤝 Contribuição

### Como Contribuir
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Checklist para PRs
- [ ] Código segue padrões do projeto
- [ ] Testes passando
- [ ] Documentação atualizada
- [ ] Não quebra funcionalidades existentes
- [ ] Revisão de código realizada

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

### Problemas Comuns
- **API não responde**: Verificar se o backend está rodando em `http://localhost:3001`
- **Erro de autenticação**: Verificar se o token JWT está válido
- **Testes falhando**: Executar `npm install` e verificar configurações

### Contato
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentação**: [Wiki do Projeto](https://github.com/your-repo/wiki)
- **Email**: suporte@cardap.io

## 🎯 Roadmap

### Próximas Funcionalidades
- [ ] Dashboard mobile responsivo
- [ ] Notificações em tempo real
- [ ] Integração com sistemas de pagamento
- [ ] Relatórios avançados
- [ ] API GraphQL
- [ ] PWA (Progressive Web App)

### Melhorias Técnicas
- [ ] Testes E2E com Playwright
- [ ] CI/CD pipeline
- [ ] Monitoramento de performance
- [ ] Logs estruturados
- [ ] Cache distribuído