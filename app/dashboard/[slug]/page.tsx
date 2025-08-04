'use client'

import { useParams } from 'next/navigation'
import { useStoreConfig, useStoreStatus } from '../../../lib/store/useStoreConfig'
import { 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  DollarSign,
  Clock,
  Star,
  Package,
  Truck,
  AlertCircle
} from 'lucide-react'

export default function DashboardOverview() {
  const params = useParams()
  const slug = params.slug as string
  
  const { config } = useStoreConfig(slug)
  const { isOpen, currentMessage } = useStoreStatus(config)

  if (!config) return null

  // Mock data para demonstração
  const stats = {
    todaySales: 1547.89,
    todayOrders: 23,
    averageRating: 4.7,
    totalProducts: config.menu.products.filter(p => p.active).length
  }

  const recentOrders = [
    {
      id: '001',
      customer: 'João Silva',
      total: 45.90,
      status: 'preparing',
      time: '14:32'
    },
    {
      id: '002',
      customer: 'Maria Santos',
      total: 32.50,
      status: 'delivered',
      time: '14:15'
    },
    {
      id: '003',
      customer: 'Pedro Costa',
      total: 67.80,
      status: 'delivering',
      time: '13:58'
    }
  ]

  const topProducts = [
    {
      name: 'Pastel de Carne',
      sales: 12,
      revenue: 106.80
    },
    {
      name: 'Porção de Batata Frita',
      sales: 8,
      revenue: 151.20
    },
    {
      name: 'Cerveja Pilsen',
      sales: 15,
      revenue: 127.50
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-100 text-yellow-800'
      case 'delivering': return 'bg-blue-100 text-blue-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'preparing': return 'Preparando'
      case 'delivering': return 'Entregando'
      case 'delivered': return 'Entregue'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
        <p className="text-gray-600">Resumo das atividades da sua loja hoje</p>
      </div>

      {/* Status da Loja */}
      <div className={`rounded-lg p-4 ${isOpen ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div className="flex items-center space-x-3">
          <div className={`h-3 w-3 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`font-medium ${isOpen ? 'text-green-800' : 'text-red-800'}`}>
            {isOpen ? 'Loja Aberta' : 'Loja Fechada'}
          </span>
          {!isOpen && (
            <>
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-700 text-sm">{currentMessage}</span>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vendas Hoje</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {stats.todaySales.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-1 text-sm">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-green-600">+12.5%</span>
            <span className="text-gray-500">vs ontem</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pedidos Hoje</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayOrders}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-1 text-sm">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-green-600">+8.2%</span>
            <span className="text-gray-500">vs ontem</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avaliação</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-1 text-sm">
            <span className="text-gray-500">Baseado em 89 avaliações</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Produtos Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-1 text-sm">
            <span className="text-gray-500">
              {config.menu.categories.filter(c => c.active).length} categorias
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pedidos Recentes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Pedidos Recentes</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.customer}</p>
                      <p className="text-sm text-gray-500">#{order.id} - {order.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      R$ {order.total.toFixed(2).replace('.', ',')}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <a
                href={`/dashboard/${slug}/pedidos`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Ver todos os pedidos →
              </a>
            </div>
          </div>
        </div>

        {/* Produtos Mais Vendidos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Produtos Mais Vendidos</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales} vendas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      R$ {product.revenue.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <a
                href={`/dashboard/${slug}/analytics`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Ver relatório completo →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Ações Rápidas</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href={`/dashboard/${slug}/produtos/novo`}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Adicionar Produto</p>
                <p className="text-sm text-gray-500">Criar novo item no cardápio</p>
              </div>
            </a>

            <a
              href={`/dashboard/${slug}/configuracoes/visual`}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="h-8 w-8 text-purple-600">
                🎨
              </div>
              <div>
                <p className="font-medium text-gray-900">Personalizar Loja</p>
                <p className="text-sm text-gray-500">Alterar cores e visual</p>
              </div>
            </a>

            <a
              href={`/loja/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Truck className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Ver Loja</p>
                <p className="text-sm text-gray-500">Visualizar como cliente</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}