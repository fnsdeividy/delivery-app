import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '../../../../../../lib/api-client'

/**
 * API para gerenciar categorias da loja
 * GET /api/stores/[slug]/categories - Listar categorias
 * POST /api/stores/[slug]/categories - Criar categoria
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

    // Buscar categorias via API Cardap.IO
    const response = await apiClient.get(`/stores/${slug}/categories`)
    
    // A resposta da API não tem estrutura ApiResponse, é direta
    const categories = response as any[] || []

    return NextResponse.json({
      categories,
      total: categories.length,
      active: categories.filter((cat: any) => cat.active).length,
      inactive: categories.filter((cat: any) => !cat.active).length
    })

  } catch (error: any) {
    console.error('Erro ao buscar categorias:', error)
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
    const { name, description, image, order } = body

    // Validações básicas
    if (!name) {
      return NextResponse.json(
        { error: 'Nome da categoria é obrigatório' },
        { status: 400 }
      )
    }

    // Criar categoria via API Cardap.IO
    const response = await apiClient.post(`/stores/${slug}/categories`, {
      name,
      description: description || null,
      image: image || null,
      order: order || 0,
      active: true
    })
    
    // A resposta da API não tem estrutura ApiResponse, é direta
    const category = response as any

    if (!category || !category.id) {
      throw new Error('Erro ao criar categoria')
    }

    return NextResponse.json({
      message: 'Categoria criada com sucesso',
      category
    }, { status: 201 })

  } catch (error: any) {
    console.error('Erro ao criar categoria:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 