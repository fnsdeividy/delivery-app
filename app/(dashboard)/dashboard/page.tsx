'use client'

import { useAuthContext } from '@/contexts/AuthContext'
import { useDashboardStats, DashboardStats } from '@/hooks/useDashboardStats'
import { ArrowRight, Package, Plus, Settings, ShoppingBag, Store, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardAdmin() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuthContext()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [storeSlug, setStoreSlug] = useState<string | null>(null)

  // Buscar estatísticas do dashboard
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats(userRole, storeSlug)

  console.log('Dashboard - Renderizando com:')
  console.log('Dashboard - userRole:', userRole)
  console.log('Dashboard - storeSlug:', storeSlug)
  console.log('Dashboard - stats:', stats)
  console.log('Dashboard - statsLoading:', statsLoading)
  console.log('Dashboard - statsError:', statsError)

  useEffect(() => {
    console.log('Dashboard - useEffect executando')
    console.log('Dashboard - isAuthenticated:', isAuthenticated)
    console.log('Dashboard - user:', user)
    console.log('Dashboard - authLoading:', authLoading)

    // Verificar autenticação e extrair informações do usuário
    if (isAuthenticated && user) {
      console.log('Dashboard - Usuário autenticado, configurando role e storeSlug')
      setUserRole(user.role)
      setStoreSlug(user.storeSlug || null)

      // Se usuário tem loja específica, redirecionar para dashboard da loja
      if (user.role === 'ADMIN' && user.storeSlug) {
        console.log('Dashboard - Redirecionando ADMIN para dashboard da loja:', user.storeSlug)
        router.push(`/dashboard/${user.storeSlug}`)
        return
      }

      // Se é super admin, redirecionar para painel admin
      if (user.role === 'SUPER_ADMIN') {
        console.log('Dashboard - Redirecionando SUPER_ADMIN para painel admin')
        router.push('/admin')
        return
      }
    } else if (!authLoading && !isAuthenticated) {
      console.log('Dashboard - Usuário não autenticado, redirecionando para login')
      // Não autenticado, redirecionar para login
      router.push('/login/lojista')
    }
  }, [isAuthenticated, user, authLoading, router])

  // Loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  // Se não estiver autenticado, mostrar mensagem
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Você precisa estar logado para acessar o dashboard.</p>
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
            <Link
              href="/dashboard/gerenciar-lojas"
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              role="link"
              aria-label="Ver todas as lojas cadastradas no sistema"
            >
              <Store className="w-4 h-4 mr-2" />
              Ver Todas as Lojas
            </Link>
          </div>
        </div>

        {/* Status do Sistema */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status do Sistema</h3>

          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <span className="ml-3 text-gray-600">Carregando estatísticas...</span>
            </div>
          ) : statsError ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-red-600">Erro ao carregar estatísticas</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-orange-600 hover:text-orange-700 underline"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Lojas */}
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Store className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{(stats as DashboardStats)?.totalStores || 0}</div>
                <div className="text-sm text-gray-600">Total de Lojas</div>
                {(stats as DashboardStats)?.pendingStores && (stats as DashboardStats).pendingStores > 0 && (
                  <div className="text-xs text-orange-600 mt-1">
                    {(stats as DashboardStats).pendingStores} pendentes
                  </div>
                )}
              </div>

              {/* Lojas Ativas */}
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">{(stats as DashboardStats)?.activeStores || 0}</div>
                <div className="text-sm text-gray-600">Lojas Ativas</div>
              </div>

              {/* Produtos */}
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600">{(stats as DashboardStats)?.totalProducts || 0}</div>
                <div className="text-sm text-gray-600">Produtos</div>
              </div>

              {/* Pedidos */}
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-orange-600">{(stats as DashboardStats)?.totalOrders || 0}</div>
                <div className="text-sm text-gray-600">Pedidos</div>
                {(stats as DashboardStats)?.totalRevenue && (stats as DashboardStats).totalRevenue > 0 && (
                  <div className="text-xs text-green-600 mt-1">
                    R$ {(stats as DashboardStats).totalRevenue.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 