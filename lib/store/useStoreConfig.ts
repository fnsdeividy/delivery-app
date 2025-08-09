'use client'

import { useEffect, useState } from 'react'
import { StoreConfig } from '../../types/store'

interface UseStoreConfigReturn {
  config: StoreConfig | null
  loading: boolean
  error: string | null
  updateConfig: (newConfig: Partial<StoreConfig>) => Promise<void>
  reloadConfig: () => Promise<void>
}

/**
 * Hook para gerenciar configurações de uma loja específica
 * Carrega, atualiza e aplica configurações dinamicamente
 */
export function useStoreConfig(slug: string): UseStoreConfigReturn {
  const [config, setConfig] = useState<StoreConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar configurações da loja
  const loadConfig = async () => {
    try {
      setLoading(true)
      setError(null)

      // Usar a nova API pública que sincroniza dados do banco
      const response = await fetch(`/api/stores/${slug}/public`)
      
      if (!response.ok) {
        throw new Error(`Loja '${slug}' não encontrada`)
      }

      const publicData = await response.json()
      
      // Converter para o formato StoreConfig esperado
      const storeConfig: StoreConfig = {
        slug: publicData.store.slug,
        name: publicData.store.name,
        description: publicData.store.description,
        branding: publicData.branding,
        business: publicData.business,
        schedule: publicData.schedule,
        menu: publicData.menu,
        delivery: publicData.delivery,
        payments: publicData.payments,
        settings: publicData.settings,
        promotions: publicData.promotions
      }
      
      setConfig(storeConfig)

      // Aplicar configurações visuais ao CSS
      applyVisualConfig(storeConfig.branding)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar configurações')
      console.error('Erro ao carregar configurações da loja:', err)
    } finally {
      setLoading(false)
    }
  }

  // Aplicar configurações visuais dinamicamente
  const applyVisualConfig = (branding: StoreConfig['branding']) => {
    if (typeof document === 'undefined') return

    const root = document.documentElement

    // Aplicar variáveis CSS customizadas
    root.style.setProperty('--store-primary', branding.primaryColor)
    root.style.setProperty('--store-secondary', branding.secondaryColor)
    root.style.setProperty('--store-background', branding.backgroundColor)
    root.style.setProperty('--store-text', branding.textColor)
    root.style.setProperty('--store-accent', branding.accentColor)

    // Atualizar favicon se definido
    if (branding.favicon) {
      const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
      if (favicon) {
        favicon.href = branding.favicon
      }
    }

    // Atualizar title da página
    if (config?.name) {
      document.title = config.name
    }
  }

  // Atualizar configurações
  const updateConfig = async (newConfig: Partial<StoreConfig>) => {
    try {
      setError(null)

      const response = await fetch(`/api/stores/${slug}/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConfig),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar configurações')
      }

      const updatedConfig: StoreConfig = await response.json()
      setConfig(updatedConfig)

      // Reaplicar configurações visuais
      applyVisualConfig(updatedConfig.branding)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar configurações')
      throw err
    }
  }

  // Recarregar configurações
  const reloadConfig = async () => {
    await loadConfig()
  }

  // Carregar configurações quando o slug mudar
  useEffect(() => {
    if (slug) {
      loadConfig()
    }
  }, [slug])

  // Limpar configurações visuais ao desmontar
  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') {
        const root = document.documentElement
        root.style.removeProperty('--store-primary')
        root.style.removeProperty('--store-secondary')
        root.style.removeProperty('--store-background')
        root.style.removeProperty('--store-text')
        root.style.removeProperty('--store-accent')
      }
    }
  }, [])

  return {
    config,
    loading,
    error,
    updateConfig,
    reloadConfig,
  }
}

/**
 * Hook para verificar se a loja está funcionando no momento
 * Agora usa os dados da API pública que já calcula o status
 */
export function useStoreStatus(config: StoreConfig | null) {
  const [isOpen, setIsOpen] = useState(false)
  const [nextOpenTime, setNextOpenTime] = useState<string | null>(null)
  const [currentMessage, setCurrentMessage] = useState<string>('')

  useEffect(() => {
    if (!config) return

    // Usar o status calculado pela API pública
    const checkStoreStatus = async () => {
      try {
        const response = await fetch(`/api/stores/${config.slug}/public`)
        if (response.ok) {
          const publicData = await response.json()
          setIsOpen(publicData.status.isOpen)
          setCurrentMessage(publicData.status.message)
          setNextOpenTime(publicData.status.nextOpenTime)
        }
      } catch (error) {
        console.error('Erro ao verificar status da loja:', error)
        // Fallback para cálculo local se a API falhar
        const now = new Date()
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        const currentDay = dayNames[now.getDay()] as keyof typeof config.schedule.workingHours
        const currentTime = now.toTimeString().slice(0, 5) // HH:mm format
        
        const todaySchedule = config.schedule.workingHours[currentDay]
        
        if (!todaySchedule.open) {
          setIsOpen(false)
          setCurrentMessage(config.schedule.closedMessage)
          return
        }

        // Verificar se está dentro do horário de funcionamento
        let isCurrentlyOpen = false
        
        for (const timeRange of todaySchedule.hours) {
          if (currentTime >= timeRange.start && currentTime <= timeRange.end) {
            isCurrentlyOpen = true
            break
          }
        }

        setIsOpen(isCurrentlyOpen)
        
        if (!isCurrentlyOpen) {
          setCurrentMessage(config.schedule.closedMessage)
          
          // Encontrar próximo horário de abertura
          const nextOpen = findNextOpenTime(config.schedule.workingHours, now)
          setNextOpenTime(nextOpen)
        } else {
          setCurrentMessage('')
          setNextOpenTime(null)
        }
      }
    }

    // Verificar status inicial
    checkStoreStatus()

    // Verificar a cada minuto
    const interval = setInterval(checkStoreStatus, 60000)

    return () => clearInterval(interval)
  }, [config])

  return {
    isOpen,
    nextOpenTime,
    currentMessage,
  }
}

// Função auxiliar para encontrar próximo horário de abertura
function findNextOpenTime(schedule: StoreConfig['schedule']['workingHours'], currentDate: Date): string | null {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  
  // Procurar nos próximos 7 dias
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentDate)
    date.setDate(date.getDate() + i)
    
    const dayName = days[date.getDay()] as keyof typeof schedule
    const daySchedule = schedule[dayName]
    
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
        const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
        return `${dayNames[date.getDay()]} às ${firstOpenTime}`
      }
    }
  }
  
  return null
}

export default useStoreConfig