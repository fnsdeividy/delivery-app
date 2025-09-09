'use client'

import { PaymentMethod } from '@/types/payment'
import { X } from '@phosphor-icons/react'

interface PaymentMethodModalProps {
  isOpen: boolean
  editingMethod: PaymentMethod | null
  formData: {
    name: string
    type: PaymentMethod['type']
    enabled: boolean
    fee: number
    feeType: 'percentage' | 'fixed'
    minAmount: string
    maxAmount: string
    description: string
    requiresChange: boolean
    changeAmount: string
  }
  onClose: () => void
  onSave: () => void
  onFormChange: (field: string, value: any) => void
}

export function PaymentMethodModal({
  isOpen,
  editingMethod,
  formData,
  onClose,
  onSave,
  onFormChange
}: PaymentMethodModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingMethod ? 'Editar Método' : 'Adicionar Método'}
          </h3>
          <button
            onClick={onClose}
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
              onChange={(e) => onFormChange('name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ex: Cartão de Crédito"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={formData.type}
              onChange={(e) => onFormChange('type', e.target.value as PaymentMethod['type'])}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                onChange={(e) => onFormChange('fee', parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Taxa
              </label>
              <select
                value={formData.feeType}
                onChange={(e) => onFormChange('feeType', e.target.value as 'percentage' | 'fixed')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                onChange={(e) => onFormChange('minAmount', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                onChange={(e) => onFormChange('maxAmount', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              onChange={(e) => onFormChange('description', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  onChange={(e) => onFormChange('requiresChange', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
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
                    onChange={(e) => onFormChange('changeAmount', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              onChange={(e) => onFormChange('enabled', e.target.checked)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
              Método ativo
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            {editingMethod ? 'Salvar' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  )
}