import { useState, useCallback } from 'react';

interface UseAsyncActionOptions {
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  preventDoubleClick?: boolean;
}

interface UseAsyncActionReturn {
  isLoading: boolean;
  error: Error | null;
  execute: (action: () => Promise<any>) => Promise<void>;
  reset: () => void;
}

/**
 * Hook personalizado para gerenciar ações assíncronas com estado de loading
 * e prevenção de cliques duplos
 */
export function useAsyncAction(options: UseAsyncActionOptions = {}): UseAsyncActionReturn {
  const { onSuccess, onError, preventDoubleClick = true } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (action: () => Promise<any>) => {
    if (isLoading && preventDoubleClick) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await action();
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro desconhecido');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, preventDoubleClick, onSuccess, onError]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    execute,
    reset,
  };
}

/**
 * Hook simplificado para ações assíncronas com apenas o estado de loading
 */
export function useLoadingState() {
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async (action: () => Promise<any>) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await action();
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return {
    isLoading,
    execute,
    setLoading: setIsLoading,
  };
}