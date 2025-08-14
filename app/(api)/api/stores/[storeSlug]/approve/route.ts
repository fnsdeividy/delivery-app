import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '../../../../../../lib/api-client'

/**
 * API para aprovar loja
 * POST /api/stores/[slug]/approve - Aprovar loja pendente
 */

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

    // Aprovar loja via API Cardap.IO
    const response = await apiClient.put(`/stores/${slug}`, {
      approved: true
    })
    
    // A resposta da API não tem estrutura ApiResponse, é direta
    const store = response as any

    if (!store || !store.id) {
      throw new Error('Erro ao aprovar loja')
    }

    return NextResponse.json({
      message: 'Loja aprovada com sucesso',
      store
    })

  } catch (error: any) {
    console.error('Erro ao aprovar loja:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

