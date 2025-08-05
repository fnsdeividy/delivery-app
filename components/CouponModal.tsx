'use client'

import { CheckCircle, X } from 'lucide-react'
import { useState } from 'react'

interface Coupon {
  code: string
  discount: number
  type: 'percentage' | 'fixed'
  minimumOrder: number
  validUntil: string
  usageLimit: number
  usedCount: number
}

interface CouponModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (coupon: Coupon) => void
  currentTotal: number
}

export default function CouponModal({ isOpen, onClose, onApply, currentTotal }: CouponModalProps) {
  const [couponCode, setCouponCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Cupons de exemplo (em produção viriam do banco)
  const availableCoupons: Coupon[] = [
    {
      code: 'PRIMEIRA10',
      discount: 10,
      type: 'percentage',
      minimumOrder: 30,
      validUntil: '2025-12-31',
      usageLimit: 1000,
      usedCount: 150
    },
    {
      code: 'FREEGRATIS',
      discount: 5,
      type: 'fixed',
      minimumOrder: 20,
      validUntil: '2025-12-31',
      usageLimit: 500,
      usedCount: 200
    },
    {
      code: 'SUPER20',
      discount: 20,
      type: 'percentage',
      minimumOrder: 50,
      validUntil: '2025-12-31',
      usageLimit: 100,
      usedCount: 50
    }
  ]

  const validateCoupon = async (code: string): Promise<Coupon | null> => {
    // Simular validação de cupom
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const coupon = availableCoupons.find(c => c.code === code.toUpperCase())
    
    if (!coupon) {
      throw new Error('Cupom não encontrado')
    }

    // Verificar se ainda é válido
    if (new Date() > new Date(coupon.validUntil)) {
      throw new Error('Cupom expirado')
    }

    // Verificar limite de uso
    if (coupon.usedCount >= coupon.usageLimit) {
      throw new Error('Cupom esgotado')
    }

    // Verificar valor mínimo
    if (currentTotal < coupon.minimumOrder) {
      throw new Error(`Pedido mínimo de R$ ${coupon.minimumOrder.toFixed(2).replace('.', ',')}`)
    }

    return coupon
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Digite um código de cupom')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const coupon = await validateCoupon(couponCode)
      
      if (coupon) {
        setSuccess(`Cupom aplicado! Desconto de ${coupon.discount}${coupon.type === 'percentage' ? '%' : ' reais'}`)
        onApply(coupon)
        setTimeout(() => onClose(), 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao aplicar cupom')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyCoupon()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Aplicar Cupom</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código do Cupom
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="Digite o código"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                disabled={loading}
              />
              <button
                onClick={handleApplyCoupon}
                disabled={loading || !couponCode.trim()}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Aplicando...' : 'Aplicar'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Cupons Disponíveis */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Cupons Disponíveis</h3>
            <div className="space-y-2">
              {availableCoupons.map((coupon) => (
                <div
                  key={coupon.code}
                  className="p-3 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors cursor-pointer"
                  onClick={() => setCouponCode(coupon.code)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{coupon.code}</p>
                      <p className="text-sm text-gray-600">
                        {coupon.discount}{coupon.type === 'percentage' ? '%' : ' reais'} de desconto
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        Mín: R$ {coupon.minimumOrder.toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {coupon.usageLimit - coupon.usedCount} restantes
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="text-xs text-gray-500 text-center">
            <p>• Cupons são válidos apenas uma vez por pedido</p>
            <p>• Não podem ser combinados com outras promoções</p>
          </div>
        </div>
      </div>
    </div>
  )
} 