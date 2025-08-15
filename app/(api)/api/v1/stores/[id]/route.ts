import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/v1/stores/[id] - Buscar loja por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    console.log(`🔍 API: Buscando loja com ID: ${id}`)
    
    // TODO: Implementar busca real na API Cardap.IO
    // Por enquanto, retornar dados mock para desenvolvimento
    
    // Simular busca de loja por ID
    const mockStore = {
      id: id,
      slug: `loja-${id}`,
      name: `Loja ${id}`,
      description: `Descrição da loja ${id}`,
      address: `Endereço da loja ${id}`,
      phone: `(11) 99999-9999`,
      email: `contato@loja${id}.com`,
      category: 'Restaurante',
      deliveryFee: 5.00,
      minimumOrder: 25.00,
      estimatedDeliveryTime: 30,
      isActive: true,
      approved: true,
      ownerId: `user-${id}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: {
        users: 3,
        products: 15,
        orders: 75
      }
    }
    
    console.log(`✅ API: Loja encontrada: ${mockStore.name}`)
    
    return NextResponse.json(mockStore)
    
  } catch (error) {
    console.error('❌ API: Erro ao buscar loja:', error)
    
    return NextResponse.json(
      { 
        message: 'Erro interno do servidor',
        error: 'Internal Server Error',
        statusCode: 500
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/v1/stores/[id] - Atualizar loja por ID
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    console.log(`🔧 API v1: Atualizando loja com ID: ${id}`)
    console.log(`📝 API v1: Dados para atualização:`, body)
    
    // Verificar se é uma operação de aprovação/rejeição
    if (body.hasOwnProperty('approved')) {
      console.log(`🔄 API v1: Operação de aprovação/rejeição detectada para loja ${id}`)
      
      // Redirecionar para rotas específicas
      if (body.approved === true) {
        console.log(`✅ API v1: Redirecionando para rota de aprovação`)
        // TODO: Implementar lógica de aprovação aqui ou redirecionar
      } else {
        console.log(`❌ API v1: Redirecionando para rota de rejeição`)
        // TODO: Implementar lógica de rejeição aqui ou redirecionar
      }
    }
    
    // TODO: Implementar atualização real na API Cardap.IO
    // Por enquanto, retornar sucesso mock para desenvolvimento
    
    const updatedStore = {
      id: id,
      slug: body.slug || `loja-${id}`,
      name: body.name || `Loja ${id}`,
      description: body.description || `Descrição da loja ${id}`,
      address: body.address || `Endereço da loja ${id}`,
      phone: body.phone || `(11) 99999-9999`,
      email: body.email || `contato@loja${id}.com`,
      category: body.category || 'Restaurante',
      deliveryFee: body.deliveryFee || 5.00,
      minimumOrder: body.minimumOrder || 25.00,
      estimatedDeliveryTime: body.estimatedDeliveryTime || 30,
      isActive: body.isActive !== undefined ? body.isActive : true,
      approved: body.approved !== undefined ? body.approved : true,
      ownerId: `user-${id}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    console.log(`✅ API v1: Loja atualizada com sucesso: ${updatedStore.name}`)
    
    return NextResponse.json(updatedStore)
    
  } catch (error) {
    console.error('❌ API v1: Erro ao atualizar loja:', error)
    
    return NextResponse.json(
      { 
        message: 'Erro interno do servidor',
        error: 'Internal Server Error',
        statusCode: 500
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/v1/stores/[id] - Deletar loja por ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    console.log(`🗑️ API: Deletando loja com ID: ${id}`)
    
    // TODO: Implementar deleção real na API Cardap.IO
    // Por enquanto, retornar sucesso mock para desenvolvimento
    
    console.log(`✅ API: Loja deletada com sucesso: ${id}`)
    
    return NextResponse.json(
      { 
        message: 'Loja deletada com sucesso',
        statusCode: 200
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('❌ API: Erro ao deletar loja:', error)
    
    return NextResponse.json(
      { 
        message: 'Erro interno do servidor',
        error: 'Internal Server Error',
        statusCode: 500
      },
      { status: 500 }
    )
  }
} 