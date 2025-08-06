import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware para proteger rotas e gerenciar autenticação multi-porta
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Permitir rotas de registro e API
  if (pathname.startsWith('/register') || pathname.startsWith('/api/auth/register')) {
    return NextResponse.next()
  }
  
  // Obter token JWT do NextAuth
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  // Proteger rotas do dashboard (lojistas - porta 3001)
  if (pathname.startsWith('/dashboard')) {
    return await protectDashboardRoute(request, token)
  }
  
  // Proteger rotas do super admin (porta 3002)
  if (pathname.startsWith('/admin')) {
    return await protectSuperAdminRoute(request, token)
  }
  
  // Validar rotas de loja pública (porta 3000)
  if (pathname.startsWith('/store')) {
    return validateStoreRoute(request)
  }
  
  return NextResponse.next()
}

/**
 * Protege rotas do dashboard - apenas lojistas e super admins
 */
async function protectDashboardRoute(request: NextRequest, token: any) {
  const { pathname } = request.nextUrl
  
  // Se não há token, redirecionar para login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    loginUrl.searchParams.set('type', 'lojista')
    return NextResponse.redirect(loginUrl)
  }
  
  // Verificar se usuário tem permissão (lojista ou super-admin)
      if (token.role !== 'ADMIN' && token.role !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }
  
  // Extrair slug da URL /dashboard/[slug]
  const pathParts = pathname.split('/')
  const storeSlug = pathParts[2]
  
      if (storeSlug && token.role === 'ADMIN') {
    // Lojista só pode acessar sua própria loja
    if (token.storeSlug !== storeSlug) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }
  
  return NextResponse.next()
}

/**
 * Protege rotas do super admin - apenas super admins
 */
async function protectSuperAdminRoute(request: NextRequest, token: any) {
  const { pathname } = request.nextUrl
  
  // Se não há token, redirecionar para login de super admin
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    loginUrl.searchParams.set('type', 'super-admin')
    return NextResponse.redirect(loginUrl)
  }
  
  // Apenas super admins podem acessar
      if (token.role !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }
  
  return NextResponse.next()
}

/**
 * Valida se a loja existe para rotas públicas
 */
function validateStoreRoute(request: NextRequest) {
  const pathParts = request.nextUrl.pathname.split('/')
  const storeSlug = pathParts[2]
  
  if (!storeSlug) {
    return NextResponse.redirect(new URL('/not-found', request.url))
  }
  
  // TODO: Verificar se loja existe no banco/arquivo
  // Por enquanto, permitir todas as rotas
  return NextResponse.next()
}

/**
 * Configuração do middleware - rotas que devem ser processadas
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}