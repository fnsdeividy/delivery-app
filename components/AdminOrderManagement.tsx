'use client'

import { MagnifyingGlass, Package } from '@phosphor-icons/react'
import { useState } from 'react'

interface AdminOrder {
  id: string
  orderNumber: string
  storeName: string
  customerName: string
  customerPhone: string
  status: string
  type: string
  paymentStatus: string
  total: number
  discount: number
  createdAt: string
}

interface AdminOrderStats {
  totalOrders: number
  totalRevenue: number
  ordersByStatus: Record<string, number>
  ordersByStore: Record<string, number>
}

export function AdminOrderManagement() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedStore, setSelectedStore] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  // Mock data - será substituído por dados reais da API
  const mockOrders: AdminOrder[] = []
  const mockStats: AdminOrderStats = {
    totalOrders: 0,
    totalRevenue: 0,
    ordersByStatus: {},
    ordersByStore: {}
  }

  // Filtrar pedidos
  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone?.includes(searchTerm) ||
      order.storeName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus
    const matchesStore = selectedStore === 'all' || order.storeName === selectedStore
    
    return matchesSearch && matchesStatus && matchesStore
  })

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return 'bg-blue-100 text-blue-800'
      case 'PREPARING':
        return 'bg-yellow-100 text-yellow-800'
      case 'READY':
        return 'bg-green-100 text-green-800'
      case 'DELIVERING':
        return 'bg-purple-100 text-purple-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Obter texto do status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return 'Recebido'
      case 'PREPARING':
        return 'Preparando'
      case 'READY':
        return 'Pronto'
      case 'DELIVERING':
        return 'Entregando'
      case 'DELIVERED':
        return 'Entregue'
      case 'CANCELLED':
        return 'Cancelado'
      default:
        return status
    }
  }

  // Obter cor do tipo
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DELIVERY':
        return 'bg-blue-100 text-blue-800'
      case 'PICKUP':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Obter texto do tipo
  const getTypeText = (type: string) => {
    switch (type) {
      case 'DELIVERY':
        return 'Entrega'
      case 'PICKUP':
        return 'Retirada'
      default:
        return type
    }
  }

  // Obter cor do status de pagamento
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats dos Pedidos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{mockStats.totalOrders}</div>
          <div className="text-sm text-gray-600">Total de Pedidos</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">R$ {mockStats.totalRevenue.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Receita Total</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">{mockStats.ordersByStatus.RECEIVED || 0}</div>
          <div className="text-sm text-gray-600">Pedidos Pendentes</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{mockStats.ordersByStatus.DELIVERED || 0}</div>
          <div className="text-sm text-gray-600">Pedidos Entregues</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar pedidos por número, cliente, loja..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todos os Status</option>
            <option value="RECEIVED">Recebido</option>
            <option value="PREPARING">Preparando</option>
            <option value="READY">Pronto</option>
            <option value="DELIVERING">Entregando</option>
            <option value="DELIVERED">Entregue</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todas as Lojas</option>
            {/* Opções de lojas serão carregadas dinamicamente */}
          </select>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Pedidos do Sistema</h3>
        </div>
        
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-500">
              {mockOrders.length === 0 
                ? 'Não há pedidos no sistema ainda.' 
                : 'Nenhum pedido corresponde aos filtros aplicados.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pedido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loja
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pagamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{order.orderNumber || order.id.slice(-8)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.storeName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.customerName || 'Cliente não identificado'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customerPhone || 'Telefone não informado'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(order.type)}`}>
                        {getTypeText(order.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus === 'PAID' ? 'Pago' : 
                         order.paymentStatus === 'PENDING' ? 'Pendente' : 
                         order.paymentStatus === 'FAILED' ? 'Falhou' : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>R$ {order.total.toFixed(2)}</div>
                      {order.discount > 0 && (
                        <div className="text-sm text-gray-500">
                          Desconto: R$ {order.discount.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-purple-600 hover:text-purple-900 text-xs"
                        title="Ver detalhes do pedido"
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginação */}
      {filteredOrders.length > 0 && (
        <div className="flex justify-center">
          <nav className="flex space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-3 py-2 text-sm text-gray-700">
              Página {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
            >
              Próxima
            </button>
          </nav>
        </div>
      )}
    </div>
  )
} 