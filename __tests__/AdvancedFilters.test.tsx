import { AdvancedFilters, useAdvancedFilters } from '@/components/AdvancedFilters'
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'

// Mock do timer para debounce
jest.useFakeTimers()

describe('AdvancedFilters Component', () => {
  const mockOnFiltersChange = jest.fn()
  const mockOnReset = jest.fn()

  const sampleFilters = [
    {
      key: 'name',
      label: 'Nome',
      type: 'text' as const,
      placeholder: 'Buscar por nome'
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'Ativo' },
        { value: 'inactive', label: 'Inativo' }
      ]
    },
    {
      key: 'createdAt',
      label: 'Data de Criação',
      type: 'date' as const
    },
    {
      key: 'price',
      label: 'Preço',
      type: 'number' as const,
      min: 0,
      max: 1000
    },
    {
      key: 'isVerified',
      label: 'Verificado',
      type: 'boolean' as const
    }
  ]

  const defaultProps = {
    filters: sampleFilters,
    onFiltersChange: mockOnFiltersChange,
    onReset: mockOnReset
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  describe('Renderização Básica', () => {
    it('deve renderizar header dos filtros', () => {
      render(<AdvancedFilters {...defaultProps} />)
      
      expect(screen.getByText('Filtros')).toBeInTheDocument()
      expect(screen.getByText('Mostrar')).toBeInTheDocument()
    })

    it('deve mostrar ícone de filtro', () => {
      render(<AdvancedFilters {...defaultProps} />)
      
      const filterIcon = screen.getByTestId('funnel-icon')
      expect(filterIcon).toBeInTheDocument()
    })

    it('não deve mostrar filtros expandidos por padrão', () => {
      render(<AdvancedFilters {...defaultProps} />)
      
      expect(screen.queryByText('Nome')).not.toBeInTheDocument()
      expect(screen.queryByText('Status')).not.toBeInTheDocument()
    })
  })

  describe('Expansão dos Filtros', () => {
    it('deve expandir filtros ao clicar em mostrar', () => {
      render(<AdvancedFilters {...defaultProps} />)
      
      const showButton = screen.getByText('Mostrar')
      fireEvent.click(showButton)
      
      expect(screen.getByText('Nome')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Data de Criação')).toBeInTheDocument()
      expect(screen.getByText('Preço')).toBeInTheDocument()
      expect(screen.getByText('Verificado')).toBeInTheDocument()
    })

    it('deve alternar entre mostrar e ocultar', () => {
      render(<AdvancedFilters {...defaultProps} />)
      
      const toggleButton = screen.getByText('Mostrar')
      
      // Expandir
      fireEvent.click(toggleButton)
      expect(screen.getByText('Nome')).toBeInTheDocument()
      expect(screen.getByText('Ocultar')).toBeInTheDocument()
      
      // Ocultar
      fireEvent.click(toggleButton)
      expect(screen.queryByText('Nome')).not.toBeInTheDocument()
      expect(screen.getByText('Mostrar')).toBeInTheDocument()
    })
  })

  describe('Tipos de Filtros', () => {
    it('deve renderizar filtro de texto', () => {
      render(<AdvancedFilters {...defaultProps} />)
      
      const showButton = screen.getByText('Mostrar')
      fireEvent.click(showButton)
      
      const textInput = screen.getByPlaceholderText('Buscar por nome')
      expect(textInput).toBeInTheDocument()
      expect(textInput).toHaveAttribute('type', 'text')
    })

    it('deve renderizar filtro de select', () => {
      render(<AdvancedFilters {...defaultProps} />)
      
      const showButton = screen.getByText('Mostrar')
      fireEvent.click(showButton)
      
      const select = screen.getByLabelText('Status')
      expect(select).toBeInTheDocument()
      
      // Verificar apenas as opções do select de Status
      const statusOptions = select.querySelectorAll('option')
      expect(statusOptions).toHaveLength(3) // Todos + 2 opções
    })

    it('deve renderizar filtro de data', () => {
      render(<AdvancedFilters {...defaultProps} />)
      
      const showButton = screen.getByText('Mostrar')
      fireEvent.click(showButton)
      
      const dateInput = screen.getByLabelText('Data de Criação')
      expect(dateInput).toBeInTheDocument()
      expect(dateInput).toHaveAttribute('type', 'date')
    })

    it('deve renderizar filtro de número com min/max', () => {
      render(<AdvancedFilters {...defaultProps} />)
      
      const showButton = screen.getByText('Mostrar')
      fireEvent.click(showButton)
      
      const minInput = screen.getByPlaceholderText('0')
      const maxInput = screen.getByPlaceholderText('1000')
      
      expect(minInput).toBeInTheDocument()
      expect(maxInput).toBeInTheDocument()
      expect(minInput).toHaveAttribute('type', 'number')
      expect(maxInput).toHaveAttribute('type', 'number')
    })

    it('deve renderizar filtro booleano', () => {
      render(<AdvancedFilters {...defaultProps} />)
      
      const showButton = screen.getByText('Mostrar')
      fireEvent.click(showButton)
      
      const booleanSelect = screen.getByLabelText('Verificado')
      expect(booleanSelect).toBeInTheDocument()
    })
  })

  describe('Funcionalidade dos Filtros', () => {
    it('deve atualizar valor do filtro de texto', () => {
      render(<AdvancedFilters {...defaultProps} />)
      
      const showButton = screen.getByText('Mostrar')
      fireEvent.click(showButton)
      
      const textInput = screen.getByPlaceholderText('Buscar por nome')
      fireEvent.change(textInput, { target: { value: 'João' } })
      
      expect(textInput).toHaveValue('João')
    })

    it('deve atualizar valor do filtro de select', () => {
      render(<AdvancedFilters {...defaultProps} />)
      
      const showButton = screen.getByText('Mostrar')
      fireEvent.click(showButton)
      
      const select = screen.getByLabelText('Status')
      fireEvent.change(select, { target: { value: 'active' } })
      
      expect(select).toHaveValue('active')
    })

    it('deve atualizar valores dos filtros de número', () => {
      render(<AdvancedFilters {...defaultProps} />)
      
      const showButton = screen.getByText('Mostrar')
      fireEvent.click(showButton)
      
      const minInput = screen.getByPlaceholderText('0')
      const maxInput = screen.getByPlaceholderText('1000')
      
      fireEvent.change(minInput, { target: { value: '100' } })
      fireEvent.change(maxInput, { target: { value: '500' } })
      
      expect(minInput).toHaveValue(100)
      expect(maxInput).toHaveValue(500)
    })
  })

  describe('Debounce e Callbacks', () => {
    it('deve chamar onFiltersChange com debounce', async () => {
      render(<AdvancedFilters {...defaultProps} />)
      
      const showButton = screen.getByText('Mostrar')
      fireEvent.click(showButton)
      
      const textInput = screen.getByPlaceholderText('Buscar por nome')
      fireEvent.change(textInput, { target: { value: 'João' } })
      
      // onFiltersChange não deve ser chamado imediatamente
      expect(mockOnFiltersChange).not.toHaveBeenCalled()
      
      // Avançar o timer para simular debounce
      jest.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({ name: 'João' })
      })
    })

    it('deve chamar onReset ao limpar filtros', () => {
      render(<AdvancedFilters {...defaultProps} />)
      
      const showButton = screen.getByText('Mostrar')
      fireEvent.click(showButton)
      
      // Preencher um filtro para ativar o botão de limpar
      const textInput = screen.getByPlaceholderText('Buscar por nome')
      fireEvent.change(textInput, { target: { value: 'João' } })
      
      // Avançar timer
      jest.advanceTimersByTime(300)
      
      const clearButton = screen.getByText('Limpar')
      fireEvent.click(clearButton)
      
      expect(mockOnReset).toHaveBeenCalled()
    })
  })

  describe('Indicadores de Filtros Ativos', () => {
    it('deve mostrar contador de filtros ativos', () => {
      render(<AdvancedFilters {...defaultProps} />)
      
      const showButton = screen.getByText('Mostrar')
      fireEvent.click(showButton)
      
      // Preencher dois filtros
      const nameInput = screen.getByPlaceholderText('Buscar por nome')
      const statusSelect = screen.getByLabelText('Status')
      
      fireEvent.change(nameInput, { target: { value: 'João' } })
      fireEvent.change(statusSelect, { target: { value: 'active' } })
      
      // Avançar timer
      jest.advanceTimersByTime(300)
      
      expect(screen.getByText('2 ativo(s)')).toBeInTheDocument()
    })

    it('deve mostrar botão de limpar apenas quando há filtros ativos', () => {
      render(<AdvancedFilters {...defaultProps} />)
      
      const showButton = screen.getByText('Mostrar')
      fireEvent.click(showButton)
      
      // Inicialmente não deve mostrar botão de limpar
      expect(screen.queryByText('Limpar')).not.toBeInTheDocument()
      
      // Preencher um filtro
      const nameInput = screen.getByPlaceholderText('Buscar por nome')
      fireEvent.change(nameInput, { target: { value: 'João' } })
      
      // Avançar timer
      jest.advanceTimersByTime(300)
      
      // Agora deve mostrar botão de limpar
      expect(screen.getByText('Limpar')).toBeInTheDocument()
    })
  })

  describe('Botão de Busca', () => {
    it('deve mostrar botão de busca quando showSearchButton é true', () => {
      render(<AdvancedFilters {...defaultProps} showSearchButton={true} />)
      
      const showButton = screen.getByText('Mostrar')
      fireEvent.click(showButton)
      
      expect(screen.getByText('Aplicar Filtros')).toBeInTheDocument()
    })

    it('não deve mostrar botão de busca quando showSearchButton é false', () => {
      render(<AdvancedFilters {...defaultProps} showSearchButton={false} />)
      
      const showButton = screen.getByText('Mostrar')
      fireEvent.click(showButton)
      
      expect(screen.queryByText('Aplicar Filtros')).not.toBeInTheDocument()
    })

    it('deve chamar onFiltersChange ao clicar no botão de busca', () => {
      render(<AdvancedFilters {...defaultProps} showSearchButton={true} />)
      
      const showButton = screen.getByText('Mostrar')
      fireEvent.click(showButton)
      
      const searchButton = screen.getByText('Aplicar Filtros')
      fireEvent.click(searchButton)
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({})
    })
  })

  describe('Responsividade', () => {
    it('deve aplicar grid responsivo', () => {
      render(<AdvancedFilters {...defaultProps} />)
      
      const showButton = screen.getByText('Mostrar')
      fireEvent.click(showButton)
      
      const filtersContainer = screen.getByText('Nome').closest('div')?.parentElement
      expect(filtersContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3')
    })
  })
})

describe('useAdvancedFilters Hook', () => {
  it('deve inicializar com filtros padrão', () => {
    const initialFilters = { name: '', status: 'all' }
    const { result } = renderHook(() => useAdvancedFilters(initialFilters))
    
    expect(result.current.filters).toEqual(initialFilters)
  })

  it('deve atualizar filtro individual', () => {
    const initialFilters = { name: '', status: 'all' }
    const { result } = renderHook(() => useAdvancedFilters(initialFilters))
    
    act(() => {
      result.current.updateFilter('name', 'João')
    })
    
    expect(result.current.filters.name).toBe('João')
  })

  it('deve atualizar múltiplos filtros', () => {
    const initialFilters = { name: '', status: 'all' }
    const { result } = renderHook(() => useAdvancedFilters(initialFilters))
    
    act(() => {
      result.current.updateMultipleFilters({ name: 'João', status: 'active' })
    })
    
    expect(result.current.filters).toEqual({ name: 'João', status: 'active' })
  })

  it('deve resetar filtros para valores iniciais', () => {
    const initialFilters = { name: '', status: 'all' }
    const { result } = renderHook(() => useAdvancedFilters(initialFilters))
    
    // Alterar filtros
    act(() => {
      result.current.updateFilter('name', 'João')
      result.current.updateFilter('status', 'active')
    })
    
    // Resetar
    act(() => {
      result.current.resetFilters()
    })
    
    expect(result.current.filters).toEqual(initialFilters)
  })

  it('deve limpar todos os filtros', () => {
    const initialFilters = { name: '', status: 'all' }
    const { result } = renderHook(() => useAdvancedFilters(initialFilters))
    
    // Alterar filtros
    act(() => {
      result.current.updateFilter('name', 'João')
    })
    
    // Limpar
    act(() => {
      result.current.clearFilters()
    })
    
    expect(result.current.filters).toEqual({})
  })
}) 