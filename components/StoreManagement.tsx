'use client'

import React, { useState } from 'react'
import { useStores, useCreateStore, useUpdateStore, useDeleteStore, useApproveStore, useRejectStore, useStoreStats } from '@/hooks'
import { Store, CreateStoreDto, UpdateStoreDto, StoreConfig, BusinessHours, DaySchedule } from '@/types/cardapio-api'
import { LoadingSpinner } from './LoadingSpinner'

interface StoreManagementProps {
  showPendingOnly?: boolean
}

export function StoreManagement({ showPendingOnly = false }: StoreManagementProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingStore, setEditingStore] = useState<Store | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)

  // Hooks para gerenciar lojas
  const { data: storesData, isLoading: isLoadingStores, error: storesError } = useStores(currentPage, 10)
  const createStoreMutation = useCreateStore()
  const updateStoreMutation = useUpdateStore()
  const deleteStoreMutation = useDeleteStore()
  const approveStoreMutation = useApproveStore()
  const rejectStoreMutation = useRejectStore()
  
  // Stats da loja selecionada
  const { data: storeStats, isLoading: isLoadingStats } = useStoreStats(selectedStore?.slug || '')

  // Estados do formulário
  const [formData, setFormData] = useState<CreateStoreDto>({
    name: '',
    slug: '',
    description: '',
    config: {
      address: '',
      phone: '',
      email: '',
      category: '',
      deliveryFee: 0,
      minimumOrder: 0,
      estimatedDeliveryTime: 30,
      businessHours: {
        monday: { open: true, openTime: '09:00', closeTime: '18:00' },
        tuesday: { open: true, openTime: '09:00', closeTime: '18:00' },
        wednesday: { open: true, openTime: '09:00', closeTime: '18:00' },
        thursday: { open: true, openTime: '09:00', closeTime: '18:00' },
        friday: { open: true, openTime: '09:00', closeTime: '18:00' },
        saturday: { open: true, openTime: '10:00', closeTime: '16:00' },
        sunday: { open: false }
      },
      paymentMethods: ['CASH', 'CREDIT_CARD', 'PIX']
    },
    active: true,
    approved: false
  })

  // Filtrar lojas
  const filteredStores = storesData?.data.filter(store => {
    const matchesSearch = 
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.config.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (showPendingOnly) {
      return matchesSearch && !store.approved
    }
    
    return matchesSearch
  }) || []

  // Manipular criação de loja
  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createStoreMutation.mutateAsync(formData)
      setIsCreateModalOpen(false)
      resetForm()
    } catch (error) {
      console.error('Erro ao criar loja:', error)
    }
  }

  // Manipular edição de loja
  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStore) return

    try {
      const updateData: UpdateStoreDto = {
        name: formData.name,
        description: formData.description,
        config: formData.config,
        active: formData.active,
        approved: formData.approved
      }

      await updateStoreMutation.mutateAsync({
        slug: editingStore.slug,
        storeData: updateData
      })

      setEditingStore(null)
      resetForm()
    } catch (error) {
      console.error('Erro ao atualizar loja:', error)
    }
  }

  // Manipular exclusão de loja
  const handleDeleteStore = async (slug: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta loja?')) {
      try {
        await deleteStoreMutation.mutateAsync(slug)
      } catch (error) {
        console.error('Erro ao excluir loja:', error)
      }
    }
  }

  // Aprovar loja
  const handleApproveStore = async (slug: string) => {
    try {
      await approveStoreMutation.mutateAsync(slug)
    } catch (error) {
      console.error('Erro ao aprovar loja:', error)
    }
  }

  // Rejeitar loja
  const handleRejectStore = async (slug: string) => {
    try {
      await rejectStoreMutation.mutateAsync(slug)
    } catch (error) {
      console.error('Erro ao rejeitar loja:', error)
    }
  }

  // Abrir modal de edição
  const openEditModal = (store: Store) => {
    setEditingStore(store)
    setFormData({
      name: store.name,
      slug: store.slug,
      description: store.description || '',
      config: store.config,
      active: store.active,
      approved: store.approved
    })
  }

  // Selecionar loja para ver stats
  const selectStore = (store: Store) => {
    setSelectedStore(selectedStore?.id === store.id ? null : store)
  }

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      config: {
        address: '',
        phone: '',
        email: '',
        category: '',
        deliveryFee: 0,
        minimumOrder: 0,
        estimatedDeliveryTime: 30,
        businessHours: {
          monday: { open: true, openTime: '09:00', closeTime: '18:00' },
          tuesday: { open: true, openTime: '09:00', closeTime: '18:00' },
          wednesday: { open: true, openTime: '09:00', closeTime: '18:00' },
          thursday: { open: true, openTime: '09:00', closeTime: '18:00' },
          friday: { open: true, openTime: '09:00', closeTime: '18:00' },
          saturday: { open: true, openTime: '10:00', closeTime: '16:00' },
          sunday: { open: false }
        },
        paymentMethods: ['CASH', 'CREDIT_CARD', 'PIX']
      },
      active: true,
      approved: false
    })
  }

  // Fechar modais
  const closeModals = () => {
    setIsCreateModalOpen(false)
    setEditingStore(null)
    resetForm()
  }

  // Renderizar modal de criação/edição
  const renderStoreModal = () => {
    const isEditing = !!editingStore
    const title = isEditing ? 'Editar Loja' : 'Criar Nova Loja'
    const onSubmit = isEditing ? handleUpdateStore : handleCreateStore
    const isLoading = createStoreMutation.isPending || updateStoreMutation.isPending

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={closeModals}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Loja *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                  Slug da Loja *
                </label>
                <input
                  type="text"
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço *
                </label>
                <input
                  type="text"
                  id="address"
                  value={formData.config.address}
                  onChange={(e) => setFormData({
                    ...formData,
                    config: { ...formData.config, address: e.target.value }
                  })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.config.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    config: { ...formData.config, phone: e.target.value }
                  })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.config.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    config: { ...formData.config, email: e.target.value }
                  })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria *
                </label>
                <input
                  type="text"
                  id="category"
                  value={formData.config.category}
                  onChange={(e) => setFormData({
                    ...formData,
                    config: { ...formData.config, category: e.target.value }
                  })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="deliveryFee" className="block text-sm font-medium text-gray-700 mb-1">
                  Taxa de Entrega *
                </label>
                <input
                  type="number"
                  id="deliveryFee"
                  value={formData.config.deliveryFee}
                  onChange={(e) => setFormData({
                    ...formData,
                    config: { ...formData.config, deliveryFee: parseFloat(e.target.value) || 0 }
                  })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="minimumOrder" className="block text-sm font-medium text-gray-700 mb-1">
                  Pedido Mínimo *
                </label>
                <input
                  type="number"
                  id="minimumOrder"
                  value={formData.config.minimumOrder}
                  onChange={(e) => setFormData({
                    ...formData,
                    config: { ...formData.config, minimumOrder: parseFloat(e.target.value) || 0 }
                  })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-gray-700">Loja Ativa</span>
              </label>

              {!isEditing && (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.approved}
                    onChange={(e) => setFormData({ ...formData, approved: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-gray-700">Aprovada</span>
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (isLoadingStores) {
    return <LoadingSpinner />
  }

  if (storesError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-700">Erro ao carregar lojas: {storesError.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {showPendingOnly ? 'Lojas Pendentes de Aprovação' : 'Gerenciamento de Lojas'}
        </h2>
        {!showPendingOnly && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + Nova Loja
          </button>
        )}
      </div>

      {/* Filtros e Busca */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar lojas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Lista de Lojas */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loja
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Configurações
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStores.map((store) => (
              <tr key={store.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{store.name}</div>
                    <div className="text-sm text-gray-500">{store.slug}</div>
                    {store.description && (
                      <div className="text-sm text-gray-500">{store.description}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {store.config.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      store.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {store.approved ? 'Aprovada' : 'Pendente'}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      store.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {store.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    <div>Taxa: R$ {store.config.deliveryFee.toFixed(2)}</div>
                    <div>Mín: R$ {store.config.minimumOrder.toFixed(2)}</div>
                    <div>Tempo: {store.config.estimatedDeliveryTime}min</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => selectStore(store)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {selectedStore?.id === store.id ? 'Ocultar' : 'Ver Stats'}
                    </button>
                    <button
                      onClick={() => openEditModal(store)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </button>
                    {!store.approved && (
                      <button
                        onClick={() => handleApproveStore(store.slug)}
                        className="text-green-600 hover:text-green-900"
                        disabled={approveStoreMutation.isPending}
                      >
                        Aprovar
                      </button>
                    )}
                    {!store.approved && (
                      <button
                        onClick={() => handleRejectStore(store.slug)}
                        className="text-red-600 hover:text-red-900"
                        disabled={rejectStoreMutation.isPending}
                      >
                        Rejeitar
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteStore(store.slug)}
                      className="text-red-600 hover:text-red-900"
                      disabled={deleteStoreMutation.isPending}
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

      {/* Stats da Loja Selecionada */}
      {selectedStore && storeStats && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Estatísticas - {selectedStore.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{storeStats.totalOrders}</div>
              <div className="text-sm text-blue-600">Total de Pedidos</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">R$ {storeStats.totalRevenue.toFixed(2)}</div>
              <div className="text-sm text-green-600">Receita Total</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{storeStats.totalProducts}</div>
              <div className="text-sm text-yellow-600">Total de Produtos</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{storeStats.totalCustomers}</div>
              <div className="text-sm text-purple-600">Total de Clientes</div>
            </div>
          </div>
        </div>
      )}

      {/* Paginação */}
      {storesData && storesData.pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <nav className="flex space-x-2">
            {Array.from({ length: storesData.pagination.totalPages }, (_, i) => i + 1).map((page) => (
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
      {isCreateModalOpen && renderStoreModal()}
      {editingStore && renderStoreModal()}
    </div>
  )
} 