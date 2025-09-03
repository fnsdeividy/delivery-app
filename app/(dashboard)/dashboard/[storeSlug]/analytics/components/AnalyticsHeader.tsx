"use client";

import { ChartBar, Package, Plus } from "@phosphor-icons/react";

interface AnalyticsHeaderProps {
  timeRange: "7d" | "30d" | "90d";
  onTimeRangeChange: (range: "7d" | "30d" | "90d") => void;
  onAddProduct: () => void;
  onViewProducts: () => void;
}

export default function AnalyticsHeader({
  timeRange,
  onTimeRangeChange,
  onAddProduct,
  onViewProducts,
}: AnalyticsHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <ChartBar className="h-6 w-6 text-orange-500" />
            <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
          </div>

          {/* Ações rápidas */}
          <div className="flex items-center space-x-3">
            {/* Filtro de período */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Período:</span>
              <select
                value={timeRange}
                onChange={(e) =>
                  onTimeRangeChange(e.target.value as "7d" | "30d" | "90d")
                }
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
              </select>
            </div>

            {/* Botão para adicionar produto */}
            <button
              onClick={onAddProduct}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </button>

            {/* Botão para ver produtos */}
            <button
              onClick={onViewProducts}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Package className="h-4 w-4 mr-2" />
              Ver Produtos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
