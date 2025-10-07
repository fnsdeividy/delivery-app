import React, { useState, useEffect } from 'react'
import { FunnelIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface FilterOption {
  value: string
  label: string
}

interface FilterConfig {
  key: string
  label: string
  type: 'text' | 'select' | 'date' | 'number' | 'boolean'
  options?: FilterOption[]
  placeholder?: string
  min?: number
  max?: number
}

interface AdvancedFiltersProps {
  filters: FilterConfig[]
  onFiltersChange: (filters: Record<string, any>) => void
  onReset?: () => void
  className?: string
  showSearchButton?: boolean
  debounceMs?: number
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  onReset,
  className = '',
  showSearchButton = false,
  debounceMs = 300
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filterValues, setFilterValues] = useState<Record<string, any>>({})
  const [debouncedValues, setDebouncedValues] = useState<Record<string, any>>({})

  // Debounce dos valores dos filtros
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValues(filterValues)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [filterValues, debounceMs])

  // Notificar mudanças nos filtros
  useEffect(() => {
    // Só notificar se não for a primeira renderização
    if (Object.keys(debouncedValues).length > 0) {
      onFiltersChange(debouncedValues)
    }
  }, [debouncedValues, onFiltersChange])

  // Atualizar valor de um filtro
  const updateFilter = (key: string, value: any) => {
    setFilterValues(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }))
  }

  // Limpar todos os filtros
  const clearAllFilters = () => {
    setFilterValues({})
    if (onReset) {
      onReset()
    }
  }

  // Verificar se há filtros ativos
  const hasActiveFilters = Object.values(filterValues).some(value => 
    value !== undefined && value !== '' && value !== false
  )

  // Renderizar campo de filtro baseado no tipo
  const renderFilterField = (filter: FilterConfig) => {
    const value = filterValues[filter.key] || ''

    switch (filter.type) {
      case 'text':
        return (
          <input
            id={filter.key}
            type="text"
            value={value}
            onChange={(e) => updateFilter(filter.key, e.target.value)}
            placeholder={filter.placeholder || `Filtrar por ${filter.label.toLowerCase()}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        )

      case 'select':
        return (
          <select
            id={filter.key}
            value={value}
            onChange={(e) => updateFilter(filter.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Todos</option>
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'date':
        return (
          <input
            id={filter.key}
            type="date"
            value={value}
            onChange={(e) => updateFilter(filter.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        )

      case 'number':
        return (
          <div className="flex gap-2">
            <input
              id={`${filter.key}_min`}
              type="number"
              value={filterValues[`${filter.key}_min`] || ''}
              onChange={(e) => updateFilter(`${filter.key}_min`, e.target.value)}
              placeholder={filter.min?.toString() || 'Min'}
              min={filter.min}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <input
              id={`${filter.key}_max`}
              type="number"
              value={filterValues[`${filter.key}_max`] || ''}
              onChange={(e) => updateFilter(`${filter.key}_max`, e.target.value)}
              placeholder={filter.max?.toString() || 'Max'}
              max={filter.max}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        )

      case 'boolean':
        return (
          <select
            id={filter.key}
            value={value}
            onChange={(e) => updateFilter(filter.key, e.target.value === 'true')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Todos</option>
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
        )

      default:
        return null
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header dos filtros */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-500" data-testid="funnel-icon" />
            <h3 className="text-sm font-medium text-gray-900">Filtros</h3>
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {Object.values(filterValues).filter(v => v !== undefined && v !== '' && v !== false).length} ativo(s)
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center gap-1"
              >
                Limpar
              </button>
            )}
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo dos filtros */}
      {isExpanded && (
        <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filters.map((filter) => (
            <div key={filter.key}>
              <label htmlFor={filter.key} className="block text-sm font-medium text-gray-700 mb-2">
                {filter.label}
              </label>
              {renderFilterField(filter)}
            </div>
          ))}
        </div>

          {/* Botão de busca (opcional) */}
          {showSearchButton && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => onFiltersChange(filterValues)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                Aplicar Filtros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Hook para gerenciar filtros
export function useAdvancedFilters<T extends Record<string, any>>(initialFilters: T) {
  const [filters, setFilters] = useState<T>(initialFilters)

  const updateFilter = (key: keyof T, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const updateMultipleFilters = (newFilters: Partial<T>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }))
  }

  const resetFilters = () => {
    setFilters(initialFilters)
  }

  const clearFilters = () => {
    setFilters({} as T)
  }

  return {
    filters,
    updateFilter,
    updateMultipleFilters,
    resetFilters,
    clearFilters
  }
} 