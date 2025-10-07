import { render, screen } from '@testing-library/react'
import LoadingSpinner from '../components/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('deve renderizar o spinner corretamente', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
  })

  it('deve ter o texto de acessibilidade oculto', () => {
    render(<LoadingSpinner />)
    
    const hiddenText = screen.getByText('Carregando...')
    expect(hiddenText).toBeInTheDocument()
    
    // Verificar se o texto está oculto visualmente
    expect(hiddenText).toHaveClass('!absolute', '!-m-px', '!h-px', '!w-px')
  })

  it('deve ter as classes CSS corretas para animação', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('animate-spin', 'border-4', 'rounded-full')
  })
}) 