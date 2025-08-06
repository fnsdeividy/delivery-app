'use client'

import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    Clock,
    DollarSign,
    Eye,
    Package,
    ShoppingCart,
    Star,
    TrendingUp,
    Users
} from 'lucide-react'
import { useEffect, useState } from 'react'


interface AnalyticsData {
  // Métricas gerais
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  averageOrderValue: number
  
  // Crescimento
  ordersGrowth: number
  revenueGrowth: number
  customersGrowth: number
  
  // Vendas por período
  salesByPeriod: {
    period: string
    orders: number
    revenue: number
  }[]
  
  // Produtos mais vendidos
  topProducts: {
    name: string
    quantity: number
    revenue: number
  }[]
  
  // Horários de pico
  peakHours: {
    hour: string
    orders: number
  }[]
  
  // Status dos pedidos
  orderStatus: {
    status: string
    count: number
    percentage: number
  }[]
  
  // Métricas de tempo
  averagePreparationTime: number
  averageDeliveryTime: number
  
  // Satisfação do cliente
  averageRating: number
  totalReviews: number
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [isLoading, setIsLoading] = useState(true)

  // Simular dados de analytics (em produção, viria da API)
  useEffect(() => {
    const generateMockData = () => {
      const baseOrders = timeRange === '7d' ? 150 : timeRange === '30d' ? 650 : 1800
      const baseRevenue = timeRange === '7d' ? 4500 : timeRange === '30d' ? 19500 : 54000
      
      return {
        totalOrders: baseOrders,
        totalRevenue: baseRevenue,
        totalCustomers: Math.floor(baseOrders * 0.8),
        averageOrderValue: Math.round(baseRevenue / baseOrders),
        
        ordersGrowth: Math.random() > 0.5 ? 12.5 : -3.2,
        revenueGrowth: Math.random() > 0.5 ? 18.7 : -2.1,
        customersGrowth: Math.random() > 0.5 ? 8.9 : -1.5,
        
        salesByPeriod: timeRange === '7d' 
          ? Array.from({ length: 7 }, (_, i) => ({
              period: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i],
              orders: Math.floor(Math.random() * 30) + 10,
              revenue: Math.floor(Math.random() * 1000) + 300
            }))
          : timeRange === '30d'
          ? Array.from({ length: 4 }, (_, i) => ({
              period: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'][i],
              orders: Math.floor(Math.random() * 200) + 100,
              revenue: Math.floor(Math.random() * 6000) + 3000
            }))
          : Array.from({ length: 3 }, (_, i) => ({
              period: ['Jan', 'Fev', 'Mar'][i],
              orders: Math.floor(Math.random() * 700) + 400,
              revenue: Math.floor(Math.random() * 20000) + 12000
            })),
        
        topProducts: [
          { name: 'X-Burger Especial', quantity: 45, revenue: 1350 },
          { name: 'Batata Frita Grande', quantity: 38, revenue: 570 },
          { name: 'Refrigerante Cola', quantity: 32, revenue: 256 },
          { name: 'Sorvete de Chocolate', quantity: 28, revenue: 420 },
          { name: 'Nuggets de Frango', quantity: 25, revenue: 375 }
        ],
        
        peakHours: [
          { hour: '12:00', orders: 25 },
          { hour: '13:00', orders: 32 },
          { hour: '14:00', orders: 28 },
          { hour: '18:00', orders: 35 },
          { hour: '19:00', orders: 42 },
          { hour: '20:00', orders: 38 },
          { hour: '21:00', orders: 30 }
        ],
        
        orderStatus: [
          { status: 'Entregue', count: Math.floor(baseOrders * 0.75), percentage: 75 },
          { status: 'Em Preparo', count: Math.floor(baseOrders * 0.15), percentage: 15 },
          { status: 'Aguardando', count: Math.floor(baseOrders * 0.08), percentage: 8 },
          { status: 'Cancelado', count: Math.floor(baseOrders * 0.02), percentage: 2 }
        ],
        
        averagePreparationTime: 18,
        averageDeliveryTime: 32,
        averageRating: 4.6,
        totalReviews: Math.floor(baseOrders * 0.3)
      }
    }

    setIsLoading(true)
    setTimeout(() => {
      setAnalyticsData(generateMockData())
      setIsLoading(false)
    }, 1000)
  }, [timeRange])

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
              <BarChart3 className="h-6 w-6 text-orange-500" />
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
                <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.totalOrders)}</p>
                <div className="flex items-center mt-2">
                  {analyticsData.ordersGrowth > 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    analyticsData.ordersGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(analyticsData.ordersGrowth)}%
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
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.totalRevenue)}</p>
                <div className="flex items-center mt-2">
                  {analyticsData.revenueGrowth > 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    analyticsData.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(analyticsData.revenueGrowth)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs período anterior</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Clientes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.totalCustomers)}</p>
                <div className="flex items-center mt-2">
                  {analyticsData.customersGrowth > 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    analyticsData.customersGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(analyticsData.customersGrowth)}%
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
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.averageOrderValue)}</p>
                <p className="text-sm text-gray-500 mt-2">Por pedido</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
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
              {analyticsData.salesByPeriod.map((period, index) => (
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
              {analyticsData.orderStatus.map((status, index) => (
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
                {analyticsData.topProducts.map((product, index) => (
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
                <p className="text-xl font-bold text-gray-900">{analyticsData.averagePreparationTime} min</p>
              </div>
            </div>
          </div>

          {/* Tempo Médio de Entrega */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo de Entrega</p>
                <p className="text-xl font-bold text-gray-900">{analyticsData.averageDeliveryTime} min</p>
              </div>
            </div>
          </div>

          {/* Avaliação Média */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
                <p className="text-xl font-bold text-gray-900">{analyticsData.averageRating}/5.0</p>
              </div>
            </div>
          </div>

          {/* Total de Avaliações */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <Eye className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avaliações</p>
                <p className="text-xl font-bold text-gray-900">{formatNumber(analyticsData.totalReviews)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Horários de Pico */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Horários de Pico</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {analyticsData.peakHours.map((hour, index) => (
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