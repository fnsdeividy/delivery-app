import { apiClient } from '@/lib/api-client'
import { AuthResponse, CreateUserDto, LoginDto } from '@/types/cardapio-api'
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
        const token = await apiClient.authenticate(credentials.email, credentials.password, credentials.storeSlug)
        
        // Decodificar o token JWT para obter informações do usuário
        const payload = JSON.parse(atob(token.split('.')[1]))
        
        // Invalidar queries relacionadas ao usuário
        queryClient.invalidateQueries({ queryKey: ['user'] })
        queryClient.invalidateQueries({ queryKey: ['stores'] })
        
        // Retornar dados do usuário do token
        return {
          user: {
            id: payload.sub,
            email: payload.email,
            name: payload.name || payload.email.split('@')[0], // Usar name do token se disponível
            role: payload.role,
            storeSlug: credentials.storeSlug || payload.storeSlug || null
          }
        }
      } catch (err: any) {
        setError(err.message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    onSuccess: (data, variables) => {
      console.log('🎉 Login bem-sucedido:', data)
      console.log('🔑 Token armazenado, tentando redirecionar...')
      console.log('📋 Dados do login:', { 
        role: data.user.role, 
        storeSlug: data.user.storeSlug,
        originalStoreSlug: variables.storeSlug 
      })
      
      // Redirecionar baseado no role do usuário
      if (data.user.role === 'SUPER_ADMIN') {
        console.log('👑 Redirecionando super admin para /admin')
        router.push('/admin')
      } else if (data.user.role === 'ADMIN') {
        // Para ADMIN, usar lógica inteligente de redirecionamento
        const storeSlug = variables.storeSlug || data.user.storeSlug
        
        if (storeSlug) {
          // ADMIN com loja específica - redirecionar para dashboard da loja
          const dashboardUrl = `/dashboard/${storeSlug}`
          console.log('🏪 Redirecionando para dashboard da loja:', dashboardUrl)
          console.log('🔄 Invalidando queries relacionadas...')
          queryClient.invalidateQueries({ queryKey: ['store', storeSlug] })
          console.log('🚀 Executando router.push...')
          router.push(dashboardUrl)
          console.log('✅ Redirecionamento executado')
        } else {
          // ADMIN sem loja específica - redirecionar para dashboard administrativo
          console.log('⚙️ ADMIN sem loja específica, redirecionando para dashboard administrativo')
          router.push('/dashboard')
        }
      } else {
        // Para outros roles (CLIENTE), redirecionar para home
        console.log('🏠 Usuário cliente, redirecionando para home')
        router.push('/')
      }
    },
    onError: (err: any) => {
      console.error('Erro no login:', err)
      setError(err.message)
    },
  })

  // Mutation para registro
  const registerMutation = useMutation({
    mutationFn: async (userData: CreateUserDto) => {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await apiClient.post<AuthResponse>('/auth/register', userData)
        return response
      } catch (err: any) {
        setError(err.message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    onSuccess: (data, variables) => {
      // Após registro bem-sucedido, fazer login automático
      loginMutation.mutate({
        email: variables.email,
        password: variables.password,
      })
    },
    onError: (err: any) => {
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