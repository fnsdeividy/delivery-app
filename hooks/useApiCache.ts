import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";

interface UseApiCacheOptions {
  staleTime?: number;
  gcTime?: number;
  retry?: boolean | number | ((failureCount: number, error: any) => boolean);
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  refetchOnReconnect?: boolean;
}

/**
 * Hook personalizado para gerenciar cache de API com configurações otimizadas
 * Evita chamadas duplicadas e melhora a performance
 */
export function useApiCache<T>(
  queryKey: (string | number)[],
  queryFn: () => Promise<T>,
  options: UseApiCacheOptions = {}
) {
  const queryClient = useQueryClient();
  const lastCallTime = useRef<number>(0);
  const minInterval = 1000; // Mínimo de 1 segundo entre chamadas

  const {
    staleTime = 5 * 60 * 1000, // 5 minutos
    gcTime = 15 * 60 * 1000, // 15 minutos
    retry = (failureCount: number, error: any) => {
      // Não tentar novamente para erros 4xx
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    enabled = true,
    refetchOnWindowFocus = false,
    refetchOnMount = true,
    refetchOnReconnect = true,
  } = options;

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const now = Date.now();
      
      // Evitar chamadas muito frequentes
      if (now - lastCallTime.current < minInterval) {
        // Retornar dados do cache se disponível
        const cachedData = queryClient.getQueryData<T>(queryKey);
        if (cachedData) {
          return cachedData;
        }
      }
      
      lastCallTime.current = now;
      return await queryFn();
    },
    enabled,
    staleTime,
    gcTime,
    retry,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const refetch = useCallback(() => {
    lastCallTime.current = 0; // Reset do timer para permitir refetch imediato
    return query.refetch();
  }, [query]);

  return {
    ...query,
    invalidate,
    refetch,
  };
}

/**
 * Hook para gerenciar cache de múltiplas queries relacionadas
 */
export function useRelatedApiCache<T>(
  queries: Array<{
    key: (string | number)[];
    fn: () => Promise<T>;
    options?: UseApiCacheOptions;
  }>
) {
  const queryClient = useQueryClient();

  const results = queries.map(({ key, fn, options = {} }) =>
    useApiCache(key, fn, options)
  );

  const invalidateAll = useCallback(() => {
    queries.forEach(({ key }) => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  }, [queryClient, queries]);

  const refetchAll = useCallback(async () => {
    await Promise.all(results.map(({ refetch }) => refetch()));
  }, [results]);

  return {
    results,
    invalidateAll,
    refetchAll,
    isLoading: results.some(({ isLoading }) => isLoading),
    isError: results.some(({ isError }) => isError),
    errors: results.map(({ error }) => error).filter(Boolean),
  };
}