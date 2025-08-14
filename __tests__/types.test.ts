import {
    CreateOrderDto,
    CreateProductDto,
    CreateStoreDto,
    CreateUserDto,
    LoginDto,
    Order,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
    Product,
    Store,
    UserRole
} from '@/types/cardapio-api'

describe('Cardap.IO API Types', () => {
  describe('Enums', () => {
    it('should have correct UserRole values', () => {
      expect(UserRole.ADMIN).toBe('ADMIN')
      expect(UserRole.SUPER_ADMIN).toBe('SUPER_ADMIN')
      expect(UserRole.CLIENTE).toBe('CLIENTE')
    })

    it('should have correct OrderStatus values', () => {
      expect(OrderStatus.PENDING).toBe('PENDING')
      expect(OrderStatus.CONFIRMED).toBe('CONFIRMED')
      expect(OrderStatus.PREPARING).toBe('PREPARING')
      expect(OrderStatus.READY).toBe('READY')
      expect(OrderStatus.DELIVERING).toBe('DELIVERING')
      expect(OrderStatus.DELIVERED).toBe('DELIVERED')
      expect(OrderStatus.CANCELLED).toBe('CANCELLED')
    })

    it('should have correct PaymentStatus values', () => {
      expect(PaymentStatus.PENDING).toBe('PENDING')
      expect(PaymentStatus.PAID).toBe('PAID')
      expect(PaymentStatus.FAILED).toBe('FAILED')
      expect(PaymentStatus.REFUNDED).toBe('REFUNDED')
    })

    it('should have correct PaymentMethod values', () => {
      expect(PaymentMethod.CASH).toBe('CASH')
      expect(PaymentMethod.CREDIT_CARD).toBe('CREDIT_CARD')
      expect(PaymentMethod.DEBIT_CARD).toBe('DEBIT_CARD')
      expect(PaymentMethod.PIX).toBe('PIX')
      expect(PaymentMethod.BANK_TRANSFER).toBe('BANK_TRANSFER')
    })
  })

  describe('DTOs', () => {
    it('should validate LoginDto structure', () => {
      const loginData: LoginDto = {
        email: 'test@example.com',
        password: 'password123'
      }

      expect(loginData.email).toBe('test@example.com')
      expect(loginData.password).toBe('password123')
    })

    it('should validate CreateUserDto structure', () => {
      const userData: CreateUserDto = {
        email: 'user@example.com',
        name: 'Test User',
        password: 'password123',
        role: UserRole.ADMIN
      }

      expect(userData.email).toBe('user@example.com')
      expect(userData.name).toBe('Test User')
      expect(userData.password).toBe('password123')
      expect(userData.role).toBe(UserRole.ADMIN)
    })

    it('should validate CreateStoreDto structure', () => {
      const storeData: CreateStoreDto = {
        name: 'Test Store',
        slug: 'test-store',
        address: '123 Test St',
        phone: '11999999999',
        email: 'store@example.com',
        category: 'Restaurante',
        deliveryFee: 5,
        minimumOrder: 20,
        estimatedDeliveryTime: 30,
        isActive: true,
        ownerId: 'user123'
      }

      expect(storeData.name).toBe('Test Store')
      expect(storeData.slug).toBe('test-store')
      expect(storeData.deliveryFee).toBe(5)
      expect(storeData.isActive).toBe(true)
    })

    it('should validate CreateProductDto structure', () => {
      const productData: CreateProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 25.99,
        categoryId: 'cat123',
        storeId: 'store123',
        isAvailable: true
      }

      expect(productData.name).toBe('Test Product')
      expect(productData.price).toBe(25.99)
      expect(productData.isAvailable).toBe(true)
    })

    it('should validate CreateOrderDto structure', () => {
      const orderData: CreateOrderDto = {
        customerId: 'user123',
        storeId: 'store123',
        items: [
          {
            productId: 'prod123',
            quantity: 2,
            unitPrice: 25.99
          }
        ],
        deliveryAddress: '123 Delivery St',
        paymentMethod: PaymentMethod.PIX,
        totalAmount: 51.98,
        deliveryFee: 5
      }

      expect(orderData.customerId).toBe('user123')
      expect(orderData.items).toHaveLength(1)
      expect(orderData.totalAmount).toBe(51.98)
      expect(orderData.paymentMethod).toBe(PaymentMethod.PIX)
    })
  })

  describe('Entity Types', () => {
    it('should validate Store structure', () => {
      const store: Store = {
        id: 'store123',
        name: 'Test Store',
        slug: 'test-store',
        address: '123 Test St',
        phone: '11999999999',
        email: 'store@example.com',
        category: 'Restaurante',
        deliveryFee: 5,
        minimumOrder: 20,
        estimatedDeliveryTime: 30,
        isActive: true,
        ownerId: 'user123',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }

      expect(store.id).toBe('store123')
      expect(store.isActive).toBe(true)
      expect(store.createdAt).toBeDefined()
    })

    it('should validate Product structure', () => {
      const product: Product = {
        id: 'prod123',
        name: 'Test Product',
        description: 'Test Description',
        price: 25.99,
        categoryId: 'cat123',
        storeId: 'store123',
        isAvailable: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }

      expect(product.id).toBe('prod123')
      expect(product.price).toBe(25.99)
      expect(product.isAvailable).toBe(true)
    })

    it('should validate Order structure', () => {
      const order: Order = {
        id: 'order123',
        customerId: 'user123',
        storeId: 'store123',
        items: [],
        deliveryAddress: '123 Delivery St',
        paymentMethod: PaymentMethod.PIX,
        totalAmount: 50.99,
        deliveryFee: 5,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }

      expect(order.id).toBe('order123')
      expect(order.status).toBe(OrderStatus.PENDING)
      expect(order.paymentStatus).toBe(PaymentStatus.PENDING)
    })
  })
}) 