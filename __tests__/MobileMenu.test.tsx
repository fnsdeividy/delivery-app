import { render, screen } from '@testing-library/react'
import { MobileMenu } from '../components/MobileMenu'

// Mock do contexto de autenticação
const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  logout: jest.fn(),
}

jest.mock('../contexts/AuthContext', () => ({
  useAuthContext: () => mockAuthContext,
}))

// Mock dos componentes do Shadcn UI para evitar problemas de renderização
jest.mock('../components/ui', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Sheet: ({ children }: any) => <div data-testid="sheet">{children}</div>,
  SheetContent: ({ children, ...props }: any) => <div data-testid="sheet-content" {...props}>{children}</div>,
  SheetHeader: ({ children }: any) => <div data-testid="sheet-header">{children}</div>,
  SheetTitle: ({ children }: any) => <h2 data-testid="sheet-title">{children}</h2>,
  SheetTrigger: ({ children }: any) => <div data-testid="sheet-trigger">{children}</div>,
}))

describe('MobileMenu', () => {
  beforeEach(() => {
    // Reset mock context before each test
    mockAuthContext.user = null
    mockAuthContext.isAuthenticated = false
    mockAuthContext.logout.mockClear()
  })

  describe('Unauthenticated User', () => {
    it('renders mobile menu trigger button', () => {
      render(<MobileMenu />)
      
      const triggerButton = screen.getByRole('button', { name: 'Abrir menu de navegação' })
      expect(triggerButton).toBeInTheDocument()
      expect(triggerButton).toHaveClass('lg:hidden')
    })

    it('renders sheet component structure', () => {
      render(<MobileMenu />)
      
      expect(screen.getByTestId('sheet')).toBeInTheDocument()
      expect(screen.getByTestId('sheet-trigger')).toBeInTheDocument()
      expect(screen.getByTestId('sheet-content')).toBeInTheDocument()
    })

    it('renders sheet header with title for unauthenticated user', () => {
      render(<MobileMenu />)
      
      expect(screen.getByTestId('sheet-header')).toBeInTheDocument()
      expect(screen.getByTestId('sheet-title')).toBeInTheDocument()
      expect(screen.getByText('Menu')).toBeInTheDocument()
    })

    it('renders default navigation links', () => {
      render(<MobileMenu />)
      
      expect(screen.getByText('Início')).toBeInTheDocument()
      expect(screen.getByText('Ver Lojas')).toBeInTheDocument()
      expect(screen.getByText('Contato')).toBeInTheDocument()
    })

    it('renders action buttons for unauthenticated user', () => {
      render(<MobileMenu />)
      
      expect(screen.getByText('Acessar conta')).toBeInTheDocument()
      expect(screen.getByText('Crie sua loja')).toBeInTheDocument()
    })

    it('has correct navigation link hrefs', () => {
      render(<MobileMenu />)
      
      const inicioLink = screen.getByText('Início').closest('a')
      const verLojasLink = screen.getByText('Ver Lojas').closest('a')
      const contatoLink = screen.getByText('Contato').closest('a')
      
      expect(inicioLink).toHaveAttribute('href', '/')
      expect(verLojasLink).toHaveAttribute('href', '/store')
      expect(contatoLink).toHaveAttribute('href', '/contato')
    })

    it('has correct action button hrefs', () => {
      render(<MobileMenu />)
      
      const loginLink = screen.getByText('Acessar conta').closest('a')
      const cadastrarLink = screen.getByText('Crie sua loja').closest('a')
      
      expect(loginLink).toHaveAttribute('href', '/login')
      expect(cadastrarLink).toHaveAttribute('href', '/register/loja')
    })

    it('applies correct styling classes', () => {
      render(<MobileMenu />)
      
      const triggerButton = screen.getByRole('button', { name: 'Abrir menu de navegação' })
      expect(triggerButton).toHaveClass('lg:hidden', 'p-2', 'rounded-lg', 'text-gray-600')
    })

    it('renders terms and privacy links', () => {
      render(<MobileMenu />)
      
      expect(screen.getByText('Termos')).toBeInTheDocument()
      expect(screen.getByText('Política de Privacidade')).toBeInTheDocument()
    })

    it('renders custom navigation links when provided', () => {
      const customLinks = [
        { href: '/custom', label: 'Custom Link' }
      ]
      
      render(<MobileMenu navLinks={customLinks} />)
      
      expect(screen.getByText('Custom Link')).toBeInTheDocument()
      expect(screen.getByText('Custom Link').closest('a')).toHaveAttribute('href', '/custom')
    })
  })

  describe('Authenticated User', () => {
    beforeEach(() => {
      mockAuthContext.isAuthenticated = true
      mockAuthContext.user = {
        id: '1',
        name: 'João Silva',
        email: 'joao@example.com',
        stores: []
      }
    })

    it('renders personalized header for authenticated user', () => {
      render(<MobileMenu />)
      
      expect(screen.getByText('Olá, João Silva')).toBeInTheDocument()
    })

    it('renders authenticated navigation links', () => {
      render(<MobileMenu />)
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Meus Pedidos')).toBeInTheDocument()
      expect(screen.getByText('Perfil')).toBeInTheDocument()
    })

    it('renders logout button for authenticated user', () => {
      render(<MobileMenu />)
      
      const logoutButton = screen.getByText('Sair da conta')
      expect(logoutButton).toBeInTheDocument()
    })

    it('calls logout function when logout button is clicked', () => {
      render(<MobileMenu />)
      
      const logoutButton = screen.getByText('Sair da conta')
      logoutButton.click()
      
      expect(mockAuthContext.logout).toHaveBeenCalledTimes(1)
    })

    it('does not show login/register buttons for authenticated user', () => {
      render(<MobileMenu />)
      
      expect(screen.queryByText('Acessar conta')).not.toBeInTheDocument()
      expect(screen.queryByText('Crie sua loja')).not.toBeInTheDocument()
    })
  })

  describe('Authenticated User with Stores', () => {
    beforeEach(() => {
      mockAuthContext.isAuthenticated = true
      mockAuthContext.user = {
        id: '1',
        name: 'João Silva',
        email: 'joao@example.com',
        stores: [
          { storeSlug: 'loja-joao', name: 'Loja do João' }
        ]
      }
    })

    it('renders manage store button when user has stores', () => {
      render(<MobileMenu />)
      
      const manageStoreButton = screen.getByText('Gerenciar Loja')
      expect(manageStoreButton).toBeInTheDocument()
      expect(manageStoreButton.closest('a')).toHaveAttribute('href', '/dashboard')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<MobileMenu />)
      
      expect(screen.getByLabelText('Abrir menu de navegação')).toBeInTheDocument()
      expect(screen.getByLabelText('Menu de navegação')).toBeInTheDocument()
    })

    it('has proper navigation landmarks', () => {
      render(<MobileMenu />)
      
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Navegação principal')
    })
  })
}) 