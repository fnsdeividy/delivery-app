'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import LoadingSpinner from '../../../components/LoadingSpinner'

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [redirectAttempted, setRedirectAttempted] = useState(false)

  useEffect(() => {
    // Evitar múltiplos redirecionamentos
    if (redirectAttempted) {
      return
    }

    if (status === 'loading') {
      return
    }

    if (status === 'unauthenticated') {
      setRedirectAttempted(true)
      router.push('/login')
      return
    }

    if (session?.user) {
      const userRole = session.user.role
      setRedirectAttempted(true)

      // Redirecionar baseado no tipo de usuário
      if (userRole === 'SUPER_ADMIN') {
        router.push('/dashboard/gerenciar-lojas')
      } else if (userRole === 'ADMIN') {
        // Lojista vai para sua loja específica
        const storeSlug = (session.user as any).storeSlug
        if (storeSlug) {
          router.push(`/dashboard/${storeSlug}`)
        } else {
          router.push('/unauthorized')
        }
      } else {
        router.push('/unauthorized')
      }
    } else if (status === 'authenticated' && !session?.user) {
      setRedirectAttempted(true)
      router.push('/login')
    }
  }, [session, status, router, redirectAttempted])

  // Mostrar loading enquanto verifica autenticação
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  // Mostrar loading durante redirecionamento
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Redirecionando...</p>
      </div>
    </div>
  )
} 