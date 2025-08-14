import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '../../../../../../../lib/api-client';

/**
 * API para gerenciar produto individual
 * GET /api/stores/[slug]/products/[id] - Buscar produto
 * PUT /api/stores/[slug]/products/[id] - Atualizar produto
 * DELETE /api/stores/[slug]/products/[id] - Excluir produto
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const { slug, id } = params
    
    if (!slug || !id) {
      return NextResponse.json(
        { error: 'Slug da loja e ID do produto são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar produto via API Cardap.IO
    const response = await apiClient.get(`/stores/${slug}/products/${id}`)
    
    // A resposta da API não tem estrutura ApiResponse, é direta
    const product = response as any

    if (!product || !product.id) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)

  } catch (error: any) {
    console.error('Erro ao buscar produto:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const { slug, id } = params
    
    if (!slug || !id) {
      return NextResponse.json(
        { error: 'Slug da loja e ID do produto são obrigatórios' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Atualizar produto via API Cardap.IO
    const response = await apiClient.put(`/stores/${slug}/products/${id}`, body)
    
    // A resposta da API não tem estrutura ApiResponse, é direta
    const product = response as any

    if (!product || !product.id) {
      throw new Error('Erro ao atualizar produto')
    }

    return NextResponse.json({
      message: 'Produto atualizado com sucesso',
      product
    })

  } catch (error: any) {
    console.error('Erro ao atualizar produto:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const { slug, id } = params
    
    if (!slug || !id) {
      return NextResponse.json(
        { error: 'Slug da loja e ID do produto são obrigatórios' },
        { status: 400 }
      )
    }

    // Excluir produto via API Cardap.IO
    const response = await apiClient.delete(`/stores/${slug}/products/${id}`)
    
    // A resposta da API não tem estrutura ApiResponse, é direta
    const result = response as any

    if (!result) {
      throw new Error('Erro ao excluir produto')
    }

    return NextResponse.json({
      message: 'Produto excluído com sucesso'
    })

  } catch (error: any) {
    console.error('Erro ao excluir produto:', error)
          return NextResponse.json(
        { error: error.message || 'Erro interno do servidor' },
        { status: 500 }
      )
  }
} 