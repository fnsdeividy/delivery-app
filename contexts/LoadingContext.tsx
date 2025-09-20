"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  variant?: "topbar" | "overlay";
  minimumMs?: number;
  timeoutMs?: number;
}

interface LoadingContextType {
  loadingState: LoadingState;
  setLoading: (
    isLoading: boolean,
    options?: Partial<Omit<LoadingState, "isLoading">>
  ) => void;
  startRouteLoading: (
    route: string,
    options?: Partial<Omit<LoadingState, "isLoading">>
  ) => void;
  stopRouteLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    variant: "topbar",
    minimumMs: 300,
    timeoutMs: 10000,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const minimumTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (minimumTimeoutRef.current) {
      clearTimeout(minimumTimeoutRef.current);
      minimumTimeoutRef.current = null;
    }
  }, []);

  const setLoading = useCallback(
    (
      isLoading: boolean,
      options: Partial<Omit<LoadingState, "isLoading">> = {}
    ) => {
      clearTimeouts();

      if (isLoading) {
        startTimeRef.current = Date.now();

        setLoadingState((prev) => ({
          ...prev,
          isLoading: true,
          ...options,
        }));

        // Timeout de segurança
        timeoutRef.current = setTimeout(() => {
          setLoadingState((prev) => ({
            ...prev,
            isLoading: false,
            loadingMessage: undefined,
          }));
          startTimeRef.current = null;
        }, options.timeoutMs || 10000);
      } else {
        const elapsed = startTimeRef.current
          ? Date.now() - startTimeRef.current
          : 0;
        const minimumMs = options.minimumMs || 300;

        if (elapsed < minimumMs) {
          // Garantir tempo mínimo de exibição
          minimumTimeoutRef.current = setTimeout(() => {
            setLoadingState((prev) => ({
              ...prev,
              isLoading: false,
              loadingMessage: undefined,
            }));
            startTimeRef.current = null;
          }, minimumMs - elapsed);
        } else {
          setLoadingState((prev) => ({
            ...prev,
            isLoading: false,
            loadingMessage: undefined,
          }));
          startTimeRef.current = null;
        }
      }
    },
    [clearTimeouts]
  );

  const startRouteLoading = useCallback(
    (route: string, options: Partial<Omit<LoadingState, "isLoading">> = {}) => {
      setLoading(true, {
        loadingMessage: `Navegando`,
        variant: "topbar",
        ...options,
      });
    },
    [setLoading]
  );

  const stopRouteLoading = useCallback(() => {
    setLoading(false);
  }, [setLoading]);

  return (
    <LoadingContext.Provider
      value={{
        loadingState,
        setLoading,
        startRouteLoading,
        stopRouteLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoadingContext() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error(
      "useLoadingContext deve ser usado dentro de um LoadingProvider"
    );
  }
  return context;
}
