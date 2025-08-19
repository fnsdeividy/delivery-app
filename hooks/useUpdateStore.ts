import { apiClient } from '@/lib/api-client'
import { Store, UpdateStoreDto } from '@/types/cardapio-api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export function useUpdateStore() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const updateStoreMutation = useMutation({
    mutationFn: async ({ storeId, storeData }: { storeId: string; storeData: UpdateStoreDto }) => {
      try {
        const response = await apiClient.patch<Store>(`/stores/${storeId}`, storeData)
        return response
      } catch (error: any) {
        console.error('Erro ao atualizar loja:', error)
        throw new Error(error.message || 'Erro ao atualizar loja')
      }
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas a lojas
      queryClient.invalidateQueries({ queryKey: ['stores'] })
      queryClient.invalidateQueries({ queryKey: ['store', data.slug] })
      queryClient.invalidateQueries({ queryKey: ['store', variables.storeId] })
      
    },
    onError: (error: any) => {
      console.error('Erro na atualização da loja:', error)
    }
  })

  return {
    mutateAsync: updateStoreMutation.mutateAsync,
    mutate: updateStoreMutation.mutate,
    isLoading: updateStoreMutation.isPending,
    isError: updateStoreMutation.isError,
    error: updateStoreMutation.error,
    isSuccess: updateStoreMutation.isSuccess,
    data: updateStoreMutation.data,
    reset: updateStoreMutation.reset
  }
} 