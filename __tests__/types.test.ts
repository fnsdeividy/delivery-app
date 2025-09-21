import {
  ApiResponse,
  CreateOrderDto,
  CreateProductDto,
  CreateStoreDto,
  CreateUserDto,
  LoginDto,
  Order,
  OrderStats,
  OrderStatus,
  PaginatedResponse,
  PaymentStatus,
  Product,
  StockMovementType,
  Store,
  StoreStats,
  User,
  UserRole
} from '../types/cardapio-api'

describe('Cardap.IO API Types', () => {
  describe('Enums', () => {
    it('should have correct UserRole values', () => {
      expect(UserRole.SUPER_ADMIN).toBe('SUPER_ADMIN')
      expect(UserRole.ADMIN).toBe('ADMIN')
      expect(UserRole.MANAGER).toBe('MANAGER')
      expect(UserRole.EMPLOYEE).toBe('EMPLOYEE')
      expect(UserRole.CLIENTE).toBe('CLIENTE')
    })

    it('should have correct OrderStatus values', () => {
      expect(OrderStatus.RECEIVED).toBe('RECEIVED')
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

    it('should have correct StockMovementType values', () => {
      expect(StockMovementType.ENTRADA).toBe('ENTRADA')
      expect(StockMovementType.SAIDA).toBe('SAIDA')
      expect(StockMovementType.AJUSTE).toBe('AJUSTE')
      expect(StockMovementType.DEVOLUCAO).toBe('DEVOLUCAO')
    })
  })

  describe('DTOs', () => {
    it('should validate LoginDto structure', () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
        storeSlug: 'test-store'
      }

      expect(loginDto.email).toBe('test@example.com')
      expect(loginDto.password).toBe('password123')
      expect(loginDto.storeSlug).toBe('test-store')
    })

    it('should validate CreateUserDto structure', () => {
      const createUserDto: CreateUserDto = {
        email: 'user@example.com',
        name: 'Test User',
        password: 'password123',
        role: UserRole.ADMIN,
        storeSlug: 'test-store',
        phone: '123456789'
      }

      expect(createUserDto.email).toBe('user@example.com')
      expect(createUserDto.name).toBe('Test User')
      expect(createUserDto.role).toBe(UserRole.ADMIN)
      expect(createUserDto.storeSlug).toBe('test-store')
      expect(createUserDto.phone).toBe('123456789')
    })

    it('should validate CreateStoreDto structure', () => {
      const createStoreDto: CreateStoreDto = {
        name: 'Test Store',
        slug: 'test-store',
        description: 'A test store',
        config: {
          address: '123 Test St',
          phone: '123456789',
          email: 'store@example.com',
          category: 'Restaurant',
          deliveryFee: 5.0,
          minimumOrder: 20.0,
          estimatedDeliveryTime: 30,
          businessHours: {
            monday: { open: true, openTime: '09:00', closeTime: '18:00' },
            tuesday: { open: true, openTime: '09:00', closeTime: '18:00' },
            wednesday: { open: true, openTime: '09:00', closeTime: '18:00' },
            thursday: { open: true, openTime: '09:00', closeTime: '18:00' },
            friday: { open: true, openTime: '09:00', closeTime: '18:00' },
            saturday: { open: true, openTime: '10:00', closeTime: '16:00' },
            sunday: { open: false }
          },
          paymentMethods: ['CASH', 'CREDIT_CARD', 'PIX']
        },
        active: true,
        approved: false
      }

      expect(createStoreDto.name).toBe('Test Store')
      expect(createStoreDto.slug).toBe('test-store')
      expect(createStoreDto.config.deliveryFee).toBe(5.0)
      expect(createStoreDto.config.paymentMethods).toContain('PIX')
    })

    it('should validate CreateProductDto structure', () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        description: 'A test product',
        price: 25.99,
        originalPrice: 29.99,
        image: 'product.jpg',
        active: true,
        preparationTime: 15,
        categoryId: 'cat-1',
        storeSlug: 'test-store',
        ingredients: [
          { name: 'Ingredient 1', included: true, removable: false },
          { name: 'Ingredient 2', included: true, removable: true }
        ],
        addons: [
          { name: 'Addon 1', price: 2.50, category: 'Sauces', maxQuantity: 3, active: true }
        ],
        nutritionalInfo: {
          calories: 250,
          protein: 15,
          carbohydrates: 30,
          fat: 8
        },
        tags: ['vegetarian', 'gluten-free'],
        tagColor: '#00ff00'
      }

      expect(createProductDto.name).toBe('Test Product')
      expect(createProductDto.price).toBe(25.99)
      expect(createProductDto.ingredients).toHaveLength(2)
      expect(createProductDto.addons).toHaveLength(1)
      expect(createProductDto.tags).toContain('vegetarian')
    })

    it('should validate CreateOrderDto structure', () => {
      const createOrderDto: CreateOrderDto = {
        customerId: 'customer-1',
        storeSlug: 'test-store',
        items: [
          {
            productId: 'prod-1',
            name: 'Product 1',
            quantity: 2,
            price: 15.99,
            customizations: {
              removedIngredients: ['onion'],
              addons: [{ name: 'Extra cheese', price: 1.50, quantity: 1 }],
              observations: 'No onions please'
            }
          }
        ],
        type: 'DELIVERY',
        deliveryAddress: '123 Delivery St',
        notes: 'Please deliver to the back door',
        paymentMethod: 'PIX',
        subtotal: 31.98,
        deliveryFee: 5.0,
        discount: 0,
        total: 36.98,
        estimatedDeliveryTime: new Date('2024-01-01T18:00:00Z')
      }

      expect(createOrderDto.customerId).toBe('customer-1')
      expect(createOrderDto.items).toHaveLength(1)
      expect(createOrderDto.total).toBe(36.98)
      expect(createOrderDto.paymentMethod).toBe('PIX')
    })
  })

  describe('Entity Types', () => {
    it('should validate Store structure', () => {
      const store: Store = {
        id: 'store-1',
        slug: 'test-store',
        name: 'Test Store',
        description: 'A test store',
        config: {
          address: '123 Test St',
          phone: '123456789',
          email: 'store@example.com',
          category: 'Restaurant',
          deliveryFee: 5.0,
          minimumOrder: 20.0,
          estimatedDeliveryTime: 30,
          businessHours: {
            monday: { open: true, openTime: '09:00', closeTime: '18:00' },
            tuesday: { open: true, openTime: '09:00', closeTime: '18:00' },
            wednesday: { open: true, openTime: '09:00', closeTime: '18:00' },
            thursday: { open: true, openTime: '09:00', closeTime: '18:00' },
            friday: { open: true, openTime: '09:00', closeTime: '18:00' },
            saturday: { open: true, openTime: '10:00', closeTime: '16:00' },
            sunday: { open: false }
          },
          paymentMethods: ['CASH', 'CREDIT_CARD', 'PIX']
        },
        active: true,
        approved: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }

      expect(store.id).toBe('store-1')
      expect(store.slug).toBe('test-store')
      expect(store.config.deliveryFee).toBe(5.0)
      expect(store.approved).toBe(true)
    })

    it('should validate Product structure', () => {
      const product: Product = {
        id: 'prod-1',
        name: 'Test Product',
        description: 'A test product',
        price: 25.99,
        originalPrice: 29.99,
        image: 'product.jpg',
        active: true,
        preparationTime: 15,
        categoryId: 'cat-1',
        category: {
          id: 'cat-1',
          name: 'Test Category',
          description: 'A test category',
          order: 1,
          active: true,
          storeSlug: 'test-store',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        storeSlug: 'test-store',
        ingredients: [
          { id: 'ing-1', name: 'Ingredient 1', included: true, removable: false },
          { id: 'ing-2', name: 'Ingredient 2', included: true, removable: true }
        ],
        addons: [
          { id: 'addon-1', name: 'Addon 1', price: 2.50, category: 'Sauces', maxQuantity: 3, active: true }
        ],
        nutritionalInfo: {
          calories: 250,
          protein: 15,
          carbohydrates: 30,
          fat: 8
        },
        tags: ['vegetarian', 'gluten-free'],
        tagColor: '#00ff00',
        inventory: {
          id: 'inv-1',
          quantity: 100,
          minStock: 10,
          maxStock: 200,
          productId: 'prod-1',
          storeSlug: 'test-store',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }

      expect(product.id).toBe('prod-1')
      expect(product.name).toBe('Test Product')
      expect(product.category.name).toBe('Test Category')
      expect(product.ingredients).toHaveLength(2)
      expect(product.inventory?.quantity).toBe(100)
    })

    it('should validate Order structure', () => {
      const order: Order = {
        id: 'order-1',
        orderNumber: 'ORD-001',
        subtotal: 45.98,
        deliveryFee: 5.0,
        discount: 0,
        total: 50.98,
        status: OrderStatus.CONFIRMED,
        type: 'DELIVERY',
        paymentMethod: 'PIX',
        paymentStatus: PaymentStatus.PAID,
        customerId: 'customer-1',
        customer: {
          id: 'customer-1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '123456789',
          address: {
            street: '123 Main St',
            number: '456',
            complement: 'Apt 1',
            neighborhood: 'Downtown',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345-678'
          },
          storeSlug: 'test-store',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        storeSlug: 'test-store',
        items: [
          {
            id: 'item-1',
            name: 'Product 1',
            quantity: 2,
            price: 15.99,
            productId: 'prod-1',
            product: {
              id: 'prod-1',
              name: 'Product 1',
              description: 'A test product',
              price: 15.99,
              image: 'product.jpg',
              active: true,
              preparationTime: 15,
              categoryId: 'cat-1',
              category: {
                id: 'cat-1',
                name: 'Test Category',
                description: 'A test category',
                order: 1,
                active: true,
                storeSlug: 'test-store',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z'
              },
              storeSlug: 'test-store',
              ingredients: [],
              addons: [],
              tags: [],
              tagColor: '#000000',
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z'
            },
            customizations: {
              removedIngredients: ['onion'],
              addons: [{ name: 'Extra cheese', price: 1.50, quantity: 1 }],
              observations: 'No onions please'
            },
            createdAt: '2024-01-01T00:00:00Z'
          }
        ],
        notes: 'Please deliver to the back door',
        estimatedDeliveryTime: '2024-01-01T18:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }

      expect(order.id).toBe('order-1')
      expect(order.orderNumber).toBe('ORD-001')
      expect(order.status).toBe(OrderStatus.CONFIRMED)
      expect(order.items).toHaveLength(1)
      expect(order.customer.name).toBe('John Doe')
    })

    it('should validate User structure', () => {
      const user: User = {
        id: 'user-1',
        email: 'user@example.com',
        name: 'Test User',
        role: UserRole.ADMIN,
        storeSlug: 'test-store',
        active: true,
        phone: '123456789',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        lastLogin: '2024-01-01T12:00:00Z'
      }

      expect(user.id).toBe('user-1')
      expect(user.email).toBe('user@example.com')
      expect(user.role).toBe(UserRole.ADMIN)
      expect(user.storeSlug).toBe('test-store')
    })
  })

  describe('Utility Types', () => {
    it('should validate ApiResponse structure', () => {
      const apiResponse: ApiResponse<string> = {
        success: true,
        data: 'test data',
        message: 'Success message'
      }

      expect(apiResponse.success).toBe(true)
      expect(apiResponse.data).toBe('test data')
      expect(apiResponse.message).toBe('Success message')
    })

    it('should validate PaginatedResponse structure', () => {
      const paginatedResponse: PaginatedResponse<string> = {
        data: ['item1', 'item2', 'item3'],
        pagination: {
          page: 1,
          limit: 10,
          total: 3,
          totalPages: 1
        }
      }

      expect(paginatedResponse.data).toHaveLength(3)
      expect(paginatedResponse.pagination.page).toBe(1)
      expect(paginatedResponse.pagination.total).toBe(3)
    })

    it('should validate StoreStats structure', () => {
      const storeStats: StoreStats = {
        totalOrders: 150,
        totalRevenue: 5000.50,
        averageOrderValue: 33.34,
        totalProducts: 45,
        activeProducts: 42,
        totalCustomers: 89
      }

      expect(storeStats.totalOrders).toBe(150)
      expect(storeStats.totalRevenue).toBe(5000.50)
      expect(storeStats.totalCustomers).toBe(89)
    })

    it('should validate OrderStats structure', () => {
      const orderStats: OrderStats = {
        totalOrders: 150,
        ordersByStatus: {
          PENDING: 8,
          RECEIVED: 20,
          CONFIRMED: 30,
          PREPARING: 25,
          READY: 15,
          DELIVERING: 10,
          DELIVERED: 45,
          CANCELLED: 5
        },
        totalRevenue: 5000.50,
        averageOrderValue: 33.34,
        ordersByType: {
          DELIVERY: 120,
          PICKUP: 30
        }
      }

      expect(orderStats.totalOrders).toBe(150)
      expect(orderStats.ordersByStatus.DELIVERED).toBe(45)
      expect(orderStats.ordersByType.DELIVERY).toBe(120)
    })
  })
}) 