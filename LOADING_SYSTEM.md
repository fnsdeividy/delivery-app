# Sistema de Loading para Navegação

Este documento descreve o sistema de loading implementado para melhorar a experiência do usuário durante a navegação entre telas do menu lateral do dashboard.

## Visão Geral

O sistema de loading fornece feedback visual imediato quando o usuário navega entre diferentes seções do dashboard, evitando cliques múltiplos e melhorando a percepção de performance.

## Componentes

### 1. LoadingContext (`contexts/LoadingContext.tsx`)

Contexto global que gerencia o estado de loading da aplicação.

**Funcionalidades:**

- Estado global de loading
- Controle de tempo mínimo de exibição (300ms)
- Timeout de segurança (10s)
- Suporte a diferentes variantes (topbar, overlay)

**API:**

```typescript
interface LoadingContextType {
  loadingState: LoadingState;
  setLoading: (
    isLoading: boolean,
    options?: Partial<Omit<LoadingState, "isLoading">>
  ) => void;
  startRouteLoading: (
    route: string,
    options?: Partial<Omit<LoadingState, "isLoading">>
  ) => void;
  stopRouteLoading: () => void;
}
```

### 2. GlobalLoading (`components/GlobalLoading.tsx`)

Componente que renderiza o indicador de loading baseado no estado do contexto.

**Variantes:**

- `topbar`: Barra fina no topo da tela (padrão)
- `overlay`: Spinner centralizado com backdrop

**Funcionalidades:**

- Anúncios para leitores de tela
- Acessibilidade com `aria-live` e `aria-atomic`
- Suporte a mensagens customizadas

### 3. useRouteLoading (`hooks/useRouteLoading.ts`)

Hook que facilita a navegação com loading automático.

**Funcionalidades:**

- Interceptação de mudanças de rota
- Bloqueio de cliques múltiplos
- Controle de tempo mínimo e timeout
- Callbacks para eventos de navegação

**API:**

```typescript
const {
  navigateWithLoading,
  navigateWithoutLoading,
  stopLoading,
  isLoading,
  loadingMessage,
} = useRouteLoading(options);
```

### 4. LoadingContent (`components/GlobalLoading.tsx`)

Componente wrapper que aplica `aria-busy` ao conteúdo durante loading.

## Configuração

### Configurações Padrão

```typescript
const defaultOptions = {
  minimumMs: 300, // Tempo mínimo de exibição
  timeoutMs: 10000, // Timeout de segurança
  variant: "overlay", // Variante padrão (overlay no meio da tela)
};
```

### Personalização

Para alterar as configurações padrão, modifique o hook `useDashboardRouteLoading`:

```typescript
export function useDashboardRouteLoading() {
  return useRouteLoading({
    minimumMs: 500, // Aumentar tempo mínimo
    timeoutMs: 15000, // Aumentar timeout
    variant: "overlay", // Usar overlay
    onRouteStart: (route) => console.log(`Navegando para: ${route}`),
    onRouteComplete: (route) => console.log(`Concluído: ${route}`),
    onRouteError: (error, route) => console.error(`Erro: ${error.message}`),
  });
}
```

## Uso

### Navegação com Loading

```typescript
const { navigateWithLoading } = useDashboardRouteLoading();

// Navegar com loading automático
navigateWithLoading("/dashboard/loja/produtos");
```

### Navegação sem Loading

```typescript
const { navigateWithoutLoading } = useDashboardRouteLoading();

// Navegar sem loading (para casos especiais)
navigateWithoutLoading("/dashboard/loja/configuracoes");
```

### Controle Manual

```typescript
const { setLoading, stopLoading } = useLoadingContext();

// Iniciar loading manual
setLoading(true, {
  loadingMessage: "Processando...",
  variant: "overlay",
});

// Parar loading
stopLoading();
```

## Acessibilidade

### Recursos Implementados

1. **aria-busy**: Aplicado ao container principal durante loading
2. **aria-live**: Anúncios para leitores de tela
3. **Foco**: Movido para h1 da nova página após navegação
4. **Desabilitação**: Botões desabilitados durante loading

### Anúncios para Leitores de Tela

```html
<div class="sr-only" aria-live="polite" aria-atomic="true">Carregando...</div>
```

## Testes

### Testes Unitários

- `LoadingContext.test.tsx`: Testa o contexto de loading
- `GlobalLoading.test.tsx`: Testa o componente de loading
- `useRouteLoading.test.tsx`: Testa o hook de navegação

### Testes E2E

- `loading-navigation.cy.ts`: Testa navegação completa com loading

### Executar Testes

```bash
# Testes unitários
npm test

# Testes E2E
npm run cypress:open
```

## Performance

### Otimizações Implementadas

1. **Tempo mínimo**: Evita "flash" de loading muito rápido
2. **Timeout**: Previne loading infinito
3. **Debounce**: Bloqueia cliques múltiplos
4. **Cleanup**: Limpa timeouts ao desmontar

### Métricas

- **Tempo de resposta**: ≤ 100ms para aparecer
- **Tempo mínimo**: 300ms de exibição
- **Timeout**: 10s máximo
- **CLS**: Evitado com altura reservada

## Troubleshooting

### Loading não aparece

1. Verificar se `LoadingProvider` está envolvendo a aplicação
2. Verificar se `GlobalLoading` está no layout principal
3. Verificar se o hook está sendo usado corretamente

### Loading não para

1. Verificar se a rota está mudando corretamente
2. Verificar se não há erros no console
3. Verificar se o timeout está configurado

### Problemas de acessibilidade

1. Verificar se `aria-busy` está sendo aplicado
2. Verificar se os anúncios estão funcionando
3. Verificar se o foco está sendo movido corretamente

## Changelog

### v1.0.0

- Implementação inicial do sistema de loading
- Suporte a variantes topbar e overlay
- Integração com dashboard layout
- Testes unitários e E2E
- Documentação completa
