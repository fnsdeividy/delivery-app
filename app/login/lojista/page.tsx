'use client'

import { ArrowLeft, Eye, EyeOff, Store } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LojistaLogin() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    storeSlug: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // TODO: Implementar autenticação real
      // Por enquanto, simulamos login
      
      if (!formData.email || !formData.password || !formData.storeSlug) {
        throw new Error('Todos os campos são obrigatórios')
      }

      // Simular validação
      if (formData.email === 'admin@boteco.com' && formData.password === '123456' && formData.storeSlug === 'boteco-do-joao') {
        // Simular token de autenticação
        document.cookie = 'store-auth-token=fake-jwt-token; path=/; max-age=86400'
        
        // Redirecionar para dashboard
        router.push(`/dashboard/${formData.storeSlug}`)
      } else {
        throw new Error('Credenciais inválidas ou loja não encontrada')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center animate-bounce-gentle">
          <Store className="h-12 w-12 text-blue-600 animate-float" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 animate-slide-in-top animate-delay-200">
          Painel do Lojista
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 animate-slide-in-top animate-delay-300">
          Acesse o dashboard da sua loja
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 animate-scale-in animate-delay-500">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm animate-shake animate-slide-in-top">
                {error}
              </div>
            )}

            {/* Demo credentials */}
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm animate-slide-in-left animate-delay-700">
              <strong>Demo:</strong> admin@boteco.com / 123456 / boteco-do-joao
            </div>

            <div className="animate-slide-in-left stagger-item">
              <label htmlFor="storeSlug" className="block text-sm font-medium text-gray-700">
                Slug da Loja
              </label>
              <div className="mt-1">
                <input
                  id="storeSlug"
                  name="storeSlug"
                  type="text"
                  required
                  value={formData.storeSlug}
                  onChange={handleInputChange}
                  placeholder="ex: boteco-do-joao"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-blackfocus:outline-none focus:ring-blue-500 focus:border-blue-500 search-focus transition-all duration-300"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                O identificador único da sua loja (usado na URL)
              </p>
            </div>

            <div className="animate-slide-in-left stagger-item">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-blackfocus:outline-none focus:ring-blue-500 focus:border-blue-500 search-focus transition-all duration-300"
                />
              </div>
            </div>

            <div className="animate-slide-in-left stagger-item">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
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
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-blackfocus:outline-none focus:ring-blue-500 focus:border-blue-500 search-focus transition-all duration-300"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover-scale transition-transform duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Lembrar de mim
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            <div className="animate-slide-in-left stagger-item">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed btn-primary transition-all duration-300"
              >
                {loading ? 'Entrando...' : 'Entrar no Dashboard'}
              </button>
            </div>
          </form>

          <div className="mt-6 animate-fade-in animate-delay-700">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Não tem uma loja?</span>
              </div>
            </div>

            <div className="mt-6">
              <a
                href="/registro/loja"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover-lift transition-all duration-300"
              >
                Cadastrar Nova Loja
              </a>
            </div>
          </div>

          <div className="mt-6 text-center animate-fade-in animate-delay-700">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 hover-lift transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar ao início
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}