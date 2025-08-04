'use client'

import { Minus, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Ingredient {
  id: number
  name: string
  included: boolean
}

interface Addon {
  id: number
  name: string
  price: number
  selected: boolean
}

interface CustomizeModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: number
    name: string
    description: string
    basePrice: number
    image: string
    customizeIngredients: Ingredient[]
    addons: Addon[]
  }
  onAddToCart: (customization: any) => void
}

export default function CustomizeModal({ isOpen, onClose, product, onAddToCart }: CustomizeModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [ingredients, setIngredients] = useState<Ingredient[]>(product.customizeIngredients)
  const [addons, setAddons] = useState<Addon[]>(product.addons)
  const [specialObservations, setSpecialObservations] = useState('')

  // Reset form when product changes
  useEffect(() => {
    setQuantity(1)
    setIngredients(product.customizeIngredients)
    setAddons(product.addons)
    setSpecialObservations('')
  }, [product.id, product.customizeIngredients, product.addons])

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

  const toggleIngredient = (id: number) => {
    setIngredients(prev => 
      prev.map(ing => 
        ing.id === id ? { ...ing, included: !ing.included } : ing
      )
    )
  }

  const toggleAddon = (id: number) => {
    setAddons(prev => 
      prev.map(addon => 
        addon.id === id ? { ...addon, selected: !addon.selected } : addon
      )
    )
  }

  const addonsTotal = addons
    .filter(addon => addon.selected)
    .reduce((sum, addon) => sum + addon.price, 0)

  const totalPrice = (product.basePrice + addonsTotal) * quantity

  const handleAddToCart = () => {
    const customization = {
      productId: product.id,
      quantity,
      ingredients: ingredients.filter(ing => ing.included),
      addons: addons.filter(addon => addon.selected),
      specialObservations,
      totalPrice
    }
    onAddToCart(customization)
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Personalizar {product.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
            aria-label="Fechar modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Product Info */}
          <div className="flex space-x-4 mb-6">
            <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <div className="text-gray-400">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {product.description}
              </p>
              <p className="text-lg font-bold text-gray-900">
                R$ {product.basePrice.toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Quantidade</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Escolha a quantidade desejada</span>
              <div className="flex items-center bg-gray-50 rounded-lg p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    quantity <= 1 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-orange-500'
                  }`}
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="mx-3 min-w-[60px] text-center">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1
                      setQuantity(Math.max(1, Math.min(99, value)))
                    }}
                    className="w-full text-center bg-transparent text-lg font-semibold text-gray-900 border-none outline-none appearance-none"
                    min="1"
                    max="99"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {quantity === 1 ? 'unidade' : 'unidades'}
                  </div>
                </div>
                <button
                  onClick={() => setQuantity(Math.min(99, quantity + 1))}
                  disabled={quantity >= 99}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    quantity >= 99 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-orange-500'
                  }`}
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Ingredientes</h4>
            <p className="text-sm text-gray-600 mb-3">
              Remova os ingredientes que não deseja
            </p>
            <div className="space-y-3">
              {ingredients.map((ingredient) => (
                <label key={ingredient.id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={ingredient.included}
                    onChange={() => toggleIngredient(ingredient.id)}
                    className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-900">{ingredient.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Adicionais</h4>
            <div className="space-y-3">
              {addons.map((addon) => (
                <label key={addon.id} className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={addon.selected}
                      onChange={() => toggleAddon(addon.id)}
                      className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-900">{addon.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    +R$ {addon.price.toFixed(2).replace('.', ',')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Special Observations */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Observações especiais</h4>
            <textarea
              value={specialObservations}
              onChange={(e) => setSpecialObservations(e.target.value)}
              placeholder="Alguma observação sobre o preparo? Ex: bem passado, sem cebola..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-600">Total</span>
            <p className="text-2xl font-bold text-gray-900">
              R$ {totalPrice.toFixed(2).replace('.', ',')}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  )
} 