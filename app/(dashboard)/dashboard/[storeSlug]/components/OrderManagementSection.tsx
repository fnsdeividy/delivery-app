"use client";

import { OrderCounters } from "@/components/orders/OrderCounters";
import { useCardapioAuth } from "@/hooks";
import { useOrdersWebSocket } from "@/hooks/useOrdersWebSocket";
import { Eye, ShoppingBag } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";

interface OrderManagementSectionProps {
  storeSlug: string;
}

export function OrderManagementSection({
  storeSlug,
}: OrderManagementSectionProps) {
  const { isAuthenticated, getCurrentToken } = useCardapioAuth();
  const [counters, setCounters] = useState({
    newOrders: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });

  // Configurar WebSocket para receber atualizações de contadores
  useOrdersWebSocket({
    storeSlug,
    token: (isAuthenticated() && getCurrentToken()) || "",
    onOrderCountersUpdated: (newCounters) => {
      setCounters(newCounters);
    },
    onStatsUpdated: (stats) => {
      // Atualizar contadores com base nas estatísticas
      if (stats) {
        const statusCounts = stats.statusCounts || {};
        setCounters({
          newOrders:
            (statusCounts["RECEIVED"] || 0) + (statusCounts["PENDING"] || 0),
          totalOrders: stats.totalOrders || 0,
          pendingOrders:
            (statusCounts["PREPARING"] || 0) + (statusCounts["CONFIRMED"] || 0),
        });
      }
    },
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
      <h2 className="text-base md:text-lg font-medium text-gray-900 mb-3 md:mb-4 flex items-center">
        <ShoppingBag className="w-3.5 sm:w-4 md:w-5 h-3.5 sm:h-4 md:h-5 text-green-600 mr-1.5 sm:mr-2" />
        Gestão de Pedidos
      </h2>

      {/* Contadores em tempo real */}
      <OrderCounters
        newOrders={counters.newOrders}
        totalOrders={counters.totalOrders}
        pendingOrders={counters.pendingOrders}
        onCountersUpdate={(newCounters) => {
          setCounters(newCounters);
        }}
      />

      {/* Links para diferentes status */}
      <div className="mt-3 md:mt-4">
        <Link
          href={`/dashboard/${storeSlug}/pedidos`}
          className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs sm:text-sm md:text-base"
        >
          <Eye className="w-3.5 sm:w-4 h-3.5 sm:h-4 mr-1.5 sm:mr-2" />
          Ver Todos os Pedidos
        </Link>
      </div>
    </div>
  );
}
