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
  
  // Proteger rotas do dashboard
  if (pathname.startsWith('/dashboard')) {
    console.log(`🔐 Middleware: Protegendo rota do dashboard ${pathname}`)
    return protectDashboardRoute(request)
  }
  
  // Proteger rotas do super admin
  if (pathname.startsWith('/admin')) {
    console.log(`🔐 Middleware: Protegendo rota do super admin ${pathname}`)
    return protectSuperAdminRoute(request)
  }
  
  // Validar rotas de loja pública
  if (pathname.startsWith('/store')) {
    return validateStoreRoute(request)
  }
  
  console.log(`✅ Middleware: Rota não protegida ${pathname} - permitindo acesso`)
  return NextResponse.next()
}

/**
 * Protege rotas do dashboard - apenas lojistas e super admins
 */
async function protectDashboardRoute(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log(`🔐 Middleware: Protegendo rota do dashboard ${pathname}`)
  
  // Verificar token JWT do localStorage (via cookie ou header)
  const token = getTokenFromRequest(request)
  
  console.log(`🔑 Middleware: Token encontrado: ${token ? 'Sim' : 'Não'}`)
  
  if (!token) {
    console.log(`❌ Middleware: Nenhum token encontrado, redirecionando para login`)
    const loginUrl = new URL('/login/lojista', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  try {
    // Decodificar token JWT
    const payload = decodeJWT(token)
    console.log(`🔓 Middleware: Token decodificado - Role: ${payload.role}, StoreSlug: ${payload.storeSlug}`)
    
    // Verificar se usuário tem permissão (lojista ou super-admin)
    if (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN') {
      console.log(`❌ Middleware: Usuário sem permissão - Role: ${payload.role}`)
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    
    // Extrair slug da URL /dashboard/[slug]
    const pathParts = pathname.split('/')
    const storeSlug = pathParts[2]
    
    console.log(`🏪 Middleware: StoreSlug da URL: ${storeSlug}, Token: ${payload.storeSlug}`)
    
    // Lógica melhorada para diferentes tipos de acesso
    if (payload.role === 'SUPER_ADMIN') {
      // Super admin pode acessar qualquer dashboard
      console.log(`✅ Middleware: Super admin - acesso permitido`)
      return NextResponse.next()
    }
    
    if (payload.role === 'ADMIN') {
      // ADMIN pode acessar:
      // 1. /dashboard/gerenciar-lojas (para configurar lojas)
      // 2. /dashboard/[sua-loja] (sua própria loja)
      
      if (storeSlug === 'gerenciar-lojas') {
        // ADMIN pode acessar página de gerenciar lojas
        console.log(`✅ Middleware: ADMIN acessando gerenciar-lojas - permitido`)
        return NextResponse.next()
      }
      
      if (storeSlug && payload.storeSlug) {
        // ADMIN tentando acessar loja específica - verificar se é sua
        if (payload.storeSlug === storeSlug) {
          console.log(`✅ Middleware: ADMIN acessando sua própria loja - permitido`)
          return NextResponse.next()
        } else {
          console.log(`❌ Middleware: ADMIN tentando acessar loja diferente - Sua: ${payload.storeSlug}, Tentando: ${storeSlug}`)
          return NextResponse.redirect(new URL('/unauthorized', request.url))
        }
      }
      
      if (!storeSlug) {
        // ADMIN acessando /dashboard sem slug - redirecionar para gerenciar lojas
        console.log(`🔄 Middleware: ADMIN sem loja específica - redirecionando para gerenciar-lojas`)
        return NextResponse.redirect(new URL('/dashboard/gerenciar-lojas', request.url))
      }
      
      // ADMIN sem storeSlug tentando acessar loja específica
      if (storeSlug && !payload.storeSlug) {
        console.log(`❌ Middleware: ADMIN sem loja configurada tentando acessar loja específica`)
        return NextResponse.redirect(new URL('/dashboard/gerenciar-lojas', request.url))
      }
    }
    
    console.log(`✅ Middleware: Acesso permitido ao dashboard`)
    return NextResponse.next()
  } catch (error) {
    console.error('❌ Middleware: Erro ao validar token:', error)
    const loginUrl = new URL('/login/lojista', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

/**
 * Protege rotas do super admin - apenas super admins
 */
async function protectSuperAdminRoute(request: NextRequest) {
  // Verificar token JWT
  const token = getTokenFromRequest(request)
  
  if (!token) {
    const loginUrl = new URL('/login/super-admin', request.url)
    return NextResponse.redirect(loginUrl)
  }
  
  try {
    // Decodificar token JWT
    const payload = decodeJWT(token)
    
    // Apenas super admins podem acessar
    if (payload.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    
    return NextResponse.next()
  } catch (error) {
    console.error('Erro ao validar token super admin:', error)
    const loginUrl = new URL('/login/super-admin', request.url)
    return NextResponse.redirect(loginUrl)
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
 * Extrai token JWT da requisição
 */
function getTokenFromRequest(request: NextRequest): string | null {
  console.log(`🔍 Middleware: Tentando extrair token da requisição`)
  
  // Tentar obter do header Authorization
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    console.log(`🔑 Middleware: Token encontrado no header Authorization`)
    return token
  }
  
  // Tentar obter do cookie
  const tokenCookie = request.cookies.get('cardapio_token')
  if (tokenCookie) {
    console.log(`🍪 Middleware: Token encontrado no cookie cardapio_token`)
    return tokenCookie.value
  }
  
  // Listar todos os cookies para debugging
  const allCookies = request.cookies.getAll()
  console.log(`🍪 Middleware: Cookies disponíveis:`, allCookies.map(c => c.name))
  
  console.log(`❌ Middleware: Nenhum token encontrado`)
  return null
}

/**
 * Decodifica token JWT
 */
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    
    return JSON.parse(jsonPayload)
  } catch (error) {
    throw new Error('Token JWT inválido')
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