import { apiClient } from '@/lib/api-client'
import { CreateUserDto, LoginDto } from '@/types/cardapio-api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function useCardapioAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const router = useRouter()

  // Mutation para login
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginDto & { storeSlug?: string }) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await apiClient.authenticate(credentials.email, credentials.password, credentials.storeSlug)

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
            storeSlug: credentials.storeSlug || response.user?.storeSlug || payload.storeSlug || null
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
    onSuccess: (data, variables) => {
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
        // Para ADMIN, usar lógica inteligente de redirecionamento
        let storeSlug = variables.storeSlug

        // Se não houver nas variáveis, verificar no usuário retornado
        if (!storeSlug && data.user.storeSlug) {
          storeSlug = data.user.storeSlug
        }

        // Se ainda não houver, verificar no localStorage
        if (!storeSlug) {
          const storedStoreSlug = localStorage.getItem('currentStoreSlug')
          if (storedStoreSlug) {
            storeSlug = storedStoreSlug
          }
        }

        // Verificar se o storeSlug é válido
        if (storeSlug && storeSlug.trim() !== '') {
          // ADMIN com loja específica - redirecionar para dashboard da loja
          const dashboardUrl = `/dashboard/${storeSlug}`

          // Invalidar queries relacionadas
          queryClient.invalidateQueries({ queryKey: ['store', storeSlug] })
          queryClient.invalidateQueries({ queryKey: ['stores'] })

          // Executar redirecionamento
          router.push(dashboardUrl)
        } else {
          // ADMIN sem loja específica - redirecionar para dashboard administrativo
          router.push('/dashboard')
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
        console.log('📝 Registrando usuário:', userData.email)
        const response = await apiClient.register(userData)
        console.log('✅ Usuário registrado com sucesso:', response)

        // O apiClient.register já armazena o token automaticamente
        if (response.access_token) {
          console.log('🔑 Token de registro armazenado automaticamente')
        }

        return response
      } catch (err: any) {
        const errorMessage = err.message || 'Erro desconhecido durante o registro'
        console.error('❌ Erro no registro:', errorMessage)
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    onSuccess: (data, variables) => {
      console.log('🎉 Registro bem-sucedido, token já armazenado')

      // Invalidar queries para atualizar estado da aplicação
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['stores'] })

      // Não fazer login automático pois o registro já retorna o token
      // O token já foi armazenado pelo apiClient.register()
    },
    onError: (err: any) => {
      console.error('❌ Erro na mutation de registro:', err.message)
      setError(err.message)
    },
  })

  // Função para logout
  const logout = () => {
    apiClient.logout()
    queryClient.clear()
    router.push('/login')
  }

  // Função para verificar se está autenticado
  const isAuthenticated = () => {
    return apiClient.isAuthenticated()
  }

  // Função para obter token atual
  const getCurrentToken = () => {
    return apiClient.getCurrentToken()
  }

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