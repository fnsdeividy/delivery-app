import { apiClient } from '@/lib/api-client'
import { AuthResponse, CreateUserDto, LoginDto, UpdateUserDto } from '@/types/cardapio-api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useAuth() {
  const queryClient = useQueryClient()

  // Login
  const loginMutation = useMutation({
    mutationFn: ({ email, password, storeSlug }: LoginDto) =>
      apiClient.authenticate(email, password, storeSlug),
    onSuccess: (data: AuthResponse) => {
      // Invalidar queries relacionadas ao usuário
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['stores'] })
    },
  })

  // Registro
  const registerMutation = useMutation({
    mutationFn: (userData: CreateUserDto) => apiClient.register(userData),
    onSuccess: (data: AuthResponse) => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['stores'] })
    },
  })

  // Logout
  const logoutMutation = useMutation({
    mutationFn: () => {
      apiClient.logout()
      return Promise.resolve()
    },
    onSuccess: () => {
      // Limpar todas as queries do cache
      queryClient.clear()
    },
  })

  // Verificar se está autenticado
  const isAuthenticated = apiClient.isAuthenticated()

  // Obter usuário atual
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', 'current'],
    queryFn: () => {
      if (!isAuthenticated) return null
      // Aqui você pode implementar um endpoint para obter dados do usuário atual
      // Por enquanto, vamos retornar null
      return null
    },
    enabled: isAuthenticated,
  })

  // Funções para chamar as mutations
  const login = (email: string, password: string, storeSlug?: string) => {
    return loginMutation.mutate({ email, password, storeSlug })
  }

  const register = (userData: CreateUserDto) => {
    return registerMutation.mutate(userData)
  }

  const logout = () => {
    return logoutMutation.mutate()
  }

  return {
    // Estado
    isAuthenticated,
    currentUser: currentUser || null,
    isLoadingUser,
    
    // Mutations
    login,
    register,
    logout,
    
    // Estados das mutations
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    
    // Erros
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    logoutError: logoutMutation.error,
    
    // Reset de erros
    resetLoginError: () => loginMutation.reset(),
    resetRegisterError: () => registerMutation.reset(),
  }
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiClient.getUserById(userId),
    enabled: !!userId,
  })
}

export function useUsers(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['users', page, limit],
    queryFn: () => apiClient.getUsers(page, limit),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: CreateUserDto) => apiClient.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: UpdateUserDto }) =>
      apiClient.updateUser(id, userData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['user', id] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
} 