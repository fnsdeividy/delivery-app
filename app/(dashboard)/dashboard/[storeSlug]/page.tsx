'use client'

import LoadingSpinner from '@/components/LoadingSpinner'
import { useCardapioAuth } from '@/hooks'
import { BarChart3, Clock, CreditCard, Package, Settings, ShoppingBag, Store, Users } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { isAuthenticated, getCurrentToken } = useCardapioAuth()
  
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userStoreSlug, setUserStoreSlug] = useState<string | null>(null)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    console.log('🏪 Dashboard: Página carregada com slug:', slug)
    console.log('🔑 Dashboard: Verificando autenticação...')
    
    const checkAuth = async () => {
      try {
        // Verificar se está autenticado
        if (!isAuthenticated()) {
          console.log('❌ Dashboard: Usuário não autenticado, redirecionando para login')
          router.push('/login/lojista')
          return
        }

        // Obter token e decodificar
        const token = getCurrentToken()
        if (!token) {
          console.log('❌ Dashboard: Token não encontrado, redirecionando para login')
          router.push('/login/lojista')
          return
        }

        // Decodificar token JWT
        const payload = JSON.parse(atob(token.split('.')[1]))
        console.log('🔓 Dashboard: Token decodificado:', payload)
        
        setUserRole(payload.role)
        setUserStoreSlug(payload.storeSlug)

        // Verificar permissões
        if (payload.role === 'SUPER_ADMIN') {
          // Super admin pode acessar qualquer dashboard
          console.log('✅ Dashboard: Super admin - acesso permitido')
          setHasAccess(true)
        } else if (payload.role === 'ADMIN') {
          // ADMIN pode acessar apenas sua própria loja
          if (payload.storeSlug === slug) {
            console.log('✅ Dashboard: ADMIN acessando sua própria loja - permitido')
            setHasAccess(true)
          } else if (payload.storeSlug === null) {
            // ADMIN sem loja específica - redirecionar para gerenciar lojas
            console.log('🔄 Dashboard: ADMIN sem loja específica - redirecionando para gerenciar-lojas')
            router.push('/dashboard/gerenciar-lojas')
            return
          } else {
            // ADMIN tentando acessar loja diferente
            console.log('❌ Dashboard: ADMIN tentando acessar loja diferente - Sua:', payload.storeSlug, 'Tentando:', slug)
            router.push('/unauthorized')
            return
          }
        } else {
          // Usuário sem permissão
          console.log('❌ Dashboard: Usuário sem permissão - Role:', payload.role)
          router.push('/unauthorized')
          return
        }
      } catch (error) {
        console.error('❌ Dashboard: Erro ao verificar autenticação:', error)
        router.push('/login/lojista')
        return
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [slug, isAuthenticated, getCurrentToken, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar este dashboard.</p>
          <Link
            href="/dashboard/gerenciar-lojas"
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Voltar para Gerenciar Lojas
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <Store className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard da Loja</h1>
                <p className="text-sm text-gray-600">Slug: {slug}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Logado como: <span className="font-medium">{userRole}</span>
              </span>
              {userStoreSlug && (
                <span className="text-sm text-gray-500">
                  Loja: <span className="font-medium">{userStoreSlug}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-orange-600"
              >
                Dashboard
              </Link>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-sm font-medium text-gray-500">{slug}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Status da Autenticação */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Status da Autenticação
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500">Token JWT:</span>
              <span className="ml-2 text-sm text-green-600">✅ Presente</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500">Role:</span>
              <span className="ml-2 text-sm text-gray-900">{userRole}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500">Slug da Loja:</span>
              <span className="ml-2 text-sm text-gray-900">{slug}</span>
            </div>
          </div>
        </div>

        {/* Cards de Navegação */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href={`/dashboard/${slug}/produtos`}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Produtos</h3>
                <p className="text-sm text-gray-600">Gerenciar catálogo</p>
              </div>
            </div>
          </Link>

          <Link
            href={`/dashboard/${slug}/pedidos`}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <ShoppingBag className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Pedidos</h3>
                <p className="text-sm text-gray-600">Acompanhar vendas</p>
              </div>
            </div>
          </Link>

          <Link
            href={`/dashboard/${slug}/analytics`}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
                <p className="text-sm text-gray-600">Relatórios e métricas</p>
              </div>
            </div>
          </Link>

          <Link
            href={`/dashboard/${slug}/configuracoes`}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Configurações</h3>
                <p className="text-sm text-gray-600">Personalizar loja</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Informações Adicionais */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Horário de Funcionamento</h3>
                <p className="text-sm text-gray-600">Segunda a Sábado: 8h às 18h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <CreditCard className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Formas de Pagamento</h3>
                <p className="text-sm text-gray-600">PIX, Cartão, Dinheiro</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Suporte</h3>
                <p className="text-sm text-gray-600">Atendimento 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}