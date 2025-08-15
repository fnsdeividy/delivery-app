import { apiClient } from '@/lib/api-client'
import {
    CreateStoreDto,
    UpdateStoreDto
} from '@/types/cardapio-api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useStores(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['stores', page, limit],
    queryFn: async () => {
      console.log('🔍 useStores: Iniciando busca de lojas...')
      try {
        const response = await apiClient.getStores(page, limit)
        console.log('✅ useStores: Resposta recebida:', response)
        return response
      } catch (error) {
        console.error('❌ useStores: Erro ao buscar lojas:', error)
        throw error
      }
    },
  })
}

export function useStore(slug: string) {
  return useQuery({
    queryKey: ['store', slug],
    queryFn: () => apiClient.getStoreBySlug(slug),
    enabled: !!slug,
  })
}

export function useCreateStore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (storeData: CreateStoreDto) => apiClient.createStore(storeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] })
    },
    onError: (error: Error) => {
      console.error('❌ Erro na criação da loja:', error.message)
      
      // Log específico para diferentes tipos de erro
      if (error.message.includes('Conflito')) {
        console.warn('🚫 Conflito detectado - possivelmente slug duplicado')
      } else if (error.message.includes('Validação')) {
        console.warn('⚠️ Erro de validação - verificar dados enviados')
      } else if (error.message.includes('Não autorizado')) {
        console.error('🔒 Erro de autenticação - verificar token')
      }
    },
  })
}

export function useUpdateStore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ slug, storeData }: { slug: string; storeData: UpdateStoreDto }) =>
      apiClient.updateStore(slug, storeData),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: ['store', slug] })
      queryClient.invalidateQueries({ queryKey: ['stores'] })
    },
  })
}

export function useDeleteStore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slug: string) => apiClient.deleteStore(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] })
    },
  })
}

export function useApproveStore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slug: string) => apiClient.approveStore(slug),
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: ['store', slug] })
      queryClient.invalidateQueries({ queryKey: ['stores'] })
    },
  })
}

export function useRejectStore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slug: string) => apiClient.rejectStore(slug),
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: ['store', slug] })
      queryClient.invalidateQueries({ queryKey: ['stores'] })
    },
  })
}

export function useStoreStats(slug: string) {
  return useQuery({
    queryKey: ['store', slug, 'stats'],
    queryFn: () => apiClient.getStoreStats(slug),
    enabled: !!slug,
  })
}

// Hook para lojas pendentes de aprovação
export function usePendingStores() {
  return useQuery({
    queryKey: ['stores', 'pending'],
    queryFn: async () => {
      const response = await apiClient.getStores(1, 100) // Buscar todas as lojas
      return {
        ...response,
        data: response.data.filter(store => !store.approved)
      }
    },
  })
}

// Hook para lojas aprovadas
export function useApprovedStores() {
  return useQuery({
    queryKey: ['stores', 'approved'],
    queryFn: async () => {
      const response = await apiClient.getStores(1, 100) // Buscar todas as lojas
      return {
        ...response,
        data: response.data.filter(store => store.approved && store.active)
      }
    },
  })
} 