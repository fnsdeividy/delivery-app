"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLoadingContext } from "@/contexts/LoadingContext";
import { useCallback, useEffect, useRef } from "react";

interface UseRouteLoadingOptions {
  minimumMs?: number;
  timeoutMs?: number;
  variant?: 'topbar' | 'overlay';
  onRouteStart?: (route: string) => void;
  onRouteComplete?: (route: string) => void;
  onRouteError?: (error: Error, route: string) => void;
}

export function useRouteLoading(options: UseRouteLoadingOptions = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { startRouteLoading, stopRouteLoading, loadingState } = useLoadingContext();
  
  const {
    minimumMs = 300,
    timeoutMs = 10000,
    variant = 'topbar',
    onRouteStart,
    onRouteComplete,
    onRouteError,
  } = options;

  const previousPathnameRef = useRef<string>(pathname);
  const isNavigatingRef = useRef<boolean>(false);
  const navigationStartTimeRef = useRef<number | null>(null);

  // Detectar mudanças de rota
  useEffect(() => {
    const currentPath = pathname;
    const previousPath = previousPathnameRef.current;

    // Se a rota mudou e não estamos navegando, significa que a navegação foi concluída
    if (currentPath !== previousPath && isNavigatingRef.current) {
      const duration = navigationStartTimeRef.current 
        ? Date.now() - navigationStartTimeRef.current 
        : 0;

      // Parar loading
      stopRouteLoading();
      isNavigatingRef.current = false;
      navigationStartTimeRef.current = null;

      // Callback de conclusão
      onRouteComplete?.(currentPath);

      // Mover foco para o h1 da nova página após um pequeno delay
      setTimeout(() => {
        const h1 = document.querySelector('main h1, main [role="heading"]');
        if (h1) {
          (h1 as HTMLElement).focus();
        }
      }, 100);
    }

    previousPathnameRef.current = currentPath;
  }, [pathname, stopRouteLoading, onRouteComplete]);

  // Função para navegar com loading
  const navigateWithLoading = useCallback((
    href: string, 
    customOptions?: Partial<UseRouteLoadingOptions>
  ) => {
    // Se já estiver carregando, ignorar cliques adicionais
    if (loadingState.isLoading) {
      return;
    }

    const finalOptions = { ...options, ...customOptions };
    
    // Iniciar loading
    isNavigatingRef.current = true;
    navigationStartTimeRef.current = Date.now();
    
    startRouteLoading(href, {
      minimumMs: finalOptions.minimumMs,
      timeoutMs: finalOptions.timeoutMs,
      variant: finalOptions.variant,
    });

    // Callback de início
    finalOptions.onRouteStart?.(href);

    // Navegar
    try {
      router.push(href);
    } catch (error) {
      // Em caso de erro na navegação
      isNavigatingRef.current = false;
      navigationStartTimeRef.current = null;
      stopRouteLoading();
      
      const errorObj = error instanceof Error ? error : new Error('Erro na navegação');
      finalOptions.onRouteError?.(errorObj, href);
    }
  }, [loadingState.isLoading, startRouteLoading, router, options]);

  // Função para navegar sem loading (para casos especiais)
  const navigateWithoutLoading = useCallback((href: string) => {
    router.push(href);
  }, [router]);

  // Função para parar loading manualmente
  const stopLoading = useCallback(() => {
    stopRouteLoading();
    isNavigatingRef.current = false;
    navigationStartTimeRef.current = null;
  }, [stopRouteLoading]);

  return {
    navigateWithLoading,
    navigateWithoutLoading,
    stopLoading,
    isLoading: loadingState.isLoading,
    loadingMessage: loadingState.loadingMessage,
  };
}

// Hook específico para o dashboard
export function useDashboardRouteLoading() {
  return useRouteLoading({
    minimumMs: 300,
    timeoutMs: 10000,
    variant: 'overlay',
    onRouteStart: (route) => {
      console.log(`Navegando para: ${route}`);
    },
    onRouteComplete: (route) => {
      console.log(`Navegação concluída: ${route}`);
    },
    onRouteError: (error, route) => {
      console.error(`Erro na navegação para ${route}:`, error);
    },
  });
}