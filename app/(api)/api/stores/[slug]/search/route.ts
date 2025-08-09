import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../../../lib/db'
import { filterProducts } from '../../../../../../lib/menu/search'
import { redisGet, redisSet } from '../../../../../../lib/redis'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()

    if (!slug) {
      return NextResponse.json({ error: 'Slug é obrigatório' }, { status: 400 })
    }

    if (!q) {
      return NextResponse.json({ items: [], total: 0 })
    }

    const cacheKey = `store:${slug}:search:${q.toLowerCase()}`

    const cached = await redisGet<{ items: any[]; total: number }>(cacheKey)
    if (cached) return NextResponse.json(cached)

    // Buscar produtos ativos da loja com campos essenciais
    const products = await db.product.findMany({
      where: { storeSlug: slug, active: true },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        originalPrice: true,
        image: true,
        preparationTime: true,
        categoryId: true,
        tags: true,
        tagColor: true,
        ingredients: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
      take: 2000, // limite de segurança
    })

    const normalized = products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: Number(p.price),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
      image: p.image,
      category: p.categoryId,
      ingredients: p.ingredients.map(i => i.name),
      tags: p.tags || [],
      tagColor: p.tagColor,
      active: true,
      preparationTime: p.preparationTime ?? undefined,
    }))

    const items = filterProducts(q, normalized)
    const payload = { items, total: items.length }

    await redisSet(cacheKey, payload, 60) // 60s de cache

    return NextResponse.json(payload)
  } catch (error) {
    console.error('Erro na busca:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

