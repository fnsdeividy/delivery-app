"use client";

import { Package, Plus } from "@phosphor-icons/react";
import { Bar } from "react-chartjs-2";

interface TopProductsChartProps {
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  onAddProduct: () => void;
}

export default function TopProductsChart({ topProducts, onAddProduct }: TopProductsChartProps) {
  // Dados para gráfico de produtos mais vendidos
  const productsChartData = {
    labels: topProducts
      .slice(0, 5)
      .map((product) => product.name),
    datasets: [
      {
        label: "Quantidade Vendida",
        data: topProducts
          .slice(0, 5)
          .map((product) => product.quantity),
        backgroundColor: "rgba(147, 51, 234, 0.8)",
        borderColor: "rgb(147, 51, 234)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    indexAxis: "y" as const,
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Quantidade Vendida",
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Top 5 Produtos Mais Vendidos
        </h3>
        <button
          onClick={onAddProduct}
          className="inline-flex items-center px-3 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Produto
        </button>
      </div>
      <div className="h-80">
        {topProducts.length > 0 ? (
          <Bar data={productsChartData} options={chartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 mb-2">
                Nenhum produto vendido encontrado
              </p>
              <button
                onClick={onAddProduct}
                className="inline-flex items-center px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Produto
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
