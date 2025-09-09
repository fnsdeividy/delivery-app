'use client'

import { PaymentMethod } from '@/types/payment'

interface PaymentMethodCardProps {
  method: PaymentMethod
  onToggle: (methodId: string) => void
  onEdit: (method: PaymentMethod) => void
  onDelete: (methodId: string) => void
}

export function PaymentMethodCard({ method, onToggle, onEdit, onDelete }: PaymentMethodCardProps) {
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

  return (
    <div
      className={`border rounded-lg p-4 ${
        method.enabled ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-gray-50'
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
            onClick={() => onToggle(method.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              method.enabled
                ? 'bg-purple-100 text-purple-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {method.enabled ? 'Ativo' : 'Inativo'}
          </button>
          <button
            onClick={() => onEdit(method)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Editar
          </button>
          {method.id.startsWith('custom_') && (
            <button
              onClick={() => onDelete(method.id)}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Excluir
            </button>
          )}
        </div>
      </div>
    </div>
  )
}