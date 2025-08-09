import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../../../lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // Buscar loja pelo slug
    const store = await db.store.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        active: true,
        approved: true
      }
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: store.id,
      slug: store.slug,
      name: store.name,
      active: store.active,
      approved: store.approved
    })
  } catch (error) {
    console.error('Erro ao verificar status da loja:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 