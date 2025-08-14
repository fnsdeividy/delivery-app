import React from 'react'
import { ChevronLeftIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (itemsPerPage: number) => void
  showItemsPerPage?: boolean
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  className = ''
}: PaginationProps) {
  // Calcular range de páginas para exibir
  const getPageRange = () => {
    const delta = 2 // Número de páginas para mostrar antes e depois da atual
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  // Opções de itens por página
  const itemsPerPageOptions = [10, 20, 50, 100]

  // Calcular informações de exibição
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Se não há páginas, não renderizar
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Informações de itens */}
      <div className="text-sm text-gray-700">
        Mostrando <span className="font-medium">{startItem}</span> a{' '}
        <span className="font-medium">{endItem}</span> de{' '}
        <span className="font-medium">{totalItems.toLocaleString()}</span> resultados
      </div>

      {/* Controles de paginação */}
      <div className="flex items-center gap-2">
        {/* Seletor de itens por página */}
        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center gap-2 mr-4">
            <label htmlFor="itemsPerPage" className="text-sm text-gray-700">
              Por página:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Navegação de páginas */}
        <nav className="flex items-center gap-1" aria-label="Pagination">
          {/* Primeira página */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100"
            aria-label="Primeira página"
          >
            <ChevronDoubleLeftIcon className="w-4 h-4" />
          </button>

          {/* Página anterior */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100"
            aria-label="Página anterior"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>

          {/* Números de página */}
          {getPageRange().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-gray-500">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-label={`Página ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}

          {/* Próxima página */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100"
            aria-label="Próxima página"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>

          {/* Última página */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100"
            aria-label="Última página"
          >
            <ChevronDoubleRightIcon className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </div>
  )
}

// Hook para gerenciar estado de paginação
export function usePagination(initialPage = 1, initialItemsPerPage = 20) {
  const [currentPage, setCurrentPage] = React.useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = React.useState(initialItemsPerPage)

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const changeItemsPerPage = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset para primeira página
  }

  const resetPagination = () => {
    setCurrentPage(1)
  }

  return {
    currentPage,
    itemsPerPage,
    goToPage,
    changeItemsPerPage,
    resetPagination
  }
} 