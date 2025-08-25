# Implementação da Página de Configurações Visuais

## Visão Geral

Esta documentação descreve a implementação da página de configurações visuais (`/dashboard/:storeSlug/configuracoes/visual`) conforme os critérios de aceite especificados.

## Funcionalidades Implementadas

### 1. Autenticação e Autorização ✅

- ✅ Página acessível apenas para usuários autenticados e ADMIN da loja
- ✅ Tratamento de erros 403/404/422/500 sem redirecionamento para /login
- ✅ Tratamento de erro 401 com tentativa de refresh e redirecionamento para /login?message=session_expired

### 2. Layout e Navegação ✅

- ✅ Título "Aparência Visual" com subtítulo descritivo
- ✅ Ações no topo-direito: Visualizar (preview) e Salvar
- ✅ Link "Voltar ao Dashboard" mantém estado local
- ✅ Cards organizados em grid responsivo

### 3. Upload de Imagens ✅

- ✅ **Logo**: JPG/PNG/SVG, ≤ 2MB
- ✅ **Favicon**: PNG/ICO, ≤ 500KB, recomendado 32×32
- ✅ **Banner**: JPG/PNG, ≤ 3MB, recomendado 1200×300
- ✅ Validação MIME real (sniffing)
- ✅ Suporte a drag and drop
- ✅ Preview local imediato
- ✅ Indicador de upload/progresso
- ✅ Botão remover sem apagar valores persistidos
- ✅ Tratamento de erros sem logout

### 4. Esquemas de Cores (Presets) ✅

- ✅ 5 presets visíveis com nomes descritivos
- ✅ Aplicação de cores ao clicar
- ✅ Destaque visual do preset selecionado
- ✅ Botão Visualizar considera preset selecionado

### 5. Cores Personalizadas ✅

- ✅ Inputs aceitam HEX #RRGGBB e #RGB
- ✅ Color picker integrado
- ✅ Validação e normalização para #RRGGBB maiúsculo
- ✅ Verificação de contraste WCAG AA (4.5:1)
- ✅ Avisos visuais para contraste baixo
- ✅ Atualização em tempo real do preview

## Componentes Criados

### 1. `FileUpload` (`/components/ui/FileUpload.tsx`)

Componente reutilizável para upload de arquivos com:

- Drag and drop
- Validação de tipo e tamanho
- Preview de arquivos
- Estados de loading
- Tratamento de erros

### 2. `ColorInput` (`/components/ui/ColorInput.tsx`)

Componente para seleção de cores com:

- Input de texto HEX
- Color picker
- Validação de formato
- Verificação de contraste WCAG
- Indicadores visuais de status

### 3. Utilitários de Validação (`/lib/utils/color-validation.ts`)

Funções para:

- Validação de cores HEX
- Cálculo de contraste WCAG
- Normalização de formatos
- Geração de paletas acessíveis

## Estrutura da Página

```
VisualConfigPage
├── Header (título + botões)
├── Link Voltar
├── Mensagens (sucesso/erro)
├── Erros de Validação
├── Grid Principal
│   ├── Coluna Esquerda (Uploads)
│   │   ├── Logo Upload
│   │   ├── Favicon Upload
│   │   └── Banner Upload
│   └── Coluna Direita (Cores)
│       ├── Esquemas Pré-definidos
│       └── Cores Personalizadas
└── Preview (condicional)
```

## Estados e Gerenciamento

### Estados Principais

- `branding`: Configuração atual de branding
- `fileUploads`: Estado dos uploads (loading)
- `showPreview`: Visibilidade do preview
- `saving`: Estado de salvamento
- `message`: Mensagens de feedback
- `validationErrors`: Erros de validação

### Fluxo de Dados

1. **Carregamento**: `useStoreConfig` busca dados da loja
2. **Edição**: Usuário modifica cores e faz uploads
3. **Validação**: Verificação antes de salvar
4. **Persistência**: API salva configuração
5. **Feedback**: Mensagens de sucesso/erro

## Validações Implementadas

### Cores

- Formato HEX válido (#RRGGBB ou #RGB)
- Normalização automática
- Verificação de contraste WCAG AA

### Arquivos

- Tipo MIME real (não apenas extensão)
- Tamanho máximo por tipo
- Formatos suportados por tipo

### Configuração

- Validação antes de salvar
- Verificação de contraste texto/background
- Prevenção de dados inválidos

## Tratamento de Erros

### Erros de Upload

- Tipo de arquivo não suportado
- Arquivo muito grande
- Erros de rede
- Permissões insuficientes

### Erros de API

- 401: Sessão expirada
- 403: Acesso negado
- 404: Loja não encontrada
- 422: Dados inválidos
- 500: Erro interno

### Erros de Validação

- Cores inválidas
- Contraste insuficiente
- Campos obrigatórios

## Acessibilidade

### WCAG 2.1 AA

- Contraste mínimo 4.5:1 para texto normal
- Indicadores visuais de status
- Mensagens de erro claras
- Navegação por teclado

### Feedback Visual

- Estados de loading
- Mensagens de erro/sucesso
- Avisos de contraste
- Preview em tempo real

## Responsividade

### Breakpoints

- Mobile: 1 coluna
- Desktop: 2 colunas
- Grid adaptativo
- Espaçamento responsivo

### Componentes

- Uploads empilhados em mobile
- Cores em grid responsivo
- Preview adaptativo
- Botões com tamanhos apropriados

## Testes

### Cobertura

- Renderização dos componentes
- Interações do usuário
- Estados de loading/erro
- Validações
- Navegação

### Arquivo de Teste

`__tests__/VisualConfigPage.test.tsx` com testes para:

- Renderização da página
- Funcionalidades principais
- Estados de erro
- Interações do usuário

## Melhorias Futuras

### Funcionalidades

- [ ] Histórico de alterações
- [ ] Backup/restore de configurações
- [ ] Templates de cores adicionais
- [ ] Exportação de paletas

### Performance

- [ ] Lazy loading de imagens
- [ ] Debounce para validações
- [ ] Cache de configurações
- [ ] Otimização de re-renders

### UX

- [ ] Tour guiado para novos usuários
- [ ] Sugestões de cores baseadas na logo
- [ ] Preview em diferentes dispositivos
- [ ] Animações de transição

## Dependências

### Internas

- `@/lib/store/useStoreConfig`
- `@/lib/api-client`
- `@/components/ui/*`

### Externas

- `@phosphor-icons/react`
- `next/navigation`
- `react` (hooks)

## Conclusão

A implementação atende completamente aos critérios de aceite especificados, fornecendo uma interface robusta e acessível para personalização visual das lojas. Os componentes são reutilizáveis e seguem as melhores práticas de desenvolvimento React e acessibilidade web.
