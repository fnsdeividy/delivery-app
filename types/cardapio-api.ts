// Tipos e interfaces para a API Cardap.IO Delivery API
// Alinhados com o schema Prisma do backend

export interface LoginDto {
  email: string
  password: string
  storeSlug?: string
}

export interface CreateUserDto {
  email: string
  name: string
  password: string
  role: UserRole
  storeSlug?: string
  phone?: string
}

export interface UpdateUserDto {
  name?: string
  email?: string
  role?: UserRole
  active?: boolean
  storeSlug?: string
  phone?: string
}

export interface CreateStoreDto {
  name: string
  slug: string
  description?: string
  config: StoreConfig
  active: boolean
  approved: boolean
}

export interface UpdateStoreDto {
  name?: string
  description?: string
  config?: Partial<StoreConfig>
  active?: boolean
  approved?: boolean
}

export interface StoreConfig {
  address: string
  phone: string
  email: string
  logo?: string
  banner?: string
  category: string
  deliveryFee: number
  minimumOrder: number
  estimatedDeliveryTime: number
  businessHours: BusinessHours
  paymentMethods: PaymentMethod[]
}

export interface BusinessHours {
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
  openTime?: string // HH:mm
  closeTime?: string // HH:mm
  breakStart?: string // HH:mm
  breakEnd?: string // HH:mm
}

export interface CreateProductDto {
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  active: boolean
  preparationTime?: number
  categoryId: string
  storeSlug: string
  ingredients: ProductIngredientDto[]
  addons: ProductAddonDto[]
  nutritionalInfo?: NutritionalInfo
  tags: string[]
  tagColor?: string
}

export interface UpdateProductDto {
  name?: string
  description?: string
  price?: number
  originalPrice?: number
  image?: string
  active?: boolean
  preparationTime?: number
  categoryId?: string
  ingredients?: ProductIngredientDto[]
  addons?: ProductAddonDto[]
  nutritionalInfo?: NutritionalInfo
  tags?: string[]
  tagColor?: string
}

export interface ProductIngredientDto {
  name: string
  included: boolean
  removable: boolean
}

export interface ProductAddonDto {
  name: string
  price: number
  category?: string
  maxQuantity?: number
  active: boolean
}

export interface CreateOrderDto {
  customerId: string
  storeSlug: string
  items: OrderItemDto[]
  type: OrderType
  deliveryAddress?: string
  notes?: string
  paymentMethod: string
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  estimatedDeliveryTime?: Date
}

export interface UpdateOrderDto {
  status?: OrderStatus
  notes?: string
  paymentStatus?: PaymentStatus
  estimatedDeliveryTime?: Date
  deliveredAt?: Date
}

export interface OrderItemDto {
  productId: string
  name: string
  quantity: number
  price: number
  customizations: OrderItemCustomizations
}

export interface OrderItemCustomizations {
  removedIngredients: string[]
  addons: Array<{ name: string; price: number; quantity: number }>
  observations?: string
}

export interface NutritionalInfo {
  calories?: number
  protein?: number
  carbohydrates?: number
  fat?: number
  fiber?: number
  sodium?: number
}

export interface CreateCategoryDto {
  name: string
  description?: string
  order: number
  active: boolean
  image?: string
  storeSlug: string
}

export interface UpdateCategoryDto {
  name?: string
  description?: string
  order?: number
  active?: boolean
  image?: string
}

export interface CreateInventoryDto {
  productId: string
  storeSlug: string
  quantity: number
  minStock: number
  maxStock?: number
}

export interface UpdateInventoryDto {
  quantity?: number
  minStock?: number
  maxStock?: number
}

export interface CreateStockMovementDto {
  productId: string
  inventoryId: string
  type: StockMovementType
  quantity: number
  reason?: string
  reference?: string
  userId?: string
}

// Tipos de resposta da API
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Enums alinhados com o backend
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',        // Lojista/Proprietário
  MANAGER = 'MANAGER',    // Gerente da loja
  EMPLOYEE = 'EMPLOYEE',  // Funcionário
  CLIENTE = 'CLIENTE'     // Cliente final
}

export enum OrderStatus {
  RECEIVED = 'RECEIVED',      // Pedido recebido
  CONFIRMED = 'CONFIRMED',    // Confirmado pela loja
  PREPARING = 'PREPARING',    // Em preparo
  READY = 'READY',            // Pronto para entrega/retirada
  DELIVERING = 'DELIVERING',  // Saiu para entrega
  DELIVERED = 'DELIVERED',    // Entregue
  CANCELLED = 'CANCELLED'     // Cancelado
}

export enum OrderType {
  DELIVERY = 'DELIVERY',      // Entrega
  PICKUP = 'PICKUP'           // Retirada
}

export enum PaymentStatus {
  PENDING = 'PENDING',        // Aguardando pagamento
  PAID = 'PAID',              // Pago
  FAILED = 'FAILED',          // Falhou
  REFUNDED = 'REFUNDED'       // Estornado
}

export enum StockMovementType {
  ENTRADA = 'ENTRADA',        // Compra, reposição
  SAIDA = 'SAIDA',            // Venda, perda, uso
  AJUSTE = 'AJUSTE',          // Correção de estoque
  DEVOLUCAO = 'DEVOLUCAO'     // Devolução de produto
}

// Interfaces de resposta da API
export interface AuthResponse {
  user: {
    id: string
    email: string
    name: string
    role: UserRole
    storeSlug?: string
    active: boolean
    phone?: string
  }
  access_token: string
}

export interface Store {
  id: string
  slug: string
  name: string
  description?: string
  config: StoreConfig
  active: boolean
  approved: boolean
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  active: boolean
  preparationTime?: number
  categoryId: string
  category: Category
  storeSlug: string
  ingredients: ProductIngredient[]
  addons: ProductAddon[]
  nutritionalInfo?: NutritionalInfo
  tags: string[]
  tagColor: string
  inventory?: Inventory
  createdAt: string
  updatedAt: string
}

export interface ProductIngredient {
  id: string
  name: string
  included: boolean
  removable: boolean
}

export interface ProductAddon {
  id: string
  name: string
  price: number
  category?: string
  maxQuantity?: number
  active: boolean
}

export interface Category {
  id: string
  name: string
  description?: string
  order: number
  active: boolean
  image?: string
  storeSlug: string
  createdAt: string
  updatedAt: string
}

export interface Inventory {
  id: string
  quantity: number
  minStock: number
  maxStock?: number
  productId: string
  storeSlug: string
  createdAt: string
  updatedAt: string
}

export interface StockMovement {
  id: string
  type: StockMovementType
  quantity: number
  reason?: string
  reference?: string
  productId: string
  inventoryId: string
  userId?: string
  createdAt: string
}

export interface Order {
  id: string
  orderNumber: string
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  status: OrderStatus
  type: OrderType
  paymentMethod: string
  paymentStatus: PaymentStatus
  customerId: string
  customer: Customer
  userId?: string
  storeSlug: string
  items: OrderItem[]
  notes?: string
  estimatedDeliveryTime?: string
  deliveredAt?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  productId: string
  product: Product
  customizations: OrderItemCustomizations
  createdAt: string
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone: string
  address?: Address
  storeSlug: string
  userId?: string
  createdAt: string
  updatedAt: string
}

export interface Address {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  storeSlug?: string
  active: boolean
  phone?: string
  createdAt: string
  updatedAt: string
  lastLogin?: string
}

export interface StoreStats {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  totalProducts: number
  activeProducts: number
  totalCustomers: number
}

export interface OrderStats {
  totalOrders: number
  ordersByStatus: Record<OrderStatus, number>
  totalRevenue: number
  averageOrderValue: number
  ordersByType: Record<OrderType, number>
}

export interface AnalyticsData {
  revenue: {
    daily: number[]
    weekly: number[]
    monthly: number[]
  }
  orders: {
    daily: number[]
    weekly: number[]
    monthly: number[]
  }
  topProducts: Array<{
    productId: string
    productName: string
    quantity: number
    revenue: number
  }>
  customerMetrics: {
    newCustomers: number
    returningCustomers: number
    averageOrderFrequency: number
  }
} 