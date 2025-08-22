'use client'

import { useAuthContext } from '@/contexts/AuthContext'
import { ChartLineUp, Crown, List, LockSimple, Package, Question, SignOut, Storefront, User, X } from '@phosphor-icons/react'
import Link from 'next/link'
import { memo, useEffect, useState } from 'react'
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui'

type NavLink = { 
  href: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  requiresAuth?: boolean
  description?: string
}

interface MobileMenuProps {
  /** Links de navegação exibidos no menu (opcional) */
  navLinks?: NavLink[]
  /** Define se o menu está aberto (controlado) */
  open?: boolean
  /** Callback quando o menu é aberto ou fechado */
  onOpenChange?: (open: boolean) => void
}

const DEFAULT_LINKS: NavLink[] = [
  { href: '/', label: 'Início', icon: ChartLineUp, description: 'Voltar para a página inicial' },
]

const AUTHENTICATED_LINKS: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: ChartLineUp, requiresAuth: true, description: 'Acompanhe suas métricas' },
  { href: '/pedidos', label: 'Meus Pedidos', icon: Package, requiresAuth: true, description: 'Visualize seu histórico' },
  { href: '/perfil', label: 'Perfil', icon: User, requiresAuth: true, description: 'Gerencie suas informações' },
]

export const MobileMenu = memo(function MobileMenu({ 
  navLinks = DEFAULT_LINKS, 
  open,
  onOpenChange 
}: MobileMenuProps) {
  const { user, isAuthenticated, logout, isLoading } = useAuthContext()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isInternalOpen, setIsInternalOpen] = useState(false)

  // Controlar estado aberto/fechado
  const isOpen = open !== undefined ? open : isInternalOpen
  const setIsOpen = onOpenChange || setIsInternalOpen

  useEffect(() => {
    // Fechar menu ao mudar de rota (melhoria de UX)
    const handleRouteChange = () => setIsOpen(false)
    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [setIsOpen])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      setIsOpen(false)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const allNavLinks = [
    ...navLinks,
    ...(isAuthenticated ? AUTHENTICATED_LINKS : [])
  ]

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden p-2 rounded-lg text-gray-700 hover:text-primary hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary transition-colors duration-200"
          aria-label="Abrir menu de navegação"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X className="size-6" aria-hidden="true" />
          ) : (
            <List className="size-6" aria-hidden="true" />
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-80 sm:w-96 p-0 data-[state=open]:animate-in data-[state=closed]:animate-out slide-in-from-right-10 duration-300 overflow-y-auto"
        aria-label="Menu de navegação"
        onInteractOutside={(e) => {
          // Prevenir fechamento durante logout
          if (isLoggingOut) e.preventDefault()
        }}
      >
        <div className="flex h-full flex-col bg-white dark:bg-gray-900">
          {/* Cabeçalho */}
          <SheetHeader className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-row items-center justify-between">
            <SheetTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center size-8 bg-primary/10 rounded-full text-primary">
                    <User className="size-4" />
                  </div>
                  <span className="truncate">{user?.name || 'Usuário'}</span>
                </div>
              ) : (
                'Menu'
              )}
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full size-8"
              onClick={() => setIsOpen(false)}
              aria-label="Fechar menu"
            >
              <X className="size-5" />
            </Button>
          </SheetHeader>

          {/* Texto de apoio */}
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {isAuthenticated 
                ? 'Gerencie seus pedidos, acompanhe vendas e configure sua loja digital de forma prática e segura.'
                : 'Entre na sua conta para acompanhar pedidos, gerenciar vendas e configurar sua loja digital de forma prática e segura.'
              }
            </p>
          </div>

          {/* Navegação principal */}
          <nav className="px-3 py-4 flex-1" aria-label="Navegação principal">
            <div className="mb-4 px-3">
              <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Navegação
              </h3>
            </div>
            <ul className="flex flex-col gap-1">
              {allNavLinks.map((link) => {
                const IconComponent = link.icon || Question
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors duration-200 group"
                      prefetch={false}
                      onClick={() => setIsOpen(false)}
                    >
                      <IconComponent 
                        className="size-5 flex-shrink-0 text-gray-500 group-hover:text-primary dark:text-gray-400" 
                        aria-hidden="true" 
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{link.label}</span>
                        {link.description && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {link.description}
                          </span>
                        )}
                      </div>
                      {link.requiresAuth && (
                        <LockSimple className="size-4 ml-auto text-gray-400 dark:text-gray-500" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Ações */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-800 space-y-4 bg-gray-50 dark:bg-gray-800/50">
            {isAuthenticated ? (
              <>
                {user?.stores && user.stores.length > 0 && (
                  <Button 
                    asChild 
                    variant="gradient" 
                    className="w-full gap-2 py-3"
                    size="lg"
                  >
                    <Link href="/dashboard" prefetch={false}>
                      <Storefront className="size-5" aria-hidden="true" />
                      Gerenciar Minha Loja
                    </Link>
                  </Button>
                )}
                
                <div className="flex gap-2">
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600"
                  >
                    <Link href="/perfil" prefetch={false} onClick={() => setIsOpen(false)}>
                      <User className="size-4 mr-2" aria-hidden="true" />
                      Perfil
                    </Link>
                  </Button>
                  
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    disabled={isLoggingOut}
                    className="flex-1 border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-600 dark:border-gray-700 dark:text-gray-300"
                  >
                    {isLoggingOut ? (
                      <>
                        <div className="size-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2" />
                        Saindo...
                      </>
                    ) : (
                      <>
                        <SignOut className="size-4 mr-2" aria-hidden="true" />
                        Sair
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="outline"
                  className="w-full gap-2 py-3 border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300"
                  size="lg"
                >
                  <Link href="/login" prefetch={false} onClick={() => setIsOpen(false)}>
                    <User className="size-5" aria-hidden="true" />
                    Acessar minha conta
                  </Link>
                </Button>

                <Button asChild variant="gradient" className="w-full gap-2 py-3" size="lg">
                  <Link
                    href="/register/loja"
                    prefetch={false}
                    onClick={() => setIsOpen(false)}
                  >
                    <Crown className="size-5" aria-hidden="true" />
                    Criar minha loja
                  </Link>
                </Button>
              </>
            )}

            {/* Observação de segurança/privacidade */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
              Ao continuar, você concorda com nossos{' '}
              <Link
                href="/termos"
                className="underline underline-offset-4 hover:no-underline hover:text-primary dark:hover:text-primary-300"
                prefetch={false}
                onClick={() => setIsOpen(false)}
              >
                Termos
              </Link>{' '}
              e{' '}
              <Link
                href="/privacidade"
                className="underline underline-offset-4 hover:no-underline hover:text-primary dark:hover:text-primary-300"
                prefetch={false}
                onClick={() => setIsOpen(false)}
              >
                Política de Privacidade
              </Link>
              .
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
})