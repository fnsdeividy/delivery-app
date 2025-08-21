import AdminUsuarios from '@/app/(dashboard)/dashboard/admin/usuarios/page'
import { useCardapioAuth } from '@/hooks'
import { fireEvent, render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'

// Mock dos hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('@/hooks', () => ({
  useCardapioAuth: jest.fn()
}))

// Mock dos ícones do Phosphor
jest.mock('@phosphor-icons/react', () => ({
  Crown: ({ className }: { className?: string }) => <div data-testid="crown-icon" className={className} />,
  Shield: ({ className }: { className?: string }) => <div data-testid="shield-icon" className={className} />
}))

// Mock do componente UserManagement
jest.mock('@/components/UserManagement', () => ({
  UserManagement: () => <div data-testid="user-management">UserManagement Component</div>
}))

const mockRouter = {
  push: jest.fn()
}

const mockUseCardapioAuth = {
  isAuthenticated: jest.fn(),
  getCurrentToken: jest.fn()
}

describe('AdminUsuarios', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useCardapioAuth as jest.Mock).mockReturnValue(mockUseCardapioAuth)
  })

  it('redireciona para login quando não autenticado', () => {
    mockUseCardapioAuth.isAuthenticated.mockReturnValue(false)
    mockUseCardapioAuth.getCurrentToken.mockReturnValue(null)

    render(<AdminUsuarios />)
    
    expect(mockRouter.push).toHaveBeenCalledWith('/login/lojista')
  })

  it('redireciona para login quando não autenticado', () => {
    mockUseCardapioAuth.isAuthenticated.mockReturnValue(false)
    mockUseCardapioAuth.getCurrentToken.mockReturnValue(null)

    render(<AdminUsuarios />)
    
    expect(mockRouter.push).toHaveBeenCalledWith('/login/lojista')
  })

  it('redireciona para login quando não há token', () => {
    mockUseCardapioAuth.isAuthenticated.mockReturnValue(true)
    mockUseCardapioAuth.getCurrentToken.mockReturnValue(null)

    render(<AdminUsuarios />)
    
    expect(mockRouter.push).toHaveBeenCalledWith('/login/lojista')
  })

  it('redireciona para unauthorized quando não é admin', () => {
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiTE9KSVNUQSIsImVtYWlsIjoibG9qaXN0YUB0ZXN0ZS5jb20iLCJpYXQiOjE2MzQ1Njc4NzJ9.test'
    
    mockUseCardapioAuth.isAuthenticated.mockReturnValue(true)
    mockUseCardapioAuth.getCurrentToken.mockReturnValue(mockToken)

    render(<AdminUsuarios />)
    
    expect(mockRouter.push).toHaveBeenCalledWith('/unauthorized')
  })

  it('renderiza página quando é SUPER_ADMIN', () => {
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiU1VQRVJfQURNSU4iLCJlbWFpbCI6ImFkbWluQHRlc3RlLmNvbSIsImlhdCI6MTYzNDU2Nzg3Mn0.test'
    
    mockUseCardapioAuth.isAuthenticated.mockReturnValue(true)
    mockUseCardapioAuth.getCurrentToken.mockReturnValue(mockToken)

    render(<AdminUsuarios />)
    
    expect(screen.getByText('Gestão de Usuários')).toBeInTheDocument()
    expect(screen.getByText('Administre todos os usuários do sistema')).toBeInTheDocument()
    expect(screen.getByText('Super Admin')).toBeInTheDocument()
    expect(screen.getByTestId('user-management')).toBeInTheDocument()
  })

  it('renderiza página quando é ADMIN', () => {
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiQURNSU4iLCJlbWFpbCI6ImFkbWluQHRlc3RlLmNvbSIsImlhdCI6MTYzNDU2Nzg3Mn0.test'
    
    mockUseCardapioAuth.isAuthenticated.mockReturnValue(true)
    mockUseCardapioAuth.getCurrentToken.mockReturnValue(mockToken)

    render(<AdminUsuarios />)
    
    expect(screen.getByText('Gestão de Usuários')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByTestId('user-management')).toBeInTheDocument()
  })

  it('exibe botão voltar ao dashboard', () => {
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiU1VQRVJfQURNSU4iLCJlbWFpbCI6ImFkbWluQHRlc3RlLmNvbSIsImlhdCI6MTYzNDU2Nzg3Mn0.test'
    
    mockUseCardapioAuth.isAuthenticated.mockReturnValue(true)
    mockUseCardapioAuth.getCurrentToken.mockReturnValue(mockToken)

    render(<AdminUsuarios />)
    
    const backButton = screen.getByText('Voltar ao Dashboard')
    expect(backButton).toBeInTheDocument()
    
    fireEvent.click(backButton)
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/admin')
  })

  it('renderiza ícones corretamente', () => {
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiU1VQRVJfQURNSU4iLCJlbWFpbCI6ImFkbWluQHRlc3RlLmNvbSIsImlhdCI6MTYzNDU2Nzg3Mn0.test'
    
    mockUseCardapioAuth.isAuthenticated.mockReturnValue(true)
    mockUseCardapioAuth.getCurrentToken.mockReturnValue(mockToken)

    render(<AdminUsuarios />)
    
    expect(screen.getByTestId('crown-icon')).toBeInTheDocument()
  })

  it('redireciona para login em caso de erro', () => {
    mockUseCardapioAuth.isAuthenticated.mockReturnValue(true)
    mockUseCardapioAuth.getCurrentToken.mockImplementation(() => {
      throw new Error('Token inválido')
    })

    render(<AdminUsuarios />)
    
    expect(mockRouter.push).toHaveBeenCalledWith('/login/lojista')
  })
}) 