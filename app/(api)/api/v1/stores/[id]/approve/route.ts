import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '../../../../../../app/(api)/api/auth/[...nextauth]/route'

/**
 * PATCH /api/v1/stores/[id]/approve - Aprovar loja
 * Aprova uma loja pendente de aprovação
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    console.log(`🔍 API v1: Aprovação de loja solicitada para ID: ${id}`)
    
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.warn('❌ API v1: Tentativa de aprovação sem autenticação')
      return NextResponse.json(
        { 
          message: 'Não autorizado',
          error: 'Unauthorized',
          statusCode: 401
        },
        { status: 401 }
      )
    }

    // Verificar permissões (apenas super admin pode aprovar lojas)
    if (session.user.role !== 'super_admin') {
      console.warn(`❌ API v1: Usuário ${session.user.email} sem permissão para aprovar lojas`)
      return NextResponse.json(
        { 
          message: 'Permissão negada',
          error: 'Forbidden',
          statusCode: 403
        },
        { status: 403 }
      )
    }

    // TODO: Implementar busca real na API Cardap.IO
    // Por enquanto, simular aprovação para desenvolvimento
    
    console.log(`✅ API v1: Usuário ${session.user.email} aprovando loja ${id}`)
    
    // Simular loja aprovada
    const approvedStore = {
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
      approvedAt: new Date().toISOString(),
      approvedBy: session.user.id || session.user.email,
      ownerId: `user-${id}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    console.log(`✅ API v1: Loja ${id} aprovada com sucesso por ${session.user.email}`)
    
    return NextResponse.json({
      message: 'Loja aprovada com sucesso',
      store: approvedStore,
      statusCode: 200
    })
    
  } catch (error: any) {
    console.error('❌ API v1: Erro ao aprovar loja:', error)
    
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