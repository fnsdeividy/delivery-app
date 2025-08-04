'use client'

import {
    BarChart3,
    Clock,
    CreditCard,
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    Palette,
    Settings,
    ShoppingBag,
    Truck,
    X
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useStoreConfig } from '../../lib/store/useStoreConfig'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Extrair slug da URL
  const pathParts = pathname.split('/')
  const slug = pathParts[2]
  
  const { config, loading } = useStoreConfig(slug)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loja não encontrada</h1>
          <p className="text-gray-600">Verifique se o endereço está correto.</p>
        </div>
      </div>
    )
  }

  const navigation = [
    {
      name: 'Visão Geral',
      href: `/dashboard/${slug}`,
      icon: LayoutDashboard,
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
      icon: BarChart3,
      current: pathname.startsWith(`/dashboard/${slug}/analytics`)
    },
    {
      name: 'Configurações',
      href: `/dashboard/${slug}/configuracoes`,
      icon: Settings,
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
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 dashboard-sidebar ${
        sidebarOpen ? 'translate-x-0 animate-slide-in-left' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 animate-fade-in">
          <div className="flex items-center space-x-3">
            {config.branding.logo && (
              <img 
                src={config.branding.logo} 
                alt={config.name}
                className="h-8 w-auto hover-scale"
              />
            )}
            <h2 className="text-lg font-semibold text-gray-900 truncate animate-slide-in-left animate-delay-200">
              {config.name}
            </h2>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3 animate-slide-in-left animate-delay-300">
          <div className="space-y-1">
            {navigation.map((item, index) => (
              <div key={item.name} className="stagger-item" style={{ animationDelay: `${0.4 + index * 0.1}s` }}>
                <a
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 hover-lift ${
                    item.current
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700 animate-glow'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
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
            ))}
          </div>
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">U</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Usuário</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            </div>
            <button
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Dashboard</span>
              <a
                href={`/loja/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Ver Loja
              </a>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}