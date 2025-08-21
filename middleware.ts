import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware para proteção de rotas com RBAC
 * Protege rotas do dashboard e super admin com verificação de escopo
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas públicas que não precisam de autenticação
  if (pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/store') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/v1') ||
    pathname.startsWith('/unauthorized') ||
    pathname.startsWith('/forbidden')) {

    return NextResponse.next()
  }

  // Proteger rotas de super admin
  if (pathname.startsWith('/admin')) {
    return await protectSuperAdminRoute(request)
  }

  // Proteger rotas do dashboard
  if (pathname.startsWith('/dashboard')) {
    return await protectDashboardRoute(request)
  }

  // Permitir acesso a outras rotas
  return NextResponse.next()
}

/**
 * Protege rotas do dashboard - usuários autenticados com acesso a lojas
 */
async function protectDashboardRoute(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar token JWT nos cookies, headers ou localStorage (via cookie de fallback)
  let token = request.cookies.get('cardapio_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '')

  // Log para debug
  console.log('🔍 Middleware Dashboard: Verificando token', {
    hasCardapioToken: !!request.cookies.get('cardapio_token')?.value,
    hasAuthorizationHeader: !!request.headers.get('authorization'),
    tokenFound: !!token,
    url: request.url
  })

  // Se não houver token no cookie, verificar se há um cookie de fallback do localStorage
  if (!token) {
    const fallbackToken = request.cookies.get('localStorage_token')?.value
    if (fallbackToken) {
      token = fallbackToken
      console.log('🔄 Middleware Dashboard: Usando token de fallback')
    }
  }

  if (!token) {
    // Redirecionar para login se não houver token
    return NextResponse.redirect(new URL('/login/lojista', request.url))
  }

  try {
    // Decodificar token para verificações básicas
    const payload = JSON.parse(atob(token.split('.')[1]))

    // Verificar se token não expirou
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return NextResponse.redirect(new URL('/login/lojista', request.url))
    }

    // Para rotas específicas de loja (/dashboard/[storeSlug]/*)
    const storeSlugMatch = pathname.match(/^\/dashboard\/([^\/]+)/)
    if (storeSlugMatch) {
      const storeSlug = storeSlugMatch[1]

      // Rotas especiais que não requerem slug específico
      const specialRoutes = ['gerenciar-lojas', 'meus-painel', 'editar-loja', 'selecionar-loja']
      if (specialRoutes.includes(storeSlug)) {
        return NextResponse.next()
      }

      // Para outras rotas, a validação detalhada será feita no componente
      // O middleware apenas garante que há autenticação básica
    }

    return NextResponse.next()
  } catch (error) {
    // Token inválido, redirecionar para login
    return NextResponse.redirect(new URL('/login/lojista', request.url))
  }
}

/**
 * Protege rotas de super admin - apenas SUPER_ADMIN
 */
async function protectSuperAdminRoute(request: NextRequest) {
  // Verificar token JWT nos cookies, headers ou localStorage (via cookie de fallback)
  let token = request.cookies.get('cardapio_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '')

  // Log para debug
  console.log('🔍 Middleware SuperAdmin: Verificando token', {
    hasCardapioToken: !!request.cookies.get('cardapio_token')?.value,
    hasAuthorizationHeader: !!request.headers.get('authorization'),
    tokenFound: !!token,
    url: request.url
  })

  // Se não houver token no cookie, verificar se há um cookie de fallback do localStorage
  if (!token) {
    const fallbackToken = request.cookies.get('localStorage_token')?.value
    if (fallbackToken) {
      token = fallbackToken
      console.log('🔄 Middleware SuperAdmin: Usando token de fallback')
    }
  }

  if (!token) {
    // Redirecionar para login de super admin se não houver token
    return NextResponse.redirect(new URL('/login/super-admin', request.url))
  }

  try {
    // Decodificar token para verificar role
    const payload = JSON.parse(atob(token.split('.')[1]))

    // Verificar se token não expirou
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return NextResponse.redirect(new URL('/login/super-admin', request.url))
    }

    // Verificar se é super admin
    if (payload.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    // Token inválido, redirecionar para login
    return NextResponse.redirect(new URL('/login/super-admin', request.url))
  }
}

/**
 * Configuração do middleware - rotas que devem ser processadas
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
} 