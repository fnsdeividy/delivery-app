export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image?: string
  isAvailable: boolean
  preparationTime: number
  allergens?: string[]
  nutritionalInfo?: {
    calories?: number
    protein?: number
    carbohydrates?: number
    fat?: number
  }
}

export interface Category {
  id: string
  name: string
  description?: string
  isActive: boolean
}

export interface Store {
  id: string
  slug: string
  name: string
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
  approved: boolean
  createdAt: string
  updatedAt: string
} 