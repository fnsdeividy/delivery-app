import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { StoreConfig } from '../../../../../types/store'

/**
 * API para gerenciar configurações de loja
 * GET /api/stores/[slug]/config - Buscar configurações
 * PUT /api/stores/[slug]/config - Atualizar configurações
 */

const STORES_CONFIG_PATH = join(process.cwd(), 'config', 'stores')

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

    const configPath = join(STORES_CONFIG_PATH, `${slug}.json`)
    
    try {
      const configData = await readFile(configPath, 'utf-8')
      const config: StoreConfig = JSON.parse(configData)
      
      return NextResponse.json(config)
    } catch (fileError) {
      // Se o arquivo não existir, retornar erro 404
      return NextResponse.json(
        { error: `Loja '${slug}' não encontrada` },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Erro ao buscar configurações da loja:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
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

    const updates = await request.json()
    const configPath = join(STORES_CONFIG_PATH, `${slug}.json`)
    
    try {
      // Carregar configuração atual
      const currentConfigData = await readFile(configPath, 'utf-8')
      const currentConfig: StoreConfig = JSON.parse(currentConfigData)
      
      // Fazer merge das atualizações com a configuração atual
      const updatedConfig: StoreConfig = {
        ...currentConfig,
        ...updates,
        // Fazer merge profundo para objetos aninhados
        branding: {
          ...currentConfig.branding,
          ...(updates.branding || {})
        },
        business: {
          ...currentConfig.business,
          ...(updates.business || {}),
          socialMedia: {
            ...currentConfig.business.socialMedia,
            ...(updates.business?.socialMedia || {})
          }
        },
        delivery: {
          ...currentConfig.delivery,
          ...(updates.delivery || {})
        },
        payments: {
          ...currentConfig.payments,
          ...(updates.payments || {}),
          integrations: {
            ...currentConfig.payments.integrations,
            ...(updates.payments?.integrations || {})
          }
        },
        schedule: {
          ...currentConfig.schedule,
          ...(updates.schedule || {}),
          workingHours: {
            ...currentConfig.schedule.workingHours,
            ...(updates.schedule?.workingHours || {})
          }
        },
        settings: {
          ...currentConfig.settings,
          ...(updates.settings || {})
        }
      }
      
      // Validar configuração atualizada
      validateStoreConfig(updatedConfig)
      
      // Salvar configuração atualizada
      await writeFile(configPath, JSON.stringify(updatedConfig, null, 2), 'utf-8')
      
      return NextResponse.json(updatedConfig)
    } catch (fileError) {
      return NextResponse.json(
        { error: `Loja '${slug}' não encontrada` },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Erro ao atualizar configurações da loja:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * Validar configuração da loja
 */
function validateStoreConfig(config: StoreConfig) {
  if (!config.slug || typeof config.slug !== 'string') {
    throw new Error('Slug da loja é obrigatório')
  }
  
  if (!config.name || typeof config.name !== 'string') {
    throw new Error('Nome da loja é obrigatório')
  }
  
  if (!config.branding?.primaryColor) {
    throw new Error('Cor primária é obrigatória')
  }
  
  if (!config.business?.phone) {
    throw new Error('Telefone é obrigatório')
  }
  
  if (!config.business?.email) {
    throw new Error('Email é obrigatório')
  }
  
  // Validar horários de funcionamento
  if (config.schedule?.workingHours) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    
    for (const day of days) {
      const daySchedule = config.schedule.workingHours[day as keyof typeof config.schedule.workingHours]
      
      if (daySchedule?.open && daySchedule.hours) {
        for (const timeRange of daySchedule.hours) {
          if (!timeRange.start || !timeRange.end) {
            throw new Error(`Horário inválido para ${day}`)
          }
          
          // Validar formato HH:mm
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
          if (!timeRegex.test(timeRange.start) || !timeRegex.test(timeRange.end)) {
            throw new Error(`Formato de horário inválido para ${day}`)
          }
        }
      }
    }
  }
  
  // Validar configurações de entrega
  if (config.delivery) {
    if (config.delivery.enabled) {
      if (typeof config.delivery.radius !== 'number' || config.delivery.radius <= 0) {
        throw new Error('Raio de entrega deve ser um número positivo')
      }
      
      if (typeof config.delivery.fee !== 'number' || config.delivery.fee < 0) {
        throw new Error('Taxa de entrega deve ser um número não negativo')
      }
    }
  }
}