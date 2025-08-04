import { useEffect, useState } from 'react'
import colorsConfig from '../config/colors.json'

export type ClientTheme = 'sabor_express' | 'cardap_io' | 'burger_king' | 'pizza_hut' | 'mcdonalds'

export interface ColorConfig {
  brand: {
    primary: Record<string, string>
    secondary: Record<string, string>
  }
  theme: {
    background: {
      primary: string
      secondary: string
      tertiary: string
    }
    text: {
      primary: string
      secondary: string
      tertiary: string
      accent: string
    }
    border: {
      light: string
      medium: string
      dark: string
    }
  }
  status: {
    success: Record<string, string>
    error: Record<string, string>
    warning: Record<string, string>
    info: Record<string, string>
  }
  payment: {
    credit: PaymentColors
    debit: PaymentColors
    pix: PaymentColors
    cash: PaymentColors
  }
  delivery: {
    delivery: DeliveryColors
    pickup: DeliveryColors
    waiter: DeliveryColors
  }
  categories: Record<string, CategoryColors>
  gradient: Record<string, string>
  clients: Record<string, ClientConfig>
}

export interface PaymentColors {
  bg: string
  border: string
  text: string
  icon: string
  selected: string
  selectedBorder: string
  badge: string
}

export interface DeliveryColors {
  bg: string
  border: string
  text: string
  icon: string
  selected: string
  selectedBorder: string
}

export interface CategoryColors {
  bg: string
  text: string
  border: string
}

export interface ClientConfig {
  primary: string
  secondary: string
  accent: string
  name: string
}

export const useTheme = () => {
  const [currentClient, setCurrentClient] = useState<ClientTheme>('cardap_io')
  const [colors] = useState<ColorConfig>(colorsConfig)

  // Função para obter configuração do cliente atual
  const getClientConfig = (): ClientConfig => {
    return colors.clients[currentClient]
  }

  // Função para obter cores de pagamento
  const getPaymentColors = (type: 'credit' | 'debit' | 'pix' | 'cash'): PaymentColors => {
    return colors.payment[type]
  }

  // Função para obter cores de delivery
  const getDeliveryColors = (type: 'delivery' | 'pickup' | 'waiter'): DeliveryColors => {
    return colors.delivery[type]
  }

  // Função para obter cores de categoria
  const getCategoryColors = (category: string): CategoryColors => {
    const normalizedCategory = category.toLowerCase().replace(/\s+/g, '').replace('ú', 'u')
    return colors.categories[normalizedCategory] || {
      bg: colors.theme.background.secondary,
      text: colors.theme.text.primary,
      border: colors.theme.border.light
    }
  }

  // Função para obter gradiente
  const getGradient = (type: string): string => {
    return colors.gradient[type] || colors.gradient.primary
  }

  // Função para obter cor do status
  const getStatusColor = (status: 'success' | 'error' | 'warning' | 'info', shade: string = '500'): string => {
    return colors.status[status][shade] || colors.status[status]['500']
  }

  // Função para obter cor primária do cliente
  const getPrimaryColor = (shade: string = '500'): string => {
    return colors.brand.primary[shade] || colors.brand.primary['500']
  }

  // Função para obter cor secundária
  const getSecondaryColor = (shade: string = '500'): string => {
    return colors.brand.secondary[shade] || colors.brand.secondary['500']
  }

  // Função para trocar cliente
  const switchClient = (client: ClientTheme): void => {
    setCurrentClient(client)
    // Aqui você pode adicionar lógica para salvar no localStorage
    localStorage.setItem('selectedClient', client)
  }

  // Função para gerar classes CSS dinamicamente
  const getDynamicClasses = () => {
    const clientConfig = getClientConfig()
    
    return {
      // Cores primárias
      primaryBg: `bg-[${clientConfig.primary}]`,
      primaryText: `text-[${clientConfig.primary}]`,
      primaryBorder: `border-[${clientConfig.primary}]`,
      
      // Cores secundárias
      secondaryBg: `bg-[${clientConfig.secondary}]`,
      secondaryText: `text-[${clientConfig.secondary}]`,
      secondaryBorder: `border-[${clientConfig.secondary}]`,
      
      // Cores de accent
      accentBg: `bg-[${clientConfig.accent}]`,
      accentText: `text-[${clientConfig.accent}]`,
      accentBorder: `border-[${clientConfig.accent}]`,
    }
  }

  // Função para obter estilos CSS inline
  const getInlineStyles = () => {
    const clientConfig = getClientConfig()
    
    return {
      primary: { backgroundColor: clientConfig.primary },
      primaryText: { color: clientConfig.primary },
      primaryBorder: { borderColor: clientConfig.primary },
      secondary: { backgroundColor: clientConfig.secondary },
      secondaryText: { color: clientConfig.secondary },
      accent: { backgroundColor: clientConfig.accent },
      accentText: { color: clientConfig.accent },
    }
  }

  // Carregar cliente salvo no localStorage
  useEffect(() => {
    const savedClient = localStorage.getItem('selectedClient') as ClientTheme
    if (savedClient && colors.clients[savedClient]) {
      setCurrentClient(savedClient)
    }
  }, [])

  return {
    // Estado
    currentClient,
    colors,
    
    // Funções de acesso
    getClientConfig,
    getPaymentColors,
    getDeliveryColors,
    getCategoryColors,
    getGradient,
    getStatusColor,
    getPrimaryColor,
    getSecondaryColor,
    
    // Funções de controle
    switchClient,
    getDynamicClasses,
    getInlineStyles,
    
    // Lista de clientes disponíveis
    availableClients: Object.keys(colors.clients) as ClientTheme[],
    clientNames: Object.entries(colors.clients).map(([key, value]) => ({
      id: key,
      name: value.name
    }))
  }
}