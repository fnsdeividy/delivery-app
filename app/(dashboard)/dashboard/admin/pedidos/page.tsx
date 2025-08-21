'use client'

import { AdminOrderManagement } from '@/components/AdminOrderManagement'
import { useCardapioAuth } from '@/hooks'
import { Package, Shield } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminPedidos() {
  const router = useRouter()
  const { isAuthenticated, getCurrentToken } = useCardapioAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!isAuthenticated()) {
          router.push('/login/lojista')
          return
        }

        const token = getCurrentToken()
        if (!token) {
          router.push('/login/lojista')
          return
        }

        // Decodificar token JWT
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUserRole(payload.role)

        // Verificar se é SUPER_ADMIN ou ADMIN
        if (payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN') {
          router.push('/unauthorized')
          return
        }
      } catch (error) {
        router.push('/login/lojista')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [isAuthenticated, getCurrentToken, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta área.</p>
          <button
            onClick={() => router.push('/dashboard/admin')}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Voltar ao Dashboard Admin
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestão de Pedidos</h1>
                <p className="text-sm text-gray-600">Monitore todos os pedidos do sistema</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard/admin')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Voltar ao Dashboard
              </button>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {userRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                </p>
                <p className="text-xs text-gray-500">admin@cardap.io</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Visão Geral dos Pedidos</h3>
          <p className="text-gray-600">
            Esta seção permite visualizar e gerenciar todos os pedidos de todas as lojas do sistema.
            Use os filtros para encontrar pedidos específicos e monitore o status em tempo real.
          </p>
        </div>
        
        <AdminOrderManagement />
      </div>
    </div>
  )
} 