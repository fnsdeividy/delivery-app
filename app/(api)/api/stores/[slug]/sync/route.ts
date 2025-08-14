import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '../../../../../../lib/api-client'

/**
 * API para sincronização de dados da loja
 * POST /api/stores/[slug]/sync - Sincronizar dados com sistema externo
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
    const { type, data, force = false } = body

    if (!type) {
      return NextResponse.json(
        { error: 'Tipo de sincronização é obrigatório' },
        { status: 400 }
      )
    }

    // Tipos de sincronização suportados
    const validTypes = ['products', 'categories', 'orders', 'inventory', 'full']
    
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Tipo de sincronização inválido. Use: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Iniciar sincronização via API Cardap.IO
    const response = await apiClient.post(`/stores/${slug}/sync`, {
      type,
      data,
      force,
      timestamp: new Date().toISOString()
    })
    
    // A resposta da API não tem estrutura ApiResponse, é direta
    const syncResult = response as any

    if (!syncResult || !syncResult.syncId) {
      throw new Error('Erro ao iniciar sincronização')
    }

    return NextResponse.json({
      message: 'Sincronização iniciada com sucesso',
      syncId: syncResult.syncId,
      type,
      status: 'started',
      estimatedTime: syncResult.estimatedTime || '5-10 minutos'
    })

  } catch (error: any) {
    console.error('Erro ao iniciar sincronização:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET - Verificar status da sincronização
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const { searchParams } = new URL(request.url)
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug da loja é obrigatório' },
        { status: 400 }
      )
    }

    const syncId = searchParams.get('syncId')

    if (!syncId) {
      return NextResponse.json(
        { error: 'ID da sincronização é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar status da sincronização via API Cardap.IO
    const response = await apiClient.get(`/stores/${slug}/sync/${syncId}`)
    
    // A resposta da API não tem estrutura ApiResponse, é direta
    const syncStatus = response as any

    if (!syncStatus) {
      throw new Error('Sincronização não encontrada')
    }

    return NextResponse.json(syncStatus)

  } catch (error: any) {
    console.error('Erro ao verificar status da sincronização:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 