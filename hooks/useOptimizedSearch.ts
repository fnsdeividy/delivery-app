import { useDebouncedSearch } from './useDebounce';
import { apiClient } from '@/lib/api-client';
import { Product, Store, Order } from '@/types/cardapio-api';

/**
 * Hook otimizado para pesquisa de produtos
 */
export function useProductSearch(storeSlug: string) {
  return useDebouncedSearch(
    async (query: string) => {
      if (!query.trim()) return [];
      return await apiClient.searchProducts(storeSlug, query);
    },
    300 // 300ms de delay
  );
}

/**
 * Hook otimizado para pesquisa de lojas
 */
export function useStoreSearch() {
  return useDebouncedSearch(
    async (query: string) => {
      if (!query.trim()) return [];
      // Implementar busca de lojas quando a API estiver disponível
      return [];
    },
    300
  );
}

/**
 * Hook otimizado para pesquisa de pedidos
 */
export function useOrderSearch(storeSlug: string) {
  return useDebouncedSearch(
    async (query: string) => {
      if (!query.trim()) return [];
      // Implementar busca de pedidos quando a API estiver disponível
      return [];
    },
    300
  );
}

/**
 * Hook para cache inteligente de dados
 */
export function useSmartCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: {
    staleTime?: number;
    gcTime?: number;
    enabled?: boolean;
  } = {}
) {
  const { staleTime = 5 * 60 * 1000, gcTime = 15 * 60 * 1000, enabled = true } = options;

  // Implementar cache inteligente baseado no tipo de dados
  const getCacheConfig = (key: string) => {
    if (key.includes('products')) {
      return { staleTime: 5 * 60 * 1000, gcTime: 15 * 60 * 1000 };
    }
    if (key.includes('orders')) {
      return { staleTime: 30 * 1000, gcTime: 5 * 60 * 1000 };
    }
    if (key.includes('stores')) {
      return { staleTime: 10 * 60 * 1000, gcTime: 30 * 60 * 1000 };
    }
    return { staleTime, gcTime };
  };

  const cacheConfig = getCacheConfig(key);

  // Aqui você implementaria a lógica de cache
  // Por enquanto, retornamos um mock
  return {
    data: null as T | null,
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
}

/**
 * Hook para pré-carregar dados relacionados
 */
export function usePreloadData(storeSlug: string) {
  const preloadProducts = async () => {
    try {
      await apiClient.getProducts(storeSlug, 1, 10);
    } catch (error) {
      console.warn('Erro ao pré-carregar produtos:', error);
    }
  };

  const preloadOrders = async () => {
    try {
      await apiClient.getOrders(storeSlug, 1, 10);
    } catch (error) {
      console.warn('Erro ao pré-carregar pedidos:', error);
    }
  };

  const preloadStore = async () => {
    try {
      await apiClient.getStoreBySlug(storeSlug);
    } catch (error) {
      console.warn('Erro ao pré-carregar loja:', error);
    }
  };

  return {
    preloadProducts,
    preloadOrders,
    preloadStore,
  };
}

/**
 * Hook para gerenciar cache de múltiplas queries
 */
export function useBatchQueries<T>(
  queries: Array<{
    key: string;
    fn: () => Promise<T>;
    enabled?: boolean;
  }>
) {
  // Implementar lógica de batch queries
  // Por enquanto, retornamos um mock
  return {
    data: [] as T[],
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
}