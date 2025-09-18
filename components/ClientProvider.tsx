"use client";

import { ToastProvider } from "@/components/Toast";
import { TrialWelcomeToast } from "@/components/TrialWelcomeToast";
import { AuthProvider } from "@/contexts/AuthContext";
import { createQueryClient } from "@/lib/query-config";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

interface ClientProviderProps {
  children: ReactNode;
}

export function ClientProvider({ children }: ClientProviderProps) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          {children}
          <TrialWelcomeToast />
          {/* Temporariamente removido para testes */}
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default ClientProvider;
