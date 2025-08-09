import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../../../lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const body = await request.json()

    const { name, description = '', order = 0, image = '' } = body || {}

    if (!slug) return NextResponse.json({ error: 'Slug é obrigatório' }, { status: 400 })
    if (!name || typeof name !== 'string') return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })

    // Verificar se a loja existe
    const store = await db.store.findUnique({ where: { slug } })
    if (!store) return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })

    // Verificar se já existe categoria com este nome
    const existing = await db.category.findFirst({ where: { storeSlug: slug, name } })
    if (existing) return NextResponse.json({ error: 'Já existe uma categoria com este nome' }, { status: 409 })

    const created = await db.category.create({
      data: {
        name,
        description,
        order,
        image,
        active: true,
        storeSlug: slug,
      },
      select: {
        id: true,
        name: true,
        description: true,
        order: true,
        image: true,
        active: true,
        storeSlug: true,
      },
    })

    return NextResponse.json({ category: created }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 