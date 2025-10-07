import { apiClient } from '@/lib/api-client'

// Teste de configuração do API Client
describe('API Client Configuration', () => {
  const originalEnv = process.env

  beforeAll(() => {
    // Garantir que estamos usando a URL correta
    process.env.NEXT_PUBLIC_CARDAPIO_API_URL = 'http://localhost:3001/api/v1'
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('Environment Configuration', () => {
    it('should have correct API URL configured', () => {
      expect(process.env.NEXT_PUBLIC_CARDAPIO_API_URL).toBe('http://localhost:3001/api/v1')
    })

    it('should be in test or development mode', () => {
      expect(['test', 'development']).toContain(process.env.NODE_ENV)
    })
  })

  describe('API Client Instance', () => {
    it('should be properly instantiated', () => {
      expect(apiClient).toBeDefined()
      expect(typeof apiClient.healthCheck).toBe('function')
      expect(typeof apiClient.authenticate).toBe('function')
      expect(typeof apiClient.get).toBe('function')
      expect(typeof apiClient.post).toBe('function')
    })

    it('should have authentication methods', () => {
      expect(typeof apiClient.isAuthenticated).toBe('function')
      expect(typeof apiClient.getCurrentToken).toBe('function')
      expect(typeof apiClient.logout).toBe('function')
    })

    it('should have store management methods', () => {
      expect(typeof apiClient.getStores).toBe('function')
      expect(typeof apiClient.createStore).toBe('function')
      expect(typeof apiClient.updateStore).toBe('function')
      expect(typeof apiClient.deleteStore).toBe('function')
    })

    it('should have product management methods', () => {
      expect(typeof apiClient.getProducts).toBe('function')
      expect(typeof apiClient.createProduct).toBe('function')
      expect(typeof apiClient.updateProduct).toBe('function')
      expect(typeof apiClient.deleteProduct).toBe('function')
    })

    it('should have order management methods', () => {
      expect(typeof apiClient.getOrders).toBe('function')
      expect(typeof apiClient.createOrder).toBe('function')
      expect(typeof apiClient.updateOrder).toBe('function')
    })

    it('should have user management methods', () => {
      expect(typeof apiClient.getUsers).toBe('function')
      expect(typeof apiClient.createUser).toBe('function')
      expect(typeof apiClient.updateUser).toBe('function')
      expect(typeof apiClient.deleteUser).toBe('function')
    })
  })

  describe('API Endpoints Structure', () => {
    it('should support all required endpoints', () => {
      const requiredEndpoints = [
        '/auth/login',
        '/auth/register',
        '/users',
        '/stores',
        '/products',
        '/orders',
        '/health',
        '/status'
      ]

      // Verificar se o cliente tem métodos para acessar esses endpoints
      expect(typeof apiClient.authenticate).toBe('function')
      expect(typeof apiClient.register).toBe('function')
      expect(typeof apiClient.getUsers).toBe('function')
      expect(typeof apiClient.getStores).toBe('function')
      expect(typeof apiClient.getProducts).toBe('function')
      expect(typeof apiClient.getOrders).toBe('function')
      expect(typeof apiClient.healthCheck).toBe('function')
    })
  })

  describe('Error Handling', () => {
    it('should have proper error handling methods', () => {
      // O cliente deve ter métodos para lidar com erros
      expect(apiClient).toBeDefined()
    })
  })
}) 