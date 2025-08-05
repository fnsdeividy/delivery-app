'use client'

import {
    AlertCircle,
    DollarSign,
    Package,
    Palette,
    ShoppingBag,
    Star,
    TrendingUp,
    Truck,
    Users
} from 'lucide-react'
import { useParams } from 'next/navigation'
import { useStoreConfig, useStoreStatus } from '../../../../lib/store/useStoreConfig'

export default function DashboardOverview() {
  const params = useParams()
  const slug = params.slug as string
  
  const { config } = useStoreConfig(slug)
  const { isOpen, currentMessage } = useStoreStatus(config)

  if (!config) return null

  // Dados dinâmicos calculados a partir da configuração da loja
  const getCurrentHour = () => new Date().getHours()
  const getCurrentDay = () => new Date().getDay() // 0 = domingo, 1 = segunda, etc.
  
  // Calcular métricas baseadas nos dados reais da loja
  const activeProducts = config.menu.products.filter(p => p.active)
  const totalProducts = activeProducts.length
  const averageProductPrice = activeProducts.reduce((sum, p) => sum + p.price, 0) / totalProducts
  const categoriesCount = config.menu.categories.filter(c => c.active).length
  
  // Simular dados realistas baseados no horário e configuração
  const currentHour = getCurrentHour()
  const isBusinessHours = isOpen
  const isPeakHour = currentHour >= 18 && currentHour <= 20 // Horário de pico (18h-20h)
  
  // Métricas calculadas dinamicamente
  const baseOrdersPerHour = isPeakHour ? 8 : isBusinessHours ? 4 : 1
  const hoursFromMidnight = currentHour
  const estimatedTodayOrders = Math.floor(baseOrdersPerHour * (isBusinessHours ? hoursFromMidnight : hoursFromMidnight * 0.3))
  const estimatedRevenue = estimatedTodayOrders * averageProductPrice * 1.2 // Incluindo extras
  
  const stats = {
    todaySales: estimatedRevenue,
    todayOrders: estimatedTodayOrders,
    averageRating: 4.7,
    totalProducts: totalProducts,
    categoriesCount: categoriesCount,
    averageOrderValue: averageProductPrice * 1.2,
    preparationTime: config.settings?.preparationTime || 25,
    deliveryFee: config.delivery.fee,
    freeDeliveryMin: config.delivery.freeDeliveryMinimum,
    estimatedDeliveryTime: config.delivery.estimatedTime,
    activePromotions: config.promotions?.coupons?.filter(c => c.active).length || 0,
    paymentMethods: Object.values(config.payments).filter(Boolean).length
  }

  // Gerar pedidos realistas baseados no horário atual
  const generateRecentOrders = () => {
    const customers = ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira', 'Carlos Lima', 'Beatriz Souza']
    const orders = []
    const now = new Date()
    
    for (let i = 0; i < Math.min(estimatedTodayOrders, 5); i++) {
      const orderTime = new Date(now.getTime() - (i * 20 + Math.random() * 40) * 60 * 1000)
      const customer = customers[Math.floor(Math.random() * customers.length)]
      const orderValue = averageProductPrice * (1 + Math.random() * 2) * (1 + Math.random() * 0.5)
      
      const statuses = i === 0 ? ['preparing'] : 
                     i === 1 ? ['preparing', 'delivering'] :
                     ['delivered', 'delivering', 'preparing']
      
      orders.push({
        id: String(i + 1).padStart(3, '0'),
        customer,
        total: orderValue,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        time: orderTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        items: Math.floor(Math.random() * 3) + 1
      })
    }
    
    return orders
  }
  
  const recentOrders = generateRecentOrders()

  // Produtos populares baseados nos produtos reais da loja
  const getTopProducts = () => {
    return activeProducts
      .slice(0, 5)
      .map(product => {
        const estimatedSales = Math.floor(Math.random() * 20) + 5
        return {
          name: product.name,
          sales: estimatedSales,
          revenue: estimatedSales * product.price,
          price: product.price,
          category: product.category,
          preparationTime: product.preparationTime
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3)
  }
  
  const topProducts = getTopProducts()
  
  // Alertas e notificações baseados no status da loja
  const getStoreAlerts = () => {
    const alerts = []
    
    if (!isOpen) {
      alerts.push({
        type: 'warning',
        title: 'Loja Fechada',
        message: currentMessage,
        icon: 'clock'
      })
    }
    
    if (estimatedTodayOrders === 0) {
      alerts.push({
        type: 'info',
        title: 'Nenhum Pedido Hoje',
        message: 'Considere promover produtos populares',
        icon: 'trending-up'
      })
    }
    
    if (isPeakHour && isOpen) {
      alerts.push({
        type: 'success',
        title: 'Horário de Pico',
        message: 'Movimento intenso esperado entre 18h-20h',
        icon: 'activity'
      })
    }
    
    if (stats.activePromotions > 0) {
      alerts.push({
        type: 'info',
        title: `${stats.activePromotions} Promoção(ões) Ativa(s)`,
        message: 'Monitore o desempenho dos cupons',
        icon: 'tag'
      })
    }
    
    return alerts
  }
  
  const storeAlerts = getStoreAlerts()
  
  // Timeline de atividades do dia
  const getTodayTimeline = () => {
    const timeline = []
    const now = new Date()
    
    // Horário de abertura
    const today = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()]
    const todaySchedule = config.schedule?.workingHours?.[today as keyof typeof config.schedule.workingHours]
    const openTime = todaySchedule?.hours?.[0]?.start || '08:00'
    timeline.push({
      time: openTime,
      title: 'Loja Aberta',
      description: 'Início do atendimento',
      type: 'success'
    })
    
    // Primeiro pedido do dia
    if (estimatedTodayOrders > 0) {
      timeline.push({
        time: '09:15',
        title: 'Primeiro Pedido',
        description: 'Pedido #001 recebido',
        type: 'info'
      })
    }
    
    // Happy hour (se configurado)
    if (config.promotions?.loyaltyProgram?.bonusRules?.some(rule => rule.id === 'happy-hour')) {
      timeline.push({
        time: '17:00',
        title: 'Happy Hour Iniciado',
        description: 'Pontos em dobro ativados',
        type: 'info'
      })
    }
    
    // Horário de pico
    if (isPeakHour) {
      timeline.push({
        time: '18:00',
        title: 'Horário de Pico',
        description: 'Movimento intenso iniciado',
        type: 'warning'
      })
    }
    
    return timeline.slice(0, 4)
  }
  
  const todayTimeline = getTodayTimeline()

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
    <div className="dashboard-section">
      {/* Header */}
      <div className="dashboard-header-section">
        <h1 className="text-3xl font-bold text-gray-900">Visão Geral</h1>
        <p className="text-gray-600 mt-2">Resumo das atividades da sua loja hoje</p>
      </div>

      {/* Status da Loja */}
      <div className="dashboard-main-card p-6">
        <div className={`dashboard-status-modern ${isOpen ? 'online' : 'offline'}`}>
          <span className="font-semibold">
            {isOpen ? 'Loja Aberta' : 'Loja Fechada'}
          </span>
          {!isOpen && (
            <div className="flex items-center ml-3 space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{currentMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-metrics-grid">
        <div className="dashboard-metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Vendas Hoje</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                R$ {stats.todaySales.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div className="dashboard-metric-icon p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl">
              <DollarSign className="h-7 w-7 text-green-600" />
            </div>
          </div>
          <div className="mt-6 flex items-center space-x-2 text-sm">
            <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-600 font-semibold">
                {isPeakHour ? '+25%' : isBusinessHours ? '+12%' : '0%'}
              </span>
            </div>
            <span className="text-gray-500">vs ontem</span>
          </div>
        </div>

        <div className="dashboard-metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Pedidos Hoje</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.todayOrders}</p>
            </div>
            <div className="dashboard-metric-icon p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl">
              <ShoppingBag className="h-7 w-7 text-blue-600" />
            </div>
          </div>
          <div className="mt-6 flex items-center space-x-2 text-sm">
            <span className="text-gray-500 bg-blue-50 px-2 py-1 rounded">
              Ticket médio: R$ {stats.averageOrderValue.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        <div className="dashboard-metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Tempo Preparo</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.preparationTime}min</p>
            </div>
            <div className="dashboard-metric-icon p-4 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-2xl">
              <Package className="h-7 w-7 text-orange-600" />
            </div>
          </div>
          <div className="mt-6">
            <span className="text-sm text-gray-500 bg-orange-50 px-2 py-1 rounded">
              Entrega: {stats.estimatedDeliveryTime}min
            </span>
          </div>
        </div>

        <div className="dashboard-metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Produtos Ativos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
            </div>
            <div className="dashboard-metric-icon p-4 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl">
              <Package className="h-7 w-7 text-purple-600" />
            </div>
          </div>
          <div className="mt-6">
            <span className="text-sm text-gray-500 bg-purple-50 px-2 py-1 rounded">
              {stats.categoriesCount} categorias
            </span>
          </div>
        </div>
      </div>

      {/* Alertas e Notificações */}
      {storeAlerts.length > 0 && (
        <div className="dashboard-main-card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Alertas e Notificações</h3>
          <div className="space-y-3">
            {storeAlerts.map((alert, index) => (
              <div 
                key={index}
                className={`flex items-start space-x-3 p-4 rounded-lg border ${
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  alert.type === 'success' ? 'bg-green-50 border-green-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  alert.type === 'warning' ? 'bg-yellow-100' :
                  alert.type === 'success' ? 'bg-green-100' :
                  'bg-blue-100'
                }`}>
                  {alert.icon === 'clock' && <AlertCircle className="h-4 w-4 text-yellow-600" />}
                  {alert.icon === 'trending-up' && <TrendingUp className="h-4 w-4 text-blue-600" />}
                  {alert.icon === 'activity' && <DollarSign className="h-4 w-4 text-green-600" />}
                  {alert.icon === 'tag' && <Star className="h-4 w-4 text-blue-600" />}
                </div>
                <div>
                  <h4 className={`font-semibold ${
                    alert.type === 'warning' ? 'text-yellow-800' :
                    alert.type === 'success' ? 'text-green-800' :
                    'text-blue-800'
                  }`}>
                    {alert.title}
                  </h4>
                  <p className={`text-sm ${
                    alert.type === 'warning' ? 'text-yellow-600' :
                    alert.type === 'success' ? 'text-green-600' :
                    'text-blue-600'
                  }`}>
                    {alert.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline do Dia */}
      <div className="dashboard-main-card p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Timeline de Hoje</h3>
        <div className="space-y-4">
          {todayTimeline.map((event, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${
                  event.type === 'success' ? 'bg-green-500' :
                  event.type === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}></div>
                {index < todayTimeline.length - 1 && (
                  <div className="w-px h-8 bg-gray-200 mt-2"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">{event.title}</h4>
                  <span className="text-sm text-gray-500">{event.time}</span>
                </div>
                <p className="text-sm text-gray-600">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-content-grid">
        {/* Pedidos Recentes */}
        <div className="dashboard-main-card">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-lg font-bold text-gray-900">Pedidos Recentes</h3>
            <p className="text-sm text-gray-600 mt-1">Últimos pedidos realizados</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {recentOrders.map((order, index) => (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{order.customer}</p>
                      <p className="text-sm text-gray-500 font-medium">
                        #{order.id} • {order.time} • {order.items || 1} item{(order.items || 1) > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-lg">
                      R$ {order.total.toFixed(2).replace('.', ',')}
                    </p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Nenhum pedido hoje</h4>
                <p className="text-gray-500 mb-4">
                  {isOpen ? 'Aguardando os primeiros pedidos do dia' : 'Loja está fechada no momento'}
                </p>
                {isOpen && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Promover produtos
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-6">
                <a
                  href={`/dashboard/${slug}/pedidos`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-semibold hover:bg-blue-50 px-3 py-2 rounded-lg transition-all duration-200"
                >
                  Ver todos os {stats.todayOrders} pedidos de hoje
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Produtos Mais Vendidos */}
        <div className="dashboard-main-card">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-lg font-bold text-gray-900">Produtos Mais Vendidos</h3>
            <p className="text-sm text-gray-600 mt-1">
              Ranking por faturamento • Preço médio: R$ {averageProductPrice.toFixed(2).replace('.', ',')}
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div 
                  key={product.name} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                      index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                      'bg-gradient-to-br from-amber-600 to-yellow-700'
                    }`}>
                      <span className="text-sm font-bold text-white">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500 font-medium">
                        {product.sales} vendas • R$ {product.price.toFixed(2).replace('.', ',')} • {product.preparationTime}min
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-lg">
                      R$ {product.revenue.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {activeProducts.length} produtos ativos
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats.categoriesCount} categorias disponíveis
                  </p>
                </div>
                <a
                  href={`/dashboard/${slug}/analytics`}
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 text-sm font-semibold hover:bg-purple-50 px-3 py-2 rounded-lg transition-all duration-200"
                >
                  Ver analytics
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-main-card">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-lg font-bold text-gray-900">Ações Rápidas</h3>
          <p className="text-sm text-gray-600 mt-1">
            Gestão da sua loja • {isOpen ? 'Loja aberta' : 'Loja fechada'}
          </p>
        </div>
        <div className="p-6">
          <div className="dashboard-actions-grid">
            <a
              href={`/dashboard/${slug}/produtos/novo`}
              className="dashboard-quick-action group"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">Adicionar Produto</p>
                  <p className="text-sm text-gray-500">Expandir cardápio ({stats.totalProducts} ativos)</p>
                </div>
              </div>
            </a>

            {stats.todayOrders > 0 && (
              <a
                href={`/dashboard/${slug}/pedidos`}
                className="dashboard-quick-action group"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <ShoppingBag className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-200">Gerenciar Pedidos</p>
                    <p className="text-sm text-gray-500">{stats.todayOrders} pedidos hoje</p>
                  </div>
                </div>
              </a>
            )}

            {stats.activePromotions > 0 && (
              <a
                href={`/dashboard/${slug}/promocoes`}
                className="dashboard-quick-action group"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors duration-200">Promoções Ativas</p>
                    <p className="text-sm text-gray-500">{stats.activePromotions} cupons ativos</p>
                  </div>
                </div>
              </a>
            )}

            <a
              href={`/dashboard/${slug}/configuracoes/horarios`}
              className="dashboard-quick-action group"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-200">
                    {isOpen ? 'Horários' : 'Abrir Loja'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isOpen ? 'Configurar funcionamento' : 'Gerenciar horários'}
                  </p>
                </div>
              </div>
            </a>

            <a
              href={`/loja/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="dashboard-quick-action group"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-200">Ver Loja</p>
                  <p className="text-sm text-gray-500">Experiência do cliente</p>
                </div>
              </div>
            </a>

            <a
              href={`/dashboard/${slug}/configuracoes/visual`}
              className="dashboard-quick-action group"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Palette className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">Personalizar</p>
                  <p className="text-sm text-gray-500">Cores e branding</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}