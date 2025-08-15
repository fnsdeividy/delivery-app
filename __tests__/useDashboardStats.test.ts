import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { apiClient } from '../lib/api-client'

// Mock do apiClient
jest.mock('../lib/api-client')
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

// Wrapper para testes
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useDashboardStats', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockStores = [
    {
      id: 'store-1',
      slug: 'loja-a',
      name: 'Loja A',
      active: true,
      approved: true
    },
    {
      id: 'store-2',
      slug: 'loja-b',
      name: 'Loja B',
      active: true,
      approved: false
    }
  ]

  const mockProducts = [
    { id: 'prod-1', name: 'Produto 1' },
    { id: 'prod-2', name: 'Produto 2' }
  ]

  const mockOrders = [
    { id: 'order-1', total: 25.90 },
    { id: 'order-2', total: 35.50 }
  ]

  describe('Super Admin', () => {
    it('deve buscar todas as estatísticas para SUPER_ADMIN', async () => {
      mockApiClient.getStores.mockResolvedValue({
        data: mockStores,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      })
      
      mockApiClient.getProducts.mockResolvedValue({
        data: mockProducts,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      })
      
      mockApiClient.getOrders.mockResolvedValue({
        data: mockOrders,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      })

      const { result } = renderHook(
        () => useDashboardStats('SUPER_ADMIN'),
        { wrapper: TestWrapper }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual({
        totalStores: 2,
        activeStores: 2,
        pendingStores: 1,
        totalProducts: 4, // 2 produtos por loja
        totalOrders: 4,   // 2 pedidos por loja
        totalRevenue: 122.8, // (25.90 + 35.50) * 2 lojas
        totalUsers: 0
      })
    })

    it('deve lidar com erros ao buscar dados de lojas específicas', async () => {
      mockApiClient.getStores.mockResolvedValue({
        data: mockStores,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      })
      
      // Simular erro ao buscar produtos da primeira loja
      mockApiClient.getProducts
        .mockResolvedValueOnce({
          data: mockProducts,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
        })
        .mockRejectedValueOnce(new Error('Erro ao buscar produtos'))
      
      mockApiClient.getOrders
        .mockResolvedValueOnce({
          data: mockOrders,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
        })
        .mockRejectedValueOnce(new Error('Erro ao buscar pedidos'))

      const { result } = renderHook(
        () => useDashboardStats('SUPER_ADMIN'),
        { wrapper: TestWrapper }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Deve continuar funcionando mesmo com erros parciais
      expect(result.current.data?.totalStores).toBe(2)
      expect(result.current.data?.activeStores).toBe(2)
    })
  })

  describe('Admin', () => {
    it('deve buscar estatísticas apenas da loja específica para ADMIN', async () => {
      mockApiClient.getStore.mockResolvedValue({
        id: 'store-1',
        slug: 'loja-a',
        name: 'Loja A',
        active: true,
        approved: true
      })
      
      mockApiClient.getProducts.mockResolvedValue({
        data: mockProducts,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      })
      
      mockApiClient.getOrders.mockResolvedValue({
        data: mockOrders,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      })

      const { result } = renderHook(
        () => useDashboardStats('ADMIN', 'loja-a'),
        { wrapper: TestWrapper }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual({
        totalStores: 1,
        activeStores: 1,
        pendingStores: 0,
        totalProducts: 2,
        totalOrders: 2,
        totalRevenue: 61.4, // 25.90 + 35.50
        totalUsers: 0
      })
    })

    it('deve lidar com erro ao buscar dados da loja', async () => {
      mockApiClient.getStore.mockRejectedValue(new Error('Loja não encontrada'))

      const { result } = renderHook(
        () => useDashboardStats('ADMIN', 'loja-inexistente'),
        { wrapper: TestWrapper }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
    })
  })

  describe('Usuário sem permissões', () => {
    it('deve retornar estatísticas zeradas para usuário sem permissões', async () => {
      const { result } = renderHook(
        () => useDashboardStats('CLIENTE'),
        { wrapper: TestWrapper }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual({
        totalStores: 0,
        activeStores: 0,
        pendingStores: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalUsers: 0
      })
    })
  })

  describe('Estado de loading e erro', () => {
    it('deve mostrar loading enquanto busca dados', async () => {
      mockApiClient.getStores.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      const { result } = renderHook(
        () => useDashboardStats('SUPER_ADMIN'),
        { wrapper: TestWrapper }
      )

      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()
    })

    it('deve lidar com erro geral na busca', async () => {
      mockApiClient.getStores.mockRejectedValue(new Error('Erro na API'))

      const { result } = renderHook(
        () => useDashboardStats('SUPER_ADMIN'),
        { wrapper: TestWrapper }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.data).toBeUndefined()
    })
  })
}) 