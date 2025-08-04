'use client'

import { AlertCircle, Eye, EyeOff, Lock, Mail, Phone, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface FormData {
  name: string
  email: string
  password: string
  phone: string
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  phone?: string
  general?: string
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const { login, register, loginWithGoogle, loginWithFacebook, loading } = useAuth()
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    phone: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})

  // Resetar formulário quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', email: '', password: '', phone: '' })
      setErrors({})
      setActiveTab('login')
      setShowPassword(false)
    }
  }, [isOpen])

  // Fechar modal com ESC
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Validação de email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validação de telefone brasileiro
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/
    return phoneRegex.test(phone)
  }

  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    if (activeTab === 'register') {
      if (!formData.name) {
        newErrors.name = 'Nome é obrigatório'
      } else if (formData.name.length < 2) {
        newErrors.name = 'Nome deve ter pelo menos 2 caracteres'
      }

      if (!formData.phone) {
        newErrors.phone = 'Telefone é obrigatório'
      } else if (!validatePhone(formData.phone)) {
        newErrors.phone = 'Telefone inválido. Use formato: (11) 99999-9999'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Formatação automática do telefone
  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    
    if (numbers.length <= 2) {
      return `(${numbers}`
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
    }
    
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  // Manipular mudanças no input
  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === 'phone') {
      value = formatPhone(value)
    }
    
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro do campo quando usuário digita
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Manipular submit do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setErrors({})
      
      if (activeTab === 'login') {
        await login(formData.email, formData.password)
      } else {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        })
      }
      
      // Sucesso - fechar modal e executar callback
      onClose()
      onSuccess?.()
      
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Erro desconhecido' })
    }
  }

  // Manipular login social
  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      setErrors({})
      
      if (provider === 'google') {
        await loginWithGoogle()
      } else {
        await loginWithFacebook()
      }
      
      onClose()
      onSuccess?.()
      
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Erro no login social' })
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div 
        className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 id="login-modal-title" className="text-2xl font-bold text-gray-900">
            {activeTab === 'login' ? 'Entrar' : 'Criar Conta'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 text-gray-500 hover:text-gray-700"
            aria-label="Fechar modal"
            title="Fechar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('login')}
            disabled={loading}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors disabled:opacity-50 ${
              activeTab === 'login'
                ? 'border-b-2 border-orange-500 text-orange-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setActiveTab('register')}
            disabled={loading}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors disabled:opacity-50 ${
              activeTab === 'register'
                ? 'border-b-2 border-orange-500 text-orange-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Criar Conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Alert */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700 text-sm">{errors.general}</span>
            </div>
          )}

          {/* Nome (só no registro) */}
          {activeTab === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-gray-900 placeholder-gray-500 bg-white disabled:bg-gray-50 disabled:text-gray-600 ${
                    errors.name 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-orange-500'
                  }`}
                  placeholder="Seu nome completo"
                  disabled={loading}
                />
              </div>
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-gray-900 placeholder-gray-500 bg-white disabled:bg-gray-50 disabled:text-gray-600 ${
                  errors.email 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-orange-500'
                }`}
                placeholder="seu@email.com"
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Telefone (só no registro) */}
          {activeTab === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-gray-900 placeholder-gray-500 bg-white disabled:bg-gray-50 disabled:text-gray-600 ${
                    errors.phone 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-orange-500'
                  }`}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  disabled={loading}
                />
              </div>
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          )}

          {/* Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-gray-900 placeholder-gray-500 bg-white disabled:bg-gray-50 disabled:text-gray-600 ${
                  errors.password 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-orange-500'
                }`}
                placeholder="Sua senha"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password}</p>
            )}
            {activeTab === 'register' && !errors.password && (
              <p className="text-gray-500 text-sm mt-1">Mínimo de 6 caracteres</p>
            )}
          </div>

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading 
              ? 'Aguarde...' 
              : activeTab === 'login' 
                ? 'Entrar' 
                : 'Criar Conta'
            }
          </button>

          {/* Divisor */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700">Continuar com Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-gray-700">Continuar com Facebook</span>
            </button>
          </div>

          {/* Link para trocar de tab */}
          <div className="text-center pt-4">
            {activeTab === 'login' ? (
              <p className="text-gray-600 text-sm">
                Não tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  disabled={loading}
                  className="text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50"
                >
                  Criar conta
                </button>
              </p>
            ) : (
              <p className="text-gray-600 text-sm">
                Já tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  disabled={loading}
                  className="text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50"
                >
                  Entrar
                </button>
              </p>
            )}
          </div>

          {/* Botão Cancelar */}
          <div className="pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}