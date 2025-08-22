import HomePage from '@/app/page'
import { render, screen } from '@testing-library/react'

// Mock do componente Header
jest.mock('@/components/Header', () => {
  return {
    Header: function MockHeader() {
      return <div data-testid="header">Header Component</div>
    }
  }
})

// Mock do Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

describe('HomePage', () => {
  it('deve renderizar a página inicial corretamente', () => {
    render(<HomePage />)
    
    // Verifica se o Header está presente
    expect(screen.getByTestId('header')).toBeInTheDocument()
    
    // Verifica se o título principal está presente
    expect(screen.getByText(/Encontre as Melhores Lojas/)).toBeInTheDocument()
    expect(screen.getByText(/Próximas de Você/)).toBeInTheDocument()
  })

  it('deve exibir a seção de recursos', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Por que escolher o Cardap.IO?')).toBeInTheDocument()
    expect(screen.getByText('Entrega Rápida')).toBeInTheDocument()
    expect(screen.getByText('Compra Segura')).toBeInTheDocument()
    expect(screen.getByText('Lojas Verificadas')).toBeInTheDocument()
  })

  it('deve exibir as categorias populares', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Categorias Populares')).toBeInTheDocument()
    // Usa getAllByText para verificar se as categorias estão presentes
    const categorias = screen.getAllByText(/Eletrônicos|Moda|Casa|Livros|Esportes|Beleza/)
    expect(categorias.length).toBeGreaterThan(0)
  })



  it('deve exibir a seção CTA', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Pronto para começar?')).toBeInTheDocument()
    expect(screen.getByText('Criar Conta Grátis')).toBeInTheDocument()
    expect(screen.getByText('Fazer Login')).toBeInTheDocument()
  })

  it('deve exibir o footer com informações da empresa', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Cardap.IO')).toBeInTheDocument()
    expect(screen.getByText(/A melhor plataforma para conectar clientes e lojistas locais/)).toBeInTheDocument()
    expect(screen.getByText('© 2024 Cardap.IO. Todos os direitos reservados.')).toBeInTheDocument()
  })

  it('deve ter links funcionais para navegação', () => {
    render(<HomePage />)
    
    // Verifica links principais
    expect(screen.getByText('Explorar Lojas').closest('a')).toHaveAttribute('href', '/lojas')
    expect(screen.getByText('Seja um Vendedor').closest('a')).toHaveAttribute('href', '/register')
    expect(screen.getByText('Criar Conta Grátis').closest('a')).toHaveAttribute('href', '/register')
    expect(screen.getByText('Fazer Login').closest('a')).toHaveAttribute('href', '/login')
  })

  it('deve ter estrutura responsiva com classes Tailwind apropriadas', () => {
    render(<HomePage />)
    
    // Verifica se o container principal tem as classes corretas
    const mainContainer = screen.getByTestId('header').parentElement
    expect(mainContainer).toHaveClass('min-h-screen', 'bg-gray-50')
  })
}) 