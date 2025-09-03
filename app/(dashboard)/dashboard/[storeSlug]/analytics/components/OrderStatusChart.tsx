"use client";

import { ShoppingCart } from "@phosphor-icons/react";
import { Doughnut } from "react-chartjs-2";

interface OrderStatusChartProps {
  orderStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

export default function OrderStatusChart({ orderStatus }: OrderStatusChartProps) {
  // Dados para gráfico de status dos pedidos
  const statusChartData = {
    labels: orderStatus.map((status) => status.status),
    datasets: [
      {
        data: orderStatus.map((status) => status.count),
        backgroundColor: [
          "#10b981", // Verde para entregue
          "#f59e0b", // Amarelo para em preparo
          "#3b82f6", // Azul para aguardando
          "#ef4444", // Vermelho para cancelado
          "#8b5cf6", // Roxo para outros
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const statusChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Status dos Pedidos
      </h3>
      <div className="h-80">
        {orderStatus.length > 0 ? (
          <Doughnut data={statusChartData} options={statusChartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Nenhum pedido encontrado</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
