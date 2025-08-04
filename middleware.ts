import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware para proteger rotas do dashboard e gerenciar autenticação
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Proteger todas as rotas /dashboard/*
  if (pathname.startsWith('/dashboard')) {
    return protectDashboardRoute(request)
  }
  
  // Verificar se a loja existe para rotas /loja/*
  if (pathname.startsWith('/loja')) {
    return validateStoreRoute(request)
  }
  
  return NextResponse.next()
}

/**
 * Protege rotas do dashboard verificando autenticação de lojista
 */
function protectDashboardRoute(request: NextRequest) {
  const token = request.cookies.get('store-auth-token')?.value
  const currentPath = request.nextUrl.pathname
  
  // Se não há token, redirecionar para login
  if (!token) {
    const loginUrl = new URL('/login/lojista', request.url)
    loginUrl.searchParams.set('callbackUrl', currentPath)
    return NextResponse.redirect(loginUrl)
  }
  
  // TODO: Validar token JWT e verificar permissões
  // Por enquanto, apenas verificamos se o token existe
  
  // Extrair slug da URL /dashboard/[slug]
  const pathParts = currentPath.split('/')
  const slug = pathParts[2]
  
  if (!slug) {
    // Redirecionar para seleção de loja se não há slug
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // TODO: Verificar se o usuário tem acesso a esta loja específica
  
  return NextResponse.next()
}

/**
 * Valida se a loja existe para rotas públicas
 */
function validateStoreRoute(request: NextRequest) {
  const pathParts = request.nextUrl.pathname.split('/')
  const slug = pathParts[2]
  
  if (!slug) {
    // Redirecionar para página de descoberta ou erro 404
    return NextResponse.redirect(new URL('/404', request.url))
  }
  
  // TODO: Verificar se a loja existe no banco/arquivo
  // Por enquanto, permitir acesso a todas as lojas
  
  return NextResponse.next()
}

/**
 * Configuração do middleware - rotas que devem ser processadas
 * Excluir rotas da API, arquivos estáticos e _next
 */
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/loja/:path*',
  ]
}