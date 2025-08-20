'use client'

import { useOrdersByStore, useUpdateOrderStatus } from '@/hooks'
import { useStoreConfig } from '@/lib/store/useStoreConfig'
import { OrderStatus, PaymentStatus } from '@/types/cardapio-api'
import {
    ArrowsClockwise,
    CheckCircle,
    Clock,
    CurrencyDollar,
    MagnifyingGlass,
    MapPin,
    Package,
    Phone,
    Truck,
    User,
    XCircle
} from '@phosphor-icons/react'
import { useParams } from 'next/navigation'
import { useState } from 'react'

export default function PedidosPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const { config, loading } = useStoreConfig(slug)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all')
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  // Hooks da API Cardap.IO
  const { data: ordersData, isLoading: loadingOrders, refetch: refetchOrders } = useOrdersByStore(slug)
  const updateStatusMutation = useUpdateOrderStatus()

  const orders = ordersData?.data || []

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.phone?.includes(searchTerm)
    
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus
    const matchesPaymentStatus = selectedPaymentStatus === 'all' || order.paymentStatus === selectedPaymentStatus
    
    return matchesSearch && matchesStatus && matchesPaymentStatus
  })

  // Atualizar status do pedido
  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: orderId, status: newStatus })
      refetchOrders()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status do pedido')
    }
  }

  // Estatísticas
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === OrderStatus.RECEIVED).length,
    preparing: orders.filter(o => o.status === OrderStatus.PREPARING).length,
    ready: orders.filter(o => o.status === OrderStatus.READY).length,
    delivering: orders.filter(o => o.status === OrderStatus.DELIVERING).length,
    delivered: orders.filter(o => o.status === OrderStatus.DELIVERED).length,
    cancelled: orders.filter(o => o.status === OrderStatus.CANCELLED).length
  }

  // Funções auxiliares
  const getStatusInfo = (status: OrderStatus) => {
    const statusMap = {
      [OrderStatus.RECEIVED]: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      [OrderStatus.CONFIRMED]: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      [OrderStatus.PREPARING]: { label: 'Preparando', color: 'bg-orange-100 text-orange-800', icon: Package },
      [OrderStatus.READY]: { label: 'Pronto', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      [OrderStatus.DELIVERING]: { label: 'Entregando', color: 'bg-purple-100 text-purple-800', icon: Truck },
      [OrderStatus.DELIVERED]: { label: 'Entregue', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      [OrderStatus.CANCELLED]: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle }
    }
    return statusMap[status]
  }

  const getPaymentStatusInfo = (status: PaymentStatus) => {
    const statusMap = {
      [PaymentStatus.PENDING]: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      [PaymentStatus.PAID]: { label: 'Pago', color: 'bg-green-100 text-green-800' },
      [PaymentStatus.FAILED]: { label: 'Falhou', color: 'bg-red-100 text-red-800' },
      [PaymentStatus.REFUNDED]: { label: 'Reembolsado', color: 'bg-gray-100 text-gray-800' }
    }
    return statusMap[status]
  }

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading || loadingOrders) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-600">Gerencie os pedidos da sua loja</p>
        </div>
        <button
          onClick={refetchOrders}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2"
        >
          <ArrowsClockwise className="h-4 w-4" />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending + stats.preparing}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Entregando</p>
              <p className="text-2xl font-bold text-gray-900">{stats.delivering}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <CurrencyDollar className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Receita</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(orders.filter(o => o.paymentStatus === PaymentStatus.PAID).reduce((sum, o) => sum + o.total, 0))}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por cliente, telefone ou ID do pedido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="confirmed">Confirmado</option>
              <option value="preparing">Preparando</option>
              <option value="ready">Pronto</option>
              <option value="delivering">Entregando</option>
              <option value="delivered">Entregue</option>
              <option value="cancelled">Cancelado</option>
            </select>
            
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Todos os pagamentos</option>
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="failed">Falhou</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const statusInfo = getStatusInfo(order.status as OrderStatus)
          const paymentStatusInfo = getPaymentStatusInfo(order.paymentStatus as PaymentStatus)
          const StatusIcon = statusInfo.icon
          
          return (
            <div key={order.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <StatusIcon className="h-5 w-5 text-gray-400" />
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">#{order.id}</span>
                  <span className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentStatusInfo.color}`}>
                    {paymentStatusInfo.label}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedOrder(order)
                      setShowOrderDetails(true)
                    }}
                    className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.customer?.name}</p>
                    <p className="text-xs text-gray-500">{order.customer?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{order.customer?.phone}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {order.deliveryType === 'delivery' ? 'Entrega' : 
                     order.deliveryType === 'pickup' ? 'Retirada' : 'Mesa'}
                  </span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      {order.items?.length || 0} item{order.items?.length > 1 ? 's' : ''} • {formatCurrency(order.total || 0)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.items?.map(item => `${item.quantity}x ${item.productName}`).join(', ')}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    {order.status === OrderStatus.RECEIVED && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(order.id, OrderStatus.CONFIRMED)}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(order.id, OrderStatus.CANCELLED)}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    
                    {order.status === OrderStatus.CONFIRMED && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, OrderStatus.PREPARING)}
                        className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
                      >
                        Preparar
                      </button>
                    )}
                    
                    {order.status === OrderStatus.PREPARING && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, OrderStatus.READY)}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Pronto
                      </button>
                    )}
                    
                    {order.status === OrderStatus.READY && order.deliveryType === 'delivery' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, OrderStatus.DELIVERING)}
                        className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Entregar
                      </button>
                    )}
                    
                    {order.status === OrderStatus.READY && order.deliveryType !== 'delivery' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, OrderStatus.DELIVERED)}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Entregue
                      </button>
                    )}
                    
                    {order.status === OrderStatus.DELIVERING && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, OrderStatus.DELIVERED)}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Entregue
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum pedido encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedStatus !== 'all' || selectedPaymentStatus !== 'all'
                ? 'Tente ajustar os filtros de busca.'
                : 'Ainda não há pedidos registrados.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Pedido */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Pedido #{selectedOrder.id}
                </h3>
                <button
                  onClick={() => {
                    setShowOrderDetails(false)
                    setSelectedOrder(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Informações do Cliente */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Cliente</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm"><strong>Nome:</strong> {selectedOrder.customer?.name}</p>
                    <p className="text-sm"><strong>Email:</strong> {selectedOrder.customer?.email}</p>
                    <p className="text-sm"><strong>Telefone:</strong> {selectedOrder.customer?.phone}</p>
                    {selectedOrder.deliveryAddress && (
                      <p className="text-sm"><strong>Endereço:</strong> {selectedOrder.deliveryAddress}</p>
                    )}
                  </div>
                </div>
                
                {/* Itens do Pedido */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Itens</h4>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{item.productName}</p>
                          <p className="text-xs text-gray-500">
                            {item.quantity}x {formatCurrency(item.price)}
                            {item.notes && ` • ${item.notes}`}
                          </p>
                        </div>
                        <p className="text-sm font-medium">{formatCurrency(item.total)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Resumo Financeiro */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Resumo</h4>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Subtotal:</span>
                      <span className="text-sm">{formatCurrency(selectedOrder.subtotal || 0)}</span>
                    </div>
                    {selectedOrder.deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Taxa de entrega:</span>
                        <span className="text-sm">{formatCurrency(selectedOrder.deliveryFee || 0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-1">
                      <span className="text-sm font-medium">Total:</span>
                      <span className="text-sm font-medium">{formatCurrency(selectedOrder.total || 0)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Informações Adicionais */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Informações</h4>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Tipo de entrega:</span>
                      <span className="text-sm">
                        {selectedOrder.deliveryType === 'delivery' ? 'Entrega' : 
                         selectedOrder.deliveryType === 'pickup' ? 'Retirada' : 'Mesa'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Forma de pagamento:</span>
                      <span className="text-sm">
                        {selectedOrder.paymentMethod === 'cash' ? 'Dinheiro' :
                         selectedOrder.paymentMethod === 'card' ? 'Cartão' : 'PIX'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Status do pagamento:</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPaymentStatusInfo(selectedOrder.paymentStatus).color}`}>
                        {getPaymentStatusInfo(selectedOrder.paymentStatus).label}
                      </span>
                    </div>
                    {selectedOrder.notes && (
                      <div>
                        <span className="text-sm font-medium">Observações:</span>
                        <p className="text-sm text-gray-600 mt-1">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Ações */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowOrderDetails(false)
                      setSelectedOrder(null)
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 