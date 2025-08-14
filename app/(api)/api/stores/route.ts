import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '../../../../lib/api-client'

export async function GET(request: NextRequest) {
  try {
    // Buscar todas as lojas via API Cardap.IO
    const response = await apiClient.get('/stores')
    
    // A resposta da API não tem estrutura ApiResponse, é direta
    const stores = response as any[] || []
    
    return NextResponse.json({
      stores,
      total: stores.length,
      active: stores.filter((store: any) => store.active).length,
      inactive: stores.filter((store: any) => !store.active).length,
      approved: stores.filter((store: any) => store.approved).length,
      pending: stores.filter((store: any) => !store.approved).length
    })

  } catch (error: any) {
    console.error('Erro ao buscar lojas:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, slug } = body

    // Validações básicas
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Nome e slug são obrigatórios' },
        { status: 400 }
      )
    }

    // Criar loja via API Cardap.IO
    const response = await apiClient.post('/stores', {
      name,
      description: description || null,
      slug,
      active: true,
      approved: false // Aguardando aprovação do master
    })

    // A resposta da API não tem estrutura ApiResponse, é direta
    const store = response as any

    if (!store || !store.id) {
      throw new Error('Erro ao criar loja')
    }

    return NextResponse.json({
      message: 'Loja criada com sucesso',
      store
    }, { status: 201 })

  } catch (error: any) {
    console.error('Erro ao criar loja:', error)
    
    // Tratar erro de slug duplicado
    if (error.message?.includes('já existe') || error.message?.includes('already exists')) {
      return NextResponse.json(
        { error: 'Já existe uma loja com este slug' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 