import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../../../lib/db'

function isLikelyId(value: string): boolean {
  return value.length >= 20 || value.includes('-')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const where = isLikelyId(slug) ? { id: slug } : { slug }

    const store = await db.store.findUnique({ where })
    if (!store) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      )
    }

    const updatedStore = await db.store.update({
      where: { id: store.id },
      data: { approved: false, active: false },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        active: true,
        approved: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      message: 'Loja rejeitada com sucesso',
      store: updatedStore,
    })
  } catch (error) {
    console.error('Erro ao rejeitar loja:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

