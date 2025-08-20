'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'
// import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { createQueryClient } from '@/lib/query-config'
import { ToastProvider } from './Toast'

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
          </ToastProvider>
        </AuthProvider>
      {/* </NextAuthSessionProvider> */}
    </QueryClientProvider>
  )
}

export default ClientProvider