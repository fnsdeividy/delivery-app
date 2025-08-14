'use client'

import { useCardapioAuth } from '@/hooks'
import { ArrowRight, Plus, Settings, Store, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardAdmin() {
  const router = useRouter()
  const { isAuthenticated, getCurrentToken } = useCardapioAuth()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [storeSlug, setStoreSlug] = useState<string | null>(null)

  useEffect(() => {
    // Verificar autenticação e extrair informações do token
    if (isAuthenticated()) {
      const token = getCurrentToken()
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          setUserRole(payload.role)
          setStoreSlug(payload.storeSlug)
          
          // Se usuário tem loja específica, redirecionar para dashboard da loja
          if (payload.role === 'ADMIN' && payload.storeSlug) {
            router.push(`/dashboard/${payload.storeSlug}`)
            return
          }
          
          // Se é super admin, redirecionar para painel admin
          if (payload.role === 'SUPER_ADMIN') {
            router.push('/admin')
            return
          }
        } catch (error) {
          console.error('Erro ao decodificar token:', error)
        }
      }
    } else {
      // Não autenticado, redirecionar para login
      router.push('/login/lojista')
    }
  }, [isAuthenticated, getCurrentToken, router])

  // Loading enquanto verifica autenticação
  if (!userRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  // Se não for ADMIN, não deveria estar aqui (middleware deveria ter bloqueado)
  if (userRole !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta área.</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                Administrador
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Bem-vindo, Administrador</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Painel de Controle
          </h2>
          <p className="text-gray-600">
            Gerencie suas lojas, produtos e configurações do sistema.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Gerenciar Lojas */}
          <Link
            href="/dashboard/gerenciar-lojas"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Store className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Gerenciar Lojas</h3>
                  <p className="text-sm text-gray-600">Criar e configurar lojas</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>

          {/* Usuários */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Usuários</h3>
                <p className="text-sm text-gray-600">Gerenciar usuários da loja</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-xs text-gray-500">Em breve</span>
            </div>
          </div>

          {/* Configurações */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Configurações</h3>
                <p className="text-sm text-gray-600">Configurações do sistema</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-xs text-gray-500">Em breve</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/dashboard/gerenciar-lojas"
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Nova Loja
            </Link>
            <button className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Store className="w-4 h-4 mr-2" />
              Ver Todas as Lojas
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status do Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Lojas Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Produtos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <div className="text-sm text-gray-600">Pedidos</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 