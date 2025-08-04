'use client'

import { CheckCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface NotificationProps {
  message: string
  isVisible: boolean
  onClose: () => void
}

export default function Notification({ message, isVisible, onClose }: NotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setIsAnimating(false)
        setTimeout(onClose, 300)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-80">
        <CheckCircle className="h-5 w-5 flex-shrink-0" />
        <span className="flex-1">{message}</span>
        <button
          onClick={() => {
            setIsAnimating(false)
            setTimeout(onClose, 300)
          }}
          className="flex-shrink-0 hover:bg-green-600 rounded-full p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
} 