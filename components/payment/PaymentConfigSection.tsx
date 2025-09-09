'use client'

interface PaymentConfig {
  autoAccept: boolean
  requireConfirmation: boolean
  allowPartialPayment: boolean
}

interface PaymentConfigSectionProps {
  config: PaymentConfig
  onConfigChange: (field: keyof PaymentConfig, value: boolean) => void
}

export function PaymentConfigSection({ config, onConfigChange }: PaymentConfigSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Configurações Gerais</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="autoAccept"
            checked={config.autoAccept}
            onChange={(e) => onConfigChange('autoAccept', e.target.checked)}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label htmlFor="autoAccept" className="text-sm font-medium text-gray-700">
            Aceitar pagamentos automaticamente
          </label>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="requireConfirmation"
            checked={config.requireConfirmation}
            onChange={(e) => onConfigChange('requireConfirmation', e.target.checked)}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label htmlFor="requireConfirmation" className="text-sm font-medium text-gray-700">
            Requer confirmação manual
          </label>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="allowPartialPayment"
            checked={config.allowPartialPayment}
            onChange={(e) => onConfigChange('allowPartialPayment', e.target.checked)}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label htmlFor="allowPartialPayment" className="text-sm font-medium text-gray-700">
            Permitir pagamento parcial
          </label>
        </div>
      </div>
    </div>
  )
}