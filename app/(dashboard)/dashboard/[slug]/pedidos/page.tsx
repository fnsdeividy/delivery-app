'use client'

import {
    CheckCircle,
    Clock,
    DollarSign,
    Eye,
    MapPin,
    Package,
    Phone,
    RefreshCw,
    Search,
    Truck,
    User,
    XCircle
} from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useStoreConfig } from '../../../../../lib/store/useStoreConfig'

interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
  total: number
  notes?: string
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

interface Order {
  id: string
  customer: Customer
  items: OrderItem[]
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled'
  total: number
  deliveryFee: number
  subtotal: number
  paymentMethod: 'cash' | 'card' | 'pix'
  paymentStatus: 'pending' | 'paid' | 'failed'
  deliveryType: 'delivery' | 'pickup' | 'waiter'
  deliveryAddress?: string
  notes?: string
  createdAt: string
  updatedAt: string
  estimatedDelivery?: string
}

export default function PedidosPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const { config, loading } = useStoreConfig(slug)
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all')
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Carregar pedidos
  useEffect(() => {
    loadOrders()
  }, [slug])

  const loadOrders = async () => {
    setLoadingOrders(true)
    try {
      // Simular carregamento de pedidos (em produção viria da API)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockOrders: Order[] = [
        {
          id: '1',
          customer: {
            id: '1',
            name: 'João Silva',
            email: 'joao@email.com',
            phone: '(11) 99999-9999',
            address: 'Rua das Flores, 123, Centro - São Paulo/SP'
          },
          items: [
            {
              id: '1',
              productId: '1',
              productName: 'X-Burger',
              quantity: 2,
              price: 25.90,
              total: 51.80,
              notes: 'Sem cebola'
            },
            {
              id: '2',
              productId: '2',
              productName: 'Batata Frita',
              quantity: 1,
              price: 12.50,
              total: 12.50
            }
          ],
          status: 'preparing',
          total: 69.30,
          deliveryFee: 5.00,
          subtotal: 64.30,
          paymentMethod: 'card',
          paymentStatus: 'paid',
          deliveryType: 'delivery',
          deliveryAddress: 'Rua das Flores, 123, Centro - São Paulo/SP',
          notes: 'Entregar no portão',
          createdAt: '2024-01-22T18:30:00Z',
          updatedAt: '2024-01-22T18:35:00Z',
          estimatedDelivery: '2024-01-22T19:00:00Z'
        },
        {
          id: '2',
          customer: {
            id: '2',
            name: 'Maria Santos',
            email: 'maria@email.com',
            phone: '(11) 88888-8888',
            address: 'Av. Paulista, 1000, Bela Vista - São Paulo/SP'
          },
          items: [
            {
              id: '3',
              productId: '3',
              productName: 'Refrigerante Cola',
              quantity: 3,
              price: 6.90,
              total: 20.70
            }
          ],
          status: 'pending',
          total: 20.70,
          deliveryFee: 0,
          subtotal: 20.70,
          paymentMethod: 'pix',
          paymentStatus: 'pending',
          deliveryType: 'pickup',
          notes: 'Retirar no balcão',
          createdAt: '2024-01-22T18:45:00Z',
          updatedAt: '2024-01-22T18:45:00Z'
        },
        {
          id: '3',
          customer: {
            id: '3',
            name: 'Pedro Costa',
            email: 'pedro@email.com',
            phone: '(11) 77777-7777',
            address: 'Rua Augusta, 500, Consolação - São Paulo/SP'
          },
          items: [
            {
              id: '4',
              productId: '1',
              productName: 'X-Burger',
              quantity: 1,
              price: 25.90,
              total: 25.90
            }
          ],
          status: 'delivered',
          total: 30.90,
          deliveryFee: 5.00,
          subtotal: 25.90,
          paymentMethod: 'cash',
          paymentStatus: 'paid',
          deliveryType: 'delivery',
          deliveryAddress: 'Rua Augusta, 500, Consolação - São Paulo/SP',
          createdAt: '2024-01-22T17:00:00Z',
          updatedAt: '2024-01-22T17:45:00Z'
        },
        {
          id: '4',
          customer: {
            id: '4',
            name: 'Ana Oliveira',
            email: 'ana@email.com',
            phone: '(11) 66666-6666',
            address: 'Rua Oscar Freire, 200, Jardins - São Paulo/SP'
          },
          items: [
            {
              id: '5',
              productId: '2',
              productName: 'Batata Frita',
              quantity: 2,
              price: 12.50,
              total: 25.00
            }
          ],
          status: 'cancelled',
          total: 25.00,
          deliveryFee: 0,
          subtotal: 25.00,
          paymentMethod: 'card',
          paymentStatus: 'failed',
          deliveryType: 'pickup',
          notes: 'Cliente cancelou',
          createdAt: '2024-01-22T16:30:00Z',
          updatedAt: '2024-01-22T16:45:00Z'
        }
      ]
      
      setOrders(mockOrders)
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    } finally {
      setLoadingOrders(false)
    }
  }

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.phone.includes(searchTerm) ||
      order.id.includes(searchTerm)
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus
    const matchesPaymentStatus = selectedPaymentStatus === 'all' || order.paymentStatus === selectedPaymentStatus
    
    return matchesSearch && matchesStatus && matchesPaymentStatus
  })

  // Estatísticas
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivering: orders.filter(o => o.status === 'delivering').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalRevenue: orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0)
  }

  // Funções de atualização de status
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      ))
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const updatePaymentStatus = async (orderId: string, newPaymentStatus: Order['paymentStatus']) => {
    try {
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, paymentStatus: newPaymentStatus, updatedAt: new Date().toISOString() }
          : order
      ))
    } catch (error) {
      console.error('Erro ao atualizar status de pagamento:', error)
    }
  }

  // Funções auxiliares
  const getStatusInfo = (status: Order['status']) => {
    const statusMap = {
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      preparing: { label: 'Preparando', color: 'bg-orange-100 text-orange-800', icon: Package },
      ready: { label: 'Pronto', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      delivering: { label: 'Entregando', color: 'bg-purple-100 text-purple-800', icon: Truck },
      delivered: { label: 'Entregue', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle }
    }
    return statusMap[status]
  }

  const getPaymentStatusInfo = (status: Order['paymentStatus']) => {
    const statusMap = {
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Pago', color: 'bg-green-100 text-green-800' },
      failed: { label: 'Falhou', color: 'bg-red-100 text-red-800' }
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
          onClick={loadOrders}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
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
            <DollarSign className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Receita</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
          const statusInfo = getStatusInfo(order.status)
          const paymentStatusInfo = getPaymentStatusInfo(order.paymentStatus)
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
                    className="text-orange-600 hover:text-orange-900"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.customer.name}</p>
                    <p className="text-xs text-gray-500">{order.customer.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{order.customer.phone}</span>
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
                      {order.items.length} item{order.items.length > 1 ? 's' : ''} • {formatCurrency(order.total)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.items.map(item => `${item.quantity}x ${item.productName}`).join(', ')}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
                      >
                        Preparar
                      </button>
                    )}
                    
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Pronto
                      </button>
                    )}
                    
                    {order.status === 'ready' && order.deliveryType === 'delivery' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivering')}
                        className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Entregar
                      </button>
                    )}
                    
                    {order.status === 'ready' && order.deliveryType !== 'delivery' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Entregue
                      </button>
                    )}
                    
                    {order.status === 'delivering' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
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
                    <p className="text-sm"><strong>Nome:</strong> {selectedOrder.customer.name}</p>
                    <p className="text-sm"><strong>Email:</strong> {selectedOrder.customer.email}</p>
                    <p className="text-sm"><strong>Telefone:</strong> {selectedOrder.customer.phone}</p>
                    {selectedOrder.deliveryAddress && (
                      <p className="text-sm"><strong>Endereço:</strong> {selectedOrder.deliveryAddress}</p>
                    )}
                  </div>
                </div>
                
                {/* Itens do Pedido */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Itens</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
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
                      <span className="text-sm">{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Taxa de entrega:</span>
                        <span className="text-sm">{formatCurrency(selectedOrder.deliveryFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-1">
                      <span className="text-sm font-medium">Total:</span>
                      <span className="text-sm font-medium">{formatCurrency(selectedOrder.total)}</span>
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