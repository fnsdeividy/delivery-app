import { readFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { db } from '../../../../../../lib/db'
import { StoreConfig } from '../../../../../../types/store'

/**
 * API para dados públicos da loja
 * GET /api/stores/[slug]/public - Buscar dados públicos da loja
 * Inclui: configurações, produtos, categorias, horários, etc.
 */

const STORES_CONFIG_PATH = join(process.cwd(), 'config', 'stores')

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

    // 1. Buscar dados básicos da loja no banco
    const store = await db.store.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        active: true,
        config: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!store) {
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

    // 2. Buscar categorias da loja
    const categories = await db.category.findMany({
      where: {
        storeSlug: slug,
        active: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        order: true,
        image: true,
        active: true
      },
      orderBy: {
        order: 'asc'
      }
    })

    // 3. Buscar produtos da loja com ingredientes e addons
    const products = await db.product.findMany({
      where: {
        storeSlug: slug,
        active: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        originalPrice: true,
        image: true,
        active: true,
        preparationTime: true,
        categoryId: true,
        nutritionalInfo: true,
        tags: true,
        tagColor: true,
        ingredients: {
          select: {
            id: true,
            name: true,
            included: true,
            removable: true
          }
        },
        addons: {
          where: { active: true },
          select: {
            id: true,
            name: true,
            price: true,
            category: true,
            maxQuantity: true
          }
        },
        inventory: {
          select: {
            quantity: true,
            minStock: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // 4. Tentar carregar configurações do arquivo JSON (fallback)
    let storeConfig: Partial<StoreConfig> = {}
    try {
      const configPath = join(STORES_CONFIG_PATH, `${slug}.json`)
      const configData = await readFile(configPath, 'utf-8')
      storeConfig = JSON.parse(configData)
    } catch (fileError) {
      // Se não existir arquivo, usar configurações padrão
      console.log(`Arquivo de configuração não encontrado para ${slug}, usando padrões`)
    }

    // 5. Mesclar configurações do banco com arquivo JSON
    const mergedConfig = {
      ...storeConfig,
      ...(store.config as any)
    }

    // 6. Calcular status da loja baseado nos horários
    const storeStatus = calculateStoreStatus(mergedConfig.schedule?.workingHours)

    // 7. Montar resposta final
    const publicData = {
      // Dados básicos da loja
      store: {
        id: store.id,
        slug: store.slug,
        name: store.name,
        description: store.description,
        active: store.active
      },
      
      // Configurações visuais e de negócio
      branding: mergedConfig.branding || {
        primaryColor: '#e53e3e',
        secondaryColor: '#c53030',
        backgroundColor: '#fff5f5',
        textColor: '#1a202c',
        accentColor: '#fc8181',
        logo: null,
        favicon: null
      },
      
      business: mergedConfig.business || {
        phone: '',
        email: '',
        address: '',
        website: '',
        socialMedia: {}
      },
      
      // Horários e status
      schedule: mergedConfig.schedule || {
        timezone: 'America/Sao_Paulo',
        workingHours: {
          monday: { open: false, hours: [] },
          tuesday: { open: true, hours: [{ start: '18:00', end: '23:00' }] },
          wednesday: { open: true, hours: [{ start: '18:00', end: '23:00' }] },
          thursday: { open: true, hours: [{ start: '18:00', end: '23:00' }] },
          friday: { open: true, hours: [{ start: '18:00', end: '23:30' }] },
          saturday: { open: true, hours: [{ start: '18:00', end: '23:30' }] },
          sunday: { open: true, hours: [{ start: '18:00', end: '23:00' }] }
        },
        closedMessage: 'Estamos fechados no momento.',
        specialDates: []
      },
      
      // Status atual da loja
      status: storeStatus,
      
      // Cardápio
      menu: {
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          image: cat.image,
          active: cat.active,
          order: cat.order
        })),
        
        products: products.map(prod => ({
          id: prod.id,
          name: prod.name,
          description: prod.description,
          price: Number(prod.price),
          originalPrice: prod.originalPrice ? Number(prod.originalPrice) : null,
          image: prod.image,
          category: prod.categoryId,
          ingredients: prod.ingredients.map(ing => ({
            name: ing.name,
            included: ing.included,
            removable: ing.removable
          })),
          addons: prod.addons.map(addon => ({
            id: addon.id,
            name: addon.name,
            price: Number(addon.price),
            category: addon.category,
            maxQuantity: addon.maxQuantity
          })),
          tags: prod.tags,
          tagColor: prod.tagColor,
          active: prod.active,
          preparationTime: prod.preparationTime,
          nutritionalInfo: prod.nutritionalInfo,
          inStock: prod.inventory ? prod.inventory.quantity > 0 : true,
          stockQuantity: prod.inventory?.quantity || 0
        }))
      },
      
      // Configurações de entrega
      delivery: mergedConfig.delivery || {
        enabled: true,
        radius: 5,
        fee: 5.00,
        freeDeliveryMinimum: 30.00,
        estimatedTime: 45,
        areas: []
      },
      
      // Configurações de pagamento
      payments: mergedConfig.payments || {
        pix: true,
        cash: true,
        card: true,
        online: false,
        integrations: {}
      },
      
      // Configurações gerais
      settings: mergedConfig.settings || {
        preparationTime: 30,
        whatsappTemplate: 'Olá! Gostaria de fazer um pedido.',
        orderNotifications: {
          email: true,
          whatsapp: true,
          dashboard: true
        },
        customerRegistrationRequired: false,
        minimumOrderValue: 15.00
      },
      
      // Promoções (se houver)
      promotions: mergedConfig.promotions || {
        coupons: [],
        loyaltyProgram: {
          enabled: false,
          pointsPerReal: 1,
          pointsToReal: 100
        }
      }
    }

    return NextResponse.json(publicData)

  } catch (error) {
    console.error('Erro ao buscar dados públicos da loja:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * Calcular status atual da loja baseado nos horários
 */
function calculateStoreStatus(workingHours: any) {
  if (!workingHours) {
    return {
      isOpen: false,
      message: 'Horários não configurados',
      nextOpenTime: null
    }
  }

  const now = new Date()
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const currentDay = dayNames[now.getDay()] as keyof typeof workingHours
  
  // Converter hora atual para minutos desde meia-noite
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  
  const todaySchedule = workingHours[currentDay]
  
  if (!todaySchedule.open) {
    return {
      isOpen: false,
      message: 'Loja fechada hoje',
      nextOpenTime: findNextOpenTime(workingHours, now)
    }
  }

  // Verificar se está dentro do horário de funcionamento
  let isCurrentlyOpen = false
  
  for (const timeRange of todaySchedule.hours) {
    const openMinutes = parseInt(timeRange.start.split(':')[0]) * 60 + parseInt(timeRange.start.split(':')[1])
    const closeMinutes = parseInt(timeRange.end.split(':')[0]) * 60 + parseInt(timeRange.end.split(':')[1])
    
    if (currentMinutes >= openMinutes && currentMinutes <= closeMinutes) {
      isCurrentlyOpen = true
      break
    }
  }

  return {
    isOpen: isCurrentlyOpen,
    message: isCurrentlyOpen ? 'Loja aberta' : 'Loja fechada',
    nextOpenTime: isCurrentlyOpen ? null : findNextOpenTime(workingHours, now)
  }
}

/**
 * Encontrar próximo horário de abertura
 */
function findNextOpenTime(workingHours: any, currentDate: Date): string | null {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  
  // Procurar nos próximos 7 dias
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentDate)
    date.setDate(date.getDate() + i)
    
    const dayName = days[date.getDay()] as keyof typeof workingHours
    const daySchedule = workingHours[dayName]
    
    if (daySchedule.open && daySchedule.hours.length > 0) {
      const firstOpenTime = daySchedule.hours[0].start
      
      if (i === 0) {
        // Hoje - verificar se ainda tem horário disponível
        const currentTime = currentDate.toTimeString().slice(0, 5)
        
        for (const timeRange of daySchedule.hours) {
          if (currentTime < timeRange.start) {
            return `Hoje às ${timeRange.start}`
          }
        }
      } else {
        // Próximos dias
        return `${dayNames[date.getDay()]} às ${firstOpenTime}`
      }
    }
  }
  
  return null
} 