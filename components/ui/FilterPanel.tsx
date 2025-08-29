"use client";

import { ArrowsClockwise, Funnel, FunnelSimple } from "@phosphor-icons/react";
import { useState } from "react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterPanelProps {
  categories: FilterOption[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  showInactive: boolean;
  onShowInactiveChange: (show: boolean) => void;
  onClearFilters: () => void;
  className?: string;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  isMobile?: boolean;
}

export function FilterPanel({
  categories,
  selectedCategory,
  onCategoryChange,
  showInactive,
  onShowInactiveChange,
  onClearFilters,
  className = "",
  showFilters = true,
  onToggleFilters,
  isMobile = false,
}: FilterPanelProps) {
  const [localShowInactive, setLocalShowInactive] = useState(showInactive);

  const handleShowInactiveChange = (value: boolean) => {
    setLocalShowInactive(value);
    onShowInactiveChange(value);
  };

  const handleClearFilters = () => {
    setLocalShowInactive(false);
    onClearFilters();
  };

  return (
    <div className={`${className}`}>
      <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
        {/* Botão de filtros para mobile */}
        {isMobile && onToggleFilters && (
          <div className="flex justify-end md:hidden">
            <button
              onClick={onToggleFilters}
              className="px-3 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center gap-2 text-sm transition-colors duration-200 border border-gray-300"
            >
              {showFilters ? <FunnelSimple size={16} /> : <Funnel size={16} />}
              <span className="truncate">
                {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
              </span>
            </button>
          </div>
        )}

        {/* Filtros expandíveis */}
        <div
          className={`grid gap-2 sm:gap-3 md:gap-4 ${
            showFilters ? "block" : "hidden md:grid"
          } ${
            isMobile
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {/* Categoria */}
          <div className="min-w-0">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs sm:text-sm md:text-base bg-white"
            >
              <option value="">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="min-w-0">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={localShowInactive ? "inactive" : "active"}
              onChange={(e) =>
                handleShowInactiveChange(e.target.value === "inactive")
              }
              className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs sm:text-sm md:text-base bg-white"
            >
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>

          {/* Limpar filtros - ocupa toda a largura em mobile, apenas uma coluna em desktop */}
          <div
            className={`flex items-end ${
              isMobile ? "col-span-1 sm:col-span-2" : ""
            }`}
          >
            <button
              onClick={handleClearFilters}
              className="w-full px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center gap-2 text-xs sm:text-sm md:text-base transition-colors duration-200 bg-white"
            >
              <ArrowsClockwise
                size={14}
                className="md:w-4 md:h-4 flex-shrink-0"
              />
              <span className="truncate">Limpar Filtros</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
