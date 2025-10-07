'use client'

import { useAuthContext } from '@/contexts/AuthContext'
import { UserRole } from '@/types/cardapio-api'
import React, { useState } from 'react'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  storeSlug?: string
}

export function LoginModal({ isOpen, onClose, onSuccess, storeSlug }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>(UserRole.CLIENTE)

  const { login, register, isAuthenticated } = useAuthContext()

  // Se já estiver autenticado, fechar modal
  React.useEffect(() => {
    if (isAuthenticated) {
      onClose()
    }
  }, [isAuthenticated, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (isRegister) {
        await register({
          email,
          password,
          name,
          role,
          storeSlug,
        })
      } else {
        await login(email, password, storeSlug)
      }
      
      // Limpar formulário
      setEmail('')
      setPassword('')
      setName('')
      setRole(UserRole.CLIENTE)
      
      // Chamar callback de sucesso se fornecido
      if (onSuccess) {
        onSuccess()
      }
      
      // Fechar modal
      onClose()
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login/registro')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setError('')
      setEmail('')
      setPassword('')
      setName('')
      setRole(UserRole.CLIENTE)
      setIsRegister(false)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isRegister ? 'Criar Conta' : 'Entrar'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
          )}

          {isRegister && (
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Usuário
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value={UserRole.CLIENTE}>Cliente</option>
                <option value={UserRole.ADMIN}>Lojista</option>
                <option value={UserRole.MANAGER}>Gerente</option>
                <option value={UserRole.EMPLOYEE}>Funcionário</option>
              </select>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Carregando...' : isRegister ? 'Criar Conta' : 'Entrar'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-600 hover:text-blue-800 text-sm"
            disabled={isLoading}
          >
            {isRegister ? 'Já tem uma conta? Entrar' : 'Não tem uma conta? Criar conta'}
          </button>
        </div>

        {storeSlug && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Acessando loja: <span className="font-medium">{storeSlug}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginModal