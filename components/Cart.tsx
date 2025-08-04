'use client'

import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react'
import { useState } from 'react'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  customization?: {
    ingredients: string[]
    addons: string[]
    specialObservations?: string
  }
}

interface CartProps {
  isOpen: boolean
  onClose: () => void
  onCheckout: () => void
}

export default function Cart({ isOpen, onClose, onCheckout }: CartProps) {
  const [items, setItems] = useState<CartItem[]>([
    {
      id: 1,
      name: 'Pizza Margherita',
      price: 32.90,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop',
      customization: {
        ingredients: ['Molho de tomate', 'Mussarela', 'Manjericão'],
        addons: ['Queijo extra'],
        specialObservations: 'Bem passada'
      }
    },
    {
      id: 2,
      name: 'Burger Artesanal',
      price: 24.22,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100&h=100&fit=crop'
    },
    {
      id: 4,
      name: 'Pasta Carbonara',
      price: 32.90, // Preço com bacon extra
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=100&h=100&fit=crop',
      customization: {
        ingredients: ['Massa italiana', 'Bacon', 'Ovos', 'Parmesão', 'Pimenta do reino', 'Creme de leite'],
        addons: ['Bacon extra'],
        specialObservations: 'Bem passada, sem cebola'
      }
    }
  ])

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
      return
    }
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const removeItem = (id: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id))
  }

  const clearCart = () => {
    setItems([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Carrinho</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
            aria-label="Fechar carrinho"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingCart className="h-16 w-16 mb-4" />
              <p className="text-lg font-medium">Carrinho vazio</p>
              <p className="text-sm">Adicione alguns produtos</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="border rounded-lg p-3">
                  <div className="flex items-start space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </p>
                      
                      {/* Customization Details */}
                      {item.customization && (
                        <div className="mt-2 space-y-1">
                          {item.customization.addons.length > 0 && (
                            <div className="text-xs text-gray-500">
                              <span className="font-medium">Adicionais:</span> {item.customization.addons.join(', ')}
                            </div>
                          )}
                          {item.customization.specialObservations && (
                            <div className="text-xs text-gray-500">
                              <span className="font-medium">Obs:</span> {item.customization.specialObservations}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className={`p-1 rounded transition-colors ${
                            item.quantity <= 1 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                          aria-label="Diminuir quantidade"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 hover:bg-red-50 rounded text-red-500 hover:text-red-700 transition-colors"
                        aria-label="Remover item"
                        title="Remover item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4">
            {/* Clear Cart Button */}
            <div className="flex justify-center mb-3">
              <button
                onClick={clearCart}
                className="text-sm text-red-500 hover:text-red-700 underline transition-colors"
              >
                Limpar carrinho
              </button>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-xl font-bold">
                R$ {total.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <button 
              onClick={onCheckout}
              className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Finalizar Pedido
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 