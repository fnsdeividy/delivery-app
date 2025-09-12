import { useCallback, useRef, useState } from "react";

interface UseLoadingStateOptions {
  initialLoading?: boolean;
  debounceMs?: number;
}

/**
 * Hook para gerenciar estado de loading com debounce
 * Evita mudanças muito rápidas de estado que podem causar re-renders desnecessários
 */
export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const { initialLoading = false, debounceMs = 100 } = options;
  const [isLoading, setIsLoading] = useState(initialLoading);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setLoading = useCallback(
    (loading: boolean) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      if (loading) {
        // Se for para mostrar loading, mostrar imediatamente
        setIsLoading(true);
      } else {
        // Se for para esconder loading, usar debounce para evitar flicker
        debounceTimeoutRef.current = setTimeout(() => {
          setIsLoading(false);
        }, debounceMs);
      }
    },
    [debounceMs]
  );

  const setLoadingImmediate = useCallback((loading: boolean) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    setIsLoading(loading);
  }, []);

  return {
    isLoading,
    setLoading,
    setLoadingImmediate,
  };
}

/**
 * Hook para gerenciar múltiplos estados de loading
 */
export function useMultipleLoadingStates(keys: string[]) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    keys.reduce((acc, key) => ({ ...acc, [key]: false }), {})
  );

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: loading,
    }));
  }, []);

  const setAllLoading = useCallback((loading: boolean) => {
    setLoadingStates((prev) =>
      Object.keys(prev).reduce(
        (acc, key) => ({ ...acc, [key]: loading }),
        {}
      )
    );
  }, []);

  const isAnyLoading = Object.values(loadingStates).some(Boolean);
  const isAllLoading = Object.values(loadingStates).every(Boolean);

  return {
    loadingStates,
    setLoading,
    setAllLoading,
    isAnyLoading,
    isAllLoading,
  };
}