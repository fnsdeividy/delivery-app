import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { useCreateStore } from '../hooks/useCreateStore'
import { CreateStoreDto } from '../types/cardapio-api'

// Mock do apiClient
jest.mock('../lib/api-client', () => ({
  apiClient: {
    post: jest.fn()
  }
}))

// Mock do router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}))

const mockApiClient = require('../lib/api-client').apiClient

describe('useCreateStore', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
    jest.clearAllMocks()
  })

  it('deve criar uma loja com sucesso', async () => {
    const mockStoreData: CreateStoreDto = {
      name: 'Test Store',
      slug: 'test-store',
      description: 'Test Description',
      address: 'Test Address',
      phone: '123456789',
      email: 'test@test.com',
      logo: '',
      banner: '',
      category: 'Restaurant',
      deliveryFee: 5.0,
      minimumOrder: 20.0,
      estimatedDeliveryTime: 30,
      isActive: true,
      ownerId: 'user-1'
    }

    const mockResponse = {
      data: {
        id: 'store-1',
        ...mockStoreData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }

    mockApiClient.post.mockResolvedValue(mockResponse)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )

    const { result } = renderHook(() => useCreateStore(), { wrapper })

    expect(result.current.isLoading).toBe(false)

    // Executar a mutação
    await result.current.mutateAsync(mockStoreData)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockApiClient.post).toHaveBeenCalledWith('/stores', mockStoreData)
  })

  it('deve lidar com erros na criação da loja', async () => {
    const mockStoreData: CreateStoreDto = {
      name: 'Test Store',
      slug: 'test-store',
      description: 'Test Description',
      address: 'Test Address',
      phone: '123456789',
      email: 'test@test.com',
      logo: '',
      banner: '',
      category: 'Restaurant',
      deliveryFee: 5.0,
      minimumOrder: 20.0,
      estimatedDeliveryTime: 30,
      isActive: true,
      ownerId: 'user-1'
    }

    const mockError = new Error('Erro ao criar loja')
    mockApiClient.post.mockRejectedValue(mockError)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )

    const { result } = renderHook(() => useCreateStore(), { wrapper })

    // Executar a mutação
    await expect(result.current.mutateAsync(mockStoreData)).rejects.toThrow('Erro ao criar loja')

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })
}) 