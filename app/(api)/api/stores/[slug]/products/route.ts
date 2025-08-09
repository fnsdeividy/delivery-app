import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../../../lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const body = await request.json()

    const {
      name,
      description = '',
      price,
      image = '',
      categoryId,
      tags = [],
      tagColor = '#ed7516',
      preparationTime,
      active = true,
      stock,
      minStock,
    } = body || {}

    if (!slug) return NextResponse.json({ error: 'Slug é obrigatório' }, { status: 400 })
    if (!name || typeof name !== 'string') return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    if (!categoryId || typeof categoryId !== 'string') return NextResponse.json({ error: 'Categoria é obrigatória' }, { status: 400 })
    if (price === undefined || Number.isNaN(Number(price))) return NextResponse.json({ error: 'Preço inválido' }, { status: 400 })

    // Garantir que a categoria pertence à loja
    const category = await db.category.findFirst({ where: { id: categoryId, storeSlug: slug } })
    if (!category) return NextResponse.json({ error: 'Categoria não encontrada para esta loja' }, { status: 404 })

    const created = await db.product.create({
      data: {
        name,
        description,
        price: new Prisma.Decimal(Number(price).toFixed(2)),
        originalPrice: null,
        image,
        active,
        preparationTime: preparationTime ? Number(preparationTime) : null,
        categoryId: category.id,
        storeSlug: slug,
        tags,
        tagColor,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        originalPrice: true,
        image: true,
        active: true,
        preparationTime: true,
        categoryId: true,
        storeSlug: true,
        tags: true,
        tagColor: true,
      },
    })

    if (stock !== undefined) {
      await db.inventory.create({
        data: {
          productId: created.id,
          quantity: Number(stock),
          minStock: minStock !== undefined ? Number(minStock) : 5,
          storeSlug: slug,
        },
      })
    }

    return NextResponse.json({
      product: {
        ...created,
        price: Number(created.price),
        originalPrice: created.originalPrice ? Number(created.originalPrice) : null,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

