'use client'

// import { useAnalytics, useCustomerMetrics, useOrderStats, useTopProducts } from '@/hooks'
import {
    ArrowDownRight,
    ArrowUpRight,
    ChartBar,
    Clock,
    CurrencyDollar,
    Eye,
    Package,
    Pulse,
    ShoppingCart,
    Star,
    TrendUp,
    Users
} from '@phosphor-icons/react'
import { useParams } from 'next/navigation'
import { useState } from 'react'

export default function AnalyticsPage() {
  const params = useParams()
  const slug = params.slug as string
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  // Hooks da API Cardap.IO (comentados até serem implementados)
  // const { data: analyticsData, isLoading } = useAnalytics({
  //   storeId: slug,
  //   period: timeRange === '7d' ? 'daily' : timeRange === '30d' ? 'weekly' : 'monthly'
  // })

  // const { data: orderStats } = useOrderStats(slug)
  // const { data: topProductsData } = useTopProducts({ storeId: slug, limit: 5 })
  // const { data: customerMetrics } = useCustomerMetrics({ storeId: slug })

  // Dados mock temporários
  const analyticsData = {
    revenue: { daily: [150, 200, 180, 220, 190, 250, 210] },
    orders: { daily: [12, 15, 13, 18, 16, 20, 17] }
  }
  const isLoading = false
  const orderStats = { totalOrders: 111, totalRevenue: 1500, ordersByStatus: { 'pending': 5, 'preparing': 8, 'delivered': 98 } }
  const topProductsData = { topProducts: [{ productName: 'Produto 1', quantity: 25, revenue: 300 }, { productName: 'Produto 2', quantity: 20, revenue: 250 }] }
  const customerMetrics = { customerMetrics: { newCustomers: 45 } }

  // Calcular métricas baseadas nos dados da API
  const metrics = {
    totalOrders: orderStats?.totalOrders || 0,
    totalRevenue: orderStats?.totalRevenue || 0,
    totalCustomers: customerMetrics?.customerMetrics?.newCustomers || 0,
    averageOrderValue: orderStats?.totalOrders > 0 ? orderStats.totalRevenue / orderStats.totalOrders : 0,
    
    ordersGrowth: 0, // Será calculado com dados históricos
    revenueGrowth: 0, // Será calculado com dados históricos
    customersGrowth: 0, // Será calculado com dados históricos
    
    salesByPeriod: analyticsData?.revenue?.daily?.map((revenue, index) => ({
      period: timeRange === '7d' ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][index] : `Dia ${index + 1}`,
      orders: analyticsData.orders?.daily?.[index] || 0,
      revenue: revenue || 0
    })) || [],
    
    topProducts: topProductsData?.topProducts?.map(product => ({
      name: product.productName,
      quantity: product.quantity,
      revenue: product.revenue
    })) || [],
    
    peakHours: [], // Será implementado quando a API suportar
    
    orderStatus: orderStats?.ordersByStatus ? Object.entries(orderStats.ordersByStatus).map(([status, count]) => ({
      status,
      count,
      percentage: orderStats.totalOrders > 0 ? (count / orderStats.totalOrders) * 100 : 0
    })) : [],
    
    averagePreparationTime: 0, // Será implementado quando a API suportar
    averageDeliveryTime: 0, // Será implementado quando a API suportar
    
    averageRating: 0, // Será implementado quando a API suportar
    totalReviews: 0 // Será implementado quando a API suportar
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando analytics...</p>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Erro ao carregar dados de analytics</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <ChartBar className="h-6 w-6 text-orange-500" />
              <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
            </div>
            
            {/* Filtro de período */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Período:</span>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total de Pedidos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.totalOrders)}</p>
                <div className="flex items-center mt-2">
                  {metrics.ordersGrowth > 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    metrics.ordersGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(metrics.ordersGrowth)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs período anterior</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Receita Total */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</p>
                <div className="flex items-center mt-2">
                  {metrics.revenueGrowth > 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    metrics.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(metrics.revenueGrowth)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs período anterior</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CurrencyDollar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Clientes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.totalCustomers)}</p>
                <div className="flex items-center mt-2">
                  {metrics.customersGrowth > 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    metrics.customersGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(metrics.customersGrowth)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs período anterior</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Ticket Médio */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.averageOrderValue)}</p>
                <p className="text-sm text-gray-500 mt-2">Por pedido</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos e Análises */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Vendas por Período */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas por Período</h3>
            <div className="space-y-4">
              {metrics.salesByPeriod.map((period, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{period.period}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">{period.orders} pedidos</span>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(period.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status dos Pedidos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status dos Pedidos</h3>
            <div className="space-y-4">
              {metrics.orderStatus.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      status.status === 'Entregue' ? 'bg-green-500' :
                      status.status === 'Em Preparo' ? 'bg-yellow-500' :
                      status.status === 'Aguardando' ? 'bg-blue-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-600">{status.status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900">{status.count}</span>
                    <span className="text-sm text-gray-500">({status.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Produtos Mais Vendidos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtos Mais Vendidos</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Produto</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Quantidade</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Receita</th>
                </tr>
              </thead>
              <tbody>
                {metrics.topProducts.map((product, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <Package className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm text-gray-900">{product.quantity}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(product.revenue)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Métricas Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tempo Médio de Preparo */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo de Preparo</p>
                <p className="text-xl font-bold text-gray-900">{metrics.averagePreparationTime} min</p>
              </div>
            </div>
          </div>

          {/* Tempo Médio de Entrega */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <Pulse className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo de Entrega</p>
                <p className="text-xl font-bold text-gray-900">{metrics.averageDeliveryTime} min</p>
              </div>
            </div>
          </div>

          {/* Avaliação Média */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
                <p className="text-xl font-bold text-gray-900">{metrics.averageRating}/5.0</p>
              </div>
            </div>
          </div>

          {/* Total de Avaliações */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <Eye className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avaliações</p>
                <p className="text-xl font-bold text-gray-900">{formatNumber(metrics.totalReviews)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Horários de Pico */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Horários de Pico</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {metrics.peakHours.map((hour: any, index) => (
              <div key={index} className="text-center">
                <div className="bg-orange-100 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">{hour.hour}</p>
                  <p className="text-lg font-bold text-orange-600">{hour.orders}</p>
                  <p className="text-xs text-gray-500">pedidos</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 