import { useUpdateStore } from '@/hooks/useUpdateStore'
import { apiClient } from '@/lib/api-client'
import { UpdateStoreDto } from '@/types/cardapio-api'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

// Mock do apiClient
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    patch: jest.fn()
  }
}))

// Mock do router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useUpdateStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve atualizar uma loja com sucesso', async () => {
    const mockStoreData = {
      id: '1',
      name: 'Loja Atualizada',
      slug: 'loja-atualizada',
      description: 'Descrição atualizada',
      address: 'Endereço atualizado',
      phone: '11999999999',
      email: 'contato@loja.com',
      category: 'Restaurante',
      deliveryFee: 5.50,
      minimumOrder: 25.00,
      estimatedDeliveryTime: 30,
      isActive: true,
      ownerId: 'user-1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }

    const mockUpdateData: UpdateStoreDto = {
      name: 'Loja Atualizada',
      description: 'Descrição atualizada'
    }

    ;(apiClient.patch as jest.Mock).mockResolvedValue(mockStoreData)

    const { result } = renderHook(() => useUpdateStore(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      storeId: '1',
      storeData: mockUpdateData
    })

    await waitFor(() => {
      expect(apiClient.patch).toHaveBeenCalledWith('/stores/1', mockUpdateData)
      expect(result.current.isSuccess).toBe(true)
      expect(result.current.data).toEqual(mockStoreData)
    })
  })

  it('deve tratar erro ao atualizar loja', async () => {
    const mockError = new Error('Erro ao atualizar loja')
    ;(apiClient.patch as jest.Mock).mockRejectedValue(mockError)

    const { result } = renderHook(() => useUpdateStore(), {
      wrapper: createWrapper(),
    })

    try {
      await result.current.mutateAsync({
        storeId: '1',
        storeData: { name: 'Loja Teste' }
      })
    } catch (error) {
      // Erro esperado
    }

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
      expect(result.current.error).toBeDefined()
    })
  })

  it('deve mostrar estado de loading durante atualização', async () => {
    let resolveUpdate: (value: any) => void
    const updatePromise = new Promise<any>((resolve) => {
      resolveUpdate = resolve
    })
    
    ;(apiClient.patch as jest.Mock).mockReturnValue(updatePromise)

    const { result } = renderHook(() => useUpdateStore(), {
      wrapper: createWrapper(),
    })

    const updatePromise2 = result.current.mutateAsync({
      storeId: '1',
      storeData: { name: 'Loja Teste' }
    })

    // Aguardar o estado de loading ser definido
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true)
    })

    resolveUpdate!({ id: '1', name: 'Loja Teste' })
    await updatePromise2

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('deve resetar estado após reset', async () => {
    const { result } = renderHook(() => useUpdateStore(), {
      wrapper: createWrapper(),
    })

    // Simular estado de sucesso
    result.current.reset()

    expect(result.current.isSuccess).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeNull()
  })
}) 