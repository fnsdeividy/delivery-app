import { Product } from '@/types/cardapio-api'
import { useEffect, useState } from 'react'

interface StoreConfig {
  id: string
  slug: string
  name: string
  description?: string
  config: Record<string, any>
  active: boolean
  approved: boolean
  createdAt: string
  updatedAt: string
  // Propriedades adicionais para o dashboard
  menu: {
    products: Product[]
    categories: Array<{
      id: string
      name: string
      active: boolean
    }>
  }
  settings: {
    preparationTime: number
    orderNotifications: boolean
  }
  delivery: {
    fee: number
    freeDeliveryMinimum: number
    estimatedTime: number
    enabled: boolean
  }
  payments: {
    pix: boolean
    cash: boolean
    card: boolean
  }
  promotions: {
    coupons: Array<{
      id: string
      name: string
      active: boolean
      discount: number
    }>
  }
  branding: {
    logo?: string
    favicon?: string
    bannerImage?: string
    primaryColor: string
    secondaryColor: string
    backgroundColor?: string
    textColor?: string
    accentColor?: string
  }
  schedule: {
    timezone: string
    workingHours: {
      [key: string]: {
        open: boolean
        hours: Array<{
          start: string
          end: string
        }>
      }
    }
  }
  business: {
    phone: string
    email: string
    address: string
  }
  status: {
    isOpen: boolean
    reason: string
  }
}

interface UseStoreConfigReturn {
  config: StoreConfig | null
  loading: boolean
  error: string | null
}

export function useStoreConfig(slug: string): UseStoreConfigReturn {
  const [config, setConfig] = useState<StoreConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Verificar se estamos no cliente
  const isClient = typeof window !== 'undefined'

  console.log(`🎯 useStoreConfig render - slug: ${slug}, loading: ${loading}, error: ${error}, config: ${!!config}, isClient: ${isClient}`)

  // Se não estamos no cliente, retornar estado inicial
  if (!isClient) {
    console.log('❌ SSR detectado, retornando estado inicial')
    return {
      config: null,
      loading: false,
      error: 'SSR não suportado'
    }
  }

  useEffect(() => {
    console.log(`🔄 useStoreConfig effect triggered with slug: ${slug}`)

    if (!slug) {
      console.log('❌ Slug vazio, parando loading')
      setLoading(false)
      return
    }

    // Timeout de segurança para evitar loading infinito
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout de segurança - forçando loading false')
      setLoading(false)
    }, 10000)

    const fetchConfig = async (slug: string): Promise<StoreConfig> => {
      try {
        console.log(`🔍 Buscando dados da loja: ${slug}`)

        // Buscar dados da loja via endpoint público
        const response = await fetch(`/api/store-public/${slug}`)

        console.log(`📡 Resposta da API:`, { status: response.status, ok: response.ok })

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Loja não encontrada')
          } else if (response.status === 403) {
            throw new Error('Loja inativa')
          } else {
            throw new Error('Erro ao buscar dados da loja')
          }
        }

        const data = await response.json()

        console.log(`📊 Dados recebidos:`, data)

        // Mapear resposta da API para StoreConfig
        const mappedConfig = {
          id: data.store.id,
          name: data.store.name,
          slug: data.store.slug,
          description: data.store.description,
          active: data.store.active,
          approved: data.store.approved || false,
          createdAt: data.store.createdAt,
          updatedAt: data.store.updatedAt,
          config: data.config || {},
          menu: {
            products: data.products || [],
            categories: data.categories || []
          },
          settings: {
            preparationTime: data.config?.preparationTime || 30,
            orderNotifications: data.config?.orderNotifications !== false
          },
          delivery: {
            fee: data.config?.deliveryFee || 0,
            freeDeliveryMinimum: data.config?.minimumOrder || 0,
            estimatedTime: data.config?.estimatedDeliveryTime || 30,
            enabled: data.config?.deliveryEnabled !== false
          },
          payments: {
            pix: data.config?.paymentMethods?.includes('PIX') || false,
            cash: data.config?.paymentMethods?.includes('DINHEIRO') || false,
            card: data.config?.paymentMethods?.includes('CARTÃO') || false
          },
          promotions: {
            coupons: data.config?.coupons || []
          },
          branding: {
            logo: data.config?.logo || '',
            favicon: data.config?.favicon || '',
            bannerImage: data.config?.banner || '',
            primaryColor: data.config?.primaryColor || '#f97316',
            secondaryColor: data.config?.secondaryColor || '#ea580c',
            backgroundColor: data.config?.backgroundColor || '#ffffff',
            textColor: data.config?.textColor || '#000000',
            accentColor: data.config?.accentColor || '#f59e0b'
          },
          schedule: {
            timezone: 'America/Sao_Paulo',
            workingHours: data.config?.businessHours || {}
          },
          business: {
            phone: data.config?.phone || '',
            email: data.config?.email || '',
            address: data.config?.address || ''
          },
          status: data.status || { isOpen: false, reason: 'Indisponível' }
        }

        console.log(`🔧 Config mapeada:`, mappedConfig)

        return mappedConfig
      } catch (error: any) {
        console.error('Erro ao buscar configuração da loja:', error)

        // Tratar diferentes tipos de erro
        if (error.message?.includes('Loja não encontrada')) {
          throw new Error('Loja não encontrada')
        } else if (error.message?.includes('Loja inativa')) {
          throw new Error('Loja inativa')
        } else if (error.message?.includes('timeout')) {
          throw new Error('Timeout na conexão')
        } else if (error.message?.includes('API indisponível')) {
          throw new Error('Serviço temporariamente indisponível')
        } else {
          throw new Error('Erro ao buscar dados da loja')
        }
      }
    }

    const loadConfig = async () => {
      try {
        console.log('🚀 Iniciando loadConfig')
        setLoading(true)
        setError(null)

        const storeConfig = await fetchConfig(slug)

        // Transformar dados da API para o formato esperado
        const transformedConfig: StoreConfig = {
          id: storeConfig.id,
          slug: storeConfig.slug,
          name: storeConfig.name,
          description: storeConfig.description,
          config: storeConfig.config,
          active: storeConfig.active,
          approved: storeConfig.approved,
          createdAt: storeConfig.createdAt,
          updatedAt: storeConfig.updatedAt,
          menu: {
            products: storeConfig.menu?.products || [],
            categories: storeConfig.menu?.categories || []
          },
          settings: {
            preparationTime: storeConfig.settings?.preparationTime || 30,
            orderNotifications: storeConfig.settings?.orderNotifications !== false
          },
          delivery: {
            fee: storeConfig.delivery?.fee || 0,
            freeDeliveryMinimum: storeConfig.delivery?.freeDeliveryMinimum || 0,
            estimatedTime: storeConfig.delivery?.estimatedTime || 30,
            enabled: storeConfig.delivery?.enabled !== false
          },
          payments: {
            pix: storeConfig.payments?.pix || false,
            cash: storeConfig.payments?.cash || false,
            card: storeConfig.payments?.card || false
          },
          promotions: {
            coupons: storeConfig.promotions?.coupons || []
          },
          branding: {
            logo: storeConfig.branding?.logo || '',
            favicon: storeConfig.branding?.favicon || '',
            bannerImage: storeConfig.branding?.bannerImage || '',
            primaryColor: storeConfig.branding?.primaryColor || '#f97316',
            secondaryColor: storeConfig.branding?.secondaryColor || '#ea580c',
            backgroundColor: storeConfig.branding?.backgroundColor || '#ffffff',
            textColor: storeConfig.branding?.textColor || '#000000',
            accentColor: storeConfig.branding?.accentColor || '#f59e0b'
          },
          schedule: {
            timezone: 'America/Sao_Paulo',
            workingHours: storeConfig.schedule?.workingHours || {}
          },
          business: {
            phone: storeConfig.business?.phone || '',
            email: storeConfig.business?.email || '',
            address: storeConfig.business?.address || ''
          },
          status: storeConfig.status
        }

        console.log('✅ Config carregada com sucesso:', transformedConfig)
        setConfig(transformedConfig)

      } catch (err: any) {
        console.log('❌ Erro no loadConfig:', err)
        console.error('Erro ao buscar configuração da loja:', err)

        // Mapear mensagens de erro para mensagens mais amigáveis
        let userMessage = 'Erro ao carregar dados da loja'

        if (err.message?.includes('Loja não encontrada')) {
          userMessage = 'Loja não encontrada'
        } else if (err.message?.includes('Loja inativa')) {
          userMessage = 'Loja temporariamente indisponível'
        } else if (err.message?.includes('timeout')) {
          userMessage = 'Conexão lenta, tente novamente'
        } else if (err.message?.includes('API indisponível')) {
          userMessage = 'Serviço temporariamente indisponível'
        } else if (err.message?.includes('não encontrada')) {
          userMessage = 'Loja não encontrada'
        }

        setError(userMessage)
      } finally {
        console.log('🏁 Finalizando loadConfig, setLoading(false)')
        setLoading(false)
        clearTimeout(timeoutId)
      }
    }

    loadConfig()

    return () => {
      clearTimeout(timeoutId)
    }
  }, [slug])

  return { config, loading, error }
}

export function useStoreStatus(config: StoreConfig | null) {
  const [isOpen, setIsOpen] = useState(true)
  const [currentMessage, setCurrentMessage] = useState('')

  useEffect(() => {
    if (config) {
      // Simular status da loja
      setIsOpen(config.active && config.approved)
      setCurrentMessage(
        config.approved
          ? 'Loja aberta e funcionando normalmente'
          : 'Loja aguardando aprovação'
      )
    }
  }, [config])

  return { isOpen, currentMessage }
} 