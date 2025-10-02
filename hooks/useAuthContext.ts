import { apiClient } from "@/lib/api-client";
import { SetCurrentStoreDto } from "@/types/cardapio-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useAuthContext() {
  return useQuery({
    queryKey: ["user-context"],
    queryFn: async () => {
      try {
        // Fallback: obter dados do localStorage em vez de chamar endpoint não implementado
        if (typeof window !== "undefined") {
          const savedUser = localStorage.getItem("user");
          if (savedUser) {
            try {
              const userData = JSON.parse(savedUser);

              return {
                user: userData,
                stores: userData.stores || [],
                currentStore: userData.currentStore || null,
              };
            } catch (e) {
              console.error(
                "❌ useAuthContext: Erro ao parsear dados do localStorage",
                e
              );
            }
          }
        }

        // Se não conseguir obter dados, retornar objeto vazio
        return {
          user: null,
          stores: [],
          currentStore: null,
        };
      } catch (error) {
        // Se não conseguir obter dados, retornar objeto vazio
        return {
          user: null,
          stores: [],
          currentStore: null,
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: false, // Não tentar novamente se falhar
    // Adicionar fallback silencioso para evitar quebras na UI
    placeholderData: (previousData) => {
      if (typeof window !== "undefined") {
        try {
          const savedUser = localStorage.getItem("user");
          if (savedUser) {
            const userData = JSON.parse(savedUser);
            return {
              user: userData,
              stores: userData.stores || [],
              currentStore: userData.currentStore || null,
            };
          }
        } catch (e) {
          console.error("❌ useAuthContext: Erro no placeholderData", e);
        }
      }
      return previousData;
    },
  });
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
    error: null,
  } as any;
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
      scope: "STORE" as any,
      stores: storeSlug
        ? {
            [storeSlug]: {
              role: "OWNER" as any,
              permissions: ["read", "write", "delete"],
            },
          }
        : {},
      globalPermissions: [],
    },
    isLoading: false,
    error: null,
  } as any;
}

export function useSetCurrentStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SetCurrentStoreDto) => apiClient.setCurrentStore(data),
    onSuccess: (updatedUser, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["user-context"] });
      queryClient.invalidateQueries({ queryKey: ["user-permissions"] });

      // Atualizar dados do usuário no cache
      queryClient.setQueryData(["user"], updatedUser);
    },
    onError: (error) => {
      console.error("❌ Erro ao definir loja atual:", error);
    },
  });
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
      return true; // Temporariamente permite tudo
    },

    hasStoreRole: (role: string, storeSlug: string) => {
      // TODO: Implementar quando o endpoint estiver disponível
      return true; // Temporariamente permite tudo
    },

    isGlobalAdmin: () => {
      // TODO: Implementar quando o endpoint estiver disponível
      return false; // Temporariamente não é admin global
    },

    isStoreAdmin: (storeSlug: string) => {
      // TODO: Implementar quando o endpoint estiver disponível
      return true; // Temporariamente é admin da loja
    },

    canAccessStore: (storeSlug: string) => {
      // TODO: Implementar quando o endpoint estiver disponível
      return true; // Temporariamente pode acessar qualquer loja
    },
  };
}

// Hook para obter a loja atual do usuário
export function useCurrentStore() {
  const {
    data: authContext,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["user-context"],
    queryFn: async () => {
      try {
        // Fallback: obter dados do localStorage em vez de chamar endpoint não implementado
        if (typeof window !== "undefined") {
          const savedUser = localStorage.getItem("user");
          if (savedUser) {
            try {
              const userData = JSON.parse(savedUser);

              return {
                user: userData,
                stores: userData.stores || [],
                currentStore: userData.currentStore || null,
              };
            } catch (e) {
              console.error(
                "❌ useCurrentStore: Erro ao parsear dados do localStorage",
                e
              );
            }
          }
        }

        // Se não conseguir obter dados, retornar objeto vazio
        return {
          user: null,
          stores: [],
          currentStore: null,
        };
      } catch (error) {
        // Se não conseguir obter dados, retornar objeto vazio
        return {
          user: null,
          stores: [],
          currentStore: null,
        };
      }
    },
    retry: false,
  });

  // Se houver erro, tentar obter dados do localStorage como último recurso
  let user = authContext?.user;
  if (!user && error && typeof window !== "undefined") {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        user = JSON.parse(savedUser);
      }
    } catch (e) {
      console.error("❌ useCurrentStore: Erro no fallback final", e);
    }
  }

  // Durante SSR, usar apenas dados do usuário
  // No cliente, tentar obter do localStorage como fallback
  const currentStoreSlug =
    typeof window !== "undefined" ? apiClient.getCurrentStoreSlug() : null;

  const currentStore = user?.currentStoreSlug || null;

  return {
    currentStore,
    currentStoreSlug,
    hasCurrentStore: !!currentStoreSlug,
    isOwner: false, // TODO: Implementar verificação de role
    isAdmin: false, // TODO: Implementar verificação de role
    isManager: false, // TODO: Implementar verificação de role
    isLoading,
    error,
  };
}
