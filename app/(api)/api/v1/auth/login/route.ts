import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG, fetchExternalAPI } from '../../config'

/**
 * API para login de usuários
 * POST /api/v1/auth/login - Autenticar usuário
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, storeSlug } = body

    // Validações básicas
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }



    // Fazer requisição para a API externa
    const response = await fetchExternalAPI(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        storeSlug
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      
      // Mapear códigos de erro HTTP
      switch (response.status) {
        case 401:
          return NextResponse.json(
            { error: 'Credenciais inválidas' },
            { status: 401 }
          )
        case 400:
          return NextResponse.json(
            { error: errorData.message || 'Dados inválidos' },
            { status: 400 }
          )
        case 404:
          return NextResponse.json(
            { error: 'Usuário não encontrado' },
            { status: 404 }
          )
        default:
          return NextResponse.json(
            { error: errorData.message || 'Erro na autenticação' },
            { status: response.status }
          )
      }
    }

    const authData = await response.json()


    // Retornar dados de autenticação
    return NextResponse.json({
      message: 'Login realizado com sucesso',
      access_token: authData.access_token,
      user: authData.user
    }, { status: 200 })

  } catch (error: any) {

    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 