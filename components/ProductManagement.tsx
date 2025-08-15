'use client'

import {
    useCategories,
    useCreateCategory,
    useCreateProduct,
    useDeleteCategory,
    useDeleteProduct,
    useProducts,
    useUpdateCategory,
    useUpdateProduct
} from '@/hooks'
import {
    Category,
    CreateCategoryDto,
    CreateProductDto,
    Product,
    UpdateCategoryDto,
    UpdateProductDto
} from '@/types/cardapio-api'
import React, { useState } from 'react'
import LoadingSpinner from './LoadingSpinner'
import { CategoryModal, ProductModal } from './ProductModals'

interface ProductManagementProps {
  storeSlug: string
}

export function ProductManagement({ storeSlug }: ProductManagementProps) {
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false)
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'products' | 'categories'>('products')

  // Hooks para produtos
  const { data: productsData, isLoading: isLoadingProducts, error: productsError } = useProducts(storeSlug, currentPage, 10)
  const createProductMutation = useCreateProduct()
  const updateProductMutation = useUpdateProduct()
  const deleteProductMutation = useDeleteProduct()

  // Hooks para categorias
  const { data: categoriesData, isLoading: isLoadingCategories, error: categoriesError } = useCategories(storeSlug)
  const createCategoryMutation = useCreateCategory()
  const updateCategoryMutation = useUpdateCategory()
  const deleteCategoryMutation = useDeleteCategory()

  // Estados do formulário de produto
  const [productFormData, setProductFormData] = useState<CreateProductDto>({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    categoryId: '',
    storeSlug: storeSlug,
    image: '',
    active: true,
    ingredients: [],
    addons: [],
    nutritionalInfo: {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sodium: 0
    },
    tags: [],
    tagColor: '#3B82F6'
  })

  // Estados do formulário de categoria
  const [categoryFormData, setCategoryFormData] = useState<CreateCategoryDto>({
    name: '',
    description: '',
    storeSlug: storeSlug,
    active: true,
    order: 0,
    image: ''
  })

  // Filtrar produtos
  const filteredProducts = productsData?.data.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory
    
    return matchesSearch && matchesCategory
  }) || []

  // Filtrar categorias
  const filteredCategories = categoriesData?.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  // Manipular criação de produto
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createProductMutation.mutateAsync(productFormData)
      setIsCreateProductModalOpen(false)
      resetProductForm()
    } catch (error) {
      console.error('Erro ao criar produto:', error)
    }
  }

  // Manipular edição de produto
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    try {
      const updateData: UpdateProductDto = {
        name: productFormData.name,
        description: productFormData.description,
        price: productFormData.price,
        originalPrice: productFormData.originalPrice,
        categoryId: productFormData.categoryId,
        image: productFormData.image,
        active: productFormData.active,
        ingredients: productFormData.ingredients,
        addons: productFormData.addons,
        nutritionalInfo: productFormData.nutritionalInfo,
        tags: productFormData.tags,
        tagColor: productFormData.tagColor
      }

      await updateProductMutation.mutateAsync({
        id: editingProduct.id,
        productData: updateData
      })

      setEditingProduct(null)
      resetProductForm()
    } catch (error) {
      console.error('Erro ao atualizar produto:', error)
    }
  }

  // Manipular exclusão de produto
  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteProductMutation.mutateAsync({ id: productId, storeSlug })
      } catch (error) {
        console.error('Erro ao excluir produto:', error)
      }
    }
  }

  // Manipular criação de categoria
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createCategoryMutation.mutateAsync(categoryFormData)
      setIsCreateCategoryModalOpen(false)
      resetCategoryForm()
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
    }
  }

  // Manipular edição de categoria
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return

    try {
      const updateData: UpdateCategoryDto = {
        name: categoryFormData.name,
        description: categoryFormData.description,
        image: categoryFormData.image,
        active: categoryFormData.active
      }

      await updateCategoryMutation.mutateAsync({
        id: editingCategory.id,
        categoryData: updateData
      })

      setEditingCategory(null)
      resetCategoryForm()
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error)
    }
  }

  // Manipular exclusão de categoria
  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await deleteCategoryMutation.mutateAsync({ id: categoryId, storeSlug })
      } catch (error) {
        console.error('Erro ao excluir categoria:', error)
      }
    }
  }

  // Abrir modal de edição de produto
  const openEditProductModal = (product: Product) => {
    setEditingProduct(product)
    setProductFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      originalPrice: product.originalPrice || 0,
      categoryId: product.categoryId,
      storeSlug: product.storeSlug,
      image: product.image || '',
      active: product.active,
      ingredients: product.ingredients || [],
      addons: product.addons || [],
      nutritionalInfo: product.nutritionalInfo || {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
        sodium: 0
      },
      tags: product.tags || [],
      tagColor: product.tagColor || '#3B82F6'
    })
  }

  // Abrir modal de edição de categoria
  const openEditCategoryModal = (category: Category) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      storeSlug: category.storeSlug,
      active: category.active,
      order: category.order,
      image: category.image || ''
    })
  }

  // Resetar formulário de produto
  const resetProductForm = () => {
    setProductFormData({
      name: '',
      description: '',
      price: 0,
      originalPrice: 0,
      categoryId: '',
      storeSlug: storeSlug,
      image: '',
      active: true,
      ingredients: [],
      addons: [],
      nutritionalInfo: {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
        sodium: 0
      },
      tags: [],
      tagColor: '#3B82F6'
    })
  }

  // Resetar formulário de categoria
  const resetCategoryForm = () => {
    setCategoryFormData({
      name: '',
      description: '',
      storeSlug: storeSlug,
      active: true,
      order: 0,
      image: ''
    })
  }

  // Fechar modais
  const closeModals = () => {
    setIsCreateProductModalOpen(false)
    setIsCreateCategoryModalOpen(false)
    setEditingProduct(null)
    setEditingCategory(null)
    resetProductForm()
    resetCategoryForm()
  }

  if (isLoadingProducts || isLoadingCategories) {
    return <LoadingSpinner />
  }

  if (productsError || categoriesError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-700">
          Erro ao carregar dados: {productsError?.message || categoriesError?.message}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Produtos</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('categories')}
            className={`px-4 py-2 rounded-md ${
              viewMode === 'categories' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Categorias
          </button>
          <button
            onClick={() => setViewMode('products')}
            className={`px-4 py-2 rounded-md ${
              viewMode === 'products' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Produtos
          </button>
          {viewMode === 'products' && (
            <button
              onClick={() => setIsCreateProductModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              + Novo Produto
            </button>
          )}
          {viewMode === 'categories' && (
            <button
              onClick={() => setIsCreateCategoryModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              + Nova Categoria
            </button>
          )}
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder={`Buscar ${viewMode === 'products' ? 'produtos' : 'categorias'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {viewMode === 'products' && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas as Categorias</option>
            {categoriesData?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Conteúdo baseado no modo de visualização */}
      {viewMode === 'products' ? (
        /* Lista de Produtos */
        <div className="bg-white shadow rounded-lg overflow-hidden">
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
                      {product.image && (
                        <img
                          className="h-10 w-10 rounded-full object-cover mr-3"
                          src={product.image}
                          alt={product.name}
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-gray-500">{product.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {categoriesData?.find(cat => cat.id === product.categoryId)?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>R$ {product.price.toFixed(2)}</div>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="text-sm text-gray-500 line-through">
                        R$ {product.originalPrice.toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditProductModal(product)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={deleteProductMutation.isPending}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Lista de Categorias */
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
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
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {category.image && (
                        <img
                          className="h-10 w-10 rounded-full object-cover mr-3"
                          src={category.image}
                          alt={category.name}
                        />
                      )}
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.description || 'Sem descrição'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      category.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {category.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditCategoryModal(category)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={deleteCategoryMutation.isPending}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginação para produtos */}
      {viewMode === 'products' && productsData && productsData.pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <nav className="flex space-x-2">
            {Array.from({ length: productsData.pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Modais */}
      <ProductModal
        isOpen={isCreateProductModalOpen}
        onClose={closeModals}
        onSubmit={handleCreateProduct}
        formData={productFormData}
        setFormData={setProductFormData}
        isEditing={false}
        isLoading={createProductMutation.isPending}
        categories={categoriesData || []}
      />
      
      <ProductModal
        isOpen={!!editingProduct}
        onClose={closeModals}
        onSubmit={handleUpdateProduct}
        formData={productFormData}
        setFormData={setProductFormData}
        isEditing={true}
        isLoading={updateProductMutation.isPending}
        categories={categoriesData || []}
      />
      
      <CategoryModal
        isOpen={isCreateCategoryModalOpen}
        onClose={closeModals}
        onSubmit={handleCreateCategory}
        formData={categoryFormData}
        setFormData={setCategoryFormData}
        isEditing={false}
        isLoading={createCategoryMutation.isPending}
      />
      
      <CategoryModal
        isOpen={!!editingCategory}
        onClose={closeModals}
        onSubmit={handleUpdateCategory}
        formData={categoryFormData}
        setFormData={setCategoryFormData}
        isEditing={true}
        isLoading={updateCategoryMutation.isPending}
      />
    </div>
  )
} 