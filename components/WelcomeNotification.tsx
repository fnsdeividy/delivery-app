'use client'

import { Bell, X } from 'lucide-react'
import { useState } from 'react'

interface WelcomeNotificationProps {
  message?: string
}

export default function WelcomeNotification({ message = 'Bem-vindo ao seu dashboard!' }: WelcomeNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Bell className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-blue-800">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={() => setIsVisible(false)}
            className="inline-flex text-blue-400 hover:text-blue-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
} 