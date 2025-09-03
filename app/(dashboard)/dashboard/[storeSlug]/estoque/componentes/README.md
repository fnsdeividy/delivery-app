# Componentes do Sistema de Estoque

Esta pasta contém os componentes modulares refatorados para o sistema de gerenciamento de estoque.

## Componentes Criados

### 1. **InventoryStatsCards.tsx**
Exibe cards com estatísticas resumidas do estoque.

**Props:**
- `summary: InventorySummary` - Dados do resumo do estoque

**Funcionalidades:**
- Exibe 6 cards com métricas principais
- Layout responsivo (2 colunas mobile, 3 tablet, 6 desktop)
- Ícones e cores específicas para cada métrica
- Animação de hover

### 2. **Toast.tsx**
Sistema de notificações nativas com hook personalizado.

**Componente Toast:**
- `message: string` - Mensagem a ser exibida
- `type: ToastType` - Tipo da notificação (success, error, warning, info)
- `onClose: () => void` - Callback para fechar
- `duration?: number` - Duração em ms (padrão: 4000ms)

**Hook useToast:**
- `showToast(message, type)` - Função para exibir toast
- `ToastContainer` - Componente para renderizar toasts

**Funcionalidades:**
- Animações de entrada/saída
- Auto-remoção após duração especificada
- Múltiplos toasts simultâneos
- Posicionamento fixo no canto superior direito

### 3. **StockActionModal.tsx**
Modal para ações de estoque (ajustar, entrada, saída).

**Props:**
- `isOpen: boolean` - Estado de abertura do modal
- `onClose: () => void` - Callback para fechar
- `product: object` - Dados do produto
- `action: "adjust" | "entry" | "exit"` - Tipo de ação
- `currentQuantity?: number` - Quantidade atual (para referência)
- `onConfirm: (quantity, reason) => Promise<void>` - Callback de confirmação

**Funcionalidades:**
- Interface específica para cada tipo de ação
- Validação de campos obrigatórios
- Estados de loading durante processamento
- Formulário com quantidade e motivo
- Exibição de informações do produto

### 4. **InventoryTable.tsx**
Tabela para exibir e gerenciar itens do inventário.

**Props:**
- `inventory: InventoryItem[]` - Lista de itens do inventário
- `isLoading: boolean` - Estado de carregamento
- `onUpdateInventory: (id, quantity) => Promise<void>` - Callback para atualizar
- `onCreateMovement: (productId, type, quantity, reason) => Promise<void>` - Callback para movimentações

**Funcionalidades:**
- Tabela responsiva com scroll horizontal
- Botões de ação (ajustar, entrada, saída)
- Status visual do estoque (cores e ícones)
- Tratamento de imagens com fallback
- Loading skeleton durante carregamento
- Estado vazio com call-to-action

### 5. **MovementsTable.tsx**
Tabela para exibir histórico de movimentações.

**Props:**
- `movements: StockMovement[]` - Lista de movimentações
- `isLoading: boolean` - Estado de carregamento

**Funcionalidades:**
- Tabela responsiva
- Tipos de movimentação com cores específicas
- Formatação de data/hora brasileira
- Indicadores visuais para entrada/saída (+/-)
- Informações do usuário responsável
- Loading skeleton e estado vazio

### 6. **SearchAndFilters.tsx**
Componente de busca e filtros avançados.

**Props:**
- `searchQuery: string` - Query de busca atual
- `onSearchChange: (query) => void` - Callback para mudança de busca
- `onSearch: () => void` - Callback para executar busca
- `activeTab: "inventory" | "movements"` - Tab ativa
- `showLowStock: boolean` - Filtro de estoque baixo
- `onLowStockChange: (show) => void` - Callback para filtro estoque baixo
- `selectedType: string` - Tipo de movimentação selecionado
- `onTypeChange: (type) => void` - Callback para mudança de tipo
- `onFilter: () => void` - Callback para aplicar filtros
- `isLoading?: boolean` - Estado de carregamento

**Funcionalidades:**
- Campo de busca com clear button
- Filtros avançados expansíveis
- Filtros específicos por tab (inventário vs movimentações)
- Botão de limpar filtros
- Estados de loading
- Layout responsivo

## Melhorias Implementadas

### **Usabilidade:**
1. **Modais em vez de prompts** - Interface mais profissional
2. **Sistema de toast nativo** - Feedback visual consistente
3. **Loading states** - Indicadores visuais durante operações
4. **Filtros avançados** - Busca e filtros mais robustos
5. **Layout responsivo** - Funciona bem em mobile e desktop

### **Organização:**
1. **Componentes modulares** - Código mais organizado e reutilizável
2. **Separação de responsabilidades** - Cada componente tem função específica
3. **TypeScript rigoroso** - Tipagem completa para melhor manutenibilidade
4. **Hooks personalizados** - Lógica reutilizável (useToast)

### **Performance:**
1. **Lazy loading** - Componentes carregados sob demanda
2. **Estados otimizados** - Gerenciamento eficiente do estado
3. **Queries otimizadas** - Parâmetros de busca estruturados
4. **Skeleton loading** - Melhor percepção de performance

### **Acessibilidade:**
1. **ARIA labels** - Navegação assistiva
2. **Keyboard navigation** - Suporte a teclado
3. **Focus management** - Estados de foco visíveis
4. **Semantic HTML** - Estrutura semântica correta

## Uso

```tsx
import InventoryStatsCards from "./componentes/InventoryStatsCards";
import { useToast } from "./componentes/Toast";

function MyComponent() {
  const { showToast, ToastContainer } = useToast();
  
  return (
    <div>
      <InventoryStatsCards summary={summaryData} />
      <ToastContainer />
    </div>
  );
}
```

## Estrutura de Arquivos

```
estoque/
├── componentes/
│   ├── InventoryStatsCards.tsx
│   ├── Toast.tsx
│   ├── StockActionModal.tsx
│   ├── InventoryTable.tsx
│   ├── MovementsTable.tsx
│   ├── SearchAndFilters.tsx
│   └── README.md
└── page.tsx
```
