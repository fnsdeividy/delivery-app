'use client'

import { CheckCircle, WarningCircle } from '@phosphor-icons/react'

interface StatusMessageProps {
  message: { type: 'success' | 'error', text: string } | null
}

export function StatusMessage({ message }: StatusMessageProps) {
  if (!message) return null

  return (
    <div className={`mb-6 p-4 rounded-lg border ${
      message.type === 'success' 
        ? 'bg-green-50 border-green-200 text-green-800' 
        : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      <div className="flex items-center space-x-2">
        {message.type === 'success' ? (
          <CheckCircle className="h-5 w-5" />
        ) : (
          <WarningCircle className="h-5 w-5" />
        )}
        <span>{message.text}</span>
      </div>
    </div>
  )
}