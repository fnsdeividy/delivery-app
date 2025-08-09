# Plano: Board Centralizado de Pedidos

## Objetivo
Implementar um board centralizado de pedidos com DataGrid/Kanban, filtros avançados, drag & drop para mudança de status e sistema de logs de auditoria.

## Funcionalidades a Implementar

### 1. Board Kanban com Drag & Drop
- ✅ Colunas por status de pedido (Pendente, Confirmado, Preparando, Pronto, Entregando, Entregue)
- ✅ Drag & drop para mudança de status
- ✅ Cards de pedido com informações essenciais
- ✅ Indicadores visuais de prioridade e tempo

### 2. DataGrid Alternativo
- ✅ Tabela com filtros avançados
- ✅ Paginação e ordenação
- ✅ Busca por cliente, pedido, telefone
- ✅ Exportação de dados

### 3. Filtros Avançados
- ✅ Por status de pedido
- ✅ Por status de pagamento
- ✅ Por canal (Web/WhatsApp)
- ✅ Por período (hoje, semana, mês)
- ✅ Por valor (faixas de preço)

### 4. Sistema de Logs de Auditoria
- ✅ Modelo `OrderLog` no banco de dados
- ✅ Log automático de mudanças de status
- ✅ Histórico completo de alterações
- ✅ Interface para visualizar logs

### 5. Melhorias no Schema
- ✅ Campo `channel` para identificar origem (Web/WhatsApp)
- ✅ Campo `priority` para priorização
- ✅ Campo `assignedTo` para responsável
- ✅ Relacionamento com logs

### 6. APIs Aprimoradas
- ✅ API para listar pedidos com filtros
- ✅ API para atualizar status com logs
- ✅ API para estatísticas em tempo real
- ✅ API para logs de auditoria

### 7. Interface Responsiva
- ✅ Toggle entre Kanban e DataGrid
- ✅ Design mobile-first
- ✅ Indicadores visuais de status
- ✅ Ações rápidas nos cards

## Estrutura de Arquivos a Modificar/Criar

### Componentes
- `components/OrderBoard.tsx` - Board Kanban principal
- `components/OrderDataGrid.tsx` - DataGrid alternativo
- `components/OrderCard.tsx` - Card individual de pedido
- `components/OrderFilters.tsx` - Filtros avançados
- `components/OrderLogs.tsx` - Visualização de logs
- `components/StatusColumn.tsx` - Coluna do Kanban

### Hooks
- `hooks/useOrders.tsx` - Gerenciamento de pedidos
- `hooks/useOrderBoard.tsx` - Lógica do board
- `hooks/useOrderLogs.tsx` - Gerenciamento de logs

### APIs
- `app/api/orders/[storeSlug]/route.ts` - CRUD de pedidos
- `app/api/orders/[storeSlug]/status/route.ts` - Atualização de status
- `app/api/orders/[storeSlug]/logs/route.ts` - Logs de auditoria
- `app/api/orders/[storeSlug]/stats/route.ts` - Estatísticas

### Tipos
- `types/order.ts` - Tipos de pedido e status
- `types/orderLog.ts` - Tipos de logs
- `types/board.ts` - Tipos do board

### Utilitários
- `lib/orders.ts` - Funções utilitárias para pedidos
- `lib/board.ts` - Lógica do board Kanban
- `lib/logs.ts` - Funções de auditoria

### Database
- `prisma/migrations/` - Nova migration para OrderLog
- `prisma/schema.prisma` - Atualização do schema

## Fluxo de Implementação

1. **Fase 1:** Atualizar schema e criar migration
2. **Fase 2:** Implementar APIs de pedidos e logs
3. **Fase 3:** Criar componentes do board Kanban
4. **Fase 4:** Implementar DataGrid alternativo
5. **Fase 5:** Adicionar filtros avançados
6. **Fase 6:** Implementar drag & drop
7. **Fase 7:** Sistema de logs de auditoria
8. **Fase 8:** Testes e otimizações

## Critérios de Aceitação

- ✅ Board Kanban funcional com drag & drop
- ✅ DataGrid com filtros e paginação
- ✅ Filtros por status, pagamento e canal
- ✅ Logs automáticos de mudanças de status
- ✅ Interface responsiva e intuitiva
- ✅ Performance otimizada para muitos pedidos
- ✅ Testes unitários e de integração

## Estimativa de Tempo
- **Desenvolvimento:** 3-4 dias
- **Testes:** 1-2 dias
- **Documentação:** 0.5 dia
- **Total:** 4.5-6.5 dias

## Benefícios Esperados

- 🚀 **Eficiência:** Mudança rápida de status com drag & drop
- 📊 **Visibilidade:** Board visual para acompanhamento
- 🔍 **Filtros:** Busca e filtros avançados
- 📝 **Auditoria:** Logs completos de alterações
- 📱 **Responsivo:** Funciona em desktop e mobile
- ⚡ **Performance:** Otimizado para volume de pedidos