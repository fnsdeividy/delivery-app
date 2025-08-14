'use client'

import { Gift, X } from 'lucide-react'
import { useState } from 'react'

interface PromotionsBannerProps {
  promotions: Array<{
    id: string
    title: string
    description: string
    type: 'discount' | 'free_delivery'
    value: number
    validUntil: string
    active: boolean
  }>
}

export default function PromotionsBanner({ promotions }: PromotionsBannerProps) {
  const [visiblePromotions, setVisiblePromotions] = useState<string[]>(
    promotions.filter(p => p.active).map(p => p.id)
  )

  const removePromotion = (id: string) => {
    setVisiblePromotions(prev => prev.filter(p => p !== id))
  }

  if (visiblePromotions.length === 0) return null

  return (
    <div className="space-y-3 mb-6">
      {promotions
        .filter(p => p.active && visiblePromotions.includes(p.id))
        .map(promotion => (
          <div
            key={promotion.id}
            className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Gift className="h-5 w-5 text-orange-500" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-orange-800">
                  {promotion.title}
                </h3>
                <p className="text-sm text-orange-700 mt-1">
                  {promotion.description}
                </p>
                <p className="text-xs text-orange-600 mt-2">
                  Válido até {new Date(promotion.validUntil).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => removePromotion(promotion.id)}
                  className="inline-flex text-orange-400 hover:text-orange-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
    </div>
  )
} 