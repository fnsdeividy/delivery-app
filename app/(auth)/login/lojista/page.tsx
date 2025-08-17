'use client'

import { useCardapioAuth } from '@/hooks'
import { ArrowLeft, Eye, EyeOff, Store } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useToast } from '@/components/Toast'
import { FormValidation, useFormValidation } from '@/components/FormValidation'

export default function LojistaLogin() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isLoading, error } = useCardapioAuth()
  const { addToast } = useToast()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    storeSlug: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  // Validação de formulário
  const { errors, validateForm, clearErrors, getFieldError, isFieldTouched, markFieldAsTouched } = useFormValidation()

  // Pré-preencher slug se vier da URL e mostrar mensagem
  useEffect(() => {
    const slug = searchParams.get('slug')
    const message = searchParams.get('message')

    if (slug) {
      setFormData(prev => ({ ...prev, storeSlug: slug }))
    }

    if (message) {
      addToast({
        type: 'info',
        title: 'Informação',
        message: message
      })
    }
  }, [searchParams, addToast])

  // Mostrar erro de login como toast
  useEffect(() => {
    if (error) {
      addToast({
        type: 'error',
        title: 'Erro no Login',
        message: error
      })
    }
  }, [error, addToast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Limpar erros anteriores
    clearErrors()

    // Validação usando o hook de validação
    const validationRules = {
      email: [
        { required: true, fieldName: 'Email' },
        {
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          fieldName: 'Email',
          message: 'Email deve ter um formato válido'
        }
      ],
      password: [
        { required: true, fieldName: 'Senha' },
        { minLength: 6, fieldName: 'Senha' }
      ],
      storeSlug: [
        { required: true, fieldName: 'Slug da Loja' },
        { minLength: 2, fieldName: 'Slug da Loja' }
      ]
    }

    const isValid = validateForm(formData, validationRules)
    if (!isValid) {
      addToast({
        type: 'error',
        title: 'Erro de Validação',
        message: 'Por favor, corrija os campos obrigatórios'
      })
      return
    }

    // Fazer login usando o hook unificado
    // O hook irá lidar com o redirecionamento em caso de sucesso
    login({
      email: formData.email,
      password: formData.password,
      storeSlug: formData.storeSlug
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // Mostrar loading enquanto verifica sessão
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando sessão...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Painel do Lojista
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Gerencie sua loja e pedidos
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Slug da Loja */}
            <div>
              <label htmlFor="storeSlug" className="block text-sm font-medium text-gray-700">
                Slug da Loja <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="storeSlug"
                  name="storeSlug"
                  type="text"
                  required
                  value={formData.storeSlug}
                  onChange={handleInputChange}
                  onBlur={() => markFieldAsTouched('storeSlug')}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-black ${isFieldTouched('storeSlug') && getFieldError('storeSlug')
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300'
                    }`}
                  placeholder="ex: minha-loja"
                />
              </div>
              {isFieldTouched('storeSlug') && getFieldError('storeSlug') && (
                <p className="mt-1 text-xs text-red-600">{getFieldError('storeSlug')?.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Identificador único da sua loja (ex: boteco-do-joao)
              </p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email do Lojista <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={() => markFieldAsTouched('email')}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-black ${isFieldTouched('email') && getFieldError('email')
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300'
                    }`}
                  placeholder="seu@email.com"
                />
              </div>
              {isFieldTouched('email') && getFieldError('email') && (
                <p className="mt-1 text-xs text-red-600">{getFieldError('email')?.message}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={() => markFieldAsTouched('password')}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-black ${isFieldTouched('password') && getFieldError('password')
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300'
                    }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {isFieldTouched('password') && getFieldError('password') && (
                <p className="mt-1 text-xs text-red-600">{getFieldError('password')?.message}</p>
              )}
            </div>

            {/* Validação de Formulário */}
            <FormValidation errors={errors} onClearErrors={clearErrors} />

            {/* Demo credentials */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <h4 className="text-blue-700 text-sm font-medium mb-2">
                Credenciais de Demo:
              </h4>
              <div className="text-blue-600 text-xs space-y-1">
                <p><strong>Email:</strong> admin@boteco.com</p>
                <p><strong>Senha:</strong> 123456</p>
                <p><strong>Loja:</strong> boteco-do-joao</p>
              </div>
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <Store className="h-5 w-5 text-orange-500 group-hover:text-orange-400" />
                </span>
                {isLoading ? 'Entrando...' : 'Acessar Dashboard'}
              </button>
            </div>

            {/* Links */}
            <div className="flex items-center justify-between">
              <Link
                href="/login/lojista"
                className="text-sm text-orange-600 hover:text-orange-500"
              >
                Login de cliente
              </Link>
              <Link
                href="/"
                className="flex items-center text-sm text-gray-600 hover:text-gray-500"
              >
                <ArrowLeft className="w-4 w-4 mr-1" />
                Voltar ao início
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}