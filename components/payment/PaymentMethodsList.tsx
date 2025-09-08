'use client'

import { PaymentMethod } from '@/types/payment'
import { PaymentMethodCard } from './PaymentMethodCard'
import { Plus } from '@phosphor-icons/react'

interface PaymentMethodsListProps {
  methods: PaymentMethod[]
  onToggleMethod: (methodId: string) => void
  onEditMethod: (method: PaymentMethod) => void
  onDeleteMethod: (methodId: string) => void
  onAddMethod: () => void
}

export function PaymentMethodsList({
  methods,
  onToggleMethod,
  onEditMethod,
  onDeleteMethod,
  onAddMethod
}: PaymentMethodsListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Métodos de Pagamento</h2>
        <button
          onClick={onAddMethod}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
          <span>Adicionar Método</span>
        </button>
      </div>

      <div className="space-y-4">
        {methods.map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            onToggle={onToggleMethod}
            onEdit={onEditMethod}
            onDelete={onDeleteMethod}
          />
        ))}
      </div>
    </div>
  )
}