import { apiClient } from '@/lib/api-client'
import { CreateStoreDto, Store } from '@/types/cardapio-api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()

  const createStoreMutation = useMutation({
    mutationFn: async (storeData: CreateStoreDto) => {
      try {
        console.log('🏪 Iniciando criação da loja:', storeData.slug)
        const response = await apiClient.post<Store>('/stores', storeData)
        console.log('✅ Loja criada com sucesso:', response.slug)
        return response
      } catch (error: any) {
        console.error('❌ Erro ao criar loja:', error)
        throw new Error(error.message || 'Erro ao criar loja')
      }
    },
    onSuccess: async (data) => {
      try {
        console.log('🔄 Processando sucesso da criação da loja:', data.slug)
        
        // 1. Invalidar queries relacionadas a lojas
        console.log('🗑️ Invalidando cache de lojas...')
        queryClient.invalidateQueries({ queryKey: ['stores'] })
        queryClient.invalidateQueries({ queryKey: ['store', data.slug] })
        queryClient.invalidateQueries({ queryKey: ['user'] })
        
        // 2. Atualizar contexto de autenticação com o novo storeSlug
        console.log('🔑 Atualizando contexto de autenticação...')
        const currentToken = apiClient.getCurrentToken()
        
        if (currentToken) {
          try {
            // Tentar atualizar o token com o novo storeSlug
            await apiClient.updateStoreContext(data.slug)
            console.log('✅ Contexto de autenticação atualizado')
          } catch (updateError) {
            console.warn('⚠️ Não foi possível atualizar contexto, continuando...', updateError)
          }
        }
        
        // 3. Aguardar um momento para garantir que as queries foram invalidadas
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // 4. Verificar se o usuário está autenticado antes de redirecionar
        const isAuthenticated = apiClient.isAuthenticated()
        console.log('🔐 Usuário autenticado:', isAuthenticated)
        
        if (!isAuthenticated) {
          console.warn('⚠️ Usuário não autenticado, redirecionando para login')
          router.push('/login/lojista')
          return
        }
        
        // 5. Redirecionar para o dashboard da loja criada
        const dashboardUrl = `/dashboard/${data.slug}?welcome=true&message=Loja criada com sucesso!`
        console.log('🚀 Redirecionando para:', dashboardUrl)
        
        // Aguardar um momento adicional antes do redirecionamento
        await new Promise(resolve => setTimeout(resolve, 200))
        
        // Verificar se o redirecionamento foi bem-sucedido
        try {
          router.push(dashboardUrl)
          console.log('✅ Redirecionamento executado com sucesso')
          
          // Aguardar um momento para verificar se o redirecionamento funcionou
          setTimeout(() => {
            console.log('🔍 Verificando se redirecionamento foi bem-sucedido...')
            console.log('📍 URL atual:', window.location.pathname)
          }, 1000)
          
        } catch (redirectError) {
          console.error('❌ Erro no redirecionamento:', redirectError)
          // Fallback: tentar redirecionar para dashboard geral
          console.log('🔄 Tentando redirecionamento alternativo...')
          router.push('/dashboard')
        }
        
      } catch (error) {
        console.error('❌ Erro no processamento pós-criação:', error)
        // Em caso de erro, redirecionar para dashboard geral
        router.push('/dashboard')
      }
    },
    onError: (error: any) => {
      console.error('❌ Erro na criação da loja:', error)
      // Em caso de erro, redirecionar para dashboard geral
      router.push('/dashboard')
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