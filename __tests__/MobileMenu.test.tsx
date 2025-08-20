import { fireEvent, render, screen } from '@testing-library/react'
import { MobileMenu } from '../components/MobileMenu'

describe('MobileMenu', () => {
  const mockOnToggle = jest.fn()

  beforeEach(() => {
    mockOnToggle.mockClear()
  })

  it('deve renderizar o botão hamburger', () => {
    render(<MobileMenu isOpen={false} onToggle={mockOnToggle} />)
    expect(screen.getByLabelText('Abrir menu')).toBeInTheDocument()
  })

  it('deve chamar onToggle quando o botão hamburger for clicado', () => {
    render(<MobileMenu isOpen={false} onToggle={mockOnToggle} />)
    const hamburgerButton = screen.getByLabelText('Abrir menu')
    fireEvent.click(hamburgerButton)
    expect(mockOnToggle).toHaveBeenCalledTimes(1)
  })

  it('deve renderizar o menu quando isOpen for true', () => {
    render(<MobileMenu isOpen={true} onToggle={mockOnToggle} />)
    expect(screen.getByText('Menu')).toBeInTheDocument()
    expect(screen.getByText('Dashboard Lojista')).toBeInTheDocument()
  })

  it('não deve renderizar o menu quando isOpen for false', () => {
    render(<MobileMenu isOpen={false} onToggle={mockOnToggle} />)
    expect(screen.queryByText('Menu')).not.toBeInTheDocument()
  })

  it('deve renderizar os botões de ação no menu', () => {
    render(<MobileMenu isOpen={true} onToggle={mockOnToggle} />)
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Cadastrar')).toBeInTheDocument()
  })

  it('deve chamar onToggle quando o backdrop for clicado', () => {
    render(<MobileMenu isOpen={true} onToggle={mockOnToggle} />)
    const backdrop = screen.getByTestId('backdrop')
    fireEvent.click(backdrop)
    expect(mockOnToggle).toHaveBeenCalledTimes(1)
  })

  it('deve chamar onToggle quando o botão de fechar for clicado', () => {
    render(<MobileMenu isOpen={true} onToggle={mockOnToggle} />)
    const closeButton = screen.getByLabelText('Fechar menu')
    fireEvent.click(closeButton)
    expect(mockOnToggle).toHaveBeenCalledTimes(1)
  })

  it('deve ter links com hrefs corretos', () => {
    render(<MobileMenu isOpen={true} onToggle={mockOnToggle} />)
    
    const dashboardLink = screen.getByText('Dashboard Lojista')
    const loginLink = screen.getByText('Login')
    const registerLink = screen.getByText('Cadastrar')

    expect(dashboardLink.closest('a')).toHaveAttribute('href', '/login/lojista')
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login')
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register')
  })

  it('deve chamar onToggle quando um link for clicado', () => {
    render(<MobileMenu isOpen={true} onToggle={mockOnToggle} />)
    const dashboardLink = screen.getByText('Dashboard Lojista')
    fireEvent.click(dashboardLink)
    expect(mockOnToggle).toHaveBeenCalledTimes(1)
  })
}) 