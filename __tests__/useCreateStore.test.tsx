import { useCreateStore } from '@/hooks/useCreateStore'
import { apiClient } from '@/lib/api-client'
import { CreateStoreDto, Store } from '@/types/cardapio-api'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

// Mock do apiClient
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    post: jest.fn(),
    getCurrentToken: jest.fn(),
    updateStoreContext: jest.fn(),
    createStore: jest.fn(),
  },
}))

// Mock do Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useCreateStore', () => {
  let queryClient: QueryClient
  let mockApiClient: jest.Mocked<typeof apiClient>

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    
    mockApiClient = apiClient as jest.Mocked<typeof apiClient>
    
    // Reset mocks
    jest.clearAllMocks()
    mockPush.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.getItem.mockClear()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  const mockStoreData: CreateStoreDto = {
    name: 'Test Store',
    slug: 'test-store',
    description: 'Test Description',
    config: {
      address: 'Test Address',
      phone: '123456789',
      email: 'test@store.com',
      category: 'Restaurant',
      deliveryFee: 5.0,
      minimumOrder: 10.0,
      estimatedDeliveryTime: 30,
      businessHours: {
        monday: { open: true, openTime: '09:00', closeTime: '18:00' },
        tuesday: { open: true, openTime: '09:00', closeTime: '18:00' },
        wednesday: { open: true, openTime: '09:00', closeTime: '18:00' },
        thursday: { open: true, openTime: '09:00', closeTime: '18:00' },
        friday: { open: true, openTime: '09:00', closeTime: '18:00' },
        saturday: { open: true, openTime: '09:00', closeTime: '18:00' },
        sunday: { open: false },
      },
      paymentMethods: ['CREDIT_CARD', 'DEBIT_CARD'],
    },
  }

  const mockStoreResponse: Store = {
    id: 'store-123',
    slug: 'test-store',
    name: 'Test Store',
    description: 'Test Description',
    active: true,
    approved: false,
    config: mockStoreData.config,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  it('deve criar uma loja com sucesso e redirecionar', async () => {
    // Arrange
    mockApiClient.createStore.mockResolvedValue(mockStoreResponse)
    mockApiClient.getCurrentToken.mockReturnValue('mock-token')
    mockApiClient.updateStoreContext.mockResolvedValue()

    const { result } = renderHook(() => useCreateStore(), { wrapper })

    // Act
    result.current.mutate(mockStoreData)

    // Assert
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockApiClient.createStore).toHaveBeenCalledWith(mockStoreData)
    expect(mockApiClient.updateStoreContext).toHaveBeenCalledWith(mockStoreResponse)
    expect(mockPush).toHaveBeenCalledWith('/dashboard/test-store?welcome=true&message=Loja criada com sucesso!')
  })

  it('deve lidar com erro na criação da loja', async () => {
    // Arrange
    const errorMessage = 'Erro ao criar loja'
    mockApiClient.createStore.mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useCreateStore(), { wrapper })

    // Act
    result.current.mutate(mockStoreData)

    // Assert
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe(errorMessage)
    expect(mockPush).toHaveBeenCalledWith('/dashboard/gerenciar-lojas')
  })

  it('deve lidar com erro no updateStoreContext', async () => {
    // Arrange
    mockApiClient.createStore.mockResolvedValue(mockStoreResponse)
    mockApiClient.getCurrentToken.mockReturnValue('mock-token')
    mockApiClient.updateStoreContext.mockRejectedValue(new Error('Erro ao atualizar contexto'))

    const { result } = renderHook(() => useCreateStore(), { wrapper })

    // Act
    result.current.mutate(mockStoreData)

    // Assert
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // Deve continuar mesmo com erro no updateStoreContext
    expect(mockPush).toHaveBeenCalledWith('/dashboard/test-store?welcome=true&message=Loja criada com sucesso!')
  })

  it('deve funcionar sem token de autenticação', async () => {
    // Arrange
    mockApiClient.createStore.mockResolvedValue(mockStoreResponse)
    mockApiClient.getCurrentToken.mockReturnValue(null)

    const { result } = renderHook(() => useCreateStore(), { wrapper })

    // Act
    result.current.mutate(mockStoreData)

    // Assert
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // Não deve chamar updateStoreContext se não houver token
    expect(mockApiClient.updateStoreContext).not.toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/dashboard/test-store?welcome=true&message=Loja criada com sucesso!')
  })

  it('deve invalidar queries relacionadas após sucesso', async () => {
    // Arrange
    mockApiClient.createStore.mockResolvedValue(mockStoreResponse)
    mockApiClient.getCurrentToken.mockReturnValue('mock-token')
    mockApiClient.updateStoreContext.mockResolvedValue()

    const { result } = renderHook(() => useCreateStore(), { wrapper })

    // Act
    result.current.mutate(mockStoreData)

    // Assert
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // Verificar se as queries foram invalidadas
    const queries = queryClient.getQueryCache().getAll()
    expect(queries.length).toBe(0) // Todas as queries devem ter sido invalidadas
  })

  it('deve fornecer dados da loja criada', async () => {
    // Arrange
    mockApiClient.createStore.mockResolvedValue(mockStoreResponse)
    mockApiClient.getCurrentToken.mockReturnValue('mock-token')
    mockApiClient.updateStoreContext.mockResolvedValue()

    const { result } = renderHook(() => useCreateStore(), { wrapper })

    // Act
    result.current.mutate(mockStoreData)

    // Assert
    await waitFor(() => {
      expect(result.current.data).toEqual(mockStoreResponse)
    })

    expect(result.current.data?.slug).toBe('test-store')
    expect(result.current.data?.name).toBe('Test Store')
  })
}) 