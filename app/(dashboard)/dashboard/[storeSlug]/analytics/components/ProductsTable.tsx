"use client";

import { Package } from "@phosphor-icons/react";

interface ProductsTableProps {
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  formatCurrency: (value: number) => string;
}

export default function ProductsTable({
  topProducts,
  formatCurrency,
}: ProductsTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Detalhes dos Produtos Mais Vendidos
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                Posição
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                Produto
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                Quantidade
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                Receita
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                Ticket Médio
              </th>
            </tr>
          </thead>
          <tbody>
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
                      <span className="text-sm font-bold text-orange-600">
                        {index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm text-gray-900 font-medium">
                      {product.quantity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-semibold text-green-600">
                      {formatCurrency(product.revenue)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm text-gray-900">
                      {formatCurrency(product.revenue / product.quantity)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  <div className="text-center">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 mb-2">
                      Nenhum produto vendido encontrado
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
