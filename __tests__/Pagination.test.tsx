import React from 'react'
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react'
import { Pagination, usePagination } from '@/components/Pagination'

describe('Pagination Component', () => {
  const mockOnPageChange = jest.fn()
  const mockOnItemsPerPageChange = jest.fn()

  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    totalItems: 100,
    itemsPerPage: 10,
    onPageChange: mockOnPageChange,
    onItemsPerPageChange: mockOnItemsPerPageChange,
    showItemsPerPage: true
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Renderização Básica', () => {
    it('deve renderizar informações de paginação', () => {
      render(<Pagination {...defaultProps} />)
      
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'Mostrando 1 a 10 de 100 resultados'
      })).toBeInTheDocument()
    })

    it('deve renderizar controles de navegação', () => {
      render(<Pagination {...defaultProps} />)
      
      expect(screen.getByLabelText('Primeira página')).toBeInTheDocument()
      expect(screen.getByLabelText('Página anterior')).toBeInTheDocument()
      expect(screen.getByLabelText('Próxima página')).toBeInTheDocument()
      expect(screen.getByLabelText('Última página')).toBeInTheDocument()
    })

    it('deve renderizar seletor de itens por página', () => {
      render(<Pagination {...defaultProps} />)
      
      expect(screen.getByText('Por página:')).toBeInTheDocument()
      expect(screen.getByDisplayValue('10')).toBeInTheDocument()
    })

    it('não deve renderizar quando há apenas uma página', () => {
      render(<Pagination {...defaultProps} totalPages={1} />)
      
      expect(screen.queryByText('Mostrando')).not.toBeInTheDocument()
    })
  })

  describe('Navegação de Páginas', () => {
    it('deve chamar onPageChange ao clicar em uma página', () => {
      render(<Pagination {...defaultProps} currentPage={5} />)
      
      const pageButton = screen.getByText('6')
      fireEvent.click(pageButton)
      
      expect(mockOnPageChange).toHaveBeenCalledWith(6)
    })

    it('deve chamar onPageChange ao clicar em primeira página', () => {
      render(<Pagination {...defaultProps} currentPage={5} />)
      
      const firstPageButton = screen.getByLabelText('Primeira página')
      fireEvent.click(firstPageButton)
      
      expect(mockOnPageChange).toHaveBeenCalledWith(1)
    })

    it('deve chamar onPageChange ao clicar em última página', () => {
      render(<Pagination {...defaultProps} currentPage={5} />)
      
      const lastPageButton = screen.getByLabelText('Última página')
      fireEvent.click(lastPageButton)
      
      expect(mockOnPageChange).toHaveBeenCalledWith(10)
    })

    it('deve chamar onPageChange ao clicar em página anterior', () => {
      render(<Pagination {...defaultProps} currentPage={5} />)
      
      const prevButton = screen.getByLabelText('Página anterior')
      fireEvent.click(prevButton)
      
      expect(mockOnPageChange).toHaveBeenCalledWith(4)
    })

    it('deve chamar onPageChange ao clicar em próxima página', () => {
      render(<Pagination {...defaultProps} currentPage={5} />)
      
      const nextButton = screen.getByLabelText('Próxima página')
      fireEvent.click(nextButton)
      
      expect(mockOnPageChange).toHaveBeenCalledWith(6)
    })
  })

  describe('Estados dos Botões', () => {
    it('deve desabilitar botões de primeira e anterior na primeira página', () => {
      render(<Pagination {...defaultProps} currentPage={1} />)
      
      const firstPageButton = screen.getByLabelText('Primeira página')
      const prevButton = screen.getByLabelText('Página anterior')
      
      expect(firstPageButton).toBeDisabled()
      expect(prevButton).toBeDisabled()
    })

    it('deve desabilitar botões de próxima e última na última página', () => {
      render(<Pagination {...defaultProps} currentPage={10} />)
      
      const nextButton = screen.getByLabelText('Próxima página')
      const lastPageButton = screen.getByLabelText('Última página')
      
      expect(nextButton).toBeDisabled()
      expect(lastPageButton).toBeDisabled()
    })

    it('deve destacar a página atual', () => {
      render(<Pagination {...defaultProps} currentPage={5} />)
      
      const currentPageButton = screen.getByText('5')
      expect(currentPageButton).toHaveClass('bg-blue-600', 'text-white')
    })
  })

  describe('Range de Páginas', () => {
    it('deve mostrar range limitado de páginas', () => {
      render(<Pagination {...defaultProps} currentPage={5} totalPages={20} />)
      
      // Deve mostrar páginas 3, 4, 5, 6, 7 (delta = 2)
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('6')).toBeInTheDocument()
      expect(screen.getByText('7')).toBeInTheDocument()
    })

    it('deve mostrar elipses quando há muitas páginas', () => {
      render(<Pagination {...defaultProps} currentPage={10} totalPages={100} />)
      
      const elipses = screen.getAllByText('...')
      expect(elipses.length).toBeGreaterThan(0)
    })
  })

  describe('Itens por Página', () => {
    it('deve chamar onItemsPerPageChange ao alterar itens por página', () => {
      render(<Pagination {...defaultProps} />)
      
      const select = screen.getByDisplayValue('10')
      fireEvent.change(select, { target: { value: '50' } })
      
      expect(mockOnItemsPerPageChange).toHaveBeenCalledWith(50)
    })

    it('não deve mostrar seletor quando showItemsPerPage é false', () => {
      render(<Pagination {...defaultProps} showItemsPerPage={false} />)
      
      expect(screen.queryByText('Por página:')).not.toBeInTheDocument()
    })
  })

  describe('Responsividade', () => {
    it('deve aplicar classes responsivas', () => {
      render(<Pagination {...defaultProps} />)
      
      const container = screen.getByText((content, element) => {
        return element?.textContent === 'Mostrando 1 a 10 de 100 resultados'
      }).closest('div')?.parentElement
      expect(container).toHaveClass('flex-col', 'sm:flex-row')
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter labels ARIA apropriados', () => {
      render(<Pagination {...defaultProps} currentPage={5} />)
      
      expect(screen.getByLabelText('Página 5')).toHaveAttribute('aria-current', 'page')
      expect(screen.getByLabelText('Página 6')).not.toHaveAttribute('aria-current')
    })

    it('deve ter navegação semântica', () => {
      render(<Pagination {...defaultProps} />)
      
      const nav = screen.getByLabelText('Pagination')
      expect(nav).toBeInTheDocument()
    })
  })
})

describe('usePagination Hook', () => {
  it('deve inicializar com valores padrão', () => {
    const { result } = renderHook(() => usePagination())
    
    expect(result.current.currentPage).toBe(1)
    expect(result.current.itemsPerPage).toBe(20)
  })

  it('deve inicializar com valores customizados', () => {
    const { result } = renderHook(() => usePagination(5, 50))
    
    expect(result.current.currentPage).toBe(5)
    expect(result.current.itemsPerPage).toBe(50)
  })

  it('deve navegar para uma página específica', () => {
    const { result } = renderHook(() => usePagination())
    
    act(() => {
      result.current.goToPage(5)
    })
    
    expect(result.current.currentPage).toBe(5)
  })

  it('deve alterar itens por página e resetar para primeira página', () => {
    const { result } = renderHook(() => usePagination(5, 20))
    
    act(() => {
      result.current.changeItemsPerPage(50)
    })
    
    expect(result.current.itemsPerPage).toBe(50)
    expect(result.current.currentPage).toBe(1)
  })

  it('deve resetar paginação', () => {
    const { result } = renderHook(() => usePagination(5, 20))
    
    act(() => {
      result.current.resetPagination()
    })
    
    expect(result.current.currentPage).toBe(1)
  })
}) 