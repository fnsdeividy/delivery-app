import { apiClient } from "@/lib/api-client";
import { CreateProductDto, UpdateProductDto } from "@/types/cardapio-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useProducts(storeSlug: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ["products", storeSlug, page, limit],
    queryFn: () => apiClient.getProducts(storeSlug, page, limit),
    enabled: !!storeSlug,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    // Agora exige storeSlug, então este hook deve receber storeSlug via closure externa
    // Mantenho compat por sobrecarga criando uma função alternativa abaixo
    queryFn: () =>
      Promise.reject(
        new Error("useProduct(id) requer storeSlug. Use useProductInStore.")
      ),
    enabled: !!id,
  });
}

// Versão correta recebendo storeSlug explicitamente
export function useProductInStore(id: string, storeSlug: string) {
  return useQuery({
    queryKey: ["product", id, storeSlug],
    queryFn: () => apiClient.getProductById(id, storeSlug),
    enabled: !!id && !!storeSlug,
  });
}

export function useCategories(storeSlug: string) {
  return useQuery({
    queryKey: ["categories", storeSlug],
    queryFn: async () => {
      try {
        const response = await apiClient.getCategories(storeSlug);
        return response;
      } catch (error: any) {
        console.error("Erro ao buscar categorias:", error);

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
          console.error("🔍 Loja não encontrada ou endpoint indisponível");
          throw new Error(
            "Loja não encontrada ou serviço temporariamente indisponível."
          );
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
    enabled: !!storeSlug,
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

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: CreateProductDto) =>
      apiClient.createProduct(productData),
    onSuccess: (_, productData) => {
      queryClient.invalidateQueries({
        queryKey: ["products", productData.storeSlug],
      });
      queryClient.invalidateQueries({
        queryKey: ["categories", productData.storeSlug],
      });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      productData,
      storeSlug,
    }: {
      id: string;
      productData: UpdateProductDto;
      storeSlug: string;
    }) => apiClient.updateProduct(id, { ...productData, storeSlug }),
    onSuccess: (_, { id, storeSlug }) => {
      queryClient.invalidateQueries({ queryKey: ["product", id, storeSlug] });
      // Invalidar todas as queries de produtos para garantir atualização
      queryClient.invalidateQueries({ queryKey: ["products", storeSlug] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, storeSlug }: { id: string; storeSlug: string }) =>
      apiClient.deleteProduct(id, storeSlug),
    onSuccess: (_, { storeSlug }) => {
      queryClient.invalidateQueries({ queryKey: ["products", storeSlug] });
    },
  });
}

export function useSearchProducts(storeSlug: string, query: string) {
  return useQuery({
    queryKey: ["products", storeSlug, "search", query],
    queryFn: () => apiClient.searchProducts(storeSlug, query),
    enabled: !!storeSlug && !!query,
  });
}

// Hook para produtos por categoria
export function useProductsByCategory(storeSlug: string, categoryId: string) {
  return useQuery({
    queryKey: ["products", storeSlug, "category", categoryId],
    queryFn: async () => {
      const response = await apiClient.getProducts(storeSlug, 1, 100);
      return {
        ...response,
        data: response.data.filter(
          (product) => product.categoryId === categoryId
        ),
      };
    },
    enabled: !!storeSlug && !!categoryId,
  });
}

// Hook para produtos ativos
export function useActiveProducts(storeSlug: string) {
  return useQuery({
    queryKey: ["products", storeSlug, "active"],
    queryFn: async () => {
      const response = await apiClient.getProducts(storeSlug, 1, 100);
      return {
        ...response,
        data: response.data.filter((product) => product.active),
      };
    },
    enabled: !!storeSlug,
  });
}
