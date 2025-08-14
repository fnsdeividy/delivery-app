import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '../../../../../../lib/api-client'

/**
 * API para registro de loja com usuário administrador
 * POST /api/auth/register/loja - Registrar loja e usuário admin
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      storeName, 
      storeSlug, 
      storeDescription,
      adminName, 
      adminEmail, 
      adminPassword 
    } = body

    // Validações básicas
    if (!storeName || !storeSlug || !adminName || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar formato do slug
    if (!/^[a-z0-9-]+$/.test(storeSlug)) {
      return NextResponse.json(
        { error: 'Slug deve conter apenas letras minúsculas, números e hífens' },
        { status: 400 }
      )
    }

    // 1. Criar loja via API Cardap.IO
    const storeResponse = await apiClient.post('/stores', {
      name: storeName,
      slug: storeSlug,
      description: storeDescription || null,
      active: true,
      approved: false // Aguardando aprovação
    })
    
    // A resposta da API não tem estrutura ApiResponse, é direta
    const store = storeResponse as any

    if (!store || !store.id) {
      throw new Error('Erro ao criar loja')
    }

    // 2. Criar usuário administrador via API Cardap.IO
    const userResponse = await apiClient.post('/auth/register', {
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'ADMIN',
      storeId: store.id
    })
    
    // A resposta da API não tem estrutura ApiResponse, é direta
    const user = userResponse as any

    if (!user || !user.id) {
      // Se falhar ao criar usuário, tentar remover a loja criada
      try {
        await apiClient.delete(`/stores/${store.id}`)
      } catch (cleanupError) {
        console.error('Erro ao limpar loja após falha no usuário:', cleanupError)
      }
      
      throw new Error('Erro ao criar usuário administrador')
    }

    return NextResponse.json({
      message: 'Loja e usuário administrador criados com sucesso',
      store,
      admin: user
    }, { status: 201 })

  } catch (error: any) {
    console.error('Erro ao registrar loja:', error)
    
    // Tratar erros específicos
    if (error.message?.includes('já existe') || error.message?.includes('already exists')) {
      return NextResponse.json(
        { error: 'Já existe uma loja com este slug ou usuário com este email' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}