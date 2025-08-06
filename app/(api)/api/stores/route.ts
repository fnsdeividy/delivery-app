import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    // Buscar todas as lojas com contagem de usuários
    const stores = await db.store.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      stores,
      total: stores.length,
      active: stores.filter(store => store.active).length,
      inactive: stores.filter(store => !store.active).length
    })

  } catch (error) {
    console.error('Erro ao buscar lojas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, slug } = body

    // Validações básicas
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Nome e slug são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se slug já existe
    const existingStore = await db.store.findUnique({
      where: { slug }
    })

    if (existingStore) {
      return NextResponse.json(
        { error: 'Já existe uma loja com este slug' },
        { status: 409 }
      )
    }

    // Criar loja
    const store = await db.store.create({
      data: {
        slug,
        name,
        description: description || null,
        active: true
      },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'Loja criada com sucesso',
      store
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar loja:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 