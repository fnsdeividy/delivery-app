'use client'

import {
    Check,
    Clock,
    CreditCard,
    Edit3,
    Mail,
    MapPin,
    Phone,
    Plus,
    User,
    X
} from 'lucide-react'
import { useState } from 'react'
import {
    formatAddress,
    formatPhone,
    getCompletedOrdersCount,
    getTotalOrderValue,
    mockUser,
    type UserData
} from '../data/mockUser'

interface UserProfileProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'addresses' | 'payments' | 'orders'>('info')
  const [userData, setUserData] = useState<UserData>(mockUser)

  if (!isOpen) return null

  const tabs = [
    { id: 'info', label: 'Dados Pessoais', icon: User },
    { id: 'addresses', label: 'Endereços', icon: MapPin },
    { id: 'payments', label: 'Pagamentos', icon: CreditCard },
    { id: 'orders', label: 'Histórico', icon: Clock }
  ]

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{userData.name}</h2>
              <p className="text-sm text-gray-600">{userData.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600">Total em Pedidos</p>
                      <p className="text-2xl font-bold text-orange-900">
                        R$ {getTotalOrderValue(userData).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <CreditCard className="h-8 w-8 text-orange-500" />
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Pedidos Concluídos</p>
                      <p className="text-2xl font-bold text-green-900">
                        {getCompletedOrdersCount(userData)}
                      </p>
                    </div>
                    <Check className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Endereços Salvos</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {userData.addresses.length}
                      </p>
                    </div>
                    <MapPin className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Informações Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{userData.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Telefone</p>
                      <p className="font-medium">{formatPhone(userData.phone)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Preferências</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Categorias Favoritas</p>
                    <div className="flex flex-wrap gap-2">
                      {userData.preferences.favoriteCategories.map((category, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Restrições Alimentares</p>
                    <div className="flex flex-wrap gap-2">
                      {userData.preferences.dietaryRestrictions.length > 0 ? (
                        userData.preferences.dietaryRestrictions.map((restriction, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                          >
                            {restriction}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">Nenhuma restrição</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Nível de Pimenta</p>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                      {userData.preferences.spicyLevel === 'none' && 'Sem pimenta'}
                      {userData.preferences.spicyLevel === 'mild' && 'Suave'}
                      {userData.preferences.spicyLevel === 'medium' && 'Médio'}
                      {userData.preferences.spicyLevel === 'hot' && 'Apimentado'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Meus Endereços</h3>
                <button className="flex items-center space-x-2 text-orange-600 hover:text-orange-700">
                  <Plus className="h-4 w-4" />
                  <span>Adicionar Endereço</span>
                </button>
              </div>
              
              {userData.addresses.map((address) => (
                <div key={address.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{address.label}</h4>
                        {address.isDefault && (
                          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                            Padrão
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded ${
                          address.type === 'home' ? 'bg-blue-100 text-blue-600' :
                          address.type === 'work' ? 'bg-green-100 text-green-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {address.type === 'home' && 'Casa'}
                          {address.type === 'work' && 'Trabalho'}
                          {address.type === 'other' && 'Outro'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{formatAddress(address)}</p>
                      <p className="text-gray-500 text-xs mt-1">CEP: {address.zipCode}</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Formas de Pagamento</h3>
                <button className="flex items-center space-x-2 text-orange-600 hover:text-orange-700">
                  <Plus className="h-4 w-4" />
                  <span>Adicionar Cartão</span>
                </button>
              </div>
              
              {userData.paymentMethods.map((payment) => {
                const getIconAndColors = () => {
                  switch (payment.type) {
                    case 'credit':
                      return {
                        icon: <CreditCard className="h-5 w-5" />,
                        iconColor: 'text-blue-600',
                        bgColor: 'bg-blue-50',
                        borderColor: 'border-blue-200',
                        badgeColor: 'bg-blue-100 text-blue-700'
                      }
                    case 'debit':
                      return {
                        icon: <CreditCard className="h-5 w-5" />,
                        iconColor: 'text-green-600',
                        bgColor: 'bg-green-50',
                        borderColor: 'border-green-200',
                        badgeColor: 'bg-green-100 text-green-700'
                      }
                    case 'pix':
                      return {
                        icon: <div className="w-5 h-5 flex items-center justify-center bg-gradient-to-br from-teal-500 to-cyan-600 rounded text-white text-xs font-bold">PIX</div>,
                        iconColor: 'text-teal-600',
                        bgColor: 'bg-teal-50',
                        borderColor: 'border-teal-200',
                        badgeColor: 'bg-teal-100 text-teal-700'
                      }
                    case 'cash':
                      return {
                        icon: <div className="w-5 h-5 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-green-600 rounded text-white text-sm">💰</div>,
                        iconColor: 'text-emerald-600',
                        bgColor: 'bg-emerald-50',
                        borderColor: 'border-emerald-200',
                        badgeColor: 'bg-emerald-100 text-emerald-700'
                      }
                    default:
                      return {
                        icon: <CreditCard className="h-5 w-5" />,
                        iconColor: 'text-gray-600',
                        bgColor: 'bg-gray-50',
                        borderColor: 'border-gray-200',
                        badgeColor: 'bg-gray-100 text-gray-700'
                      }
                  }
                }

                const { icon, iconColor, bgColor, borderColor, badgeColor } = getIconAndColors()

                return (
                  <div key={payment.id} className={`border-2 ${borderColor} ${bgColor} rounded-xl p-4 transition-all hover:shadow-md`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className={iconColor}>
                          {icon}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{payment.label}</p>
                          {payment.isDefault && (
                            <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full font-medium ${badgeColor} mt-1`}>
                              ⭐ Padrão
                            </span>
                          )}
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white rounded-lg transition-colors">
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Histórico de Pedidos</h3>
              
              {userData.orderHistory.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <p className="font-medium">Pedido #{order.id}</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          order.status === 'completed' ? 'bg-green-100 text-green-600' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {order.status === 'completed' && 'Concluído'}
                          {order.status === 'cancelled' && 'Cancelado'}
                          {order.status === 'pending' && 'Pendente'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {order.itemCount} {order.itemCount === 1 ? 'item' : 'itens'} • 
                        {order.deliveryType === 'delivery' && ' Delivery'}
                        {order.deliveryType === 'pickup' && ' Retirada'}
                        {order.deliveryType === 'waiter' && ' Mesa'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        R$ {order.total.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}