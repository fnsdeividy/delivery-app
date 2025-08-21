'use client'

import LoadingSpinner from '@/components/LoadingSpinner'
import { useCardapioAuth } from '@/hooks'
import { apiClient } from '@/lib/api-client'
import {
    Crown,
    Database,
    Gear,
    Package,
    Shield,
    Storefront,
    TrendUp,
    Users,
    WarningCircle
} from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface Store {
  id: string
  name: string
  slug: string
  status: 'active' | 'pending' | 'inactive'
  owner: string
  revenue: string
  orders: number
  createdAt: string
}

interface SystemStats {
  totalStores: number
  activeStores: number
  pendingStores: number
  totalUsers: number
  totalOrders: number
  totalRevenue: string
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical'
}

export default function AdminDashboard() {
  const router = useRouter()
  const { isAuthenticated, getCurrentToken } = useCardapioAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [recentStores, setRecentStores] = useState<Store[]>([])

  // Estabilizar funções para evitar re-renders desnecessários
  const checkAuth = useCallback(async () => {
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

      // Carregar dados administrativos
      loadAdminData()
    } catch (error) {
      router.push('/login/lojista')
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, getCurrentToken, router])

  const loadAdminData = useCallback(async () => {
    try {
      // Carregar estatísticas do sistema
      const statsData = await apiClient.get<any>('/stores/stats')
      setStats({
        totalStores: statsData.total || 0,
        activeStores: statsData.approved || 0,
        pendingStores: statsData.pending || 0,
        totalUsers: 0, // TODO: Implementar endpoint de usuários
        totalOrders: 0, // TODO: Implementar endpoint de pedidos
        totalRevenue: 'R$ 0,00', // TODO: Implementar cálculo de receita
        systemHealth: 'excellent'
      })

      // Carregar lojas recentes
      const storesData = await apiClient.get<any>('/stores?page=1&limit=5')
      const formattedStores = storesData.data.map((store: any) => ({
        id: store.id,
        name: store.name,
        slug: store.slug,
        status: store.approved ? 'active' : 'pending',
        owner: store.createdByEmail || 'N/A',
        revenue: 'R$ 0,00', // TODO: Implementar cálculo de receita
        orders: 0, // TODO: Implementar contagem de pedidos
        createdAt: store.createdAt
      }))
      setRecentStores(formattedStores)
    } catch (error) {
      console.error('Erro ao carregar dados administrativos:', error)
    }
  }, [])

  // Executar apenas uma vez na montagem do componente
  useEffect(() => {
    checkAuth()
  }, []) // Remover dependências para evitar loops

  // Memoizar funções utilitárias
  const getSystemHealthColor = useCallback((health: string) => {
    switch (health) {
      case 'excellent': return 'bg-green-500'
      case 'good': return 'bg-blue-500'
      case 'warning': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }, [])

  const getSystemHealthText = useCallback((health: string) => {
    switch (health) {
      case 'excellent': return 'Excelente'
      case 'good': return 'Bom'
      case 'warning': return 'Atenção'
      case 'critical': return 'Crítico'
      default: return 'Desconhecido'
    }
  }, [])

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }, [])

  // Memoizar navegação para evitar re-renders
  const navigationActions = useMemo(() => [
    {
      href: '/dashboard/gerenciar-lojas',
      icon: Storefront,
      title: 'Gerenciar Lojas',
      description: 'Visualizar e administrar todas as lojas',
      color: 'bg-blue-500'
    },
    {
      href: '/dashboard/admin/usuarios',
      icon: Users,
      title: 'Gestão de Usuários',
      description: 'Administrar usuários do sistema',
      color: 'bg-green-500'
    },
    {
      href: '/dashboard/admin/pedidos',
      icon: Package,
      title: 'Gestão de Pedidos',
      description: 'Monitorar todos os pedidos',
      color: 'bg-purple-500'
    },
    {
      href: '/dashboard/meus-painel',
      icon: Storefront,
      title: 'Minhas Lojas',
      description: 'Acessar suas lojas',
      color: 'bg-orange-500'
    },
    {
      href: '/dashboard',
      icon: Gear,
      title: 'Dashboard',
      description: 'Voltar ao dashboard principal',
      color: 'bg-gray-500'
    },
    {
      href: '/dashboard/admin',
      icon: Database,
      title: 'Sistema',
      description: 'Logs, backup e manutenção',
      color: 'bg-red-500'
    }
  ], [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
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
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar o Dashboard Admin.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar ao Dashboard
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
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
                <p className="text-sm text-gray-600">Painel de Controle Administrativo</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {userRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                </p>
                <p className="text-xs text-gray-500">admin@cardap.io</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-blue-500 rounded-lg p-3">
                  <Storefront className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Lojas</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalStores}</p>
                    <span className="ml-2 text-sm font-medium text-green-600">
                      +{stats.activeStores} ativas
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-green-500 rounded-lg p-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Usuários</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                    <span className="ml-2 text-sm font-medium text-blue-600">
                      +{stats.activeStores} lojistas
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-purple-500 rounded-lg p-3">
                  <TrendUp className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pedidos Hoje</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
                    <span className="ml-2 text-sm font-medium text-green-600">
                      +12%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${getSystemHealthColor(stats.systemHealth)} rounded-lg p-3`}>
                  <WarningCircle className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Status do Sistema</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-semibold text-gray-900">
                      {getSystemHealthText(stats.systemHealth)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Stores */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Lojas Recentes</h3>
              </div>
              <div className="p-6">
                {recentStores.length === 0 ? (
                  <div className="text-center py-8">
                    <Storefront className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma loja encontrada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentStores.map((store) => (
                      <div key={store.slug} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                            <Storefront className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{store.name}</p>
                            <p className="text-sm text-gray-500">por {store.owner}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{store.revenue}</p>
                          <p className="text-sm text-gray-500">{store.orders} pedidos</p>
                        </div>
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            store.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {store.status === 'active' ? 'Ativa' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Ações Rápidas</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {navigationActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => router.push(action.href)}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className={`${action.color} rounded-lg p-2 mr-3`}>
                          <action.icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{action.title}</p>
                          <p className="text-sm text-gray-500">{action.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status do Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Servidores Online</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Banco de Dados</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">APIs Externas</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Sistema Geral</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Atividade Recente</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Storefront className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Nova loja criada</p>
                  <p className="text-xs text-gray-500">Pizzaria do João foi criada por joao@email.com</p>
                </div>
                <span className="text-xs text-gray-400">2 min atrás</span>
              </div>

              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Usuário aprovado</p>
                  <p className="text-xs text-gray-500">maria@email.com foi aprovada como lojista</p>
                </div>
                <span className="text-xs text-gray-400">15 min atrás</span>
              </div>

              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <WarningCircle className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Alerta de sistema</p>
                  <p className="text-xs text-gray-500">Backup automático concluído com sucesso</p>
                </div>
                <span className="text-xs text-gray-400">1 hora atrás</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 