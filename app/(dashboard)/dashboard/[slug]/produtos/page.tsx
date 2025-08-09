'use client'

import { useStoreConfig } from '@/lib/store/useStoreConfig'
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Edit,
    Package,
    Plus,
    Search,
    Trash2
} from 'lucide-react'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image?: string
  available: boolean
  featured: boolean
  stock?: number
  minStock?: number
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
  description?: string
  active: boolean
}

export default function ProdutosPage() {
  const params = useParams()
  const slug = params.slug as string
  const searchParams = useSearchParams()
  
  const { config, loading } = useStoreConfig(slug)
  
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    available: true,
    featured: false,
    stock: '',
    minStock: ''
  })

  // Carregar produtos e categorias
  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [slug])



  // Abrir modal automaticamente quando vier de /produtos/novo
  useEffect(() => {
    if (searchParams?.get('new') === '1') {
      setShowCreateModal(true)
    }
  }, [searchParams])

  const loadProducts = async () => {
    setLoadingProducts(true)
    try {
      // Carregar produtos reais da API
      const res = await fetch(`/api/stores/${slug}/public`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Falha ao carregar produtos')
      
      const data = await res.json()
      const apiProducts: Product[] = (data.menu?.products || []).map((p: any) => {
        // Garantir que a categoria seja uma string válida
        let categoryName = p.category?.name || 'Sem categoria'
        if (typeof categoryName === 'number' || !isNaN(Number(categoryName))) {
          categoryName = 'Sem categoria'
        }
        
        return {
          id: p.id,
          name: p.name,
          description: p.description || '',
          price: p.price,
          category: categoryName,
          image: p.image || '',
          available: !!p.active,
          featured: false, // TODO: implementar featured
          stock: p.inventory?.quantity || 0,
          minStock: p.inventory?.minStock || 0,
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.updatedAt || new Date().toISOString()
        }
      })
      
      setProducts(apiProducts)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      setProducts([])
    } finally {
      setLoadingProducts(false)
    }
  }

  const loadCategories = async () => {
    try {
      const res = await fetch(`/api/stores/${slug}/public`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Falha ao carregar categorias')
      const data = await res.json()
      const apiCategories: Category[] = (data.menu?.categories || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description || '',
        active: !!c.active,
      }))
      setCategories(apiCategories)
      // Se não houver categoria selecionada, pré-seleciona a primeira ativa
      if (!formData.category && apiCategories.length > 0) {
        const firstActive = apiCategories.find(c => c.active)
        if (firstActive) {
          setFormData(prev => ({ ...prev, category: firstActive.name }))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      setCategories([])
    }
  }

  const createCategory = async (name: string) => {
    try {
      const res = await fetch(`/api/stores/${slug}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: `Categoria ${name}` }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erro ao criar categoria')
      }
      await loadCategories()
      return true
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
      alert(`Erro ao criar categoria: ${error}`)
      return false
    }
  }

  const handleCreateProduct = async () => {
    try {
      if (!formData.name || !formData.price || !formData.category) {
        alert('Preencha Nome, Preço e Categoria')
        return
      }
      
      // Se não há categorias, criar uma automaticamente
      if (categories.length === 0) {
        const created = await createCategory(formData.category)
        if (!created) return
      }
      
      const activeCategory = categories.find(c => c.name === formData.category && c.active)
      if (!activeCategory) {
        // Tentar criar a categoria se não existir
        const created = await createCategory(formData.category)
        if (!created) return
        
        // Recarregar categorias e tentar novamente
        await loadCategories()
        const newActiveCategory = categories.find(c => c.name === formData.category && c.active)
        if (!newActiveCategory) {
          alert('Erro ao encontrar categoria criada')
          return
        }
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: activeCategory?.id || '',
        image: formData.image,
        active: formData.available,
        stock: parseInt(formData.stock) || 0,
        minStock: parseInt(formData.minStock) || 0
      }

      const res = await fetch(`/api/stores/${slug}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erro ao criar produto')
      }

      alert('Produto criado com sucesso!')
      setShowCreateModal(false)
      resetForm()
      loadProducts()
    } catch (error) {
      console.error('Erro ao criar produto:', error)
      alert(`Erro ao criar produto: ${error}`)
    }
  }

  const handleEditProduct = async () => {
    if (!selectedProduct) return

    try {
      if (!formData.name || !formData.price || !formData.category) {
        alert('Preencha Nome, Preço e Categoria')
        return
      }

      // Encontrar a categoria pelo nome
      const activeCategory = categories.find(c => c.name === formData.category && c.active)
      if (!activeCategory) {
        alert('Categoria não encontrada')
        return
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: activeCategory.id,
        image: formData.image,
        active: formData.available,
        stock: parseInt(formData.stock) || 0,
        minStock: parseInt(formData.minStock) || 0
      }

      const res = await fetch(`/api/stores/${slug}/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erro ao atualizar produto')
      }

      alert('Produto atualizado com sucesso!')
      setShowEditModal(false)
      setSelectedProduct(null)
      resetForm()
      loadProducts()
    } catch (error) {
      console.error('Erro ao atualizar produto:', error)
      alert(`Erro ao atualizar produto: ${error}`)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const res = await fetch(`/api/stores/${slug}/products/${productId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erro ao excluir produto')
      }

      alert('Produto excluído com sucesso!')
      loadProducts()
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      alert(`Erro ao excluir produto: ${error}`)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      available: true,
      featured: false,
      stock: '',
      minStock: ''
    })
  }

  const openEditModal = (product: Product) => {
    // Garantir que a categoria seja uma string válida
    let categoryName = product.category
    if (typeof categoryName === 'number' || !isNaN(Number(categoryName))) {
      categoryName = 'Sem categoria'
    }
    
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: categoryName,
      image: product.image || '',
      available: product.available,
      featured: product.featured,
      stock: product.stock?.toString() || '',
      minStock: product.minStock?.toString() || ''
    })
    setShowEditModal(true)
  }

  // Filtros e estatísticas
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    
    const matchesAvailability = !showAvailableOnly || product.available
    
    return matchesSearch && matchesCategory && matchesAvailability
  })

  const stats = {
    total: products.length,
    available: products.filter(p => p.available).length,
    outOfStock: products.filter(p => (p.stock || 0) === 0).length,
    lowStock: products.filter(p => (p.stock || 0) <= (p.minStock || 0) && (p.stock || 0) > 0).length
  }

  if (loading || loadingProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600">Gerencie o cardápio da sua loja</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Produto</span>
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Disponíveis</p>
              <p className="text-2xl font-bold text-gray-900">{stats.available}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Sem Estoque</p>
              <p className="text-2xl font-bold text-gray-900">{stats.outOfStock}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Estoque Baixo</p>
              <p className="text-2xl font-bold text-gray-900">{stats.lowStock}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Todas as categorias</option>
              {categories.filter(c => c.active).map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showAvailableOnly}
                onChange={(e) => setShowAvailableOnly(e.target.checked)}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">Apenas disponíveis</span>
            </label>
          </div>
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={product.image || 'https://via.placeholder.com/40x40?text=?'}
                          alt={product.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                          {product.featured && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              Destaque
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.stock !== undefined ? (
                      <div className="text-sm">
                        <span className={product.stock <= (product.minStock || 0) ? 'text-red-600 font-medium' : 'text-gray-900'}>
                          {product.stock}
                        </span>
                        {product.minStock && (
                          <span className="text-gray-500 text-xs ml-1">
                            / {product.minStock}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.available ? 'Disponível' : 'Indisponível'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum produto encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory !== 'all' || showAvailableOnly
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece criando seu primeiro produto.'}
            </p>
            {!searchTerm && selectedCategory === 'all' && !showAvailableOnly && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Produto
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Criar/Editar Produto */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {showCreateModal ? 'Novo Produto' : 'Editar Produto'}
              </h3>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Nome do produto"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Descrição do produto"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preço *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Categoria *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.filter(c => c.active).map(category => (
                        <option key={category.id} value={category.name}>{category.name}</option>
                      ))}
                    </select>
                    {categories.filter(c => c.active).length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Carregando categorias...
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL da Imagem</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estoque</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Quantidade"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estoque Mínimo</label>
                    <input
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Mínimo"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({...formData, available: e.target.checked})}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Disponível</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Destaque</span>
                  </label>
                </div>
              </form>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setShowEditModal(false)
                    setSelectedProduct(null)
                    resetForm()
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={showCreateModal ? handleCreateProduct : handleEditProduct}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700"
                >
                  {showCreateModal ? 'Criar' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 