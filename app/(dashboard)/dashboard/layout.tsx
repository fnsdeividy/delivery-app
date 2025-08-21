'use client'

import {
  ChartBar,
  Clock,
  CreditCard,
  Crown,
  Gear,
  House,
  Layout,
  List,
  Package,
  Palette,
  ShoppingBag,
  SignOut,
  Storefront,
  Truck,
  X
} from '@phosphor-icons/react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { UserStoreStatus } from '../../../components/UserStoreStatus'
import WelcomeNotification from '../../../components/WelcomeNotification'
import { useStores } from '../../../hooks'
import { useStoreConfig } from '../../../lib/store/useStoreConfig'
import './dashboard.css'

interface DashboardLayoutProps {
  children: React.ReactNode
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  current: boolean
  children?: NavigationItem[]
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Extrair slug da URL - considerar rotas especiais
  const pathParts = pathname.split('/')
  let slug = ''
  
  // Para rotas especiais, não extrair slug
  if (pathname.startsWith('/dashboard/editar-loja/') || 
      pathname.startsWith('/dashboard/gerenciar-lojas') ||
      pathname.startsWith('/dashboard/meus-painel') ||
      pathname.startsWith('/dashboard/admin') ||
      pathname.startsWith('/dashboard/superadmin') ||
      pathname === '/dashboard') {
    slug = ''
  } else if (pathParts.length > 2) {
    // Filtrar partes vazias e encontrar o primeiro slug válido
    const validParts = pathParts.filter(part => part && part.trim() !== '')
    if (validParts.length > 1) {
      const possibleSlug = validParts[1] // [0] é 'dashboard', [1] é o slug
      if (!['editar-loja', 'gerenciar-lojas', 'meus-painel', 'admin', 'superadmin'].includes(possibleSlug)) {
        slug = possibleSlug
      }
    }
  }
  
  // Para a página raiz do dashboard, não precisamos carregar configuração de loja
  const shouldLoadStoreConfig = slug && slug !== 'editar-loja' && slug !== 'gerenciar-lojas' && slug !== 'meus-painel' && slug !== 'admin' && slug !== 'superadmin'
  
  // Sempre chamar o hook, mas passar slug vazio quando não precisamos carregar
  const { config, loading, error } = useStoreConfig(shouldLoadStoreConfig ? slug : '')

  // Buscar lojas do usuário para navegação
  const { data: storesData } = useStores()
  const userStores = storesData?.data || []

  // Mostrar loading apenas quando estamos carregando configurações de uma loja específica
  if (loading && shouldLoadStoreConfig && slug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Permitir acesso à página de gerenciar lojas e página raiz do dashboard mesmo sem slug válido
  if (!config && shouldLoadStoreConfig && slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loja não encontrada</h1>
          <p className="text-gray-600">Verifique se o endereço está correto.</p>
        </div>
      </div>
    )
  }

  // Navegação principal sempre disponível
  const mainNavigation: NavigationItem[] = [
    {
      name: 'Minhas Lojas',
      href: '/dashboard/meus-painel',
      icon: House,
      current: pathname === '/dashboard/meus-painel'
    },
    {
      name: 'Gerenciar Lojas',
      href: '/dashboard/gerenciar-lojas',
      icon: Storefront,
      current: pathname === '/dashboard/gerenciar-lojas'
    },
    {
      name: 'Dashboard Admin',
      href: '/dashboard/admin',
      icon: Crown,
      current: pathname === '/dashboard/admin'
    }
  ]

  // Navegação por loja específica
  const storeNavigation: NavigationItem[] = slug ? [
    {
      name: 'Visão Geral',
      href: `/dashboard/${slug}`,
      icon: Layout,
      current: pathname === `/dashboard/${slug}`
    },
    {
      name: 'Produtos',
      href: `/dashboard/${slug}/produtos`,
      icon: Package,
      current: pathname.startsWith(`/dashboard/${slug}/produtos`)
    },
    {
      name: 'Pedidos',
      href: `/dashboard/${slug}/pedidos`,
      icon: ShoppingBag,
      current: pathname.startsWith(`/dashboard/${slug}/pedidos`)
    },
    {
      name: 'Analytics',
      href: `/dashboard/${slug}/analytics`,
      icon: ChartBar,
      current: pathname.startsWith(`/dashboard/${slug}/analytics`)
    },
    {
      name: 'Configurações',
      href: `/dashboard/${slug}/configuracoes`,
      icon: Gear,
      current: pathname.startsWith(`/dashboard/${slug}/configuracoes`),
      children: [
        {
          name: 'Visual',
          href: `/dashboard/${slug}/configuracoes/visual`,
          icon: Palette,
          current: pathname === `/dashboard/${slug}/configuracoes/visual`
        },
        {
          name: 'Entrega',
          href: `/dashboard/${slug}/configuracoes/entrega`,
          icon: Truck,
          current: pathname === `/dashboard/${slug}/configuracoes/entrega`
        },
        {
          name: 'Pagamento',
          href: `/dashboard/${slug}/configuracoes/pagamento`,
          icon: CreditCard,
          current: pathname === `/dashboard/${slug}/configuracoes/pagamento`
        },
        {
          name: 'Horários',
          href: `/dashboard/${slug}/configuracoes/horarios`,
          icon: Clock,
          current: pathname === `/dashboard/${slug}/configuracoes/horarios`
        }
      ]
    }
  ] : []

  // Navegação completa
  const navigation = [...mainNavigation, ...storeNavigation]

  return (
    <div className="dashboard-layout">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200/60">
          <div className="flex items-center space-x-3">
            {config?.branding?.logo ? (
              <img 
                src={config.branding.logo} 
                alt={config.name || 'Logo'}
                className="h-8 w-auto hover-scale"
              />
            ) : (
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Storefront className="h-5 w-5 text-white" />
              </div>
            )}
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {config?.name || 'Dashboard'}
            </h2>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.length > 0 ? navigation.map((item, index) => (
              <div key={item.name}>
                <a
                  href={item.href}
                  className={`dashboard-nav-button group flex items-center px-3 py-3 text-sm font-medium ${
                    item.current
                      ? 'active'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </a>

                {/* Submenu */}
                {item.children && item.current && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <a
                        key={child.name}
                        href={child.href}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          child.current
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <child.icon
                          className={`mr-3 h-4 w-4 ${
                            child.current ? 'text-blue-500' : 'text-gray-400'
                          }`}
                        />
                        {child.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">Navegação não disponível</p>
              </div>
            )}
          </div>

          {/* Seletor de Loja Ativa */}
          {userStores.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200/60">
              <div className="px-3 mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Lojas Disponíveis
                </h3>
              </div>
              <div className="space-y-1">
                {userStores.slice(0, 5).map((store) => (
                  <a
                    key={store.slug}
                    href={`/dashboard/${store.slug}`}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname === `/dashboard/${store.slug}`
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Storefront className="mr-3 h-4 w-4 text-gray-400" />
                    <span className="truncate">{store.name}</span>
                  </a>
                ))}
                {userStores.length > 5 && (
                  <div className="px-3 py-2">
                    <p className="text-xs text-gray-500">
                      +{userStores.length - 5} mais lojas
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/60 bg-gradient-to-t from-gray-50/80 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                <span className="text-sm">U</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Usuário</p>
                <p className="text-xs text-gray-500 font-medium">Administrador</p>
              </div>
            </div>
            <button
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Sair"
            >
              <SignOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="dashboard-main-layout">
        {/* Top bar */}
        <div className="dashboard-main-header sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
            >
              <List className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              {/* Breadcrumb */}
              <nav className="breadcrumb">
                <span className="breadcrumb-item">Dashboard</span>
                {slug && slug !== 'gerenciar-lojas' && (
                  <span className="breadcrumb-item">{slug}</span>
                )}
              </nav>
              
              {slug && slug !== 'gerenciar-lojas' && (
                <a
                  href={`/loja/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Ver Loja
                </a>
              )}

              {/* Status do usuário e loja atual */}
              <UserStoreStatus />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="dashboard-main-content">
          <div className="dashboard-container">
            {children}
          </div>
        </main>
      </div>

      {/* Welcome Notification */}
      <WelcomeNotification />
    </div>
  )
}