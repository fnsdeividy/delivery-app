"use client";

import { ChartBar } from "@phosphor-icons/react";
import { Line } from "react-chartjs-2";

interface SalesChartProps {
  salesByPeriod: Array<{
    period: string;
    orders: number;
    revenue: number;
  }>;
}

export default function SalesChart({ salesByPeriod }: SalesChartProps) {
  // Dados para gráfico de vendas por período
  const salesChartData = {
    labels: salesByPeriod.map((period) => period.period),
    datasets: [
      {
        label: "Receita (R$)",
        data: salesByPeriod.map((period) => period.revenue),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
      },
      {
        label: "Pedidos",
        data: salesByPeriod.map((period) => period.orders),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        yAxisID: "y1",
      },
    ],
  };

  const salesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        beginAtZero: true,
        title: {
          display: true,
          text: "Receita (R$)",
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        beginAtZero: true,
        title: {
          display: true,
          text: "Número de Pedidos",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Vendas por Período
      </h3>
      <div className="h-80">
        {salesByPeriod.length > 0 ? (
          <Line data={salesChartData} options={salesChartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <ChartBar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">
                Nenhum dado de vendas disponível
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
