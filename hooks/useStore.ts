import { apiClient } from '@/lib/api-client'
import { Store } from '@/types/cardapio-api'
import { useQuery } from '@tanstack/react-query'

export function useStore(storeId: string) {
  return useQuery({
    queryKey: ['store', storeId],
    queryFn: async (): Promise<Store> => {
      try {
        const response = await apiClient.get<Store>(`/stores/${storeId}`)
        return response
      } catch (error: any) {
        console.error('Erro ao buscar loja:', error)
        throw new Error(error.message || 'Erro ao buscar loja')
      }
    },
    enabled: !!storeId, // Só executa se storeId estiver disponível
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
} 