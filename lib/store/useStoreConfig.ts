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

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      return
    }

    const fetchConfig = async (slug: string): Promise<StoreConfig> => {
      try {
        // Buscar dados da loja via API
        const response = await fetch(`/api/store-public/${slug}`)

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

        // Mapear resposta da API para StoreConfig
        return {
          store: {
            id: data.store.id,
            name: data.store.name,
            slug: data.store.slug,
            description: data.store.description,
            active: data.store.active,
            approved: data.store.approved || false,
            createdAt: data.store.createdAt,
            updatedAt: data.store.updatedAt
          },
          categories: data.categories || [],
          products: data.products || [],
          config: data.config || {},
          status: data.status || { isOpen: false, reason: 'Indisponível' }
        }
      } catch (error) {
        console.error('Erro ao buscar configuração da loja:', error)
        throw error
      }
    }

    const loadConfig = async () => {
      try {
        setLoading(true)
        setError(null)

        const storeConfig = await fetchConfig(slug)

        // Transformar dados da API para o formato esperado
        const transformedConfig: StoreConfig = {
          id: storeConfig.store.id,
          slug: storeConfig.store.slug,
          name: storeConfig.store.name,
          description: storeConfig.store.description,
          config: storeConfig.config,
          active: storeConfig.store.active,
          approved: storeConfig.store.approved,
          createdAt: storeConfig.store.createdAt,
          updatedAt: storeConfig.store.updatedAt,
          menu: {
            products: storeConfig.products || [],
            categories: storeConfig.categories || []
          },
          settings: {
            preparationTime: storeConfig.config?.preparationTime || 30,
            orderNotifications: storeConfig.config?.orderNotifications !== false
          },
          delivery: {
            fee: storeConfig.config?.deliveryFee || 0,
            freeDeliveryMinimum: storeConfig.config?.minimumOrder || 0,
            estimatedTime: storeConfig.config?.estimatedDeliveryTime || 30,
            enabled: storeConfig.config?.deliveryEnabled !== false
          },
          payments: {
            pix: storeConfig.config?.paymentMethods?.includes('PIX') || false,
            cash: storeConfig.config?.paymentMethods?.includes('DINHEIRO') || false,
            card: storeConfig.config?.paymentMethods?.includes('CARTÃO') || false
          },
          promotions: {
            coupons: storeConfig.config?.coupons || []
          },
          branding: {
            logo: storeConfig.config?.logo || '',
            favicon: storeConfig.config?.favicon || '',
            bannerImage: storeConfig.config?.banner || '',
            primaryColor: storeConfig.config?.primaryColor || '#f97316',
            secondaryColor: storeConfig.config?.secondaryColor || '#ea580c',
            backgroundColor: storeConfig.config?.backgroundColor || '#ffffff',
            textColor: storeConfig.config?.textColor || '#000000',
            accentColor: storeConfig.config?.accentColor || '#f59e0b'
          },
          schedule: {
            timezone: 'America/Sao_Paulo',
            workingHours: storeConfig.config?.businessHours || {}
          },
          business: {
            phone: storeConfig.config?.phone || '',
            email: storeConfig.config?.email || '',
            address: storeConfig.config?.address || ''
          },
          status: storeConfig.status
        }

        setConfig(transformedConfig)

      } catch (err: any) {
        console.error('Erro ao buscar configuração da loja:', err)
        setError(err.message || 'Erro ao carregar dados da loja')
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
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