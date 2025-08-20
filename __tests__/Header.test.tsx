import { render, screen } from '@testing-library/react';
import { Header } from '../components/Header';

// Mock dos componentes filhos
jest.mock('../components/Logo', () => ({
  Logo: ({ size }: { size?: string }) => (
    <div data-testid="logo" data-size={size}>
      Cardap.IO
    </div>
  )
}))

jest.mock('../components/MobileMenu', () => ({
  MobileMenu: ({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) => (
    <div data-testid="mobile-menu">
      <button onClick={onToggle} data-testid="mobile-menu-toggle">
        Toggle Menu
      </button>
      {isOpen && <div data-testid="mobile-menu-content">Menu Content</div>}
    </div>
  )
}))

describe('Header', () => {
  it('deve renderizar o logo', () => {
    render(<Header />)
    expect(screen.getByTestId('logo')).toBeInTheDocument()
  })

  it('deve renderizar os links de navegação no desktop', () => {
    render(<Header />)
    expect(screen.getByText('Dashboard Lojista')).toBeInTheDocument()
  })

  it('deve renderizar os botões de ação no desktop', () => {
    render(<Header />)
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Cadastrar')).toBeInTheDocument()
  })

  it('deve renderizar o componente MobileMenu', () => {
    render(<Header />)
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()
  })

  it('deve ter estrutura de header fixo', () => {
    render(<Header />)
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('fixed', 'top-0', 'left-0', 'right-0')
  })

  it('deve ter spacer para compensar o header fixo', () => {
    render(<Header />)
    const spacer = screen.getByTestId('header-spacer')
    expect(spacer).toHaveClass('h-16')
  })

  it('deve ter links com hrefs corretos', () => {
    render(<Header />)
    
    const dashboardLink = screen.getByText('Dashboard Lojista')
    const loginLink = screen.getByText('Login')
    const registerLink = screen.getByText('Cadastrar')

    expect(dashboardLink.closest('a')).toHaveAttribute('href', '/login/lojista')
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login')
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register')
  })

  it('deve ter classes responsivas corretas', () => {
    render(<Header />)
    
    // Links de navegação devem ser hidden em lg
    const nav = screen.getByText('Dashboard Lojista').closest('nav')
    expect(nav).toHaveClass('hidden', 'lg:flex')
    
    // Botões de ação devem ser hidden em lg
    const buttonsContainer = screen.getByText('Login').closest('div')
    expect(buttonsContainer).toHaveClass('hidden', 'lg:flex')
  })

  it('deve ter z-index alto para ficar sobre outros elementos', () => {
    render(<Header />)
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('z-40')
  })
}) 