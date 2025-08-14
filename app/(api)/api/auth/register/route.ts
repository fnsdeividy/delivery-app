import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '../../../../../lib/api-client'

/**
 * API para registro de usuários
 * POST /api/auth/register - Registrar novo usuário
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role, storeId } = body

    // Validações básicas
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Nome, email, senha e role são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar role
    const validRoles = ['CLIENT', 'ADMIN', 'SUPER_ADMIN']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Role inválido. Use: CLIENT, ADMIN ou SUPER_ADMIN' },
        { status: 400 }
      )
    }

    // Validar se ADMIN precisa de storeId
    if (role === 'ADMIN' && !storeId) {
      return NextResponse.json(
        { error: 'Lojistas (ADMIN) precisam estar associados a uma loja' },
        { status: 400 }
      )
    }

    // Registrar usuário via API Cardap.IO
    const response = await apiClient.post('/auth/register', {
      name,
      email,
      password,
      role,
      storeId: role === 'ADMIN' ? storeId : null
    })
    
    // A resposta da API não tem estrutura ApiResponse, é direta
    const user = response as any

    if (!user || !user.id) {
      throw new Error('Erro ao registrar usuário')
    }

    return NextResponse.json({
      message: 'Usuário registrado com sucesso',
      user
    }, { status: 201 })

  } catch (error: any) {
    console.error('Erro ao registrar usuário:', error)
    
    // Tratar erro de email duplicado
    if (error.message?.includes('já existe') || error.message?.includes('already exists')) {
      return NextResponse.json(
        { error: 'Já existe um usuário com este email' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}