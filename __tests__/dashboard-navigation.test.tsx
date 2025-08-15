import DashboardAdmin from '@/app/(dashboard)/dashboard/page'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'

// Mock do Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock do hook useCardapioAuth
jest.mock('@/hooks', () => ({
  useCardapioAuth: () => ({
    isAuthenticated: () => true,
    getCurrentToken: () => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiQURNSU4iLCJzdG9yZVNsdWciOm51bGwsImlhdCI6MTYzNTY4OTYwMCwiZXhwIjoxNjM1NjkzMjAwfQ.mock'
  }),
  useDashboardStats: () => ({
    data: null,
    isLoading: false,
    error: null
  })
}))

// Mock do Link do Next.js
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

// Wrapper com QueryClient para os testes
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('Dashboard Navigation', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    })
  })

  it('deve renderizar o botão "Ver Todas as Lojas" corretamente', () => {
    render(
      <TestWrapper>
        <DashboardAdmin />
      </TestWrapper>
    )
    
    const verTodasLojasButton = screen.getByRole('link', { name: /ver todas as lojas/i })
    expect(verTodasLojasButton).toBeInTheDocument()
  })

  it('deve ter o atributo href correto para navegação', () => {
    render(
      <TestWrapper>
        <DashboardAdmin />
      </TestWrapper>
    )
    
    const verTodasLojasButton = screen.getByRole('link', { name: /ver todas as lojas/i })
    expect(verTodasLojasButton).toHaveAttribute('href', '/dashboard/gerenciar-lojas')
  })

  it('deve ter o role="link" para acessibilidade', () => {
    render(
      <TestWrapper>
        <DashboardAdmin />
      </TestWrapper>
    )
    
    const verTodasLojasButton = screen.getByRole('link', { name: /ver todas as lojas/i })
    expect(verTodasLojasButton).toHaveAttribute('role', 'link')
  })

  it('deve ter aria-label descritivo', () => {
    render(
      <TestWrapper>
        <DashboardAdmin />
      </TestWrapper>
    )
    
    const verTodasLojasButton = screen.getByRole('link', { name: /ver todas as lojas/i })
    expect(verTodasLojasButton).toHaveAttribute('aria-label', 'Ver todas as lojas cadastradas no sistema')
  })

  it('deve manter o estilo visual consistente', () => {
    render(
      <TestWrapper>
        <DashboardAdmin />
      </TestWrapper>
    )
    
    const verTodasLojasButton = screen.getByRole('link', { name: /ver todas as lojas/i })
    expect(verTodasLojasButton).toHaveClass(
      'inline-flex',
      'items-center',
      'px-4',
      'py-2',
      'bg-gray-100',
      'text-gray-700',
      'rounded-lg',
      'hover:bg-gray-200',
      'transition-colors'
    )
  })

  it('deve ter o ícone Store visível', () => {
    render(
      <TestWrapper>
        <DashboardAdmin />
      </TestWrapper>
    )
    
    const verTodasLojasButton = screen.getByRole('link', { name: /ver todas as lojas/i })
    const storeIcon = verTodasLojasButton.querySelector('svg')
    expect(storeIcon).toBeInTheDocument()
  })

  it('deve ter o texto "Ver Todas as Lojas" visível', () => {
    render(
      <TestWrapper>
        <DashboardAdmin />
      </TestWrapper>
    )
    
    const verTodasLojasButton = screen.getByRole('link', { name: /ver todas as lojas/i })
    expect(verTodasLojasButton).toHaveTextContent('Ver Todas as Lojas')
  })
}) 