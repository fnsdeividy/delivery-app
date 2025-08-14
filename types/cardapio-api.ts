// Tipos e interfaces para a API Cardap.IO Delivery API

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
}

export interface UpdateUserDto {
  name?: string
  email?: string
  role?: UserRole
  active?: boolean
  storeSlug?: string
}

export interface CreateStoreDto {
  name: string
  slug: string
  description?: string
  address: string
  phone: string
  email: string
  logo?: string
  banner?: string
  category: string
  deliveryFee: number
  minimumOrder: number
  estimatedDeliveryTime: number
  isActive: boolean
  ownerId: string
}

export interface UpdateStoreDto {
  name?: string
  description?: string
  address?: string
  phone?: string
  email?: string
  logo?: string
  banner?: string
  category?: string
  deliveryFee?: number
  minimumOrder?: number
  estimatedDeliveryTime?: number
  isActive?: boolean
}

export interface CreateProductDto {
  name: string
  description: string
  price: number
  categoryId: string
  storeId: string
  image?: string
  isAvailable: boolean
  stockQuantity?: number
  preparationTime?: number
  allergens?: string[]
  nutritionalInfo?: NutritionalInfo
}

export interface UpdateProductDto {
  name?: string
  description?: string
  price?: number
  categoryId?: string
  image?: string
  isAvailable?: boolean
  stockQuantity?: number
  preparationTime?: number
  allergens?: string[]
  nutritionalInfo?: NutritionalInfo
}

export interface CreateOrderDto {
  customerId: string
  storeId: string
  items: OrderItemDto[]
  deliveryAddress: string
  deliveryInstructions?: string
  paymentMethod: PaymentMethod
  totalAmount: number
  deliveryFee: number
  estimatedDeliveryTime?: number
}

export interface UpdateOrderDto {
  status?: OrderStatus
  deliveryInstructions?: string
  paymentStatus?: PaymentStatus
  assignedTo?: string
}

export interface OrderItemDto {
  productId: string
  quantity: number
  unitPrice: number
  specialInstructions?: string
}

export interface NutritionalInfo {
  calories?: number
  protein?: number
  carbohydrates?: number
  fat?: number
  fiber?: number
  sodium?: number
}

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

// Enums
export enum UserRole {
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  CLIENTE = 'CLIENTE'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERING = 'DELIVERING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PIX = 'PIX',
  BANK_TRANSFER = 'BANK_TRANSFER'
}

// Tipos de resposta da API
export interface AuthResponse {
  user: {
    id: string
    email: string
    name: string
    role: UserRole
    storeSlug?: string
    active: boolean
  }
  access_token: string
}

export interface Store {
  id: string
  name: string
  slug: string
  description?: string
  address: string
  phone: string
  email: string
  logo?: string
  banner?: string
  category: string
  deliveryFee: number
  minimumOrder: number
  estimatedDeliveryTime: number
  isActive: boolean
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  categoryId: string
  storeId: string
  image?: string
  isAvailable: boolean
  stockQuantity?: number
  preparationTime?: number
  allergens?: string[]
  nutritionalInfo?: NutritionalInfo
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  customerId: string
  storeId: string
  items: OrderItem[]
  deliveryAddress: string
  deliveryInstructions?: string
  paymentMethod: PaymentMethod
  totalAmount: number
  deliveryFee: number
  estimatedDeliveryTime?: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  assignedTo?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  productId: string
  product: Product
  quantity: number
  unitPrice: number
  specialInstructions?: string
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  storeSlug?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  description?: string
  storeId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface StoreStats {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  totalProducts: number
  activeProducts: number
}

export interface OrderStats {
  totalOrders: number
  ordersByStatus: Record<OrderStatus, number>
  totalRevenue: number
  averageOrderValue: number
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