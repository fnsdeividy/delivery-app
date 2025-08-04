'use client'

import { useState } from 'react'
import { X, Minus, Plus, ShoppingCart } from 'lucide-react'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
}

interface CartProps {
  isOpen: boolean
  onClose: () => void
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const [items, setItems] = useState<CartItem[]>([
    {
      id: 1,
      name: 'Pizza Margherita',
      price: 32.90,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop'
    },
    {
      id: 2,
      name: 'Burger Artesanal',
      price: 24.22,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100&h=100&fit=crop'
    }
  ])

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setItems(items.filter(item => item.id !== id))
    } else {
      setItems(items.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ))
    }
  }

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Carrinho</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
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
                <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      R$ {item.price.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-xl font-bold">
                R$ {total.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <button className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Finalizar Pedido
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 