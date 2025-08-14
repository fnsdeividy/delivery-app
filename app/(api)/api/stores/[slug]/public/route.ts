import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '../../../../../../lib/api-client'

/**
 * API para dados públicos da loja
 * GET /api/stores/[slug]/public - Buscar dados públicos da loja
 * Inclui: configurações, produtos, categorias, horários, etc.
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

    // Buscar dados da loja via API Cardap.IO
    const storeResponse = await apiClient.get(`/stores/${slug}`)
    
    // A resposta da API não tem estrutura ApiResponse, é direta
    const store = storeResponse as any

    if (!store || !store.id) {
      return NextResponse.json(
        { error: `Loja '${slug}' não encontrada` },
        { status: 404 }
      )
    }

    if (!store.active) {
      return NextResponse.json(
        { error: 'Loja inativa' },
        { status: 403 }
      )
    }

    // Buscar categorias da loja
    const categoriesResponse = await apiClient.get(`/stores/${slug}/categories`)
    const categories = categoriesResponse as any[] || []

    // Buscar produtos da loja
    const productsResponse = await apiClient.get(`/stores/${slug}/products`)
    const products = productsResponse as any[] || []

    // Buscar configurações da loja
    const configResponse = await apiClient.get(`/stores/${slug}/config`)
    const storeConfig = configResponse as any || {}

    // Calcular status da loja baseado nos horários
    const storeStatus = calculateStoreStatus(storeConfig.schedule?.workingHours)

    // Montar resposta final
    const publicData = {
      // Dados básicos da loja
      store: {
        id: store.id,
        slug: store.slug,
        name: store.name,
        description: store.description,
        active: store.active,
        config: storeConfig,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt
      },
      
      // Categorias ativas
      categories: categories.filter((cat: any) => cat.active),
      
      // Produtos ativos
      products: products.filter((prod: any) => prod.active),
      
      // Configurações da loja
      config: storeConfig,
      
      // Status atual da loja
      status: storeStatus
    }

    return NextResponse.json(publicData)

  } catch (error: any) {
    console.error('Erro ao buscar dados públicos da loja:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * Calcula o status atual da loja baseado nos horários de funcionamento
 */
function calculateStoreStatus(workingHours: any) {
  if (!workingHours) {
    return { isOpen: false, reason: 'Horários não configurados' }
  }

  const now = new Date()
  const currentDay = now.getDay() // 0 = Domingo, 1 = Segunda, etc.
  const currentTime = now.getHours() * 60 + now.getMinutes() // Tempo em minutos

  // Encontrar horário do dia atual
  const todaySchedule = workingHours.find((schedule: any) => 
    schedule.dayOfWeek === currentDay
  )

  if (!todaySchedule || !todaySchedule.isOpen) {
    return { isOpen: false, reason: 'Fechado neste dia' }
  }

  // Verificar se está dentro do horário de funcionamento
  const openTime = todaySchedule.openTime
  const closeTime = todaySchedule.closeTime

  if (openTime && closeTime) {
    const [openHour, openMin] = openTime.split(':').map(Number)
    const [closeHour, closeMin] = closeTime.split(':').map(Number)
    
    const openMinutes = openHour * 60 + openMin
    const closeMinutes = closeHour * 60 + closeMin

    if (currentTime >= openMinutes && currentTime <= closeMinutes) {
      return { isOpen: true, reason: 'Aberto' }
    } else {
      return { isOpen: false, reason: 'Fora do horário de funcionamento' }
    }
  }

  return { isOpen: false, reason: 'Horários não configurados corretamente' }
} 