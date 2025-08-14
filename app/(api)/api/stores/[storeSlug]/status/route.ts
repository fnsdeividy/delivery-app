import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '../../../../../../lib/api-client'

/**
 * API para verificar status da loja
 * GET /api/stores/[slug]/status - Verificar status de aprovação e ativação
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

    // Buscar status da loja via API Cardap.IO
    const response = await apiClient.get(`/stores/${slug}`)
    
    // A resposta da API não tem estrutura ApiResponse, é direta
    const store = response as any

    if (!store || !store.id) {
      return NextResponse.json(
        { error: `Loja '${slug}' não encontrada` },
        { status: 404 }
      )
    }

    // Retornar status da loja
    return NextResponse.json({
      id: store.id,
      slug: store.slug,
      name: store.name,
      active: store.active,
      approved: store.approved,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
      status: store.approved ? 'approved' : 'pending',
      message: store.approved 
        ? 'Loja aprovada e ativa' 
        : 'Loja aguardando aprovação'
    })

  } catch (error: any) {
    console.error('Erro ao verificar status da loja:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 