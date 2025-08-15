# Cardap.IO Delivery App

Aplicação frontend para o sistema de delivery Cardap.IO, desenvolvida com Next.js 14, React, TypeScript e Tailwind CSS.

## 🚀 Status da Integração

**✅ INTEGRAÇÃO COMPLETA COM A API CARDAP.IO DELIVERY**

O frontend está totalmente integrado com a API backend Cardap.IO Delivery, fornecendo:
- Autenticação JWT completa
- CRUD de usuários, lojas, produtos e pedidos
- Sistema de roles e permissões
- Cache inteligente com React Query
- Tratamento de erros centralizado

### 🐛 Correções Recentes
- **Bug Fix**: Corrigido erro `token.split is not a function` no hook `useCardapioAuth`
- **Melhorias**: Implementada validação robusta de tokens JWT e fallback para dados de usuário
- **Testes**: Adicionados testes unitários abrangentes para o hook de autenticação

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
- **Base URL**: `http://localhost:3000/api/v1`
- **Swagger**: `http://localhost:3000/api/docs`
- **Health Check**: `http://localhost:3000/api/v1/health`

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
- API Cardap.IO Delivery rodando em `http://localhost:3000`

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
NEXT_PUBLIC_CARDAPIO_API_URL=http://localhost:3000/api/v1

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
- **API não responde**: Verificar se o backend está rodando em `http://localhost:3000`
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