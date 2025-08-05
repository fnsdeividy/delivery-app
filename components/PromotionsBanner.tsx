'use client'

import { Gift, X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Promotion {
  id: string
  title: string
  description: string
  type: 'discount' | 'free_delivery' | 'gift' | 'combo'
  value: number
  validUntil: string
  active: boolean
}

interface PromotionsBannerProps {
  promotions: Promotion[]
  onClose?: () => void
}

export default function PromotionsBanner({ promotions, onClose }: PromotionsBannerProps) {
  const [currentPromotion, setCurrentPromotion] = useState<Promotion | null>(null)
  const [isVisible, setIsVisible] = useState(true)

  // Filtrar promoções ativas
  const activePromotions = promotions.filter(p => 
    p.active && new Date() < new Date(p.validUntil)
  )

  useEffect(() => {
    if (activePromotions.length > 0) {
      setCurrentPromotion(activePromotions[0])
    }
  }, [activePromotions])

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  if (!isVisible || !currentPromotion) return null

  const getPromotionIcon = (type: string) => {
    switch (type) {
      case 'discount':
        return '🎯'
      case 'free_delivery':
        return '🚚'
      case 'gift':
        return '🎁'
      case 'combo':
        return '🍽️'
      default:
        return '🎉'
    }
  }

  const getPromotionColor = (type: string) => {
    switch (type) {
      case 'discount':
        return 'bg-gradient-to-r from-red-500 to-pink-500'
      case 'free_delivery':
        return 'bg-gradient-to-r from-blue-500 to-purple-500'
      case 'gift':
        return 'bg-gradient-to-r from-green-500 to-emerald-500'
      case 'combo':
        return 'bg-gradient-to-r from-orange-500 to-yellow-500'
      default:
        return 'bg-gradient-to-r from-purple-500 to-pink-500'
    }
  }

  return (
    <div className={`${getPromotionColor(currentPromotion.type)} text-white animate-slide-in-top`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">
              {getPromotionIcon(currentPromotion.type)}
            </span>
            <div>
              <h3 className="font-semibold text-sm sm:text-base">
                {currentPromotion.title}
              </h3>
              <p className="text-xs sm:text-sm opacity-90">
                {currentPromotion.description}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            aria-label="Fechar promoção"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Componente para múltiplas promoções com carrossel
export function PromotionsCarousel({ promotions }: { promotions: Promotion[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const activePromotions = promotions.filter(p => 
    p.active && new Date() < new Date(p.validUntil)
  )

  useEffect(() => {
    if (activePromotions.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activePromotions.length)
    }, 5000) // Troca a cada 5 segundos

    return () => clearInterval(interval)
  }, [activePromotions.length])

  if (!isVisible || activePromotions.length === 0) return null

  const currentPromotion = activePromotions[currentIndex]

  return (
    <div className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white animate-slide-in-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎉</span>
            <div>
              <h3 className="font-semibold text-sm sm:text-base">
                {currentPromotion.title}
              </h3>
              <p className="text-xs sm:text-sm opacity-90">
                {currentPromotion.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Indicadores */}
            {activePromotions.length > 1 && (
              <div className="flex space-x-1">
                {activePromotions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            )}
            
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 