'use client'

import { ArrowRight, Settings, ShoppingCart, Store, Users } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import LoadingSpinner from '../../../../components/LoadingSpinner'

export default function MeusPainelPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (session?.user) {
      setLoading(false)
    }
  }, [session, status, router])

  const handleAccessStore = (storeSlug: string) => {
    router.push(`/dashboard/${storeSlug}`)
  }

  const handleManageStores = () => {
    router.push('/dashboard/gerenciar-lojas')
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Carregando seu painel...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Você precisa estar logado para acessar esta página.</p>
        </div>
      </div>
    )
  }

  const { user } = session

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Store className="h-6 w-6 text-orange-500" />
              <h1 className="text-xl font-semibold text-gray-900">Meu Painel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Olá, {user.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informações do Usuário */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-600">{user.email}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.role === 'SUPER_ADMIN' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user.role === 'SUPER_ADMIN' ? 'Super Administrador' : 'Lojista'}
              </span>
            </div>
          </div>
        </div>

        {/* Ações Baseadas no Role */}
        {user.role === 'SUPER_ADMIN' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Gerenciar Lojas */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Store className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Gerenciar Lojas</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Visualize e gerencie todas as lojas do sistema
              </p>
              <button
                onClick={handleManageStores}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <span>Acessar</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Estatísticas Gerais */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Pedidos</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Visualize pedidos de todas as lojas
              </p>
              <div className="text-2xl font-bold text-green-600">0</div>
              <p className="text-xs text-gray-500">Pedidos hoje</p>
            </div>

            {/* Configurações do Sistema */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-5 w-5 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Configurações</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Configure o sistema global
              </p>
              <button
                disabled
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
              >
                <span>Em breve</span>
              </button>
            </div>
          </div>
        ) : (
          // Lojista - Acesso direto à sua loja
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {user.storeSlug ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Store className="h-8 w-8 text-orange-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Sua Loja</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Acesse o painel de controle da sua loja
                </p>
                <button
                  onClick={() => handleAccessStore(user.storeSlug!)}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors mx-auto"
                >
                  <span>Acessar Painel</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Store className="h-8 w-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma Loja Encontrada</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Você ainda não possui uma loja cadastrada
                </p>
                <button
                  onClick={() => router.push('/register/loja')}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors mx-auto"
                >
                  <span>Criar Nova Loja</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Informações Adicionais */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Como usar o painel</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {user.role === 'SUPER_ADMIN' ? (
              <>
                <li>• Use "Gerenciar Lojas" para ver todas as lojas do sistema</li>
                <li>• Monitore pedidos e estatísticas gerais</li>
                <li>• Configure o sistema global quando necessário</li>
              </>
            ) : (
              <>
                <li>• Acesse seu painel para gerenciar produtos, pedidos e configurações</li>
                <li>• Personalize a aparência da sua loja</li>
                <li>• Configure horários de funcionamento</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
} 