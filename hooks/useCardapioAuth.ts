import { apiClient } from '@/lib/api-client'
import { CreateUserDto, LoginDto } from '@/types/cardapio-api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

export function useCardapioAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const router = useRouter()

  // Mutation para login
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginDto) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await apiClient.authenticate(credentials.email, credentials.password)

        // Validar se a resposta contém o token
        if (!response || typeof response !== 'object') {
          throw new Error('Resposta inválida da API')
        }

        if (!response.access_token || typeof response.access_token !== 'string') {
          throw new Error('Token de acesso inválido ou ausente na resposta')
        }

        // Validar se o token tem o formato JWT correto (3 partes separadas por ponto)
        const tokenParts = response.access_token.split('.')
        if (tokenParts.length !== 3) {
          throw new Error('Formato de token JWT inválido')
        }

        // Decodificar o token JWT para obter informações do usuário
        let payload: any
        try {
          payload = JSON.parse(atob(tokenParts[1]))
        } catch (decodeError) {
          // Fallback: usar dados do usuário da resposta da API
          if (response.user) {
            payload = {
              sub: response.user.id,
              email: response.user.email,
              name: response.user.name,
              role: response.user.role,
              storeSlug: response.user.storeSlug
            }
          } else {
            throw new Error('Não foi possível obter informações do usuário')
          }
        }

        // Retornar dados do usuário do token ou da resposta da API
        return {
          user: {
            id: payload.sub,
            email: payload.email,
            name: payload.name || payload.email.split('@')[0],
            role: response.user?.role || payload.role,
            storeSlug: response.user?.storeSlug || payload.storeSlug || null
          }
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Erro desconhecido durante o login'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    onSuccess: async (data, variables) => {
      // Invalidar queries para atualizar estado da aplicação
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['stores'] })

      // Redirecionar baseado no role do usuário
      if (data.user.role === 'SUPER_ADMIN') {
        router.push('/admin')
        return
      } else if (data.user.role === 'CLIENTE') {
        router.push('/')
        return
      } else if (data.user.role === 'ADMIN') {
        // Para ADMIN, implementar redirecionamento inteligente
        try {
          // TODO: Endpoint /users/me/context não está disponível no backend ainda
          // Comentado temporariamente até a implementação
          // Consultar contexto do usuário para obter lojas
          // const authContext = await apiClient.getCurrentUserContext()
          // const userInfo = authContext.user
          
          // Fallback temporário: não redirecionar automaticamente
          console.warn('Endpoint /users/me/context não implementado no backend ainda')
          router.push('/dashboard/gerenciar-lojas')
          return
        } catch (error) {
          console.warn('Erro ao obter informações do usuário:', error)
          // Fallback: redirecionar para gerenciar lojas
          router.push('/dashboard/gerenciar-lojas')
        }
      }
    },
    onError: (err: any) => {
      console.error('Erro no login:', err)
      setError(err.message)
      // Não fazer redirecionamento automático em caso de erro
    },
  })

  // Mutation para registro
  const registerMutation = useMutation({
    mutationFn: async (userData: CreateUserDto) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await apiClient.register(userData)

        // O apiClient.register já armazena o token automaticamente
        if (response.access_token) {
        }

        return response
      } catch (err: any) {
        const errorMessage = err.message || 'Erro desconhecido durante o registro'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    onSuccess: (data, variables) => {

      // Invalidar queries para atualizar estado da aplicação
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['stores'] })

      // Não fazer login automático pois o registro já retorna o token
      // O token já foi armazenado pelo apiClient.register()
    },
    onError: (err: any) => {
      setError(err.message)
    },
  })

  // Função para logout
  const logout = useCallback(() => {
    apiClient.logout()
    queryClient.clear()
    router.push('/login')
  }, [queryClient, router])

  // Função para verificar se está autenticado - estabilizada com useCallback
  const isAuthenticated = useCallback(() => {
    return apiClient.isAuthenticated()
  }, [])

  // Função para obter token atual - estabilizada com useCallback
  const getCurrentToken = useCallback(() => {
    return apiClient.getCurrentToken()
  }, [])

  return {
    // Estados
    isLoading,
    error,

    // Ações
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,

    // Utilitários
    isAuthenticated,
    getCurrentToken,

    // Mutations para uso direto
    loginMutation,
    registerMutation,
  }
} 