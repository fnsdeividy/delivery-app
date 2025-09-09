# Sistema de Temas de Loja

Este documento descreve como o sistema de temas personalizados funciona no modal de login e outros componentes da aplicação.

## Visão Geral

O sistema permite que cada loja tenha seu próprio tema visual, incluindo cores personalizadas que são aplicadas automaticamente nos componentes da interface.

## Componentes Principais

### 1. Hook `useStoreTheme`

Localizado em `hooks/useStoreTheme.ts`, este hook:
- Busca as configurações de tema da loja via API
- Aplica estilos CSS dinâmicos baseados nas cores da loja
- Retorna o tema atual e estado de carregamento

```typescript
const { theme, isLoading } = useStoreTheme(storeSlug);
```

### 2. Hook `useInlineStyles`

Localizado em `hooks/useInlineStyles.ts`, este hook:
- Gera estilos inline como fallback
- Calcula cores de contraste automaticamente
- Fornece estilos prontos para uso em componentes

```typescript
const inlineStyles = useInlineStyles(theme);
```

### 3. Componente `PhoneLoginModal`

O modal de login foi atualizado para:
- Aplicar automaticamente o tema da loja
- Usar classes CSS personalizadas
- Incluir estilos inline como fallback
- Manter acessibilidade e contraste adequado

## Configuração da API

A API deve retornar as seguintes propriedades de tema no endpoint `/stores/public/{slug}`:

```json
{
  "config": {
    "branding": {
      "primaryColor": "#3b82f6",
      "secondaryColor": "#1d4ed8", 
      "backgroundColor": "#ffffff",
      "textColor": "#1f2937",
      "accentColor": "#60a5fa"
    }
  }
}
```

## Cores Suportadas

- **primaryColor**: Cor principal da loja (botões, links, destaques)
- **secondaryColor**: Cor secundária (hover states, variações)
- **backgroundColor**: Cor de fundo dos modais e cards
- **textColor**: Cor do texto principal
- **accentColor**: Cor de destaque (ícones, elementos especiais)

## Aplicação Automática

O sistema aplica automaticamente:

1. **CSS Dinâmico**: Gera estilos CSS que são injetados no `<head>` do documento
2. **Classes Personalizadas**: Aplica classes como `.store-themed-modal` nos componentes
3. **Estilos Inline**: Usa estilos inline como fallback para garantir compatibilidade
4. **Cálculo de Contraste**: Calcula automaticamente cores de texto legíveis

## Exemplo de Uso

```tsx
import { PhoneLoginModal } from "@/components/PhoneLoginModal";

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const storeSlug = "minha-loja";

  return (
    <PhoneLoginModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onSuccess={(authData) => console.log(authData)}
      storeSlug={storeSlug} // O tema será aplicado automaticamente
    />
  );
}
```

## Página de Demonstração

Acesse `/teste-tema` para ver uma demonstração interativa com diferentes temas de loja.

## Fallbacks e Compatibilidade

- Se a loja não tiver tema configurado, usa cores padrão
- Se a API falhar, mantém o tema padrão
- Estilos inline garantem que as cores sejam aplicadas mesmo sem CSS
- Cálculo automático de contraste garante legibilidade

## Personalização Adicional

Para adicionar novos elementos temáticos:

1. Adicione as classes CSS no hook `useStoreTheme`
2. Use o hook `useInlineStyles` para estilos inline
3. Aplique as classes nos componentes desejados
4. Teste com diferentes combinações de cores

## Considerações de Performance

- Os estilos são memoizados para evitar recálculos
- CSS é injetado apenas uma vez por tema
- Estilos são limpos automaticamente quando o componente é desmontado
- Carregamento assíncrono não bloqueia a interface