'use client'

import {
    AlertCircle,
    Crown,
    Database,
    Settings,
    Shield,
    Store,
    TrendingUp,
    Users
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SuperAdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Ainda carregando

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      router.push('/login/super-admin')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return null // O useEffect já está redirecionando
  }

  const stats = [
    {
      name: 'Lojas Ativas',
      value: '12',
      change: '+2',
      changeType: 'positive',
      icon: Store,
      color: 'bg-blue-500'
    },
    {
      name: 'Lojistas',
      value: '28',
      change: '+5',
      changeType: 'positive',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      name: 'Pedidos Hoje',
      value: '847',
      change: '+12%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      name: 'Incidentes',
      value: '3',
      change: '-2',
      changeType: 'negative',
      icon: AlertCircle,
      color: 'bg-red-500'
    }
  ]

  const recentStores = [
    {
      name: 'Boteco do João',
      slug: 'boteco-do-joao',
      status: 'active',
      owner: 'João Silva',
      revenue: 'R$ 2.450,00',
      orders: 23
    },
    {
      name: 'Pizza Express',
      slug: 'pizza-express',
      status: 'active',
      owner: 'Maria Santos',
      revenue: 'R$ 1.890,00',
      orders: 18
    },
    {
      name: 'Burger House',
      slug: 'burger-house',
      status: 'pending',
      owner: 'Carlos Lima',
      revenue: 'R$ 0,00',
      orders: 0
    }
  ]

  const quickActions = [
    {
      name: 'Gerenciar Lojas',
      description: 'Visualizar e administrar todas as lojas',
      icon: Store,
      color: 'bg-blue-500',
      href: '/admin/stores'
    },
    {
      name: 'Usuários',
      description: 'Gerenciar lojistas e permissões',
      icon: Users,
      color: 'bg-green-500',
      href: '/admin/users'
    },
    {
      name: 'Configurações',
      description: 'Configurações globais do sistema',
      icon: Settings,
      color: 'bg-purple-500',
      href: '/admin/settings'
    },
    {
      name: 'Sistema',
      description: 'Logs, backup e manutenção',
      icon: Database,
      color: 'bg-red-500',
      href: '/admin/system'
    }
  ]

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
                <h1 className="text-2xl font-bold text-gray-900">Super Admin</h1>
                <p className="text-sm text-gray-600">Painel de Controle Global</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                <p className="text-xs text-gray-500">{session.user.email}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <span className={`ml-2 text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Stores */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Lojas Recentes</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentStores.map((store) => (
                    <div key={store.slug} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                          <Store className="w-5 h-5 text-gray-600" />
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
                  {quickActions.map((action) => (
                    <button
                      key={action.name}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className={`${action.color} rounded-lg p-2 mr-3`}>
                          <action.icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{action.name}</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Servidores Online</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Banco de Dados</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">APIs Externas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}