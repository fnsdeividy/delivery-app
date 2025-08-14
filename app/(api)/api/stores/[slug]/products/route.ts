import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '../../../../../../lib/api-client'

/**
 * API para gerenciar produtos da loja
 * GET /api/stores/[slug]/products - Listar produtos
 * POST /api/stores/[slug]/products - Criar produto
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug da loja é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar produtos via API Cardap.IO
    const response = await apiClient.get(`/stores/${slug}/products`)
    
    // A resposta da API não tem estrutura ApiResponse, é direta
    const products = response as any[] || []

    return NextResponse.json({
      products,
      total: products.length,
      active: products.filter((prod: any) => prod.active).length,
      inactive: products.filter((prod: any) => !prod.active).length
    })

  } catch (error: any) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug da loja é obrigatório' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, description, price, categoryId, image, preparationTime } = body

    // Validações básicas
    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: 'Nome, preço e categoria são obrigatórios' },
        { status: 400 }
      )
    }

    // Criar produto via API Cardap.IO
    const response = await apiClient.post(`/stores/${slug}/products`, {
      name,
      description: description || null,
      price: Number(price),
      categoryId,
      image: image || null,
      preparationTime: preparationTime || 30,
      active: true
    })
    
    // A resposta da API não tem estrutura ApiResponse, é direta
    const product = response as any

    if (!product || !product.id) {
      throw new Error('Erro ao criar produto')
    }

    return NextResponse.json({
      message: 'Produto criado com sucesso',
      product
    }, { status: 201 })

  } catch (error: any) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

