import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para debounce de valores
 * Útil para otimizar pesquisas e evitar muitas chamadas de API
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para debounce de função
 * Útil para otimizar callbacks que são chamados frequentemente
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const timer = setTimeout(() => {
        callback(...args);
      }, delay);

      setDebounceTimer(timer);
    },
    [callback, delay, debounceTimer]
  ) as T;

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return debouncedCallback;
}

/**
 * Hook para debounce de pesquisa com estado de loading
 */
export function useDebouncedSearch<T>(
  searchFn: (query: string) => Promise<T>,
  delay: number = 150
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, delay);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const searchResults = await searchFn(debouncedQuery);
        
        if (!isCancelled) {
          setResults(searchResults);
          setIsLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Erro na pesquisa');
          setIsLoading(false);
        }
      }
    };

    performSearch();

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery, searchFn]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    clearSearch,
  };
}

/**
 * Hook para throttle de função
 * Útil para limitar a frequência de execução de funções
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [lastCall, setLastCall] = useState<number>(0);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCall >= delay) {
        setLastCall(now);
        callback(...args);
      }
    },
    [callback, delay, lastCall]
  ) as T;

  return throttledCallback;
}