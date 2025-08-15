import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '../../../../../../app/(api)/api/auth/[...nextauth]/route'

/**
 * PATCH /api/v1/stores/[id]/reject - Rejeitar loja
 * Rejeita uma loja pendente de aprovação
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { reason } = body || {}
    
    console.log(`🔍 API v1: Rejeição de loja solicitada para ID: ${id}`)
    console.log(`📝 API v1: Motivo da rejeição: ${reason || 'Não informado'}`)
    
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.warn('❌ API v1: Tentativa de rejeição sem autenticação')
      return NextResponse.json(
        { 
          message: 'Não autorizado',
          error: 'Unauthorized',
          statusCode: 401
        },
        { status: 401 }
      )
    }

    // Verificar permissões (apenas super admin pode rejeitar lojas)
    if (session.user.role !== 'super_admin') {
      console.warn(`❌ API v1: Usuário ${session.user.email} sem permissão para rejeitar lojas`)
      return NextResponse.json(
        { 
          message: 'Permissão negada',
          error: 'Forbidden',
          statusCode: 403
        },
        { status: 403 }
      )
    }

    // TODO: Implementar rejeição real na API Cardap.IO
    // Por enquanto, simular rejeição para desenvolvimento
    
    console.log(`✅ API v1: Usuário ${session.user.email} rejeitando loja ${id}`)
    
    // Simular loja rejeitada
    const rejectedStore = {
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
      isActive: false,
      approved: false,
      rejectedAt: new Date().toISOString(),
      rejectedBy: session.user.id || session.user.email,
      rejectionReason: reason || 'Não informado',
      ownerId: `user-${id}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    console.log(`✅ API v1: Loja ${id} rejeitada com sucesso por ${session.user.email}`)
    
    return NextResponse.json({
      message: 'Loja rejeitada com sucesso',
      store: rejectedStore,
      statusCode: 200
    })
    
  } catch (error: any) {
    console.error('❌ API v1: Erro ao rejeitar loja:', error)
    
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