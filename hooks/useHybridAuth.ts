import { apiClient } from '@/lib/api-client'
import { AuthResponse, CreateUserDto, LoginDto } from '@/types/cardapio-api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { signIn, signOut, useSession } from 'next-auth/react'

/**
 * Hook híbrido que combina NextAuth.js com autenticação direta via backend
 * Permite migração gradual do NextAuth para JWT puro do backend
 */
export function useHybridAuth() {
  const queryClient = useQueryClient()
  const { data: session, status } = useSession()

  // Login direto via backend (sem NextAuth)
  const directLoginMutation = useMutation({
    mutationFn: ({ email, password, storeSlug }: LoginDto) =>
      apiClient.authenticate(email, password, storeSlug),
    onSuccess: (data: AuthResponse) => {
      console.log('✅ Login direto bem-sucedido:', data)
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['stores'] })
    },
    onError: (error) => {
      console.error('❌ Erro no login direto:', error)
    }
  })

  // Login via NextAuth (híbrido - usa backend mas mantém sessão NextAuth)
  const nextAuthLoginMutation = useMutation({
    mutationFn: async ({ email, password, storeSlug }: LoginDto) => {
      console.log('🔐 Fazendo login via NextAuth híbrido...')
      
      const result = await signIn('credentials', {
        email,
        password,
        storeSlug,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      return result
    },
    onSuccess: () => {
      console.log('✅ Login NextAuth híbrido bem-sucedido')
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['stores'] })
    },
    onError: (error) => {
      console.error('❌ Erro no login NextAuth híbrido:', error)
    }
  })

  // Registro via backend
  const registerMutation = useMutation({
    mutationFn: (userData: CreateUserDto) => apiClient.register(userData),
    onSuccess: (data: AuthResponse) => {
      console.log('✅ Registro bem-sucedido:', data)
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['stores'] })
    },
  })

  // Logout híbrido
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Limpar token do backend
      apiClient.logout()
      
      // Fazer signOut do NextAuth
      await signOut({ redirect: false })
      
      return Promise.resolve()
    },
    onSuccess: () => {
      console.log('✅ Logout híbrido bem-sucedido')
      queryClient.clear()
    },
  })

  // Verificar autenticação (verifica tanto NextAuth quanto backend)
  const isAuthenticated = Boolean(
    session?.user || // NextAuth
    apiClient.isAuthenticated() // Backend direto
  )

  // Obter usuário atual (prioriza NextAuth se disponível)
  const currentUser = session?.user || null

  // Obter token (prioriza NextAuth se disponível)
  const currentToken = session?.accessToken || apiClient.getCurrentToken()

  // Funções de conveniência
  const loginDirect = (email: string, password: string, storeSlug?: string) => {
    return directLoginMutation.mutate({ email, password, storeSlug })
  }

  const loginNextAuth = (email: string, password: string, storeSlug?: string) => {
    return nextAuthLoginMutation.mutate({ email, password, storeSlug })
  }

  const register = (userData: CreateUserDto) => {
    return registerMutation.mutate(userData)
  }

  const logout = () => {
    return logoutMutation.mutate()
  }

  return {
    // Estado da sessão
    session,
    sessionStatus: status,
    isAuthenticated,
    currentUser,
    currentToken,
    
    // Funções de autenticação
    loginDirect,
    loginNextAuth,
    register,
    logout,
    
    // Estados das mutations
    isLoggingInDirect: directLoginMutation.isPending,
    isLoggingInNextAuth: nextAuthLoginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    
    // Erros
    directLoginError: directLoginMutation.error,
    nextAuthLoginError: nextAuthLoginMutation.error,
    registerError: registerMutation.error,
    logoutError: logoutMutation.error,
    
    // Reset de erros
    resetDirectLoginError: () => directLoginMutation.reset(),
    resetNextAuthLoginError: () => nextAuthLoginMutation.reset(),
    resetRegisterError: () => registerMutation.reset(),
    
    // Utilitários
    isLoading: status === 'loading',
    
    // Para compatibilidade com o hook anterior
    login: loginNextAuth, // Por padrão, usar NextAuth híbrido
    loginError: nextAuthLoginMutation.error,
    isLoggingIn: nextAuthLoginMutation.isPending,
    resetLoginError: () => nextAuthLoginMutation.reset(),
  }
}

// Hook para compatibilidade com código existente
export { useHybridAuth as useAuth }
