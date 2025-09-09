'use client'

import { CreditCard, FloppyDisk } from '@phosphor-icons/react'

interface PaymentHeaderProps {
  onSave: () => void
  saving: boolean
}

export function PaymentHeader({ onSave, saving }: PaymentHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <CreditCard className="h-6 w-6 text-purple-500" />
            <h1 className="text-xl font-semibold text-gray-900">Métodos de Pagamento</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <FloppyDisk className="h-4 w-4" />
              <span>{saving ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}