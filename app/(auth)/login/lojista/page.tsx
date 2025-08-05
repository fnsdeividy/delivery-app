'use client'

import { ArrowLeft, Eye, EyeOff, Store } from 'lucide-react'
import { getSession, signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LojistaLogin() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    storeSlug: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Pré-preencher slug se vier da URL
  useEffect(() => {
    const slug = searchParams.get('slug')
    if (slug) {
      setFormData(prev => ({ ...prev, storeSlug: slug }))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.email || !formData.password || !formData.storeSlug) {
        throw new Error('Todos os campos são obrigatórios')
      }

      // Fazer login com NextAuth
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        userType: 'lojista',
        storeSlug: formData.storeSlug,
        redirect: false
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      if (result?.ok) {
        // Buscar sessão para verificar role
        const session = await getSession()
        
        if (session?.user?.role === 'admin') {
          // Redirecionar para dashboard da loja
          router.push(`/dashboard/${formData.storeSlug}`)
        } else if (session?.user?.role === 'super_admin') {
          // Super admin pode acessar qualquer dashboard
          router.push(`/dashboard/${formData.storeSlug}`)
        } else {
          throw new Error('Tipo de usuário inválido para esta área')
        }
      }
    } catch (err) {
      console.error('Erro no login:', err)
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-black"
                  placeholder="ex: minha-loja"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Identificador único da sua loja (ex: boteco-do-joao)
              </p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email do Lojista
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-black"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-black"
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
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

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
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <Store className="h-5 w-5 text-orange-500 group-hover:text-orange-400" />
                </span>
                {loading ? 'Entrando...' : 'Acessar Dashboard'}
              </button>
            </div>

            {/* Links */}
            <div className="flex items-center justify-between">
              <Link
                href="/login"
                className="text-sm text-orange-600 hover:text-orange-500"
              >
                Login de cliente
              </Link>
              <Link
                href="/"
                className="flex items-center text-sm text-gray-600 hover:text-gray-500"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar ao início
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}