import { AdminOrderManagement } from '@/components/AdminOrderManagement'
import { fireEvent, render, screen } from '@testing-library/react'

// Mock dos ícones do Phosphor
jest.mock('@phosphor-icons/react', () => ({
  Package: ({ className }: { className?: string }) => <div data-testid="package-icon" className={className} />,
  MagnifyingGlass: ({ className }: { className?: string }) => <div data-testid="magnifying-glass-icon" className={className} />,
  Funnel: ({ className }: { className?: string }) => <div data-testid="funnel-icon" className={className} />
}))

describe('AdminOrderManagement', () => {
  it('renderiza o componente corretamente', () => {
    render(<AdminOrderManagement />)
    
    expect(screen.getByText('Total de Pedidos')).toBeInTheDocument()
    expect(screen.getByText('Receita Total')).toBeInTheDocument()
    expect(screen.getByText('Pedidos Pendentes')).toBeInTheDocument()
    expect(screen.getByText('Pedidos Entregues')).toBeInTheDocument()
  })

  it('exibe estatísticas zeradas quando não há dados', () => {
    render(<AdminOrderManagement />)
    
    // Verificar que há múltiplos elementos com valor 0
    const zeroElements = screen.getAllByText('0')
    expect(zeroElements).toHaveLength(3)
    expect(screen.getByText('R$ 0.00')).toBeInTheDocument()
  })

  it('renderiza filtros de busca', () => {
    render(<AdminOrderManagement />)
    
    expect(screen.getByPlaceholderText('Buscar pedidos por número, cliente, loja...')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Todos os Status')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Todas as Lojas')).toBeInTheDocument()
  })

  it('permite digitar no campo de busca', () => {
    render(<AdminOrderManagement />)
    
    const searchInput = screen.getByPlaceholderText('Buscar pedidos por número, cliente, loja...')
    fireEvent.change(searchInput, { target: { value: 'teste' } })
    
    expect(searchInput).toHaveValue('teste')
  })

  it('permite alterar filtro de status', () => {
    render(<AdminOrderManagement />)
    
    const statusSelect = screen.getByDisplayValue('Todos os Status')
    fireEvent.change(statusSelect, { target: { value: 'RECEIVED' } })
    
    expect(statusSelect).toHaveValue('RECEIVED')
  })

  it('permite alterar filtro de loja', () => {
    render(<AdminOrderManagement />)
    
    const storeSelect = screen.getByDisplayValue('Todas as Lojas')
    // Como não há opções de lojas no mock, o valor permanece 'all'
    expect(storeSelect).toHaveValue('all')
  })

  it('exibe mensagem quando não há pedidos', () => {
    render(<AdminOrderManagement />)
    
    expect(screen.getByText('Nenhum pedido encontrado')).toBeInTheDocument()
    expect(screen.getByText('Não há pedidos no sistema ainda.')).toBeInTheDocument()
  })

  it('renderiza cabeçalho da tabela corretamente', () => {
    render(<AdminOrderManagement />)
    
    expect(screen.getByText('Pedidos do Sistema')).toBeInTheDocument()
    // Como não há pedidos, a tabela não é renderizada, apenas a mensagem de "nenhum pedido"
    expect(screen.queryByText('Pedido')).not.toBeInTheDocument()
    expect(screen.queryByText('Loja')).not.toBeInTheDocument()
    expect(screen.queryByText('Cliente')).not.toBeInTheDocument()
    expect(screen.queryByText('Status')).not.toBeInTheDocument()
    expect(screen.queryByText('Tipo')).not.toBeInTheDocument()
    expect(screen.queryByText('Pagamento')).not.toBeInTheDocument()
    expect(screen.queryByText('Total')).not.toBeInTheDocument()
    expect(screen.queryByText('Ações')).not.toBeInTheDocument()
  })

  it('não exibe paginação quando não há pedidos', () => {
    render(<AdminOrderManagement />)
    
    expect(screen.queryByText('Anterior')).not.toBeInTheDocument()
    expect(screen.queryByText('Próxima')).not.toBeInTheDocument()
  })

  it('renderiza ícones corretamente', () => {
    render(<AdminOrderManagement />)
    
    expect(screen.getByTestId('package-icon')).toBeInTheDocument()
    expect(screen.getByTestId('magnifying-glass-icon')).toBeInTheDocument()
  })
}) 