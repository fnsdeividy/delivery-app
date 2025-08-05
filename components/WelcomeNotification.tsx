'use client'

import { CheckCircle, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface WelcomeNotificationProps {
  storeName?: string
}

export default function WelcomeNotification({ storeName }: WelcomeNotificationProps) {
  const searchParams = useSearchParams()
  const [isVisible, setIsVisible] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const welcome = searchParams.get('welcome')
    const messageParam = searchParams.get('message')
    
    if (welcome === 'true' && messageParam) {
      setIsVisible(true)
      setMessage(decodeURIComponent(messageParam))
    }
  }, [searchParams])

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border border-green-200 animate-in slide-in-from-right-2 duration-300">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-green-800">
              🎉 Bem-vindo ao Cardap.IO!
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>{message}</p>
              {storeName && (
                <p className="mt-1 font-medium">
                  Sua loja <strong>{storeName}</strong> está pronta para ser configurada!
                </p>
              )}
            </div>
            <div className="mt-3 text-xs text-green-600">
              <p>💡 <strong>Dica:</strong> Comece configurando seus produtos e horários de funcionamento.</p>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className="inline-flex text-green-400 hover:text-green-600 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 