"use client";

import { Search, Filter, X } from "lucide-react";
import { useState } from "react";

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
  activeTab: "inventory" | "movements";
  showLowStock: boolean;
  onLowStockChange: (show: boolean) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  onFilter: () => void;
  isLoading?: boolean;
}

export default function SearchAndFilters({
  searchQuery,
  onSearchChange,
  onSearch,
  activeTab,
  showLowStock,
  onLowStockChange,
  selectedType,
  onTypeChange,
  onFilter,
  isLoading = false,
}: SearchAndFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  const clearSearch = () => {
    onSearchChange("");
    onSearch();
  };

  const movementTypes = [
    { value: "", label: "Todos os tipos" },
    { value: "ENTRADA", label: "Entrada" },
    { value: "SAIDA", label: "Saída" },
    { value: "AJUSTE", label: "Ajuste" },
    { value: "DEVOLUCAO", label: "Devolução" },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      {/* Busca Principal */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </button>
          <button
            onClick={onFilter}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            Buscar
          </button>
        </div>
      </div>

      {/* Filtros Avançados */}
      {showAdvancedFilters && (
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtros específicos para Inventário */}
            {activeTab === "inventory" && (
              <>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showLowStock}
                      onChange={(e) => onLowStockChange(e.target.checked)}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Apenas estoque baixo
                    </span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status do Produto
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Todos os status</option>
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </>
            )}

            {/* Filtros específicos para Movimentações */}
            {activeTab === "movements" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Movimentação
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => onTypeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {movementTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Final
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}
          </div>

          {/* Ações dos Filtros */}
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={() => {
                onSearchChange("");
                onLowStockChange(false);
                onTypeChange("");
                setShowAdvancedFilters(false);
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
