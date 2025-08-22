# Guia de Animações com Framer Motion

## Visão Geral

Este projeto utiliza o **Framer Motion** como sistema principal de animações, substituindo completamente o sistema customizado anterior. O Framer Motion oferece animações mais suaves, melhor performance e um sistema de presets flexível e responsivo.

## Instalação

```bash
npm install framer-motion
```

## Estrutura do Sistema

### 1. Presets de Animação (`lib/animations.ts`)

Sistema flexível de presets com configurações responsivas para mobile/desktop:

```typescript
import { animationPresets } from '@/lib/animations'

// Configuração básica
const fadeInAnimation = animationPresets.fadeIn({
  duration: 0.6,
  delay: 0.2,
  mobile: true
})

// Configuração responsiva automática
const slideAnimation = animationPresets.slideIn('up', {
  duration: 0.7,
  delay: 0.1
})
```

### 2. Componentes de Animação (`components/ui/animated.tsx`)

Componentes reutilizáveis para diferentes tipos de animação:

#### `Animated` - Componente Base
```tsx
import { Animated } from '@/components/ui'

<Animated 
  animation="fadeIn"
  config={{ delay: 0.2 }}
  trigger="scroll"
  className="my-class"
>
  <div>Conteúdo animado</div>
</Animated>
```

**Props:**
- `animation`: Tipo de animação (fadeIn, slideIn, scaleIn, etc.)
- `config`: Configurações específicas (delay, duration, ease)
- `trigger`: Quando disparar a animação ('scroll', 'hover', 'mount')
- `className`: Classes CSS adicionais

#### `StaggerList` - Lista com Animações Sequenciais
```tsx
import { StaggerList, StaggerItem } from '@/components/ui'

<StaggerList staggerDelay={0.15}>
  <StaggerItem animation="fadeIn">
    <div>Item 1</div>
  </StaggerItem>
  <StaggerItem animation="slideIn" config={{ direction: 'up' }}>
    <div>Item 2</div>
  </StaggerItem>
</StaggerList>
```

#### `Hero` - Animação para Seções Hero
```tsx
import { Hero } from '@/components/ui'

<Hero>
  <h1>Título Principal</h1>
  <p>Descrição com animação automática</p>
</Hero>
```

#### `AnimatedCard` - Cards com Efeitos Hover
```tsx
import { AnimatedCard } from '@/components/ui'

<AnimatedCard className="bg-white p-6 rounded-lg">
  <h3>Título do Card</h3>
  <p>Conteúdo com efeitos hover automáticos</p>
</AnimatedCard>
```

## Presets Disponíveis

### 1. **fadeIn**
- **Descrição**: Fade in com movimento vertical
- **Configurações**: `duration`, `delay`, `ease`, `mobile`
- **Responsivo**: Offset menor em mobile (20px vs 30px)

### 2. **slideIn**
- **Descrição**: Slide com direções (up, down, left, right)
- **Configurações**: `direction`, `duration`, `delay`, `ease`, `mobile`
- **Responsivo**: Offset adaptativo por dispositivo

### 3. **scaleIn**
- **Descrição**: Scale com fade
- **Configurações**: `duration`, `delay`, `ease`, `mobile`
- **Responsivo**: Scale inicial menor em mobile (0.9 vs 0.8)

### 4. **rotateIn**
- **Descrição**: Rotação com fade
- **Configurações**: `duration`, `delay`, `ease`, `mobile`
- **Responsivo**: Rotação menor em mobile (5° vs 10°)

### 5. **stagger**
- **Descrição**: Container para animações sequenciais
- **Configurações**: `stagger`, `delay`
- **Responsivo**: Delay menor em mobile (0.1 vs 0.15)

### 6. **hero**
- **Descrição**: Animação especial para seções hero
- **Configurações**: `duration`, `delay`, `ease`, `mobile`
- **Responsivo**: Movimento vertical adaptativo

### 7. **cardHover**
- **Descrição**: Efeitos hover para cards
- **Configurações**: `mobile`
- **Responsivo**: Scale e movimento adaptativos

### 8. **textReveal**
- **Descrição**: Reveal de texto com movimento
- **Configurações**: `duration`, `delay`, `ease`, `mobile`
- **Responsivo**: Movimento vertical adaptativo

## Configurações Responsivas

### Detecção Automática de Mobile
```typescript
// O sistema detecta automaticamente se é mobile
const isMobile = window.innerWidth < 768

// Configurações adaptativas
const config = {
  mobile: {
    duration: 0.5,    // Mais rápido em mobile
    stagger: 0.1,     // Delay menor
    offset: 20        // Movimento menor
  },
  desktop: {
    duration: 0.7,    // Mais suave em desktop
    stagger: 0.15,    // Delay maior
    offset: 40        // Movimento maior
  }
}
```

### Configuração Manual
```typescript
<Animated 
  animation="fadeIn"
  config={{ 
    mobile: true,     // Forçar configuração mobile
    duration: 0.3,    // Duração customizada
    delay: 0.1        // Delay customizado
  }}
>
  Conteúdo
</Animated>
```

## Triggers de Animação

### 1. **scroll** (Padrão)
```tsx
<Animated animation="fadeIn">
  Anima quando entra na viewport
</Animated>
```

### 2. **mount**
```tsx
<Animated animation="fadeIn" trigger="mount">
  Anima imediatamente ao montar
</Animated>
```

### 3. **hover**
```tsx
<Animated animation="cardHover" trigger="hover">
  Anima no hover/tap
</Animated>
```

## Exemplos de Uso

### Seção com Título e Descrição
```tsx
<div className="text-center mb-16">
  <Animated animation="fadeIn">
    <h2 className="text-3xl font-bold mb-4">
      Título da Seção
    </h2>
  </Animated>
  <Animated 
    animation="fadeIn" 
    config={{ delay: 0.2 }}
  >
    <p className="text-lg text-gray-600">
      Descrição com delay para criar sequência
    </p>
  </Animated>
</div>
```

### Grid de Cards com Stagger
```tsx
<StaggerList staggerDelay={0.15}>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {items.map((item, index) => (
      <StaggerItem 
        key={index} 
        animation="scaleIn"
        config={{ delay: index * 0.1 }}
      >
        <AnimatedCard className="bg-white p-6 rounded-lg">
          {item.content}
        </AnimatedCard>
      </StaggerItem>
    ))}
  </div>
</StaggerList>
```

### Hero Section Completa
```tsx
<section className="hero-section">
  <Hero>
    <h1 className="text-4xl font-bold mb-6">
      Título Principal
      <Animated 
        animation="slideIn" 
        config={{ direction: 'up', delay: 0.2 }}
        trigger="mount"
        className="block text-blue-200"
      >
        Subtítulo
      </Animated>
    </h1>
    <Animated 
      animation="fadeIn" 
      config={{ delay: 0.3 }}
      trigger="mount"
    >
      <p>Descrição principal</p>
    </Animated>
    <Animated 
      animation="scaleIn" 
      config={{ delay: 0.5 }}
      trigger="mount"
    >
      <button>Call to Action</button>
    </Animated>
  </Hero>
</section>
```

## Performance e Otimizações

### 1. **Viewport Detection**
- Animações só executam quando visíveis
- `once: true` evita re-animações
- Margin de -50px para trigger antecipado

### 2. **Lazy Loading**
- Componentes só montam quando necessários
- Animações responsivas reduzem carga em mobile

### 3. **Hardware Acceleration**
- Framer Motion usa transform3d automaticamente
- Animações suaves em todos os dispositivos

## Migração do Sistema Anterior

### Antes (Hooks Customizados)
```tsx
const heroTitle = useScrollFadeIn<HTMLHeadingElement>(100, true)

<h1 ref={heroTitle.elementRef} className={heroTitle.className}>
  Título
</h1>
```

### Depois (Framer Motion)
```tsx
<Animated animation="fadeIn" trigger="mount">
  <h1>Título</h1>
</Animated>
```

## Benefícios da Migração

✅ **Performance**: Animações mais suaves e otimizadas  
✅ **Responsividade**: Comportamento adaptativo mobile/desktop  
✅ **Manutenibilidade**: Código mais limpo e reutilizável  
✅ **Flexibilidade**: Sistema de presets configurável  
✅ **Acessibilidade**: Melhor suporte a preferências de movimento  
✅ **Debugging**: DevTools integrados do Framer Motion  

## Troubleshooting

### Animação não funciona
1. Verifique se o componente está dentro da viewport
2. Confirme se o trigger está correto
3. Verifique se não há conflitos de CSS

### Performance ruim em mobile
1. Use configurações mobile específicas
2. Reduza duration e stagger delays
3. Evite animações complexas em dispositivos lentos

### Animações travando
1. Verifique se há loops infinitos
2. Confirme se as dependências estão corretas
3. Use `AnimatePresence` para transições de página

## Próximos Passos

1. **Extender para outras páginas**: Dashboard, admin, etc.
2. **Animações de transição**: Entre páginas e rotas
3. **Gestos touch**: Swipe e pinch para mobile
4. **Animações de loading**: Estados de carregamento
5. **Micro-interações**: Hover states e feedback visual 