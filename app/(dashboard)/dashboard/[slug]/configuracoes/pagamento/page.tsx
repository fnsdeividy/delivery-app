'use client'

import {
    AlertCircle,
    CheckCircle,
    CreditCard,
    Edit,
    Plus,
    Save,
    Trash2,
    X
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useStoreConfig } from '../../../../../lib/store/useStoreConfig'

interface PaymentMethod {
  id: string
  name: string
  type: 'card' | 'pix' | 'cash' | 'transfer' | 'digital_wallet'
  enabled: boolean
  fee: number
  feeType: 'percentage' | 'fixed'
  minAmount?: number
  maxAmount?: number
  description?: string
  icon: string
  requiresChange?: boolean
  changeAmount?: number
}

interface PaymentConfig {
  methods: PaymentMethod[]
  autoAccept: boolean
  requireConfirmation: boolean
  allowPartialPayment: boolean
  defaultMethod?: string
}

export default function PagamentoPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const { config, loading } = useStoreConfig(slug)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    methods: [],
    autoAccept: false,
    requireConfirmation: true,
    allowPartialPayment: false
  })

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'card' as PaymentMethod['type'],
    enabled: true,
    fee: 0,
    feeType: 'percentage' as 'percentage' | 'fixed',
    minAmount: '',
    maxAmount: '',
    description: '',
    requiresChange: false,
    changeAmount: ''
  })

  // Métodos de pagamento pré-definidos
  const defaultMethods: PaymentMethod[] = [
    {
      id: 'pix',
      name: 'PIX',
      type: 'pix',
      enabled: true,
      fee: 0,
      feeType: 'percentage',
      description: 'Pagamento instantâneo via PIX',
      icon: '💳',
      minAmount: 0.01,
      maxAmount: 10000
    },
    {
      id: 'credit_card',
      name: 'Cartão de Crédito',
      type: 'card',
      enabled: true,
      fee: 2.99,
      feeType: 'percentage',
      description: 'Visa, Mastercard, Elo e outros',
      icon: '💳',
      minAmount: 1,
      maxAmount: 5000
    },
    {
      id: 'debit_card',
      name: 'Cartão de Débito',
      type: 'card',
      enabled: true,
      fee: 1.99,
      feeType: 'percentage',
      description: 'Débito automático em conta',
      icon: '💳',
      minAmount: 1,
      maxAmount: 2000
    },
    {
      id: 'cash',
      name: 'Dinheiro',
      type: 'cash',
      enabled: true,
      fee: 0,
      feeType: 'fixed',
      description: 'Pagamento em dinheiro na entrega',
      icon: '💵',
      requiresChange: true,
      changeAmount: 50
    },
    {
      id: 'transfer',
      name: 'Transferência Bancária',
      type: 'transfer',
      enabled: false,
      fee: 0,
      feeType: 'fixed',
      description: 'Transferência PIX ou TED',
      icon: '🏦',
      minAmount: 10,
      maxAmount: 10000
    },
    {
      id: 'digital_wallet',
      name: 'Carteira Digital',
      type: 'digital_wallet',
      enabled: false,
      fee: 1.5,
      feeType: 'percentage',
      description: 'PayPal, Mercado Pago, etc.',
      icon: '📱',
      minAmount: 1,
      maxAmount: 3000
    }
  ]

  // Carregar configuração atual
  useEffect(() => {
    if (config?.payment) {
      setPaymentConfig({
        methods: config.payment.methods || defaultMethods,
        autoAccept: config.payment.autoAccept || false,
        requireConfirmation: config.payment.requireConfirmation !== false,
        allowPartialPayment: config.payment.allowPartialPayment || false,
        defaultMethod: config.payment.defaultMethod
      })
    } else {
      setPaymentConfig({
        methods: defaultMethods,
        autoAccept: false,
        requireConfirmation: true,
        allowPartialPayment: false
      })
    }
  }, [config])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/stores/${slug}/config`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment: paymentConfig
        }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Configurações de pagamento salvas com sucesso!' })
      } else {
        throw new Error('Erro ao salvar configurações')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar configurações de pagamento' })
    } finally {
      setSaving(false)
    }
  }

  const handleAddMethod = () => {
    const newMethod: PaymentMethod = {
      id: `custom_${Date.now()}`,
      name: formData.name,
      type: formData.type,
      enabled: formData.enabled,
      fee: formData.fee,
      feeType: formData.feeType,
      minAmount: formData.minAmount ? parseFloat(formData.minAmount) : undefined,
      maxAmount: formData.maxAmount ? parseFloat(formData.maxAmount) : undefined,
      description: formData.description,
      icon: '💳',
      requiresChange: formData.requiresChange,
      changeAmount: formData.changeAmount ? parseFloat(formData.changeAmount) : undefined
    }

    setPaymentConfig(prev => ({
      ...prev,
      methods: [...prev.methods, newMethod]
    }))

    setShowAddModal(false)
    resetForm()
  }

  const handleEditMethod = () => {
    if (!editingMethod) return

    const updatedMethods = paymentConfig.methods.map(method =>
      method.id === editingMethod.id
        ? {
            ...method,
            name: formData.name,
            type: formData.type,
            enabled: formData.enabled,
            fee: formData.fee,
            feeType: formData.feeType,
            minAmount: formData.minAmount ? parseFloat(formData.minAmount) : undefined,
            maxAmount: formData.maxAmount ? parseFloat(formData.maxAmount) : undefined,
            description: formData.description,
            requiresChange: formData.requiresChange,
            changeAmount: formData.changeAmount ? parseFloat(formData.changeAmount) : undefined
          }
        : method
    )

    setPaymentConfig(prev => ({
      ...prev,
      methods: updatedMethods
    }))

    setEditingMethod(null)
    resetForm()
  }

  const handleDeleteMethod = (methodId: string) => {
    setPaymentConfig(prev => ({
      ...prev,
      methods: prev.methods.filter(method => method.id !== methodId)
    }))
  }

  const handleToggleMethod = (methodId: string) => {
    setPaymentConfig(prev => ({
      ...prev,
      methods: prev.methods.map(method =>
        method.id === methodId
          ? { ...method, enabled: !method.enabled }
          : method
      )
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'card',
      enabled: true,
      fee: 0,
      feeType: 'percentage',
      minAmount: '',
      maxAmount: '',
      description: '',
      requiresChange: false,
      changeAmount: ''
    })
  }

  const openEditModal = (method: PaymentMethod) => {
    setEditingMethod(method)
    setFormData({
      name: method.name,
      type: method.type,
      enabled: method.enabled,
      fee: method.fee,
      feeType: method.feeType,
      minAmount: method.minAmount?.toString() || '',
      maxAmount: method.maxAmount?.toString() || '',
      description: method.description || '',
      requiresChange: method.requiresChange || false,
      changeAmount: method.changeAmount?.toString() || ''
    })
  }

  const getMethodIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'card': return '💳'
      case 'pix': return '📱'
      case 'cash': return '💵'
      case 'transfer': return '🏦'
      case 'digital_wallet': return '📱'
      default: return '💳'
    }
  }

  const getMethodTypeName = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'card': return 'Cartão'
      case 'pix': return 'PIX'
      case 'cash': return 'Dinheiro'
      case 'transfer': return 'Transferência'
      case 'digital_wallet': return 'Carteira Digital'
      default: return 'Outro'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando configurações...</p>
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
              <CreditCard className="h-6 w-6 text-orange-500" />
              <h1 className="text-xl font-semibold text-gray-900">Métodos de Pagamento</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Salvando...' : 'Salvar'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensagem de Status */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Configurações Gerais */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Configurações Gerais</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="autoAccept"
                checked={paymentConfig.autoAccept}
                onChange={(e) => setPaymentConfig(prev => ({ ...prev, autoAccept: e.target.checked }))}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="autoAccept" className="text-sm font-medium text-gray-700">
                Aceitar pagamentos automaticamente
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="requireConfirmation"
                checked={paymentConfig.requireConfirmation}
                onChange={(e) => setPaymentConfig(prev => ({ ...prev, requireConfirmation: e.target.checked }))}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="requireConfirmation" className="text-sm font-medium text-gray-700">
                Requer confirmação manual
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="allowPartialPayment"
                checked={paymentConfig.allowPartialPayment}
                onChange={(e) => setPaymentConfig(prev => ({ ...prev, allowPartialPayment: e.target.checked }))}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="allowPartialPayment" className="text-sm font-medium text-gray-700">
                Permitir pagamento parcial
              </label>
            </div>
          </div>
        </div>

        {/* Métodos de Pagamento */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Métodos de Pagamento</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar Método</span>
            </button>
          </div>

          <div className="space-y-4">
            {paymentConfig.methods.map((method) => (
              <div
                key={method.id}
                className={`border rounded-lg p-4 ${
                  method.enabled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getMethodIcon(method.type)}</div>
                    <div>
                      <h3 className="font-medium text-gray-900">{method.name}</h3>
                      <p className="text-sm text-gray-600">{method.description}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500">
                          Taxa: {method.fee}{method.feeType === 'percentage' ? '%' : ' R$'}
                        </span>
                        {method.minAmount && (
                          <span className="text-xs text-gray-500">
                            Mín: R$ {method.minAmount}
                          </span>
                        )}
                        {method.maxAmount && (
                          <span className="text-xs text-gray-500">
                            Máx: R$ {method.maxAmount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleMethod(method.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        method.enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {method.enabled ? 'Ativo' : 'Inativo'}
                    </button>
                    <button
                      onClick={() => openEditModal(method)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {method.id.startsWith('custom_') && (
                      <button
                        onClick={() => handleDeleteMethod(method.id)}
                        className="p-2 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Informações sobre Pagamentos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Configurações Recomendadas:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Mantenha PIX sempre ativo (sem taxa)</li>
                <li>• Configure taxas de cartão adequadamente</li>
                <li>• Defina limites de valor por método</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Segurança:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Sempre confirme pagamentos grandes</li>
                <li>• Monitore transações suspeitas</li>
                <li>• Mantenha registros de todas as transações</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Adicionar/Editar Método */}
      {(showAddModal || editingMethod) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingMethod ? 'Editar Método' : 'Adicionar Método'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingMethod(null)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Método
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Ex: Cartão de Crédito"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as PaymentMethod['type'] }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="card">Cartão</option>
                  <option value="pix">PIX</option>
                  <option value="cash">Dinheiro</option>
                  <option value="transfer">Transferência</option>
                  <option value="digital_wallet">Carteira Digital</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taxa
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.fee}
                    onChange={(e) => setFormData(prev => ({ ...prev, fee: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Taxa
                  </label>
                  <select
                    value={formData.feeType}
                    onChange={(e) => setFormData(prev => ({ ...prev, feeType: e.target.value as 'percentage' | 'fixed' }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Mínimo
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, minAmount: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Máximo
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.maxAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxAmount: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="1000.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={2}
                  placeholder="Descrição do método de pagamento"
                />
              </div>

              {formData.type === 'cash' && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="requiresChange"
                      checked={formData.requiresChange}
                      onChange={(e) => setFormData(prev => ({ ...prev, requiresChange: e.target.checked }))}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requiresChange" className="text-sm font-medium text-gray-700">
                      Requer troco
                    </label>
                  </div>
                  {formData.requiresChange && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor para Troco
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.changeAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, changeAmount: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="50.00"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
                  Método ativo
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingMethod(null)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={editingMethod ? handleEditMethod : handleAddMethod}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                {editingMethod ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 