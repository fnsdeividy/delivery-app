// Schema TypeScript completo para configurações do estabelecimento

export interface StoreConfig {
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

// Categoria de produtos
export interface Category {
  id: string
  name: string
  description?: string
  order: number
  active: boolean
  image?: string
}

// Produto do cardápio
export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  category: string
  ingredients: string[]
  tags: string[]
  tagColor: string
  active: boolean
  preparationTime?: number
  nutritionalInfo?: NutritionalInfo
  customizeIngredients: CustomizeIngredient[]
  addons: Addon[]
}

// Ingrediente customizável
export interface CustomizeIngredient {
  id: string
  name: string
  included: boolean
  removable: boolean
}

// Adicional/Extra
export interface Addon {
  id: string
  name: string
  price: number
  selected: boolean
  category?: string
  maxQuantity?: number
}

// Informações nutricionais
export interface NutritionalInfo {
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  fiber?: number
  sodium?: number
}

// Área de entrega
export interface DeliveryArea {
  id: string
  name: string // Nome do bairro/região
  active: boolean
  fee: number // Taxa específica da área
  estimatedTime: number // Tempo estimado em minutos
}

// Configurações de pagamento
export interface StripeConfig {
  publicKey: string
  secretKey: string
  webhookSecret: string
}

export interface MercadoPagoConfig {
  publicKey: string
  accessToken: string
  webhookUrl: string
}

// Horário de funcionamento
export interface WeekSchedule {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

export interface DaySchedule {
  open: boolean
  hours: TimeRange[]
}

export interface TimeRange {
  start: string // formato "HH:mm"
  end: string   // formato "HH:mm"
}

// Feriados
export interface Holiday {
  id: string
  name: string
  date: string // formato "YYYY-MM-DD"
  closed: boolean
  customHours?: TimeRange[]
  message?: string
}

// Cupons de desconto
export interface Coupon {
  id: string
  code: string
  name: string
  description: string
  type: 'percentage' | 'fixed'
  value: number
  minimumValue?: number
  maxDiscount?: number
  validFrom: string
  validUntil: string
  usageLimit?: number
  usageCount: number
  active: boolean
  firstTimeOnly: boolean
}

// Combos
export interface Combo {
  id: string
  name: string
  description: string
  image: string
  price: number
  originalPrice: number
  products: ComboProduct[]
  active: boolean
  validFrom?: string
  validUntil?: string
}

export interface ComboProduct {
  productId: string
  quantity: number
  customizations?: any
}

// Programa de fidelidade
export interface LoyaltyProgram {
  enabled: boolean
  pointsPerReal: number // Pontos por real gasto
  pointsToReal: number  // Quantos pontos = 1 real
  bonusRules: BonusRule[]
}

export interface BonusRule {
  id: string
  name: string
  description: string
  multiplier: number // Multiplicador de pontos
  conditions: {
    minimumValue?: number
    productCategories?: string[]
    dayOfWeek?: number[]
    timeRange?: TimeRange
  }
}

// Pedido
export interface Order {
  id: string
  storeSlug: string
  customerId?: string
  customerInfo: CustomerInfo
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  status: OrderStatus
  type: 'delivery' | 'pickup'
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'failed'
  createdAt: string
  updatedAt: string
  estimatedDeliveryTime?: string
  notes?: string
}

export interface CustomerInfo {
  name: string
  phone: string
  email?: string
  address?: Address
}

export interface Address {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  reference?: string
}

export interface OrderItem {
  productId: string
  name: string
  quantity: number
  price: number
  customizations: {
    removedIngredients: string[]
    addons: {
      id: string
      name: string
      price: number
      quantity: number
    }[]
    observations?: string
  }
}

export type OrderStatus = 
  | 'received'     // Pedido recebido
  | 'confirmed'    // Confirmado pela loja
  | 'preparing'    // Em preparo
  | 'ready'        // Pronto para entrega/retirada
  | 'delivering'   // Saiu para entrega
  | 'delivered'    // Entregue
  | 'cancelled'    // Cancelado

// Usuário lojista
export interface StoreOwner {
  id: string
  name: string
  email: string
  phone: string
  stores: string[] // Array de slugs das lojas que gerencia
  role: 'owner' | 'manager' | 'employee'
  permissions: Permission[]
  createdAt: string
  lastLogin?: string
}

export interface Permission {
  resource: string // ex: 'products', 'orders', 'settings'
  actions: string[] // ex: ['read', 'write', 'delete']
}

// Analytics
export interface SalesAnalytics {
  period: {
    start: string
    end: string
  }
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  topProducts: ProductSales[]
  salesByHour: HourSales[]
  salesByDay: DaySales[]
  paymentMethods: PaymentMethodSales[]
}

export interface ProductSales {
  productId: string
  productName: string
  quantity: number
  revenue: number
}

export interface HourSales {
  hour: number
  orders: number
  revenue: number
}

export interface DaySales {
  date: string
  orders: number
  revenue: number
}

export interface PaymentMethodSales {
  method: string
  orders: number
  revenue: number
  percentage: number
}