'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardAdmin() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionamento automático para a nova Dashboard principal
    router.push('/dashboard/gerenciar-lojas')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Redirecionando...</h1>
        <p className="text-gray-600">Aguarde, você será redirecionado para o dashboard.</p>
      </div>
    </div>
  )
} 