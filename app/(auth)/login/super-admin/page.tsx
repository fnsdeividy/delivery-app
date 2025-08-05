'use client'

import { ArrowLeft, Crown, Eye, EyeOff } from 'lucide-react'
import { getSession, signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SuperAdminLogin() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Email e senha são obrigatórios')
      }

      // Fazer login com NextAuth
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        userType: 'super-admin',
        redirect: false
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      if (result?.ok) {
        // Buscar sessão para verificar role
        const session = await getSession()
        
        if (session?.user?.role === 'super_admin') {
          // Redirecionar para painel super admin
          router.push('/admin')
        } else {
          throw new Error('Acesso negado - apenas Super Admins')
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Crown className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Super Admin
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Painel de Administração do Sistema
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-purple-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email do Super Admin
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="admin@cardap.io"
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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

            {/* Security Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <div className="flex items-start">
                <Crown className="w-5 h-5 text-amber-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-amber-700 text-sm font-medium">
                    Área Restrita
                  </p>
                  <p className="text-amber-600 text-sm mt-1">
                    Este painel é exclusivo para administradores do sistema. 
                    Todas as ações são monitoradas e registradas.
                  </p>
                </div>
              </div>
            </div>

            {/* Demo credentials */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <h4 className="text-blue-700 text-sm font-medium mb-2">
                Credenciais de Demo:
              </h4>
              <div className="text-blue-600 text-xs space-y-1">
                <p><strong>Email:</strong> superadmin@cardap.io</p>
                <p><strong>Senha:</strong> admin123</p>
              </div>
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <Crown className="h-5 w-5 text-purple-300 group-hover:text-purple-200" />
                </span>
                {loading ? 'Autenticando...' : 'Acessar Painel Admin'}
              </button>
            </div>

            {/* Links */}
            <div className="flex items-center justify-between">
              <Link
                href="/login"
                className="text-sm text-purple-600 hover:text-purple-500"
              >
                Login regular
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