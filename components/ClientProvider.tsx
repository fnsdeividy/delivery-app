'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'
// import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { createQueryClient } from '@/lib/query-config'
import { ToastProvider } from './Toast'
import { TokenDebug } from './TokenDebug'

interface ClientProviderProps {
  children: ReactNode
}

export function ClientProvider({ children }: ClientProviderProps) {
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {/* <NextAuthSessionProvider> */}
      <AuthProvider>
        <ToastProvider>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
          {/* Componente de debug para monitorar o estado do token */}
          {process.env.NODE_ENV === 'development' && <TokenDebug />}
        </ToastProvider>
      </AuthProvider>
      {/* </NextAuthSessionProvider> */}
    </QueryClientProvider>
  )
}

export default ClientProvider