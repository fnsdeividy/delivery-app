'use client'

import { Clock, Heart, MapPin, Search, Shield, Star, Truck, Zap, ShoppingCart, User } from 'lucide-react'
import { useState } from 'react'
import Cart from '../components/Cart'
import Notification from '../components/Notification'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<number[]>([])
  const [notification, setNotification] = useState({ show: false, message: '' })

  const categories = [
    { name: 'Todos', count: 24 },
    { name: 'Pizzas', count: 8 },
    { name: 'Hambúrgueres', count: 6 },
    { name: 'Massas', count: 4 },
    { name: 'Saladas', count: 3 },
    { name: 'Bebidas', count: 3 },
  ]

  const products = [
    {
      id: 1,
      name: 'Pizza Margherita',
      rating: 4.8,
      reviews: 127,
      description: 'Pizza clássica com molho de tomate, mussarela, manjericão fresco e azeite...',
      ingredients: ['Molho de tomate', 'Mussarela', 'Manjericão'],
      price: 32.90,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      tags: ['Popular'],
      tagColor: 'orange'
    },
    {
      id: 2,
      name: 'Burger Artesanal',
      rating: 4.6,
      reviews: 89,
      description: 'Hambúrguer de carne bovina 180g, queijo cheddar, alface, tomate, cebol...',
      ingredients: ['Pão brioche', 'Carne 180g', 'Queijo cheddar'],
      price: 24.22,
      originalPrice: 28.50,
      image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
      tags: ['-15%'],
      tagColor: 'red'
    },
    {
      id: 3,
      name: 'Salada Caesar',
      rating: 4.4,
      reviews: 56,
      description: 'Mix de folhas verdes, frango grelhado, croutons, parmesão e molho caesar...',
      ingredients: ['Mix de folhas', 'Frango grelhado', 'Croutons'],
      price: 24.90,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
      tags: ['Sem glúten'],
      tagColor: 'green'
    },
    {
      id: 4,
      name: 'Pasta Carbonara',
      rating: 4.7,
      reviews: 73,
      description: 'Massa italiana com bacon, ovos, parmesão, pimenta do reino e molho...',
      ingredients: ['Massa italiana', 'Bacon', 'Ovos'],
      price: 26.90,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop',
      tags: [],
      tagColor: ''
    },
    {
      id: 5,
      name: 'Pizza Vegana',
      rating: 4.5,
      reviews: 42,
      description: 'Pizza com molho de tomate, queijo vegetal, abobrinha, berinjela e rúcula',
      ingredients: ['Molho de tomate', 'Queijo vegetal', 'Abobrinha'],
      price: 34.90,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
      tags: ['Novo', 'Vegano'],
      tagColor: 'green'
    },
    {
      id: 6,
      name: 'Refrigerante Cola',
      rating: 4.2,
      reviews: 24,
      description: 'Refrigerante cola gelado 350ml',
      ingredients: ['Água', 'Açúcar', 'Extrato de cola'],
      price: 6.50,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=300&fit=crop',
      tags: [],
      tagColor: ''
    },
    {
      id: 7,
      name: 'Burger Veggie',
      rating: 4.3,
      reviews: 38,
      description: 'Hambúrguer de grão-de-bico e quinoa, queijo vegetal, alface, tomate e molh...',
      ingredients: ['Pão integral', 'Hambúrguer vegetal', 'Queijo vegetal'],
      price: 25.90,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&h=300&fit=crop',
      tags: ['Vegano'],
      tagColor: 'green'
    },
    {
      id: 8,
      name: 'Pizza Pepperoni',
      rating: 4.9,
      reviews: 156,
      description: 'Pizza com molho de tomate, mussarela e fatias generosas de pepperoni',
      ingredients: ['Molho de tomate', 'Mussarela', 'Pepperoni'],
      price: 36.90,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
      tags: ['Popular'],
      tagColor: 'orange'
    }
  ]

  const getTagColor = (color: string) => {
    switch (color) {
      case 'orange':
        return 'bg-orange-500 text-white'
      case 'red':
        return 'bg-red-500 text-white'
      case 'green':
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const addToCart = (productId: number) => {
    const product = products.find(p => p.id === productId)
    setCartItems(prev => [...prev, productId])
    setNotification({
      show: true,
      message: `${product?.name} adicionado ao carrinho!`
    })
  }

  const cartItemCount = cartItems.length

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-black">Sabor Express</h1>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar pratos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors">
                <User className="h-5 w-5" />
                <span className="hidden sm:block">Entrar</span>
              </button>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors relative"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden sm:block">Carrinho</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Categories */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 py-4 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category.name
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="font-medium">{category.name}</span>
                <span className="text-sm opacity-75">({category.count})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Product Image */}
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  
                  {/* Tags */}
                  <div className="absolute top-3 left-3 flex flex-col space-y-1">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 text-xs font-medium rounded ${getTagColor(product.tagColor)}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="p-4">
                  {/* Name and Rating */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{product.rating}</span>
                      <span className="text-xs text-gray-400">({product.reviews})</span>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  
                  {/* Ingredients */}
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {product.ingredients.map((ingredient, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {ingredient}
                        </span>
                      ))}
                      {product.ingredients.length > 0 && (
                        <span className="text-xs text-gray-500 px-2 py-1">
                          +{Math.max(0, 4 - product.ingredients.length)} mais
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button className="flex-1 px-4 py-2 border border-black text-black rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                      Personalizar
                    </button>
                    <button 
                      onClick={() => addToCart(product.id)}
                      className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                      + Adicionar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cart Component */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      {/* Notification */}
      <Notification 
        message={notification.message}
        isVisible={notification.show}
        onClose={() => setNotification({ show: false, message: '' })}
      />
    </div>
  )
} 