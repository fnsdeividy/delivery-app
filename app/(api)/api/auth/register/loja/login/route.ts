import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../../../../lib/db'

/**
 * API para login automático após criação de loja
 * POST /api/auth/register/loja/login
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, storeSlug } = body

    // Validações básicas
    if (!email || !password || !storeSlug) {
      return NextResponse.json(
        { error: 'Email, senha e slug da loja são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar usuário no banco
    const user = await db.user.findUnique({
      where: { email },
      include: { store: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar senha
    if (!user.password) {
      return NextResponse.json(
        { error: 'Usuário deve ter senha configurada' },
        { status: 400 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Senha incorreta' },
        { status: 401 }
      )
    }

    // Verificar se usuário está ativo
    if (!user.active) {
      return NextResponse.json(
        { error: 'Conta desativada' },
        { status: 403 }
      )
    }

    // Verificar se usuário tem acesso à loja
    if (user.storeSlug !== storeSlug) {
      return NextResponse.json(
        { error: 'Acesso negado para esta loja' },
        { status: 403 }
      )
    }

    // Atualizar último login
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    // Retornar dados do usuário (sem senha)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        message: 'Login realizado com sucesso',
        user: userWithoutPassword,
        storeSlug
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Erro no login automático:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 