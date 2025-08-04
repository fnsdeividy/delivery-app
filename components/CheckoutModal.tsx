'use client'

import { Car, Clock, CreditCard, Home, UserCheck, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatAddress, mockUser } from '../data/mockUser'
import { useTheme } from '../hooks/useTheme'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  cartItems: any[]
  total: number
}

type DeliveryType = 'waiter' | 'pickup' | 'delivery'

export default function CheckoutModal({ isOpen, onClose, cartItems, total }: CheckoutModalProps) {
  const { getPaymentColors, getDeliveryColors, getPrimaryColor } = useTheme()
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery')
  const [customerInfo, setCustomerInfo] = useState({
    name: mockUser.name,
    phone: mockUser.phone,
    email: mockUser.email,
    tableNumber: '',
    selectedAddressId: mockUser.addresses.find(addr => addr.isDefault)?.id || '',
    paymentMethodId: mockUser.paymentMethods.find(pm => pm.isDefault)?.id || ''
  })

  const selectedAddress = mockUser.addresses.find(addr => addr.id === customerInfo.selectedAddressId)
  const selectedPaymentMethod = mockUser.paymentMethods.find(pm => pm.id === customerInfo.paymentMethodId)

  // Fechar modal com ESC
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const deliveryFee = deliveryType === 'delivery' ? 5.00 : 0
  const finalTotal = total + deliveryFee

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui você implementaria a lógica de envio do pedido
    console.log('Pedido enviado:', {
      deliveryType,
      customerInfo,
      cartItems,
      total: finalTotal
    })
    alert('Pedido realizado com sucesso!')
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Finalizar Pedido</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
            aria-label="Fechar checkout"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Lado Esquerdo - Opções de Entrega e Dados */}
            <div className="space-y-6">
              {/* Tipo de Entrega */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Como você quer receber?</h3>
                <div className="grid grid-cols-1 gap-3">
                  {/* Delivery */}
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    deliveryType === 'delivery' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="deliveryType"
                      value="delivery"
                      checked={deliveryType === 'delivery'}
                      onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}
                      className="sr-only"
                    />
                    <Car className="h-6 w-6 text-orange-500 mr-3" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Delivery</h4>
                      <p className="text-sm text-gray-600">Entregamos na sua casa</p>
                      <p className="text-sm font-medium text-orange-600">Taxa: R$ 5,00</p>
                    </div>
                  </label>

                  {/* Retirar no Local */}
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    deliveryType === 'pickup' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="deliveryType"
                      value="pickup"
                      checked={deliveryType === 'pickup'}
                      onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}
                      className="sr-only"
                    />
                    <Home className="h-6 w-6 text-orange-500 mr-3" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Retirar no Local</h4>
                      <p className="text-sm text-gray-600">Retire seu pedido no restaurante</p>
                      <p className="text-sm font-medium text-green-600">Sem taxa</p>
                    </div>
                  </label>

                  {/* Garçom */}
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    deliveryType === 'waiter' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="deliveryType"
                      value="waiter"
                      checked={deliveryType === 'waiter'}
                      onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}
                      className="sr-only"
                    />
                    <UserCheck className="h-6 w-6 text-orange-500 mr-3" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Garçom</h4>
                      <p className="text-sm text-gray-600">Pedido na mesa</p>
                      <p className="text-sm font-medium text-green-600">Sem taxa</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Dados do Cliente */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Seus Dados</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                      <input
                        type="text"
                        required
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                      <input
                        type="tel"
                        required
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  {deliveryType === 'waiter' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Número da Mesa *</label>
                      <input
                        type="text"
                        required
                        value={customerInfo.tableNumber}
                        onChange={(e) => setCustomerInfo({...customerInfo, tableNumber: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Ex: Mesa 15"
                      />
                    </div>
                  )}

                  {deliveryType === 'delivery' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Endereço de Entrega *</label>
                        <select
                          required
                          value={customerInfo.selectedAddressId}
                          onChange={(e) => setCustomerInfo({...customerInfo, selectedAddressId: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="">Selecione um endereço</option>
                          {mockUser.addresses.map((address) => (
                            <option key={address.id} value={address.id}>
                              {address.label} - {formatAddress(address)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {selectedAddress && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-900">{selectedAddress.label}</p>
                          <p className="text-sm text-gray-600">{formatAddress(selectedAddress)}</p>
                          <p className="text-xs text-gray-500">CEP: {selectedAddress.zipCode}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Forma de Pagamento */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Forma de Pagamento</h3>
                <div className="space-y-3">
                  {mockUser.paymentMethods.map((payment) => {
                    const colors = getPaymentColors(payment.type)
                    
                    const getIcon = () => {
                      switch (payment.type) {
                        case 'credit':
                        case 'debit':
                          return <CreditCard className="h-5 w-5 mr-3" />
                        case 'pix':
                          return <div className="w-5 h-5 mr-3 flex items-center justify-center bg-gradient-to-br from-teal-500 to-cyan-600 rounded text-white text-xs font-bold">PIX</div>
                        case 'cash':
                          return <div className="w-5 h-5 mr-3 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-green-600 rounded text-white text-sm">💰</div>
                        default:
                          return <CreditCard className="h-5 w-5 mr-3" />
                      }
                    }

                    return (
                      <label 
                        key={payment.id}
                        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          customerInfo.paymentMethodId === payment.id 
                            ? `shadow-md transform scale-[1.02]` 
                            : `border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md`
                        }`}
                        style={{
                          backgroundColor: customerInfo.paymentMethodId === payment.id ? colors.selected : 'white',
                          borderColor: customerInfo.paymentMethodId === payment.id ? colors.selectedBorder : undefined
                        }}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={payment.id}
                          checked={customerInfo.paymentMethodId === payment.id}
                          onChange={(e) => setCustomerInfo({...customerInfo, paymentMethodId: e.target.value})}
                          className="sr-only"
                        />
                        <div style={{ color: colors.icon }}>
                          {getIcon()}
                        </div>
                        <div className="flex-1">
                          <span className={`font-semibold ${
                            customerInfo.paymentMethodId === payment.id ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {payment.label}
                          </span>
                          {payment.isDefault && (
                            <span 
                              className="ml-2 text-xs px-2 py-1 rounded-full font-medium"
                              style={{ 
                                backgroundColor: colors.badge,
                                color: colors.text 
                              }}
                            >
                              ⭐ Padrão
                            </span>
                          )}
                        </div>
                        {customerInfo.paymentMethodId === payment.id && (
                          <div 
                            className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: colors.icon }}
                          >
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Lado Direito - Resumo do Pedido */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Pedido</h3>
              
              {/* Itens do Carrinho */}
              <div className="space-y-3 mb-6">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      {item.customization && item.customization.addons.length > 0 && (
                        <p className="text-sm text-gray-600">
                          + {item.customization.addons.join(', ')}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                    </div>
                    <span className="font-medium text-gray-900">
                      R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Resumo de Valores */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
                
                {deliveryType === 'delivery' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxa de entrega</span>
                    <span className="font-medium">R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span>R$ {finalTotal.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              {/* Tempo Estimado */}
              <div className="mt-6 p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-orange-500 mr-2" />
                  <div>
                    <p className="font-medium text-gray-900">Tempo estimado</p>
                    <p className="text-sm text-gray-600">
                      {deliveryType === 'delivery' ? '30-45 min' : 
                       deliveryType === 'pickup' ? '15-25 min' : '10-15 min'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botão Finalizar */}
              <button
                type="submit"
                className="w-full mt-6 bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Finalizar Pedido - R$ {finalTotal.toFixed(2).replace('.', ',')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}