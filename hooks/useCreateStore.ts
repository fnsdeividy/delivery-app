import { apiClient } from '@/lib/api-client'
import { CreateStoreDto, Store } from '@/types/cardapio-api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useStoreRedirect } from './useStoreRedirect'

interface CreateStoreHookReturn {
  mutateAsync: (data: CreateStoreDto) => Promise<Store>
  mutate: (data: CreateStoreDto) => void
  isLoading: boolean
  isPending: boolean
  isError: boolean
  error: Error | null
  isSuccess: boolean
  data: Store | undefined
  reset: () => void
}

export function useCreateStore(): CreateStoreHookReturn {
  const queryClient = useQueryClient()
  const { redirectAfterStoreCreation } = useStoreRedirect()

  const createStoreMutation = useMutation({
    mutationFn: async (storeData: CreateStoreDto) => {
      try {
        const response = await apiClient.createStore(storeData)
        return response
      } catch (error: any) {
        console.error('❌ Erro ao criar loja:', error)
        throw new Error(error.message || 'Erro ao criar loja')
      }
    },
    onSuccess: async (data) => {
      try {
        // Invalidar queries relacionadas a lojas
        queryClient.invalidateQueries({ queryKey: ['stores'] })
        queryClient.invalidateQueries({ queryKey: ['store', data.slug] })
        queryClient.invalidateQueries({ queryKey: ['user'] })
        queryClient.invalidateQueries({ queryKey: ['user-context'] })
        queryClient.invalidateQueries({ queryKey: ['user-stores'] })

        // Redirecionar para o dashboard da nova loja
        await redirectAfterStoreCreation(data)

      } catch (error) {
        console.error('❌ Erro no processamento pós-criação:', error)
      }
    },
    onError: (error: any) => {
      console.error('❌ Erro na criação da loja:', error)
    }
  })

  // Retornar um objeto com a interface esperada
  return {
    mutateAsync: createStoreMutation.mutateAsync,
    mutate: createStoreMutation.mutate,
    isLoading: createStoreMutation.isPending, // Alias para compatibilidade
    isPending: createStoreMutation.isPending,
    isError: createStoreMutation.isError,
    error: createStoreMutation.error,
    isSuccess: createStoreMutation.isSuccess,
    data: createStoreMutation.data,
    reset: createStoreMutation.reset
  }
} 