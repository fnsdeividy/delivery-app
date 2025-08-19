import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware simplificado para proteção de rotas
 * Protege rotas do dashboard e super admin
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Rotas públicas que não precisam de autenticação
  if (pathname === '/' || 
      pathname.startsWith('/login') || 
      pathname.startsWith('/register') ||
      pathname.startsWith('/store') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api/v1')) {
    
    return NextResponse.next()
  }
  
  // Proteger rotas do dashboard e super admin
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    return await protectDashboardRoute(request)
  }
  
  // Permitir acesso a outras rotas
  return NextResponse.next()
}

/**
 * Protege rotas do dashboard - apenas usuários autenticados
 */
async function protectDashboardRoute(request: NextRequest) {
  // Verificar token JWT nos cookies ou headers
  const token = request.cookies.get('cardapio_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token) {
    // Redirecionar para login se não houver token
    return NextResponse.redirect(new URL('/login/lojista', request.url))
  }
  
  // Por enquanto, permitir acesso se houver token
  // A validação completa será feita no componente do dashboard
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