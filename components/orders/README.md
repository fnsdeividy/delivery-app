# Componentes de Pedidos

Esta pasta contém os componentes refatorados para a página de pedidos, organizados de forma modular e reutilizável.

## Estrutura

### Componentes

- **OrderStats**: Exibe estatísticas dos pedidos (total, pendentes, entregando, receita)
- **OrderFilters**: Componente de filtros para busca e seleção de status
- **OrderCard**: Card individual para cada pedido com informações e ações
- **OrderDetailsModal**: Modal com detalhes completos do pedido
- **EmptyOrdersList**: Componente para exibir quando não há pedidos
- **OrdersLoading**: Componente de loading para a página

### Utilitários

- **order-utils.ts**: Funções utilitárias para formatação e cálculos relacionados a pedidos

### Tipos

- **order.ts**: Interfaces TypeScript específicas para pedidos

## Benefícios da Refatoração

1. **Modularidade**: Cada componente tem uma responsabilidade específica
2. **Reutilização**: Componentes podem ser reutilizados em outras partes da aplicação
3. **Manutenibilidade**: Código mais fácil de manter e debugar
4. **Testabilidade**: Componentes menores são mais fáceis de testar
5. **Tipagem**: Interfaces TypeScript específicas para melhor segurança de tipos
6. **Performance**: Componentes menores podem ser otimizados individualmente

## Uso

```tsx
import {
  OrderStats,
  OrderFilters,
  OrderCard,
  OrderDetailsModal,
  EmptyOrdersList,
  OrdersLoading,
} from "@/components/orders";
```

## Padrões Seguidos

- **TypeScript**: Uso de interfaces para props e tipos
- **Componentes Funcionais**: Uso de hooks e componentes funcionais
- **Props Interface**: Interfaces específicas para cada componente
- **Separação de Responsabilidades**: Cada componente tem uma função específica
- **Reutilização**: Componentes genéricos e configuráveis
