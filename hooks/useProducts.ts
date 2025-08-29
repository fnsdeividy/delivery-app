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
    queryFn: () => apiClient.getProductById(id),
    enabled: !!id,
  });
}

export function useCategories(storeSlug: string) {
  return useQuery({
    queryKey: ["categories", storeSlug],
    queryFn: () => apiClient.getCategories(storeSlug),
    enabled: !!storeSlug,
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
    }: {
      id: string;
      productData: UpdateProductDto;
    }) => apiClient.updateProduct(id, productData),
    onSuccess: (_, { id, productData }) => {
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      // Invalidar todas as queries de produtos para garantir atualização
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, storeSlug }: { id: string; storeSlug: string }) =>
      apiClient.deleteProduct(id),
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
