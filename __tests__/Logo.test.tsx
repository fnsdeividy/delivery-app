import { render, screen } from '@testing-library/react'
import { Logo } from '../components/Logo'

describe('Logo', () => {
  it('deve renderizar o logo com texto Cardap.IO', () => {
    render(<Logo />)
    expect(screen.getByText('Cardap.IO')).toBeInTheDocument()
  })

  it('deve renderizar o badge Multi-Tenant por padrão', () => {
    render(<Logo />)
    expect(screen.getByText('Multi-Tenant')).toBeInTheDocument()
  })

  it('não deve renderizar o badge quando showBadge for false', () => {
    render(<Logo showBadge={false} />)
    expect(screen.queryByText('Multi-Tenant')).not.toBeInTheDocument()
  })

  it('deve aplicar classes de tamanho corretas', () => {
    const { rerender } = render(<Logo size="sm" />)
    const logoElement = screen.getByText('Cardap.IO')
    expect(logoElement).toHaveClass('text-xl')

    rerender(<Logo size="md" />)
    expect(logoElement).toHaveClass('text-3xl')

    rerender(<Logo size="lg" />)
    expect(logoElement).toHaveClass('text-4xl')
  })

  it('deve aplicar classes customizadas', () => {
    render(<Logo className="custom-class" />)
    const logoContainer = screen.getByText('Cardap.IO').parentElement
    expect(logoContainer).toHaveClass('custom-class')
  })

  it('deve ter estrutura HTML correta', () => {
    render(<Logo />)
    const logoContainer = screen.getByText('Cardap.IO').parentElement
    expect(logoContainer).toHaveClass('flex', 'items-center')
  })
}) 