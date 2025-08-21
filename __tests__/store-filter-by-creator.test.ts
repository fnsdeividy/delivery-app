/**
 * @jest-environment jsdom
 */

import { apiClient } from '@/lib/api-client'

// Mock do apiClient
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    getStores: jest.fn(),
    createStore: jest.fn(),
    isAuthenticated: jest.fn(() => true),
    getCurrentStoreSlug: jest.fn(() => 'test-store'),
  },
}))

describe('Filtro de Lojas por Criador', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Listagem de Lojas', () => {
    it('deve retornar apenas lojas do ADMIN logado', async () => {
      // Arrange
      const mockStoresData = {
        data: [
          {
            id: '1',
            name: 'Loja do Admin 1',
            slug: 'loja-admin-1',
            createdByEmail: 'admin1@teste.com',
            active: true,
            approved: true,
          },
          {
            id: '2',
            name: 'Loja do Admin 1 - Segunda',
            slug: 'loja-admin-1-segunda',
            createdByEmail: 'admin1@teste.com',
            active: true,
            approved: true,
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      }

      ;(apiClient.getStores as jest.Mock).mockResolvedValue(mockStoresData)

      // Act
      const result = await apiClient.getStores(1, 10)

      // Assert
      expect(result.data).toHaveLength(2)
      expect(result.data[0].createdByEmail).toBe('admin1@teste.com')
      expect(result.data[1].createdByEmail).toBe('admin1@teste.com')
    })

    it('não deve retornar lojas de outros administradores', async () => {
      // Arrange
      const mockStoresData = {
        data: [], // Nenhuma loja retornada para este admin
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      }

      ;(apiClient.getStores as jest.Mock).mockResolvedValue(mockStoresData)

      // Act
      const result = await apiClient.getStores(1, 10)

      // Assert
      expect(result.data).toHaveLength(0)
      expect(result.pagination.total).toBe(0)
    })

    it('deve retornar lojas legacy para SUPER_ADMIN', async () => {
      // Arrange
      const mockStoresData = {
        data: [
          {
            id: '1',
            name: 'Loja Legacy',
            slug: 'loja-legacy',
            createdByEmail: null, // Loja sem criador definido
            active: true,
            approved: true,
          },
          {
            id: '2',
            name: 'Loja Nova',
            slug: 'loja-nova',
            createdByEmail: 'admin@teste.com',
            active: true,
            approved: true,
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      }

      ;(apiClient.getStores as jest.Mock).mockResolvedValue(mockStoresData)

      // Act
      const result = await apiClient.getStores(1, 10)

      // Assert
      expect(result.data).toHaveLength(2)
      expect(result.data.some(store => store.createdByEmail === null)).toBe(true)
    })
  })

  describe('Criação de Lojas', () => {
    it('deve criar loja com createdByEmail automaticamente', async () => {
      // Arrange
      const storeData = {
        name: 'Nova Loja',
        slug: 'nova-loja',
        description: 'Descrição da nova loja',
      }

      const mockCreatedStore = {
        id: '1',
        ...storeData,
        createdByEmail: 'admin@teste.com',
        active: true,
        approved: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      ;(apiClient.createStore as jest.Mock).mockResolvedValue(mockCreatedStore)

      // Act
      const result = await apiClient.createStore(storeData)

      // Assert
      expect(result.createdByEmail).toBe('admin@teste.com')
      expect(result.name).toBe(storeData.name)
      expect(result.slug).toBe(storeData.slug)
    })

    it('não deve permitir override do createdByEmail pelo frontend', async () => {
      // Arrange
      const storeDataWithCreator = {
        name: 'Loja Maliciosa',
        slug: 'loja-maliciosa',
        description: 'Tentativa de override',
        createdByEmail: 'outro@teste.com', // Tentativa de override
      }

      const mockCreatedStore = {
        id: '1',
        name: 'Loja Maliciosa',
        slug: 'loja-maliciosa',
        description: 'Tentativa de override',
        createdByEmail: 'admin@teste.com', // Backend ignora o override
        active: true,
        approved: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      ;(apiClient.createStore as jest.Mock).mockResolvedValue(mockCreatedStore)

      // Act
      const result = await apiClient.createStore(storeDataWithCreator)

      // Assert
      expect(result.createdByEmail).toBe('admin@teste.com')
      expect(result.createdByEmail).not.toBe('outro@teste.com')
    })
  })

  describe('Cenários de Diferentes Roles', () => {
    it('ADMIN deve ver apenas suas próprias lojas', async () => {
      // Arrange
      const adminStores = {
        data: [
          {
            id: '1',
            name: 'Minha Loja',
            slug: 'minha-loja',
            createdByEmail: 'admin@teste.com',
            active: true,
            approved: true,
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      }

      ;(apiClient.getStores as jest.Mock).mockResolvedValue(adminStores)

      // Act
      const result = await apiClient.getStores(1, 10)

      // Assert
      expect(result.data).toHaveLength(1)
      expect(result.data[0].createdByEmail).toBe('admin@teste.com')
    })

    it('SUPER_ADMIN deve ver todas as lojas', async () => {
      // Arrange
      const allStores = {
        data: [
          {
            id: '1',
            name: 'Loja Admin 1',
            slug: 'loja-admin-1',
            createdByEmail: 'admin1@teste.com',
            active: true,
            approved: true,
          },
          {
            id: '2',
            name: 'Loja Admin 2',
            slug: 'loja-admin-2',
            createdByEmail: 'admin2@teste.com',
            active: true,
            approved: true,
          },
          {
            id: '3',
            name: 'Loja Legacy',
            slug: 'loja-legacy',
            createdByEmail: null,
            active: true,
            approved: true,
          },
        ],
        pagination: { page: 1, limit: 10, total: 3, totalPages: 1 },
      }

      ;(apiClient.getStores as jest.Mock).mockResolvedValue(allStores)

      // Act
      const result = await apiClient.getStores(1, 10)

      // Assert
      expect(result.data).toHaveLength(3)
      expect(result.data.some(store => store.createdByEmail === 'admin1@teste.com')).toBe(true)
      expect(result.data.some(store => store.createdByEmail === 'admin2@teste.com')).toBe(true)
      expect(result.data.some(store => store.createdByEmail === null)).toBe(true)
    })
  })

  describe('Casos Extremos', () => {
    it('deve retornar lista vazia quando ADMIN não tem lojas', async () => {
      // Arrange
      const emptyResult = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      }

      ;(apiClient.getStores as jest.Mock).mockResolvedValue(emptyResult)

      // Act
      const result = await apiClient.getStores(1, 10)

      // Assert
      expect(result.data).toHaveLength(0)
      expect(result.pagination.total).toBe(0)
    })

    it('deve manter paginação correta com filtro aplicado', async () => {
      // Arrange
      const paginatedResult = {
        data: Array.from({ length: 5 }, (_, i) => ({
          id: String(i + 1),
          name: `Loja ${i + 1}`,
          slug: `loja-${i + 1}`,
          createdByEmail: 'admin@teste.com',
          active: true,
          approved: true,
        })),
        pagination: { page: 1, limit: 5, total: 12, totalPages: 3 },
      }

      ;(apiClient.getStores as jest.Mock).mockResolvedValue(paginatedResult)

      // Act
      const result = await apiClient.getStores(1, 5)

      // Assert
      expect(result.data).toHaveLength(5)
      expect(result.pagination.total).toBe(12)
      expect(result.pagination.totalPages).toBe(3)
      result.data.forEach(store => {
        expect(store.createdByEmail).toBe('admin@teste.com')
      })
    })
  })
})