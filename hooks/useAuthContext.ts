import { apiClient } from '@/lib/api-client'
import { SetCurrentStoreDto } from '@/types/cardapio-api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useAuthContext() {
  return useQuery({
    queryKey: ['user-context'],
    queryFn: () => apiClient.getCurrentUserContext(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

// TODO: Endpoint /users/{userId}/stores não está disponível no backend ainda
// Comentado temporariamente até a implementação
export function useUserStores() {
  // const { data: authContext } = useQuery({
  //   queryKey: ['user-context'],
  //   queryFn: () => apiClient.getCurrentUserContext(),
  // })

  // const user = authContext?.user

  // return useQuery({
  //   queryKey: ['user-stores', user?.id],
  //   queryFn: () => apiClient.getUserStoreAssociations(user!.id),
  //   enabled: !!user?.id,
  //   staleTime: 5 * 60 * 1000,
  // })

  // Fallback temporário: retornar array vazio
  return {
    data: [],
    isLoading: false,
    error: null
  } as any
}

// TODO: Endpoint /users/me/permissions não está disponível no backend ainda
// Comentado temporariamente até a implementação
export function useUserPermissions(storeSlug?: string) {
  // return useQuery({
  //   queryKey: ['user-permissions', storeSlug],
  //   queryFn: () => apiClient.getUserPermissions(storeSlug),
  //   staleTime: 5 * 60 * 1000,
  // })

  // Fallback temporário: retornar permissões básicas
  return {
    data: {
      scope: 'STORE' as any,
      stores: storeSlug ? {
        [storeSlug]: {
          role: 'OWNER' as any,
          permissions: ['read', 'write', 'delete']
        }
      } : {},
      globalPermissions: []
    },
    isLoading: false,
    error: null
  } as any
}

export function useSetCurrentStore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SetCurrentStoreDto) => apiClient.setCurrentStore(data),
    onSuccess: (updatedUser, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['user-context'] })
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] })

      // Atualizar dados do usuário no cache
      queryClient.setQueryData(['user'], updatedUser)

      console.log('✅ Loja atual definida com sucesso:', variables.storeSlug)
    },
    onError: (error) => {
      console.error('❌ Erro ao definir loja atual:', error)
    }
  })
}

// TODO: Endpoint /users/me/permissions não está disponível no backend ainda
// Comentado temporariamente até a implementação
// Hook para verificar permissões
export function useHasPermission() {
  // const { data: permissions } = useUserPermissions()

  // Fallback temporário: retornar permissões básicas
  return {
    hasPermission: (permission: string, storeSlug?: string) => {
      // TODO: Implementar quando o endpoint estiver disponível
      return true // Temporariamente permite tudo
    },

    hasStoreRole: (role: string, storeSlug: string) => {
      // TODO: Implementar quando o endpoint estiver disponível
      return true // Temporariamente permite tudo
    },

    isGlobalAdmin: () => {
      // TODO: Implementar quando o endpoint estiver disponível
      return false // Temporariamente não é admin global
    },

    isSuperAdmin: () => {
      // TODO: Implementar quando o endpoint estiver disponível
      return false // Temporariamente não é super admin
    },

    isStoreAdmin: (storeSlug: string) => {
      // TODO: Implementar quando o endpoint estiver disponível
      return true // Temporariamente é admin da loja
    },

    canAccessStore: (storeSlug: string) => {
      // TODO: Implementar quando o endpoint estiver disponível
      return true // Temporariamente pode acessar qualquer loja
    }
  }
}

// Hook para obter a loja atual do usuário
export function useCurrentStore() {
  const { data: authContext } = useQuery({
    queryKey: ['user-context'],
    queryFn: () => apiClient.getCurrentUserContext(),
  })

  const user = authContext?.user

  // Durante SSR, usar apenas dados do usuário
  // No cliente, tentar obter do localStorage como fallback
  const currentStoreSlug = typeof window !== 'undefined' ? apiClient.getCurrentStoreSlug() : null

  const currentStore = user?.currentStoreSlug || null

  return {
    currentStore,
    currentStoreSlug,
    hasCurrentStore: !!currentStoreSlug,
    isOwner: false, // TODO: Implementar verificação de role
    isAdmin: false, // TODO: Implementar verificação de role
    isManager: false, // TODO: Implementar verificação de role
  }
}