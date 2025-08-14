'use client'

import { ReactNode } from 'react'

interface ClientProviderProps {
  children: ReactNode
}

export default function ClientProvider({ children }: ClientProviderProps) {
  return (
    <>
      {children}
    </>
  )
}