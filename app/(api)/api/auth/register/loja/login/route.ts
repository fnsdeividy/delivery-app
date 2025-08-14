import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '../../../../../../../lib/api-client'

/**
 * API para login de lojistas
 * POST /api/auth/register/loja/login - Login de usuário administrador
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validações básicas
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Fazer login via API Cardap.IO
    const response = await apiClient.post('/auth/login', {
      email,
      password
    })
    
    // A resposta da API não tem estrutura ApiResponse, é direta
    const { user, access_token } = response as any

    if (!user || !access_token) {
      throw new Error('Credenciais inválidas')
    }

    // Verificar se o usuário é um administrador
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem fazer login.' },
        { status: 403 }
      )
    }

    // Verificar se o usuário está ativo
    if (!user.active) {
      return NextResponse.json(
        { error: 'Usuário inativo. Entre em contato com o suporte.' },
        { status: 403 }
      )
    }

    // Se for ADMIN, verificar se a loja está aprovada
    if (user.role === 'ADMIN' && user.storeSlug) {
      try {
        const storeResponse = await apiClient.get(`/stores/${user.storeSlug}`)
        if (!(storeResponse as any).approved) {
          return NextResponse.json(
            { error: 'Sua loja ainda está aguardando aprovação. Entre em contato com o suporte.' },
            { status: 403 }
          )
        }
      } catch (storeError) {
        console.error('Erro ao verificar status da loja:', storeError)
      }
    }

    return NextResponse.json({
      message: 'Login realizado com sucesso',
              user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          storeSlug: user.storeSlug,
          active: user.active
        },
        access_token
    })

  } catch (error: any) {
    console.error('Erro no login:', error)
    
    // Tratar erros específicos
    if (error.message?.includes('Credenciais inválidas') || error.message?.includes('Invalid credentials')) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 