# 🔌 Integração com API Backend

Este documento descreve a integração completa do frontend com o backend Cardap.IO Delivery na porta 3001.

## 📍 Configuração da API

### URL Base
```
http://localhost:3001/api/v1
```

### Variáveis de Ambiente
```bash
# Arquivo .env.local
NEXT_PUBLIC_CARDAPIO_API_URL=http://localhost:3001/api/v1
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

## 🏗️ Arquitetura

### Estrutura de Arquivos
```
lib/
├── config.ts              # Configurações centralizadas
├── api-client.ts          # Cliente HTTP principal
└── error-handler.ts       # Tratamento de erros

types/
└── cardapio-api.ts        # Tipos TypeScript da API
```

### Configuração Centralizada
O arquivo `lib/config.ts` centraliza todas as configurações:

```typescript
export const config = {
  api: {
    baseURL: process.env.NEXT_PUBLIC_CARDAPIO_API_URL,
    timeout: 10000,
    endpoints: {
      auth: { login: '/auth/login', register: '/auth/register' },
      users: '/users',
      stores: '/stores',
      products: '/products',
      orders: '/orders',
      health: '/health',
      status: '/status',
      analytics: '/audit/analytics',
    }
  }
}
```

## 🔌 Endpoints Disponíveis

### Health & Status
- `GET /health` - Verificação de saúde do backend
- `GET /status` - Status e informações do sistema
- `GET /` - Rota raiz da API

### Autenticação
- `POST /auth/login` - Login de usuários
- `POST /auth/register` - Registro de usuários

### Usuários
- `GET /users` - Listar usuários
- `POST /users` - Criar usuário
- `GET /users/{id}` - Obter usuário por ID
- `PATCH /users/{id}` - Atualizar usuário
- `DELETE /users/{id}` - Excluir usuário

### Lojas
- `GET /stores` - Listar lojas
- `POST /stores` - Criar loja
- `GET /stores/{id}` - Obter loja por ID
- `PATCH /stores/{id}` - Atualizar loja
- `DELETE /stores/{id}` - Excluir loja
- `POST /stores/{id}/approve` - Aprovar loja
- `POST /stores/{id}/reject` - Rejeitar loja
- `GET /stores/stats` - Estatísticas das lojas

### Produtos
- `GET /products` - Listar produtos
- `POST /products` - Criar produto
- `GET /products/{id}` - Obter produto por ID
- `PATCH /products/{id}` - Atualizar produto
- `DELETE /products/{id}` - Excluir produto
- `GET /products/search` - Buscar produtos
- `GET /products/category/{categoryId}` - Produtos por categoria

### Pedidos
- `GET /orders` - Listar pedidos
- `POST /orders` - Criar pedido
- `GET /orders/{id}` - Obter pedido por ID
- `PATCH /orders/{id}` - Atualizar pedido
- `DELETE /orders/{id}` - Excluir pedido
- `PATCH /orders/{id}/status` - Atualizar status do pedido
- `GET /orders/stats` - Estatísticas dos pedidos

### Analytics
- `GET /audit/analytics` - Dados de analytics e auditoria

## 🚀 Uso do API Client

### Instância Singleton
```typescript
import { apiClient } from '@/lib/api-client'

// O cliente já está configurado e pronto para uso
```

### Exemplos de Uso

#### Autenticação
```typescript
// Login
const authResponse = await apiClient.authenticate(email, password)

// Registro
const user = await apiClient.register(userData)

// Verificar autenticação
const isAuth = apiClient.isAuthenticated()
```

#### Gerenciamento de Lojas
```typescript
// Listar lojas
const stores = await apiClient.getStores(page, limit)

// Criar loja
const newStore = await apiClient.createStore(storeData)

// Atualizar loja
const updatedStore = await apiClient.updateStore(slug, updateData)

// Aprovar/Rejeitar loja
await apiClient.approveStore(id)
await apiClient.rejectStore(id, reason)
```

#### Gerenciamento de Produtos
```typescript
// Listar produtos de uma loja
const products = await apiClient.getProducts(storeSlug, page, limit)

// Criar produto
const newProduct = await apiClient.createProduct(productData)

// Buscar produtos
const searchResults = await apiClient.searchProducts(storeSlug, query)
```

#### Gerenciamento de Pedidos
```typescript
// Listar pedidos de uma loja
const orders = await apiClient.getOrders(storeSlug, page, limit)

// Criar pedido
const newOrder = await apiClient.createOrder(orderData)

// Atualizar status
await apiClient.updateOrder(id, { status: 'CONFIRMED' })
```

## 🔧 Configurações Avançadas

### Timeout
```typescript
// Configurar timeout via variável de ambiente
NEXT_PUBLIC_API_TIMEOUT=15000
```

### Logging
O sistema de logging é configurável por ambiente:

```typescript
// Desenvolvimento: logs detalhados
// Produção: logs mínimos
// Teste: sem logs

if (appConfig.api.debug) {
  console.log('Debug info')
}
```

### Interceptors
O cliente HTTP possui interceptors configurados:

- **Request**: Adiciona token de autenticação automaticamente
- **Response**: Trata erros e redireciona para login se necessário

## 🧪 Testes

### Testes Unitários
```bash
# Testar API Client
npm test -- --testPathPattern=api-client

# Testar configurações
npm test -- --testPathPattern=api-integration

# Todos os testes da API
npm test -- --testPathPattern="api-client|api-integration"
```

### Teste de Conectividade
```bash
# Verificar se o backend está respondendo
node scripts/test-api-connection.js
```

### Cobertura de Testes
- ✅ API Client: 5/5 testes passando
- ✅ Configurações: 10/10 testes passando
- ✅ Total: 15/15 testes passando

## 🚨 Tratamento de Erros

### Códigos de Status HTTP
- `400` - Dados inválidos
- `401` - Não autorizado (redireciona para login)
- `403` - Acesso negado
- `404` - Recurso não encontrado
- `409` - Conflito detectado
- `422` - Dados inválidos (validação)
- `500` - Erro interno do servidor

### Tratamento Automático
- Tokens expirados são limpos automaticamente
- Usuário é redirecionado para login quando necessário
- Erros são logados para debugging
- Mensagens de erro são amigáveis ao usuário

## 🔒 Segurança

### Autenticação JWT
- Tokens são armazenados no localStorage
- Interceptors adicionam token automaticamente
- Validação de expiração de token
- Logout automático em caso de erro 401

### Validação de Dados
- Todos os dados de entrada são validados
- Schemas TypeScript para tipagem forte
- Sanitização de dados antes do envio

## 📊 Monitoramento

### Health Checks
```typescript
// Verificar saúde do backend
const isHealthy = await apiClient.healthCheck()
```

### Logs Estruturados
- Logs de requisições e respostas
- Logs de erros com contexto
- Logs de autenticação
- Configurável por ambiente

## 🚀 Deploy

### Variáveis de Produção
```bash
NEXT_PUBLIC_CARDAPIO_API_URL=https://api.seudominio.com/api/v1
NODE_ENV=production
```

### Configurações de Produção
- Logs desabilitados para performance
- Timeout otimizado para produção
- Tratamento de erros robusto
- Monitoramento de saúde ativo

## 📚 Recursos Adicionais

### Documentação da API
- [Especificação OpenAPI](http://localhost:3001/api/v1/docs)
- [Swagger UI](http://localhost:3001/api/v1/swagger)

### Suporte
- Issues: GitHub Issues
- Documentação: Este arquivo
- Testes: Jest + Testing Library
- Linting: ESLint + Prettier 