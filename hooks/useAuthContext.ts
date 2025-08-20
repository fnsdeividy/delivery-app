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

export function useUserStores() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => apiClient.getCurrentUser(),
  })

  return useQuery({
    queryKey: ['user-stores', user?.id],
    queryFn: () => apiClient.getUserStoreAssociations(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUserPermissions(storeSlug?: string) {
  return useQuery({
    queryKey: ['user-permissions', storeSlug],
    queryFn: () => apiClient.getUserPermissions(storeSlug),
    staleTime: 5 * 60 * 1000,
  })
}

export function useSetCurrentStore() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: SetCurrentStoreDto) => apiClient.setCurrentStore(data),
    onSuccess: (updatedUser) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['user-context'] })
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] })
      
      // Atualizar dados do usuário no cache
      queryClient.setQueryData(['user'], updatedUser)
    },
    onError: (error) => {
      console.error('❌ Erro ao definir loja atual:', error)
    }
  })
}

// Hook para verificar permissões
export function useHasPermission() {
  const { data: permissions } = useUserPermissions()
  
  return {
    hasPermission: (permission: string, storeSlug?: string) => {
      if (!permissions) return false
      
      // Verificar permissões globais primeiro
      if (permissions.globalPermissions?.includes(permission)) {
        return true
      }
      
      // Verificar permissões específicas da loja
      if (storeSlug && permissions.stores[storeSlug]) {
        return permissions.stores[storeSlug].permissions.includes(permission)
      }
      
      return false
    },
    
    hasStoreRole: (role: string, storeSlug: string) => {
      if (!permissions || !permissions.stores[storeSlug]) return false
      return permissions.stores[storeSlug].role === role
    },
    
    isGlobalAdmin: () => {
      return permissions?.scope === 'GLOBAL'
    },
    
    isSuperAdmin: () => {
      return permissions?.scope === 'GLOBAL'
    },
    
    isStoreAdmin: (storeSlug: string) => {
      if (!permissions || !permissions.stores[storeSlug]) return false
      const storeRole = permissions.stores[storeSlug].role
      return storeRole === 'OWNER' || storeRole === 'LOJA_ADMIN'
    },
    
    canAccessStore: (storeSlug: string) => {
      if (!permissions) return false
      // Super admin pode acessar qualquer loja
      if (permissions.scope === 'GLOBAL') return true
      // Usuário pode acessar lojas onde tem vínculo
      return !!permissions.stores[storeSlug]
    }
  }
}

// Hook para obter a loja atual do usuário
export function useCurrentStore() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => apiClient.getCurrentUser(),
  })

  const currentStoreSlug = user?.currentStoreSlug || apiClient.getCurrentStoreSlug()
  
  const currentStore = user?.stores?.find(
    store => store.storeSlug === currentStoreSlug
  )

  return {
    currentStore,
    currentStoreSlug,
    hasCurrentStore: !!currentStore,
    isOwner: currentStore?.role === 'OWNER',
    isAdmin: currentStore?.role === 'OWNER' || currentStore?.role === 'LOJA_ADMIN',
    isManager: ['OWNER', 'LOJA_ADMIN', 'LOJA_MANAGER'].includes(currentStore?.role || ''),
  }
}