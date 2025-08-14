import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '../../../../../../lib/api-client'

/**
 * API para gerenciar configurações de loja
 * GET /api/stores/[slug]/config - Buscar configurações
 * PUT /api/stores/[slug]/config - Atualizar configurações
 */

/**
 * GET - Buscar configurações da loja
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

    // Buscar configurações via API Cardap.IO
    const response = await apiClient.get(`/stores/${slug}/config`)
    
    // A resposta da API não tem estrutura ApiResponse, é direta
    const config = response as any

    if (!config) {
      return NextResponse.json(
        { error: `Loja '${slug}' não encontrada` },
        { status: 404 }
      )
    }

    return NextResponse.json(config)
  } catch (error: any) {
    console.error('Erro ao buscar configurações da loja:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * PUT - Atualizar configurações da loja
 */
export async function PUT(
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
    
    // Validações básicas
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Dados de configuração são obrigatórios' },
        { status: 400 }
      )
    }

    // Atualizar configurações via API Cardap.IO
    const response = await apiClient.put(`/stores/${slug}/config`, body)
    
    // A resposta da API não tem estrutura ApiResponse, é direta
    const config = response as any

    if (!config) {
      throw new Error('Erro ao atualizar configurações')
    }

    return NextResponse.json({
      message: 'Configurações atualizadas com sucesso',
      config
    })

  } catch (error: any) {
    console.error('Erro ao atualizar configurações da loja:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}