import { apiClient } from "@/lib/api-client";
import { CreateStoreDto, UpdateStoreDto } from "@/types/cardapio-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useStores(page = 1, limit = 10, enabled = true) {
  return useQuery({
    queryKey: ["stores", page, limit],
    queryFn: async () => {
      try {
        const response = await apiClient.getStores(page, limit);
        return response;
      } catch (error: any) {
        console.error("Erro ao buscar lojas:", error);

        // Tratamento específico para diferentes tipos de erro
        if (error.status === 401) {
          console.error("🔒 Erro de autenticação - token inválido ou expirado");
          throw new Error("Sessão expirada. Faça login novamente.");
        } else if (error.status === 403) {
          console.error("🚫 Erro de permissão - usuário não tem acesso");
          throw new Error(
            "Você não tem permissão para acessar esta funcionalidade."
          );
        } else if (error.status === 404) {
          console.error("🔍 Endpoint não encontrado");
          throw new Error("Serviço temporariamente indisponível.");
        } else if (error.status >= 500) {
          console.error("🔥 Erro interno do servidor");
          throw new Error(
            "Erro interno do servidor. Tente novamente em alguns minutos."
          );
        } else if (
          error.message?.includes("Network Error") ||
          error.code === "ERR_NETWORK"
        ) {
          console.error("🌐 Erro de conexão");
          throw new Error(
            "Erro de conexão. Verifique sua internet e tente novamente."
          );
        }

        throw error;
      }
    },
    enabled: enabled,
    retry: (failureCount, error: any) => {
      // Não tentar novamente para erros de autenticação ou permissão
      if (error.status === 401 || error.status === 403) {
        return false;
      }
      // Tentar até 3 vezes para outros erros
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useStore(slug: string) {
  return useQuery({
    queryKey: ["store", slug],
    queryFn: () => apiClient.getStoreBySlug(slug),
    enabled: !!slug,
  });
}

export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storeData: CreateStoreDto) => apiClient.createStore(storeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
    onError: (error: Error) => {
      if (error.message.includes("Conflito")) {
        console.warn("🚫 Conflito detectado - possivelmente slug duplicado");
      } else if (error.message.includes("Validação")) {
        console.warn("⚠️ Erro de validação - verificar dados enviados");
      } else if (error.message.includes("Não autorizado")) {
        console.error("🔒 Erro de autenticação - verificar token");
      }
    },
  });
}

export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      slug,
      storeData,
    }: {
      slug: string;
      storeData: UpdateStoreDto;
    }) => apiClient.updateStore(slug, storeData),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: ["store", slug] });
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
}

export function useDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => apiClient.deleteStore(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
}

export function useApproveStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.updateStore(id, { approved: true }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["store", id] });
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
    onError: (error: Error) => {
      if (error.message.includes("401")) {
        console.warn("🔒 Erro de autenticação - verificar token");
      } else if (error.message.includes("403")) {
        console.warn("🚫 Erro de permissão - usuário não tem acesso");
      } else if (error.message.includes("404")) {
        console.warn("🔍 Loja não encontrada - verificar ID");
      }
    },
  });
}

export function useRejectStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      apiClient.updateStore(id, { approved: false }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["store", id] });
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
    onError: (error: Error) => {
      if (error.message.includes("401")) {
        console.warn("🔒 Erro de autenticação - verificar token");
      } else if (error.message.includes("403")) {
        console.warn("🚫 Erro de permissão - usuário não tem acesso");
      } else if (error.message.includes("404")) {
        console.warn("🔍 Loja não encontrada - verificar ID");
      }
    },
  });
}

export function useStoreStats(slug: string) {
  return useQuery({
    queryKey: ["store", slug, "stats"],
    queryFn: () => apiClient.getStoreStats(slug),
    enabled: !!slug,
  });
}

// Hook para lojas pendentes de aprovação
export function usePendingStores() {
  return useQuery({
    queryKey: ["stores", "pending"],
    queryFn: async () => {
      const response = await apiClient.getStores(1, 100); // Buscar todas as lojas
      return {
        ...response,
        data: response.data.filter((store) => !store.approved),
      };
    },
  });
}

// Hook para lojas aprovadas
export function useApprovedStores() {
  return useQuery({
    queryKey: ["stores", "approved"],
    queryFn: async () => {
      const response = await apiClient.getStores(1, 100); // Buscar todas as lojas
      return {
        ...response,
        data: response.data.filter((store) => store.approved && store.active),
      };
    },
  });
}
