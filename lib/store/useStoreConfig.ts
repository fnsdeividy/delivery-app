import { useEffect, useState } from 'react'
import { Product } from '@/types/cardapio-api'

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

    const fetchConfig = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Simular busca da configuração da loja
        // Em produção, isso seria uma chamada à API
        const mockConfig: StoreConfig = {
          id: 'temp-id',
          slug,
          name: `Loja ${slug}`,
          description: 'Descrição da loja',
          config: {
            theme: 'default',
            colors: {
              primary: '#3B82F6',
              secondary: '#6B7280'
            }
          },
          active: true,
          approved: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Adicionar propriedades necessárias para o dashboard
          menu: {
            products: [
              { 
                id: '1', 
                name: 'Produto 1', 
                description: 'Descrição do produto 1',
                price: 25.90, 
                categoryId: '1',
                storeId: 'temp-id',
                image: 'https://via.placeholder.com/40x40?text=?',
                isAvailable: true, 
                stockQuantity: 10,
                preparationTime: 15,
                allergens: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              { 
                id: '2', 
                name: 'Produto 2', 
                description: 'Descrição do produto 2',
                price: 32.50, 
                categoryId: '2',
                storeId: 'temp-id',
                image: 'https://via.placeholder.com/40x40?text=?',
                isAvailable: true, 
                stockQuantity: 15,
                preparationTime: 20,
                allergens: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              { 
                id: '3', 
                name: 'Produto 3', 
                description: 'Descrição do produto 3',
                price: 18.75, 
                categoryId: '1',
                storeId: 'temp-id',
                image: 'https://via.placeholder.com/40x40?text=?',
                isAvailable: true, 
                stockQuantity: 8,
                preparationTime: 12,
                allergens: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ],
            categories: [
              { id: '1', name: 'Categoria 1', active: true },
              { id: '2', name: 'Categoria 2', active: true }
            ]
          },
          settings: {
            preparationTime: 25,
            orderNotifications: true
          },
          delivery: {
            fee: 5.00,
            freeDeliveryMinimum: 30.00,
            estimatedTime: 45,
            enabled: true
          },
          payments: {
            pix: true,
            cash: true,
            card: true
          },
          promotions: {
            coupons: [
              { id: '1', name: 'DESCONTO10', active: true, discount: 10 }
            ]
          },
          branding: {
            primaryColor: '#3B82F6',
            secondaryColor: '#6B7280'
          },
          schedule: {
            timezone: 'America/Sao_Paulo',
            workingHours: {
              monday: { open: true, hours: [{ start: '08:00', end: '18:00' }] },
              tuesday: { open: true, hours: [{ start: '08:00', end: '18:00' }] },
              wednesday: { open: true, hours: [{ start: '08:00', end: '18:00' }] },
              thursday: { open: true, hours: [{ start: '08:00', end: '18:00' }] },
              friday: { open: true, hours: [{ start: '08:00', end: '18:00' }] },
              saturday: { open: true, hours: [{ start: '08:00', end: '18:00' }] },
              sunday: { open: false, hours: [] }
            }
          },
          business: {
            phone: '(11) 99999-9999',
            email: 'contato@loja.com',
            address: 'Rua Exemplo, 123 - São Paulo, SP'
          }
        }
        
        setConfig(mockConfig)
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar configuração da loja')
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
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