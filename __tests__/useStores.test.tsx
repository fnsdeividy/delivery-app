import { useCreateStore, useDeleteStore, useStore, useStores, useUpdateStore } from '@/hooks/useStores'
import { apiClient } from '@/lib/api-client'
import { Store } from '@/types/cardapio-api'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'

// Mock do apiClient
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    getStores: jest.fn(),
    getStoreBySlug: jest.fn(),
    createStore: jest.fn(),
    updateStore: jest.fn(),
    deleteStore: jest.fn(),
  },
}))

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

// Wrapper para React Query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useStores', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve buscar lojas com sucesso', async () => {
    const mockStores = {
      data: [
        {
          id: '1',
          slug: 'loja-1',
          name: 'Loja 1',
          description: 'Descrição da loja 1',
          config: {
            address: 'Endereço 1',
            phone: '123456789',
            email: 'loja1@example.com',
            category: 'Restaurante',
            deliveryFee: 5.0,
            minimumOrder: 20.0,
            estimatedDeliveryTime: 30,
            businessHours: {},
            paymentMethods: ['CASH', 'CREDIT_CARD'],
          },
          active: true,
          approved: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    }

    mockApiClient.getStores.mockResolvedValue(mockStores)

    const { result } = renderHook(() => useStores(1, 10), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.data).toEqual(mockStores)
    })

    expect(mockApiClient.getStores).toHaveBeenCalledWith(1, 10)
  })

  it('deve buscar loja específica por slug', async () => {
    const mockStore: Store = {
      id: '1',
      slug: 'loja-1',
      name: 'Loja 1',
      description: 'Descrição da loja 1',
      config: {
        address: 'Endereço 1',
        phone: '123456789',
        email: 'loja1@example.com',
        category: 'Restaurante',
        deliveryFee: 5.0,
        minimumOrder: 20.0,
        estimatedDeliveryTime: 30,
        businessHours: {},
        paymentMethods: ['CASH', 'CREDIT_CARD'],
      },
      active: true,
      approved: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }

    mockApiClient.getStoreBySlug.mockResolvedValue(mockStore)

    const { result } = renderHook(() => useStore('loja-1'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.data).toEqual(mockStore)
    })

    expect(mockApiClient.getStoreBySlug).toHaveBeenCalledWith('loja-1')
  })

  it('deve criar loja com sucesso', async () => {
    const mockStore: Store = {
      id: '1',
      slug: 'nova-loja',
      name: 'Nova Loja',
      description: 'Descrição da nova loja',
      config: {
        address: 'Endereço da nova loja',
        phone: '987654321',
        email: 'nova@example.com',
        category: 'Restaurante',
        deliveryFee: 3.0,
        minimumOrder: 15.0,
        estimatedDeliveryTime: 25,
        businessHours: {},
        paymentMethods: ['CASH', 'PIX'],
      },
      active: true,
      approved: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }

    mockApiClient.createStore.mockResolvedValue(mockStore)

    const { result } = renderHook(() => useCreateStore(), { wrapper: createWrapper() })

    const storeData = {
      name: 'Nova Loja',
      slug: 'nova-loja',
      description: 'Descrição da nova loja',
      config: {
        address: 'Endereço da nova loja',
        phone: '987654321',
        email: 'nova@example.com',
        category: 'Restaurante',
        deliveryFee: 3.0,
        minimumOrder: 15.0,
        estimatedDeliveryTime: 25,
        businessHours: {},
        paymentMethods: ['CASH', 'PIX'],
      },
      active: true,
      approved: false,
    }

    await waitFor(() => {
      result.current.mutate(storeData)
    })

    expect(mockApiClient.createStore).toHaveBeenCalledWith(storeData)
  })

  it('deve atualizar loja com sucesso', async () => {
    const mockStore: Store = {
      id: '1',
      slug: 'loja-1',
      name: 'Loja 1 Atualizada',
      description: 'Descrição atualizada',
      config: {
        address: 'Endereço atualizado',
        phone: '123456789',
        email: 'loja1@example.com',
        category: 'Restaurante',
        deliveryFee: 6.0,
        minimumOrder: 25.0,
        estimatedDeliveryTime: 35,
        businessHours: {},
        paymentMethods: ['CASH', 'CREDIT_CARD', 'PIX'],
      },
      active: true,
      approved: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }

    mockApiClient.updateStore.mockResolvedValue(mockStore)

    const { result } = renderHook(() => useUpdateStore(), { wrapper: createWrapper() })

    const updateData = {
      name: 'Loja 1 Atualizada',
      description: 'Descrição atualizada',
      config: {
        deliveryFee: 6.0,
        minimumOrder: 25.0,
        estimatedDeliveryTime: 35,
        paymentMethods: ['CASH', 'CREDIT_CARD', 'PIX'],
      },
    }

    await waitFor(() => {
      result.current.mutate({ slug: 'loja-1', storeData: updateData })
    })

    expect(mockApiClient.updateStore).toHaveBeenCalledWith('loja-1', updateData)
  })

  it('deve deletar loja com sucesso', async () => {
    mockApiClient.deleteStore.mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeleteStore(), { wrapper: createWrapper() })

    await waitFor(() => {
      result.current.mutate('loja-1')
    })

    expect(mockApiClient.deleteStore).toHaveBeenCalledWith('loja-1')
  })

  it('deve lidar com erro ao buscar lojas', async () => {
    const mockError = new Error('Erro ao buscar lojas')
    mockApiClient.getStores.mockRejectedValue(mockError)

    const { result } = renderHook(() => useStores(1, 10), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.error).toEqual(mockError)
    })
  })

  it('deve lidar com erro ao buscar loja específica', async () => {
    const mockError = new Error('Loja não encontrada')
    mockApiClient.getStoreBySlug.mockRejectedValue(mockError)

    const { result } = renderHook(() => useStore('loja-inexistente'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.error).toEqual(mockError)
    })
  })
}) 