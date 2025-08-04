# Configuração de Tema para Lojistas

Este diretório contém os arquivos de configuração para personalização visual do delivery app por loja.

## 📁 Arquivos

- `theme-config.json` - Configuração completa de cores e estilos para uma loja
- `colors.json` - Configuração base das cores do sistema (existente)

## 🎨 Personalização por Loja

### Estrutura do theme-config.json

```json
{
  "storeId": "identificador-da-loja",
  "storeName": "Nome da Loja",
  "colors": {
    "primary": {
      "main": "#ed7516",     // Cor principal da marca
      "light": "#f59e56",    // Versão clara
      "dark": "#cc6914",     // Versão escura
      "contrast": "#ffffff"  // Cor do texto sobre essa cor
    },
    "secondary": { ... },
    "background": { ... },
    "text": { ... }
  },
  "typography": { ... },
  "customization": {
    "logo": {
      "url": "https://...",
      "width": "auto",
      "height": "40px"
    },
    "metadata": {
      "title": "Nome da Loja - Delivery",
      "description": "Descrição da loja"
    }
  }
}
```

## 🔧 Como Usar

### 1. Para Desenvolvedores

```typescript
// hooks/useThemeConfig.ts
import themeConfig from '../config/theme-config.json'

export const useThemeConfig = () => {
  return themeConfig
}

// Aplicar cores dinamicamente
const theme = useThemeConfig()
const primaryColor = theme.colors.primary.main
```

### 2. Para Lojistas

1. **Cores da Marca**: Defina as cores principais que representam sua marca
2. **Logo**: Adicione a URL do seu logo
3. **Metadados**: Configure título e descrição da sua loja
4. **Tipografia**: Ajuste tamanhos e pesos de fonte

## 🎯 Elementos Personalizáveis

### Cores
- **Primary**: Botões principais, links, destaques
- **Secondary**: Elementos secundários, texto auxiliar
- **Background**: Fundos de páginas e componentes
- **Success/Warning/Error**: Estados de feedback
- **Text**: Cores de texto em diferentes hierarquias

### Visual
- **Logo**: Imagem da marca na header
- **Favicon**: Ícone do navegador
- **Border Radius**: Cantos arredondados dos elementos
- **Spacing**: Espaçamentos internos e externos

### Conteúdo
- **Título**: Nome que aparece na aba do navegador
- **Descrição**: Meta description para SEO
- **Nome da Loja**: Exibido na interface

## 📋 Exemplo de Implementação

```typescript
// Aplicar tema globalmente
export default function Layout({ children }: { children: React.ReactNode }) {
  const theme = useThemeConfig()
  
  return (
    <html>
      <head>
        <title>{theme.customization.metadata.title}</title>
        <meta name="description" content={theme.customization.metadata.description} />
        <link rel="icon" href={theme.customization.favicon.url} />
        <style>{`
          :root {
            --color-primary: ${theme.colors.primary.main};
            --color-secondary: ${theme.colors.secondary.main};
            --color-background: ${theme.colors.background.default};
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

## 🔄 Processo de Atualização

1. **Lojista** escolhe cores no painel administrativo
2. **Sistema** gera o theme-config.json
3. **Aplicação** aplica automaticamente as novas cores
4. **Usuários** veem o site com a identidade visual da loja

## 🛠️ Ferramentas Recomendadas

- **Color Picker**: Para escolher cores precisas
- **Contrast Checker**: Garantir acessibilidade
- **Logo Optimizer**: Otimizar imagens para web
- **Preview Mode**: Visualizar antes de aplicar