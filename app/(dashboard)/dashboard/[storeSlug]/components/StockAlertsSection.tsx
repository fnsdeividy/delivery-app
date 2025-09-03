"use client";

import { Warning, Package } from "@phosphor-icons/react";
import Link from "next/link";

interface StockAlertsSectionProps {
  metrics: {
    lowStockProducts: number;
    outOfStockProducts: number;
  };
  storeSlug: string;
}

export function StockAlertsSection({ metrics, storeSlug }: StockAlertsSectionProps) {
  if (!metrics || (metrics.lowStockProducts === 0 && metrics.outOfStockProducts === 0)) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
      <h2 className="text-base md:text-lg font-medium text-gray-900 mb-3 md:mb-4 flex items-center">
        <Warning className="w-3.5 sm:w-4 md:w-5 h-3.5 sm:h-4 md:h-5 text-yellow-600 mr-1.5 sm:mr-2" />
        Alertas de Estoque
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
        {metrics.lowStockProducts > 0 && (
          <div className="flex items-center p-2 sm:p-3 md:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <Warning className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-yellow-600 mr-1.5 sm:mr-2 md:mr-3 flex-shrink-0" />
            <div>
              <p className="text-xs md:text-sm font-medium text-yellow-800">
                {metrics.lowStockProducts} produto(s) com estoque baixo
              </p>
              <p className="text-xs text-yellow-600">
                Verifique e reabasteça o estoque
              </p>
            </div>
          </div>
        )}
        {metrics.outOfStockProducts > 0 && (
          <div className="flex items-center p-2 sm:p-3 md:p-4 bg-red-50 rounded-lg border border-red-200">
            <Warning className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-red-600 mr-1.5 sm:mr-2 md:mr-3 flex-shrink-0" />
            <div>
              <p className="text-xs md:text-sm font-medium text-red-800">
                {metrics.outOfStockProducts} produto(s) sem estoque
              </p>
              <p className="text-xs text-red-600">
                Produtos indisponíveis para venda
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="mt-3 md:mt-4">
        <Link
          href={`/dashboard/${storeSlug}/estoque`}
          className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm md:text-base"
        >
          <Package className="w-3.5 sm:w-4 h-3.5 sm:h-4 mr-1.5 sm:mr-2" />
          Gerenciar Estoque
        </Link>
      </div>
    </div>
  );
}
