import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import DashboardLayout from '../app/(dashboard)/dashboard/layout'

// Mock do usePathname
jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}))

// Mock dos hooks
jest.mock('../hooks', () => ({
  useStores: jest.fn()
}))

jest.mock('../lib/store/useStoreConfig', () => ({
  useStoreConfig: jest.fn()
}))

jest.mock('../components/UserStoreStatus', () => ({
  UserStoreStatus: () => <div data-testid="user-store-status">User Store Status</div>
}))

jest.mock('../components/WelcomeNotification', () => ({
  default: () => <div data-testid="welcome-notification">Welcome Notification</div>
}))

const mockUseStores = require('../hooks').useStores
const mockUseStoreConfig = require('../lib/store/useStoreConfig').useStoreConfig

describe('DashboardLayout', () => {
  const mockStores = {
    data: [
      { slug: 'loja-1', name: 'Loja 1', description: 'Descrição da Loja 1' },
      { slug: 'loja-2', name: 'Loja 2', description: 'Descrição da Loja 2' }
    ]
  }

  const mockStoreConfig = {
    name: 'Loja Teste',
    branding: { logo: 'logo.png' }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseStores.mockReturnValue({ data: mockStores })
    mockUseStoreConfig.mockReturnValue({ 
      config: null, 
      loading: false, 
      error: null 
    })
  })

  it('deve renderizar o sidebar com navegação principal', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard')
    
    render(
      <DashboardLayout>
        <div>Conteúdo do Dashboard</div>
      </DashboardLayout>
    )

    // Verificar se a navegação principal está presente
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Minhas Lojas')).toBeInTheDocument()
    expect(screen.getByText('Gerenciar Lojas')).toBeInTheDocument()
  })

  it('deve mostrar seletor de lojas quando há lojas disponíveis', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard')
    
    render(
      <DashboardLayout>
        <div>Conteúdo do Dashboard</div>
      </DashboardLayout>
    )

    // Verificar se o seletor de lojas está presente
    expect(screen.getByText('Lojas Disponíveis')).toBeInTheDocument()
    expect(screen.getByText('Loja 1')).toBeInTheDocument()
    expect(screen.getByText('Loja 2')).toBeInTheDocument()
  })

  it('deve mostrar navegação específica da loja quando em uma loja', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard/loja-1')
    mockUseStoreConfig.mockReturnValue({ 
      config: mockStoreConfig, 
      loading: false, 
      error: null 
    })
    
    render(
      <DashboardLayout>
        <div>Conteúdo da Loja</div>
      </DashboardLayout>
    )

    // Verificar se a navegação da loja está presente
    expect(screen.getByText('Visão Geral')).toBeInTheDocument()
    expect(screen.getByText('Produtos')).toBeInTheDocument()
    expect(screen.getByText('Pedidos')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
    expect(screen.getByText('Configurações')).toBeInTheDocument()
  })

  it('deve mostrar submenu de configurações quando ativo', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard/loja-1/configuracoes')
    mockUseStoreConfig.mockReturnValue({ 
      config: mockStoreConfig, 
      loading: false, 
      error: null 
    })
    
    render(
      <DashboardLayout>
        <div>Configurações da Loja</div>
      </DashboardLayout>
    )

    // Verificar se o submenu está presente
    expect(screen.getByText('Visual')).toBeInTheDocument()
    expect(screen.getByText('Entrega')).toBeInTheDocument()
    expect(screen.getByText('Pagamento')).toBeInTheDocument()
    expect(screen.getByText('Horários')).toBeInTheDocument()
  })

  it('deve mostrar loading quando carregando configuração da loja', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard/loja-1')
    mockUseStoreConfig.mockReturnValue({ 
      config: null, 
      loading: true, 
      error: null 
    })
    
    render(
      <DashboardLayout>
        <div>Conteúdo da Loja</div>
      </DashboardLayout>
    )

    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('deve mostrar erro quando loja não é encontrada', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard/loja-1')
    mockUseStoreConfig.mockReturnValue({ 
      config: null, 
      loading: false, 
      error: 'Not found' 
    })
    
    render(
      <DashboardLayout>
        <div>Conteúdo da Loja</div>
      </DashboardLayout>
    )

    expect(screen.getByText('Loja não encontrada')).toBeInTheDocument()
    expect(screen.getByText('Verifique se o endereço está correto.')).toBeInTheDocument()
  })

  it('deve mostrar logo padrão quando loja não tem logo', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard')
    
    render(
      <DashboardLayout>
        <div>Conteúdo do Dashboard</div>
      </DashboardLayout>
    )

    // Verificar se o ícone padrão está presente
    const defaultLogo = screen.getByTestId('default-logo')
    expect(defaultLogo).toBeInTheDocument()
  })

  it('deve mostrar breadcrumbs corretos', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard/loja-1/produtos')
    mockUseStoreConfig.mockReturnValue({ 
      config: mockStoreConfig, 
      loading: false, 
      error: null 
    })
    
    render(
      <DashboardLayout>
        <div>Produtos da Loja</div>
      </DashboardLayout>
    )

    // Verificar se os breadcrumbs estão corretos
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('loja-1')).toBeInTheDocument()
  })
}) 