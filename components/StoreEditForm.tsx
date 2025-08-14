'use client'

import { useStore, useUpdateStore } from '@/hooks'
import { UpdateStoreDto } from '@/types/cardapio-api'
import { Loader2, Save, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface StoreEditFormProps {
  storeId: string
  onSuccess?: () => void
  onCancel?: () => void
  initialData?: UpdateStoreDto
}

export function StoreEditForm({ storeId, onSuccess, onCancel, initialData }: StoreEditFormProps) {
  const [formData, setFormData] = useState<UpdateStoreDto>({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    category: '',
    deliveryFee: 0,
    minimumOrder: 0,
    estimatedDeliveryTime: 0,
    isActive: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Buscar dados da loja se não houver dados iniciais
  const { data: storeData, isLoading: isLoadingStore } = useStore(storeId)
  const updateStoreMutation = useUpdateStore()

  // Inicializar formulário com dados da loja
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else if (storeData) {
      setFormData({
        name: storeData.name || '',
        description: storeData.description || '',
        address: storeData.address || '',
        phone: storeData.phone || '',
        email: storeData.email || '',
        category: storeData.category || '',
        deliveryFee: storeData.deliveryFee || 0,
        minimumOrder: storeData.minimumOrder || 0,
        estimatedDeliveryTime: storeData.estimatedDeliveryTime || 0,
        isActive: storeData.isActive ?? true
      })
    }
  }, [initialData, storeData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const parsedValue = type === 'number' ? parseFloat(value) || 0 : value
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }))

    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'Nome da loja é obrigatório'
    }

    if (!formData.address?.trim()) {
      newErrors.address = 'Endereço é obrigatório'
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Telefone é obrigatório'
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if ((formData.deliveryFee ?? 0) < 0) {
      newErrors.deliveryFee = 'Taxa de entrega não pode ser negativa'
    }

    if ((formData.minimumOrder ?? 0) < 0) {
      newErrors.minimumOrder = 'Pedido mínimo não pode ser negativo'
    }

    if ((formData.estimatedDeliveryTime ?? 0) < 0) {
      newErrors.estimatedDeliveryTime = 'Tempo estimado não pode ser negativo'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await updateStoreMutation.mutateAsync({
        storeId,
        storeData: formData
      })

      // Sucesso
      onSuccess?.()
    } catch (error) {
      console.error('Erro ao atualizar loja:', error)
    }
  }

  if (isLoadingStore) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-2 text-gray-600">Carregando dados da loja...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome da Loja */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Loja *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nome da sua loja"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Categoria */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Selecione uma categoria</option>
              <option value="Restaurante">Restaurante</option>
              <option value="Pizzaria">Pizzaria</option>
              <option value="Hamburgueria">Hamburgueria</option>
              <option value="Doceria">Doceria</option>
              <option value="Bebidas">Bebidas</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
        </div>

        {/* Descrição */}
        <div className="mt-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Descreva sua loja..."
          />
        </div>
      </div>

      {/* Contato */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações de Contato</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Endereço */}
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Endereço *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Endereço completo da loja"
            />
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
          </div>

          {/* Telefone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefone *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="(11) 99999-9999"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="contato@loja.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
        </div>
      </div>

      {/* Configurações de Entrega */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Entrega</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Taxa de Entrega */}
          <div>
            <label htmlFor="deliveryFee" className="block text-sm font-medium text-gray-700 mb-1">
              Taxa de Entrega (R$)
            </label>
            <input
              type="number"
              id="deliveryFee"
              name="deliveryFee"
              value={formData.deliveryFee}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.deliveryFee ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.deliveryFee && <p className="mt-1 text-sm text-red-600">{errors.deliveryFee}</p>}
          </div>

          {/* Pedido Mínimo */}
          <div>
            <label htmlFor="minimumOrder" className="block text-sm font-medium text-gray-700 mb-1">
              Pedido Mínimo (R$)
            </label>
            <input
              type="number"
              id="minimumOrder"
              name="minimumOrder"
              value={formData.minimumOrder}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.minimumOrder ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.minimumOrder && <p className="mt-1 text-sm text-red-600">{errors.minimumOrder}</p>}
          </div>

          {/* Tempo Estimado */}
          <div>
            <label htmlFor="estimatedDeliveryTime" className="block text-sm font-medium text-gray-700 mb-1">
              Tempo Estimado (min)
            </label>
            <input
              type="number"
              id="estimatedDeliveryTime"
              name="estimatedDeliveryTime"
              value={formData.estimatedDeliveryTime}
              onChange={handleInputChange}
              min="0"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.estimatedDeliveryTime ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="30"
            />
            {errors.estimatedDeliveryTime && <p className="mt-1 text-sm text-red-600">{errors.estimatedDeliveryTime}</p>}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status da Loja</h3>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
            Loja ativa e disponível para pedidos
          </label>
        </div>
      </div>

      {/* Botões */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          <X className="w-4 h-4 inline mr-2" />
          Cancelar
        </button>
        
        <button
          type="submit"
          disabled={updateStoreMutation.isLoading}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updateStoreMutation.isLoading ? (
            <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 inline mr-2" />
          )}
          {updateStoreMutation.isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      {/* Mensagens de Erro/Sucesso */}
      {updateStoreMutation.isError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700 text-sm">
            Erro ao atualizar loja: {updateStoreMutation.error?.message}
          </p>
        </div>
      )}

      {updateStoreMutation.isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-700 text-sm">
            ✅ Loja atualizada com sucesso!
          </p>
        </div>
      )}
    </form>
  )
} 