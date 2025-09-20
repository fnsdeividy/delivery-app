"use client";

import { ToastProvider } from "@/components/Toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { createQueryClient } from "@/lib/query-config";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useMemo, type ReactNode } from "react";

interface ClientProviderProps {
  children: ReactNode;
}

export function ClientProvider({ children }: ClientProviderProps) {
  // Memoizar o QueryClient para evitar recriações desnecessárias
  const queryClient = useMemo(() => createQueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LoadingProvider>
          <ToastProvider>
            {children}
            {/* DevTools apenas em desenvolvimento */}
            {process.env.NODE_ENV === "development" && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </ToastProvider>
        </LoadingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default ClientProvider;
