# 🏪 Plano: Sistema Dashboard Multi-Tenant para Estabelecimentos

## 📋 Resumo Executivo
Implementação de um sistema completo de dashboard administrativo multi-tenant, onde cada estabelecimento possui:
- **Interface pública**: `/loja/[slug]` para consumidores
- **Dashboard privado**: `/dashboard/[slug]` para proprietários
- **Sistema de configuração JSON** por estabelecimento
- **Autenticação baseada em roles** (lojista/admin)

---

## 🏗️ Estrutura de Rotas Proposta

### 🌐 URLs do Sistema
| Página | URL | Acesso | Descrição |
|--------|-----|--------|-----------|
| **Cardápio Público** | `/loja/boteco-do-joao` | Público | Interface do consumidor |
| **Dashboard Lojista** | `/dashboard/boteco-do-joao` | Privado | Painel administrativo |
| **Login Lojista** | `/login/lojista` | Público | Autenticação de proprietários |
| **Registro Loja** | `/registro/loja` | Público | Cadastro de novo estabelecimento |

### 📁 Estrutura de Diretórios
```
/app
├── loja/
│   └── [slug]/
│       ├── page.tsx           # Cardápio público da loja
│       ├── layout.tsx         # Layout específico da loja
│       └── loading.tsx        # Loading da loja
├── dashboard/
│   ├── layout.tsx             # Layout com sidebar administrativa
│   └── [slug]/
│       ├── page.tsx           # Visão geral do dashboard
│       ├── produtos/
│       │   ├── page.tsx       # Lista de produtos
│       │   ├── novo/page.tsx  # Criar produto
│       │   └── [id]/page.tsx  # Editar produto
│       ├── configuracoes/
│       │   ├── page.tsx       # Configurações gerais
│       │   ├── visual/page.tsx # Personalização visual
│       │   ├── entrega/page.tsx # Configurações de entrega
│       │   └── pagamento/page.tsx # Métodos de pagamento
│       ├── pedidos/
│       │   └── page.tsx       # Gestão de pedidos
│       └── analytics/
│           └── page.tsx       # Relatórios e métricas
├── login/
│   ├── lojista/page.tsx       # Login específico para lojistas
│   └── cliente/page.tsx       # Login para clientes
├── registro/
│   └── loja/page.tsx          # Cadastro de nova loja
└── middleware.ts              # Proteção de rotas
```

---

## 🔐 Sistema de Autenticação e Autorização

### **Middleware de Proteção**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Proteger todas as rotas /dashboard/*
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Verificar autenticação de lojista
    // Redirecionar para /login/lojista se não autenticado
  }
}

export const config = {
  matcher: ['/dashboard/:path*']
}
```

### **Roles de Usuário**
- **Cliente**: Acesso apenas ao cardápio público
- **Lojista**: Acesso ao dashboard da própria loja
- **Admin**: Acesso a múltiplas lojas (super admin)

---

## 📊 Schema de Configuração por Loja

### **Estrutura do arquivo `config/stores/[slug].json`**
```typescript
interface StoreConfig {
  // Identificação
  slug: string
  name: string
  description: string
  
  // 🎨 Personalização Visual
  branding: {
    logo: string
    favicon: string
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    textColor: string
    accentColor: string
    bannerImage?: string
  }
  
  // 🏪 Informações do Estabelecimento
  business: {
    cnpj?: string
    phone: string
    email: string
    website?: string
    socialMedia: {
      instagram?: string
      facebook?: string
      whatsapp?: string
    }
  }
  
  // 🍔 Cardápio e Produtos
  menu: {
    categories: Category[]
    products: Product[]
    addons: Addon[]
  }
  
  // 🚚 Configurações de Entrega
  delivery: {
    enabled: boolean
    radius: number // em km
    fee: number
    freeDeliveryMinimum?: number
    areas: DeliveryArea[]
    estimatedTime: number // em minutos
  }
  
  // 💳 Métodos de Pagamento
  payments: {
    pix: boolean
    cash: boolean
    card: boolean
    online: boolean
    integrations: {
      stripe?: StripeConfig
      mercadoPago?: MercadoPagoConfig
    }
  }
  
  // ⏰ Horário de Funcionamento
  schedule: {
    timezone: string
    workingHours: WeekSchedule
    holidays: Holiday[]
    closedMessage: string
  }
  
  // 💸 Promoções e Cupons
  promotions: {
    coupons: Coupon[]
    combos: Combo[]
    loyaltyProgram?: LoyaltyProgram
  }
  
  // ⚙️ Configurações Gerais
  settings: {
    preparationTime: number
    whatsappTemplate: string
    orderNotifications: boolean
    customerRegistrationRequired: boolean
    minimumOrderValue?: number
  }
}
```

---

## 🎯 Funcionalidades por Página do Dashboard

### **1. 📊 Visão Geral (`/dashboard/[slug]`)**
- Resumo de vendas do dia/semana/mês
- Pedidos pendentes em tempo real
- Produtos mais vendidos
- Métricas de performance

### **2. 🍔 Gestão de Produtos (`/dashboard/[slug]/produtos`)**
- Lista completa de produtos
- Criar/editar/excluir produtos
- Upload de imagens
- Configurar adicionais e opções
- Organizar categorias
- Controle de estoque

### **3. 🎨 Personalização Visual (`/dashboard/[slug]/configuracoes/visual`)**
- Upload de logo
- Seletor de cores (primary, secondary, accent)
- Upload de banner promocional
- Preview em tempo real
- Templates pré-definidos

### **4. 🚚 Configurações de Entrega (`/dashboard/[slug]/configuracoes/entrega`)**
- Definir raio de entrega
- Configurar taxa de entrega
- Mapear bairros atendidos
- Tempo estimado de entrega
- Delivery gratuito por valor mínimo

### **5. 💳 Métodos de Pagamento (`/dashboard/[slug]/configuracoes/pagamento`)**
- Ativar/desativar métodos
- Configurar integrações (Stripe, Mercado Pago)
- Definir taxa de conveniência
- Configurar parcelamento

### **6. 📋 Gestão de Pedidos (`/dashboard/[slug]/pedidos`)**
- Lista de pedidos em tempo real
- Alterar status (recebido, preparando, saiu, entregue)
- Detalhes completos do pedido
- Histórico de pedidos
- Integração com WhatsApp

### **7. 📈 Analytics e Relatórios (`/dashboard/[slug]/analytics`)**
- Vendas por período
- Produtos mais vendidos
- Horários de pico
- Análise de clientes
- Relatórios de entrega

---

## 🔄 Fluxo de Aplicação de Configurações

### **1. Carregamento Dinâmico**
```typescript
// Hook para carregar configurações por slug
function useStoreConfig(slug: string) {
  const [config, setConfig] = useState<StoreConfig | null>(null)
  
  useEffect(() => {
    // Carregar config/stores/{slug}.json
    // Aplicar configurações ao contexto global
    // Atualizar tema CSS dinâmico
  }, [slug])
  
  return { config, updateConfig }
}
```

### **2. Aplicação em Tempo Real**
- Mudanças no dashboard aplicadas instantaneamente
- CSS customizado injetado dinamicamente
- Cache inteligente para performance
- Fallback para configurações padrão

---

## 🚀 Próximos Passos de Implementação

### **Fase 1: Estrutura Base** ⏱️ 2-3 dias
- [x] ✅ Criar estrutura de rotas multi-tenant
- [ ] 🔄 Implementar middleware de autenticação
- [ ] 📝 Criar schema TypeScript completo
- [ ] 🗂️ Sistema de arquivos de configuração por loja

### **Fase 2: Dashboard Core** ⏱️ 3-4 dias
- [ ] 🎨 Layout administrativo com sidebar
- [ ] 📊 Página de visão geral
- [ ] 🔐 Sistema de autenticação para lojistas
- [ ] ⚙️ Hook useStoreConfig

### **Fase 3: Gestão de Produtos** ⏱️ 2-3 dias
- [ ] 📋 CRUD completo de produtos
- [ ] 📁 Sistema de categorias
- [ ] 🖼️ Upload e gestão de imagens
- [ ] 🍕 Configuração de adicionais

### **Fase 4: Personalização Visual** ⏱️ 2-3 dias
- [ ] 🎨 Interface de configuração visual
- [ ] 🖼️ Upload de logo e banner
- [ ] 🎯 Seletor de cores
- [ ] 👁️ Preview em tempo real

### **Fase 5: Configurações Operacionais** ⏱️ 3-4 dias
- [ ] ⏰ Sistema de horário de funcionamento
- [ ] 🚚 Configurações de entrega
- [ ] 💳 Métodos de pagamento
- [ ] 📱 Templates de WhatsApp

### **Fase 6: Gestão de Pedidos** ⏱️ 3-4 dias
- [ ] 📋 Interface de pedidos em tempo real
- [ ] 🔄 Sistema de status de pedidos
- [ ] 📊 Dashboard de métricas
- [ ] 🔔 Notificações

### **Fase 7: Testes e Deploy** ⏱️ 2-3 dias
- [ ] 🧪 Testes unitários e integração
- [ ] 📚 Documentação completa
- [ ] 🚀 Configuração de deploy
- [ ] 🐛 Correção de bugs

---

## 🎯 Resultados Esperados

### **Para o Proprietário da Loja:**
- ✅ Controle total sobre aparência e funcionamento
- ✅ Gestão simplificada de produtos e pedidos
- ✅ Análises detalhadas de performance
- ✅ Configuração sem conhecimento técnico

### **Para o Cliente Final:**
- ✅ Experiência personalizada por estabelecimento
- ✅ Interface otimizada e responsiva
- ✅ Informações sempre atualizadas
- ✅ Processo de pedido simplificado

### **Para o Desenvolvedor:**
- ✅ Arquitetura escalável e maintível
- ✅ Código tipado e testado
- ✅ Sistema de configuração flexível
- ✅ Deploy simples e eficiente

---

**🔥 Este plano está aprovado? Posso iniciar a implementação da estrutura multi-tenant?**