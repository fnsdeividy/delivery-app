'use client'

import { LogOut, Settings, User } from 'lucide-react'
import { useState } from 'react'

interface UserProfileProps {
  user?: {
    name: string
    email: string
  } | null
  onLogin: () => void
  onLogout: () => void
}

export default function UserProfile({ user, onLogin, onLogout }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!user) {
    return (
      <button
        onClick={onLogin}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
      >
        <User className="h-5 w-5" />
        <span>Entrar</span>
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
      >
        <User className="h-5 w-5" />
        <span>{user.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <div className="px-4 py-2 text-sm text-gray-700 border-b">
            <p className="font-medium">{user.name}</p>
            <p className="text-gray-500">{user.email}</p>
          </div>
          
          <button
            onClick={() => {
              setIsOpen(false)
              // Adicionar lógica para configurações
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </button>
          
          <button
            onClick={() => {
              setIsOpen(false)
              onLogout()
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </button>
        </div>
      )}
    </div>
  )
} 