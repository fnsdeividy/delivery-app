'use client'

export function PaymentInfoSection() {
  return (
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
  )
}