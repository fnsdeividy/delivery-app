import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware para proteção de rotas e autenticação
 * Protege rotas do dashboard e super admin usando JWT customizado
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log(`🔒 Middleware: Processando rota ${pathname}`)
  
  // Rotas públicas que não precisam de autenticação
  if (pathname === '/' || 
      pathname.startsWith('/login') || 
      pathname.startsWith('/register') ||
      pathname.startsWith('/store') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api')) {
    console.log(`✅ Middleware: Rota pública ${pathname} - permitindo acesso`)
    return NextResponse.next()
  }
  
  // Proteger rotas do dashboard e super admin
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    return await protectDashboardRoute(request)
  }
  
  // Proteger rotas de loja específica
  if (pathname.startsWith('/store/')) {
    return validateStoreRoute(request)
  }
  
  // Permitir acesso a outras rotas
  return NextResponse.next()
}

/**
 * Protege rotas do dashboard - apenas usuários autenticados
 */
async function protectDashboardRoute(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log(`🔐 Middleware: Protegendo rota do dashboard ${pathname}`)
  
  // Verificar token JWT nos cookies ou headers
  const token = request.cookies.get('cardapio_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token) {
    console.log(`🚫 Middleware: Token não encontrado, redirecionando para login`)
    return NextResponse.redirect(new URL('/login/lojista', request.url))
  }
  
  try {
    // Verificar se o token é válido fazendo uma chamada ao backend
    const response = await fetch('http://localhost:3001/api/v1/stores', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.log(`🚫 Middleware: Token inválido (${response.status}), redirecionando para login`)
      return NextResponse.redirect(new URL('/login/lojista', request.url))
    }
    
    console.log(`✅ Middleware: Token válido, permitindo acesso ao dashboard`)
    return NextResponse.next()
    
  } catch (error) {
    console.error(`❌ Middleware: Erro ao validar token`, error)
    return NextResponse.redirect(new URL('/login/lojista', request.url))
  }
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
  
  // TODO: Verificar se loja existe via API Cardap.IO
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