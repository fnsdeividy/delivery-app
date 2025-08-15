'use client'

import { Clock, Phone, Search, ShoppingCart, Truck, User } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import LoadingSpinner from '../../../../components/LoadingSpinner'
import LoginModal from '../../../../components/LoginModal'
import PromotionsBanner from '../../../../components/PromotionsBanner'
import UserProfile from '../../../../components/UserProfile'
import { useStoreConfig, useStoreStatus } from '../../../../lib/store/useStoreConfig'
import { Product } from '../../../../types/cardapio-api'

export default function StorePage() {
  const params = useParams()
  const slug = params.slug as string
  
  const { config, loading, error } = useStoreConfig(slug)
  const { isOpen, currentMessage } = useStoreStatus(config)
  
  const { data: session, status } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [searchResults, setSearchResults] = useState<Product[] | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  // Promoções de exemplo (em produção viriam do banco/config)
  const promotions = [
    {
      id: '1',
      title: '🎉 Primeira Compra',
      description: '10% de desconto na primeira compra com cupom PRIMEIRA10',
      type: 'discount' as const,
      value: 10,
      validUntil: '2025-12-31',
      active: true
    },
    {
      id: '2',
      title: '🚚 Entrega Grátis',
      description: 'Entrega grátis em pedidos acima de R$ 30,00',
      type: 'free_delivery' as const,
      value: 5,
      validUntil: '2025-12-31',
      active: true
    }
  ]

  // Filtrar produtos - movido para antes dos returns condicionais
  const filteredProducts = useMemo(() => {
    if (!config?.menu?.products) return []
    const base = (searchResults ?? config.menu.products).filter(p => p.active)
    let filtered = base

    // Filtrar por categoria
    if (selectedCategory !== 'todos') {
      filtered = filtered.filter(product => product.categoryId === selectedCategory)
    }

    // Filtrar por busca
    // quando há resultados de busca por API, já estão filtrados

    return filtered
  }, [config?.menu?.products, selectedCategory, searchQuery])

  // Busca com debounce usando API e cache do Redis no backend
  useEffect(() => {
    if (!slug) return
    if (!searchQuery.trim()) {
      setSearchResults(null)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/stores/${slug}/search?q=${encodeURIComponent(searchQuery)}`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data.items as Product[])
        } else {
          setSearchResults(null)
        }
      } catch {
        setSearchResults(null)
      }
    }, 200)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [slug, searchQuery])

  const addToCart = (product: Product) => {
    setCartItems(prev => [...prev, { ...product, quantity: 1 }])
  }

  const getTagColor = (color: string) => {
    switch (color) {
      case 'orange': return 'bg-orange-500 text-white'
      case 'red': return 'bg-red-500 text-white'
      case 'green': return 'bg-green-500 text-white'
      case 'blue': return 'bg-blue-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Error state
  if (error || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loja não encontrada</h1>
          <p className="text-gray-600 mb-4">{error || 'Esta loja não existe ou está temporariamente indisponível.'}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ 
      backgroundColor: config?.branding?.backgroundColor || '#ffffff',
      color: config?.branding?.textColor || '#000000'
    }}>
      {/* Promotions Banner */}
      <PromotionsBanner promotions={promotions} />
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 animate-slide-in-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo e Nome */}
            <div className="flex items-center space-x-4 animate-slide-in-left">
              {config?.branding?.logo && (
                <img 
                  src={config.branding.logo} 
                  alt={config.name}
                  className="h-10 w-auto hover-scale"
                />
              )}
              <h1 className="text-2xl font-bold animate-float" style={{ color: config?.branding?.primaryColor || '#000' }}>
                {config.name}
              </h1>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8 animate-fade-in animate-delay-200">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:bg-white search-focus transition-all duration-300"
                  style={{ '--tw-ring-color': config?.branding?.primaryColor || '#f97316' } as any}
                />
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-4 animate-slide-in-right">
              {/* Login/Profile Button */}
              {status === 'authenticated' && session?.user ? (
                <button 
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center space-x-2 hover:opacity-75 transition-all duration-300 hover-lift"
                  style={{ color: config?.branding?.primaryColor || '#f97316' }}
                  title="Meu Perfil"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:block">
                    {session.user.name ? session.user.name.split(' ')[0] : 'Perfil'}
                  </span>
                </button>
              ) : (
                <button 
                  onClick={() => setIsLoginOpen(true)}
                  className="flex items-center space-x-2 hover:opacity-75 transition-all duration-300 hover-lift"
                  style={{ color: config?.branding?.primaryColor || '#f97316' }}
                  title="Fazer Login"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:block">Login</span>
                </button>
              )}
              
              {/* Cart Button */}
              <button 
                onClick={() => {
                  if (cartItems.length > 0) {
                    setIsCartOpen(true)
                  } else {
                    // Mostrar mensagem de carrinho vazio
                    alert('Adicione produtos ao carrinho primeiro')
                  }
                }}
                className="flex items-center space-x-2 hover:opacity-75 transition-all duration-300 relative hover-lift"
                style={{ color: config?.branding?.primaryColor || '#f97316' }}
              >
                <ShoppingCart className="h-5 w-5 transition-transform" />
                <span className="hidden sm:block">Carrinho</span>
                {cartItems.length > 0 && (
                  <span 
                    className="absolute -top-2 -right-2 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce-gentle"
                    style={{ backgroundColor: config?.branding?.accentColor || '#f97316' }}
                  >
                    {cartItems.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Banner */}
      {config?.branding?.bannerImage && (
        <div className="relative h-48 md:h-64 overflow-hidden animate-fade-in">
          <img 
            src={config.branding.bannerImage} 
            alt={config.name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white animate-scale-in animate-delay-300">
              <h2 className="text-3xl md:text-4xl font-bold mb-2 animate-slide-in-top animate-delay-500">{config.name}</h2>
              <p className="text-lg animate-slide-in-top animate-delay-700">{config.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Status da Loja */}
      {!isOpen && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 text-center animate-slide-in-top animate-shake">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="h-5 w-5 animate-pulse" />
            <span>{currentMessage}</span>
          </div>
        </div>
      )}

      {/* Info da Loja */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              {config?.business?.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{config.business.phone}</span>
                </div>
              )}
              {config?.delivery?.enabled && (
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    Entrega: R$ {config.delivery.fee?.toFixed(2).replace('.', ',') || '0,00'}
                    {config.delivery.freeDeliveryMinimum && (
                      <span className="text-green-600">
                        {' '}(Grátis acima de R$ {config.delivery.freeDeliveryMinimum.toFixed(2).replace('.', ',')})
                      </span>
                    )}
                  </span>
                </div>
              )}
              {config?.delivery?.estimatedTime && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{config.delivery.estimatedTime} min</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <section className="bg-white border-b animate-slide-in-left animate-delay-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 py-4 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('todos')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 hover-lift ${
                selectedCategory === 'todos'
                  ? 'text-white animate-glow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={selectedCategory === 'todos' ? { backgroundColor: config?.branding?.primaryColor || '#f97316' } : {}}
            >
              <span className="font-medium">Todos</span>
              <span className="text-sm opacity-75">({config?.menu?.products?.filter(p => p.active).length || 0})</span>
            </button>
            
            {config?.menu?.categories?.filter(c => c.active).map((category) => {
              const count = config?.menu?.products?.filter(p => p.active && p.categoryId === category.id).length || 0
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 hover-lift ${
                    selectedCategory === category.id
                      ? 'text-white animate-glow'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={selectedCategory === category.id ? { backgroundColor: config?.branding?.primaryColor || '#f97316' } : {}}
                >
                  <span className="font-medium">{category.name}</span>
                  <span className="text-sm opacity-75">({count})</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Info */}
          <div className="mb-6">
            <p className="text-gray-600">
              {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
              {selectedCategory !== 'todos' && ` em ${config?.menu?.categories?.find(c => c.id === selectedCategory)?.name}`}
              {searchQuery && ` para "${searchQuery}"`}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-600">
                Tente ajustar os filtros ou buscar por outro termo
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden card-hover stagger-item"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover transition-transform duration-500 hover:scale-110"
                    />
                    
                    {/* Tags */}
                    <div className="absolute top-3 left-3 flex flex-col space-y-1">
                      {/* Tags removidas - não existem no tipo Product */}
                    </div>
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-4">
                    {/* Name and Rating */}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>
                      {product.preparationTime && (
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{product.preparationTime}min</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                    
                    {/* Ingredients */}
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {/* Ingredients removidos - não existem no tipo Product */}
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                        {/* Preço original removido - não existe no tipo Product */}
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <button 
                      onClick={() => addToCart(product)}
                      disabled={!isOpen}
                      className="w-full px-4 py-2 text-white rounded-lg btn-primary text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      style={{ backgroundColor: isOpen ? (config?.branding?.primaryColor || '#f97316') : '#9ca3af' }}
                    >
                      {isOpen ? '+ Adicionar ao Carrinho' : 'Loja Fechada'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2 animate-slide-in-top">{config.name}</h3>
            <p className="text-gray-400 mb-4 animate-slide-in-top animate-delay-200">{config.description}</p>
            <div className="flex justify-center space-x-4 animate-slide-in-top animate-delay-300">
              {/* Social media removido - não existe no tipo business */}
            </div>
          </div>
        </div>
      </footer>

      {/* User Profile Modal */}
      <UserProfile
        user={session?.user || null}
        onLogin={() => setIsLoginOpen(true)}
        onLogout={() => {
          // Lógica de logout
          setIsProfileOpen(false)
        }}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={() => {
          setIsLoginOpen(false)
          // Usuário logado com sucesso
        }}
      />
    </div>
  )
}