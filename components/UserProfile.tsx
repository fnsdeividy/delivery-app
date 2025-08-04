'use client'

import {
    Check,
    Clock,
    CreditCard,
    Edit3,
    Heart,
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
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{userData.name}</h2>
              <p className="text-xs sm:text-sm text-gray-600 truncate">{userData.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b overflow-x-auto">
          <div className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-orange-600 font-medium">Total em Pedidos</p>
                      <p className="text-xl sm:text-2xl font-bold text-orange-900">
                        R$ {getTotalOrderValue(userData).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-full flex items-center justify-center">
                      <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-green-600 font-medium">Pedidos Concluídos</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-900">
                        {getCompletedOrdersCount(userData)}
                      </p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-blue-600 font-medium">Endereços Salvos</p>
                      <p className="text-xl sm:text-2xl font-bold text-blue-900">
                        {userData.addresses.length}
                      </p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 border border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900">Informações Pessoais</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">Email</p>
                      <p className="font-semibold text-gray-900 truncate">{userData.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">Telefone</p>
                      <p className="font-semibold text-gray-900">{formatPhone(userData.phone)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 sm:p-6 border border-purple-200">
                <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900">Preferências</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Heart className="h-4 w-4 text-purple-600" />
                      <p className="text-xs sm:text-sm text-gray-700 font-medium">Categorias Favoritas</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {userData.preferences.favoriteCategories.map((category, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1.5 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 rounded-full text-xs sm:text-sm font-medium border border-orange-300"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-red-600">🚫</span>
                      <p className="text-xs sm:text-sm text-gray-700 font-medium">Restrições Alimentares</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {userData.preferences.dietaryRestrictions.length > 0 ? (
                        userData.preferences.dietaryRestrictions.map((restriction, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1.5 bg-gradient-to-r from-red-100 to-red-200 text-red-800 rounded-full text-xs sm:text-sm font-medium border border-red-300"
                          >
                            {restriction}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-xs sm:text-sm italic">Nenhuma restrição</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-yellow-600">🌶️</span>
                      <p className="text-xs sm:text-sm text-gray-700 font-medium">Nível de Pimenta</p>
                    </div>
                    <span className="inline-flex px-3 py-1.5 bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 rounded-full text-xs sm:text-sm font-medium border border-yellow-300">
                      {userData.preferences.spicyLevel === 'none' && '🟢 Sem pimenta'}
                      {userData.preferences.spicyLevel === 'mild' && '🟡 Suave'}
                      {userData.preferences.spicyLevel === 'medium' && '🟠 Médio'}
                      {userData.preferences.spicyLevel === 'hot' && '🔴 Apimentado'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Meus Endereços</h3>
                <button className="flex items-center justify-center space-x-2 text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-lg transition-colors border border-orange-200">
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-medium">Adicionar Endereço</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {userData.addresses.map((address) => (
                  <div key={address.id} className="border-2 border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-all">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <h4 className="font-semibold text-gray-900">{address.label}</h4>
                          </div>
                          {address.isDefault && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium border border-orange-200">
                              ⭐ Padrão
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            address.type === 'home' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            address.type === 'work' ? 'bg-green-100 text-green-700 border border-green-200' :
                            'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}>
                            {address.type === 'home' && '🏠 Casa'}
                            {address.type === 'work' && '🏢 Trabalho'}
                            {address.type === 'other' && '📍 Outro'}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed mb-2">{formatAddress(address)}</p>
                        <p className="text-gray-500 text-xs font-mono bg-gray-50 px-2 py-1 rounded border inline-block">CEP: {address.zipCode}</p>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Formas de Pagamento</h3>
                <button className="flex items-center justify-center space-x-2 text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-lg transition-colors border border-orange-200">
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-medium">Adicionar Cartão</span>
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
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Histórico de Pedidos</h3>
              
              <div className="space-y-3">
                {userData.orderHistory.map((order) => (
                  <div key={order.id} className="border-2 border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-all">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <p className="font-semibold text-gray-900">Pedido #{order.id}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            order.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700 border border-red-200' :
                            'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          }`}>
                            {order.status === 'completed' && '✅ Concluído'}
                            {order.status === 'cancelled' && '❌ Cancelado'}
                            {order.status === 'pending' && '⏳ Pendente'}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
                          <span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
                            {order.itemCount} {order.itemCount === 1 ? 'item' : 'itens'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.deliveryType === 'delivery' ? 'bg-blue-100 text-blue-700' :
                            order.deliveryType === 'pickup' ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {order.deliveryType === 'delivery' && '🚗 Delivery'}
                            {order.deliveryType === 'pickup' && '🏠 Retirada'}
                            {order.deliveryType === 'waiter' && '👨‍💼 Mesa'}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded border inline-block">
                          📅 {new Date(order.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      
                      <div className="text-right sm:text-left flex-shrink-0">
                        <p className="text-lg sm:text-xl font-bold text-gray-900">
                          R$ {order.total.toFixed(2).replace('.', ',')}
                        </p>
                        <p className="text-xs text-gray-500">{order.restaurantName}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}