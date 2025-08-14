import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '../../../../../../lib/api-client'

/**
 * API para rejeitar loja
 * POST /api/stores/[slug]/reject - Rejeitar loja pendente
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

    const body = await request.json()
    const { reason } = body

    // Rejeitar loja via API Cardap.IO
    const response = await apiClient.put(`/stores/${slug}`, {
      approved: false,
      active: false,
      rejectionReason: reason || 'Loja rejeitada pelo administrador'
    })
    
    // A resposta da API não tem estrutura ApiResponse, é direta
    const store = response as any

    if (!store || !store.id) {
      throw new Error('Erro ao rejeitar loja')
    }

    return NextResponse.json({
      message: 'Loja rejeitada com sucesso',
      store
    })

  } catch (error: any) {
    console.error('Erro ao rejeitar loja:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

