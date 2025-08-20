'use client'

import { useStores } from '@/hooks'
import { Storefront, Package, ShoppingBag, ChartBar, Gear, ArrowRight, Plus } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function MinhasLojas() {
  const router = useRouter()
  const { data: storesData, isLoading, error } = useStores()
  const [searchTerm, setSearchTerm] = useState('')
  
  const stores = storesData?.data || []
  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleStoreClick = (storeSlug: string) => {
    router.push(`/dashboard/${storeSlug}`)
  }

  const handleCreateStore = () => {
    router.push('/dashboard/gerenciar-lojas')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando suas lojas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar lojas</h1>
          <p className="text-gray-600 mb-4">Não foi possível carregar suas lojas. Tente novamente.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Storefront className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Minhas Lojas</h1>
                <p className="text-sm text-gray-500">Gerencie e acesse suas lojas</p>
              </div>
            </div>
            <button
              onClick={handleCreateStore}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Loja
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Stats */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar lojas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Storefront className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{filteredStores.length} loja{filteredStores.length !== 1 ? 's' : ''} encontrada{filteredStores.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Stores Grid */}
        {filteredStores.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏪</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhuma loja encontrada' : 'Você ainda não tem lojas'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Tente ajustar os termos de busca.'
                : 'Comece criando sua primeira loja para gerenciar produtos e pedidos.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreateStore}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Criar Primeira Loja
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => (
              <div
                key={store.slug}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={() => handleStoreClick(store.slug)}
              >
                <div className="p-6">
                  {/* Store Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {store.name}
                      </h3>
                      {store.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {store.description}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>

                  {/* Store Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Package className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Produtos</p>
                      <p className="text-sm font-semibold text-gray-900">-</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <ShoppingBag className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Pedidos</p>
                      <p className="text-sm font-semibold text-gray-900">-</p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/dashboard/${store.slug}/produtos`)
                      }}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      <Package className="h-3 w-3 mr-1" />
                      Produtos
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/dashboard/${store.slug}/pedidos`)
                      }}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                    >
                      <ShoppingBag className="h-3 w-3 mr-1" />
                      Pedidos
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/dashboard/${store.slug}/configuracoes`)
                      }}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <Gear className="h-3 w-3 mr-1" />
                      Config
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 