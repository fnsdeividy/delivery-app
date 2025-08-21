'use client'

import LoadingSpinner from '@/components/LoadingSpinner'
import { useCardapioAuth } from '@/hooks'
import { Eye, EyeSlash, Pencil, Plus, Trash } from '@phosphor-icons/react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  active: boolean
  category: {
    id: string
    name: string
  }
  inventory: {
    quantity: number
    minStock: number
  }
  _count: {
    orderItems: number
  }
}

interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function ProdutosPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.storeSlug as string
  const { isAuthenticated, getCurrentToken } = useCardapioAuth()
  
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showInactive, setShowInactive] = useState(false)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!isAuthenticated()) {
          router.push('/login/lojista')
          return
        }

        const token = getCurrentToken()
        if (!token) {
          router.push('/login/lojista')
          return
        }

        // Decodificar token JWT
        const payload = JSON.parse(atob(token.split('.')[1]))
        
        if (payload.role === 'SUPER_ADMIN' || 
            (payload.role === 'ADMIN' && payload.storeSlug === slug)) {
          loadProducts()
          loadCategories()
        } else {
          router.push('/unauthorized')
        }
      } catch (error) {
        router.push('/login/lojista')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [slug, isAuthenticated, getCurrentToken, router])

  const loadProducts = async () => {
    try {
      const response = await fetch(`/api/v1/products/store/${slug}?page=${pagination.page}&limit=${pagination.limit}&active=${!showInactive}${selectedCategory ? `&categoryId=${selectedCategory}` : ''}`)
      
      if (response.ok) {
        const data: PaginatedResponse<Product> = await response.json()
        setProducts(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch(`/api/v1/stores/${slug}/categories`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const searchProducts = async () => {
    if (searchQuery.trim().length < 2) return

    try {
      const response = await fetch(`/api/v1/products/store/${slug}/search?q=${encodeURIComponent(searchQuery.trim())}${selectedCategory ? `&categoryId=${selectedCategory}` : ''}`)
      
      if (response.ok) {
        const data: Product[] = await response.json()
        setProducts(data)
        setPagination(prev => ({ ...prev, total: data.length, totalPages: 1 }))
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
    }
  }

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/v1/products/${productId}/toggle-status?storeSlug=${slug}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getCurrentToken()}`
        }
      })

      if (response.ok) {
        // Atualizar estado local
        setProducts(prev => prev.map(p => 
          p.id === productId ? { ...p, active: !currentStatus } : p
        ))
      }
    } catch (error) {
      console.error('Erro ao alterar status do produto:', error)
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja remover este produto?')) return

    try {
      const response = await fetch(`/api/v1/products/${productId}?storeSlug=${slug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getCurrentToken()}`
        }
      })

      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId))
      }
    } catch (error) {
      console.error('Erro ao remover produto:', error)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity <= 0) return { text: 'Sem estoque', color: 'text-red-600 bg-red-100' }
    if (quantity <= minStock) return { text: 'Estoque baixo', color: 'text-yellow-600 bg-yellow-100' }
    return { text: 'Em estoque', color: 'text-green-600 bg-green-100' }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gerenciar Produtos</h1>
                <p className="text-sm text-gray-600">Loja: {slug}</p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/dashboard/${slug}/produtos/novo`)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Produto
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => router.push(`/dashboard/${slug}`)}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Dashboard
              </button>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-sm font-medium text-gray-500">Produtos</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="md:col-span-2">
              <div className="relative">
                {/* Corrigido: Importação do ícone de busca */}
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchProducts()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filtro por Categoria */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de Status */}
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Mostrar inativos</span>
              </label>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={searchProducts}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                />
              </svg>
              Buscar
            </button>

            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('')
                setShowInactive(false)
                setPagination(prev => ({ ...prev, page: 1 }))
                loadProducts()
              }}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                />
              </svg>
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Lista de Produtos */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Produtos ({pagination.total})
            </h2>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery ? 'Tente ajustar os filtros de busca' : 'Comece criando seu primeiro produto'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => router.push(`/dashboard/${slug}/produtos/novo`)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Criar Primeiro Produto
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estoque
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category?.name || 'Sem categoria'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.inventory?.quantity || 0} unidades
                        </div>
                        {product.inventory && (
                          <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatus(product.inventory.quantity, product.inventory.minStock).color}`}>
                            {getStockStatus(product.inventory.quantity, product.inventory.minStock).text}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => router.push(`/dashboard/${slug}/produtos/${product.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/dashboard/${slug}/produtos/${product.id}/editar`)}
                            className="text-green-600 hover:text-green-900"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleProductStatus(product.id, product.active)}
                            className={product.active ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"}
                            title={product.active ? "Desativar" : "Ativar"}
                          >
                            {product.active ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Remover"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="inline-flex rounded-md shadow">
              <button
                onClick={() => {
                  if (pagination.page > 1) {
                    setPagination(prev => ({ ...prev, page: prev.page - 1 }))
                    loadProducts()
                  }
                }}
                disabled={pagination.page === 1}
                className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              
              <span className="px-3 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              
              <button
                onClick={() => {
                  if (pagination.page < pagination.totalPages) {
                    setPagination(prev => ({ ...prev, page: prev.page + 1 }))
                    loadProducts()
                  }
                }}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </nav>
          </div>
        )}
      </main>
    </div>
  )
} 