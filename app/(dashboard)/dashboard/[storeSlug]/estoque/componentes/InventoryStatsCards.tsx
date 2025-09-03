"use client";

import { Package, Warning, CheckCircle, TrendUp } from "@phosphor-icons/react";

interface InventorySummary {
  totalProducts: number;
  totalStock: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  reservedStock: number;
  availableStock: number;
}

interface InventoryStatsCardsProps {
  summary: InventorySummary;
}

export default function InventoryStatsCards({ summary }: InventoryStatsCardsProps) {
  const stats = [
    {
      title: "Total de Produtos",
      value: summary.totalProducts,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total em Estoque",
      value: summary.totalStock,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Estoque Baixo",
      value: summary.lowStockProducts,
      icon: Warning,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Sem Estoque",
      value: summary.outOfStockProducts,
      icon: Warning,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Reservado",
      value: summary.reservedStock,
      icon: TrendUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Disponível",
      value: summary.availableStock,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const isAlert = stat.title === "Estoque Baixo" || stat.title === "Sem Estoque";
        
        return (
          <div
            key={index}
            className={`${stat.bgColor} rounded-lg p-4 border-2 ${
              isAlert && stat.value > 0 
                ? stat.title === "Sem Estoque" 
                  ? "border-red-300 shadow-red-100" 
                  : "border-yellow-300 shadow-yellow-100"
                : "border-gray-200"
            } hover:shadow-lg transition-all duration-200 cursor-pointer group`}
          >
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                {isAlert && stat.value > 0 && (
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${
                      stat.title === "Sem Estoque" ? "bg-red-500" : "bg-yellow-500"
                    } animate-pulse`}></div>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className={`text-xl font-bold ${
                  isAlert && stat.value > 0 
                    ? stat.title === "Sem Estoque" 
                      ? "text-red-700" 
                      : "text-yellow-700"
                    : "text-gray-900"
                }`}>
                  {stat.value}
                  {stat.title.includes("Estoque") && stat.value !== summary.totalProducts ? " itens" : ""}
                </p>
                {isAlert && stat.value > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {stat.title === "Sem Estoque" ? "Requer atenção imediata" : "Verificar reposição"}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
