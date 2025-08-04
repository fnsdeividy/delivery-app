'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '../contexts/AuthContext'

interface ClientProviderProps {
  children: ReactNode
}

export default function ClientProvider({ children }: ClientProviderProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}