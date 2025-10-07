"use client";

import { Clock } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

interface OrderCountersProps {
  newOrders: number;
  totalOrders: number;
  pendingOrders: number;
  onCountersUpdate?: (counters: {
    newOrders: number;
    totalOrders: number;
    pendingOrders: number;
  }) => void;
}

export function OrderCounters({
  newOrders,
  totalOrders,
  pendingOrders,
  onCountersUpdate,
}: OrderCountersProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const previousCountsRef = useRef({
    newOrders,
    totalOrders,
    pendingOrders,
  });

  // Detectar mudanças nos contadores
  useEffect(() => {
    const prev = previousCountsRef.current;
    const hasNewOrders = newOrders > prev.newOrders;
    const hasTotalOrders = totalOrders > prev.totalOrders;
    const hasPendingOrders = pendingOrders > prev.pendingOrders;

    if (hasNewOrders || hasTotalOrders || hasPendingOrders) {
      setIsAnimating(true);

      onCountersUpdate?.({
        newOrders,
        totalOrders,
        pendingOrders,
      });

      // Atualiza o ref após notificar, evitando novo render por estado
      previousCountsRef.current = { newOrders, totalOrders, pendingOrders };

      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 2000);

      return () => clearTimeout(timer);
    }

    // Se não houve aumento, apenas sincroniza o ref
    previousCountsRef.current = { newOrders, totalOrders, pendingOrders };
  }, [newOrders, totalOrders, pendingOrders, onCountersUpdate]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
      {/* Novos Pedidos */}
      <div
        className={`flex items-center p-1.5 sm:p-2 md:p-3 lg:p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-all duration-300 ${
          isAnimating
            ? "animate-pulse ring-2 ring-blue-300 ring-opacity-50"
            : ""
        }`}
      >
        <Clock className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-blue-600 mr-1 sm:mr-2 md:mr-3 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-xs md:text-sm font-medium text-blue-900">
            Novos Pedidos
          </p>
          <p className="text-xs text-blue-600">
            {newOrders > 0 ? (
              <span className="font-bold text-blue-700">
                {newOrders} aguardando
              </span>
            ) : (
              "Aguardando confirmação"
            )}
          </p>
        </div>
        {/* Badge de contagem */}
        {newOrders > 0 && (
          <div className="ml-auto">
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full animate-bounce">
              {newOrders}
            </span>
          </div>
        )}
      </div>

      {/* Em Andamento */}
      <div className="flex items-center p-1.5 sm:p-2 md:p-3 lg:p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors">
        <Clock className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-yellow-600 mr-1 sm:mr-2 md:mr-3 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-xs md:text-sm font-medium text-yellow-900">
            Em Andamento
          </p>
          <p className="text-xs text-yellow-600">
            {pendingOrders > 0 ? (
              <span className="font-bold text-yellow-700">
                {pendingOrders} preparando
              </span>
            ) : (
              "Preparando pedidos"
            )}
          </p>
        </div>
        {/* Badge de contagem */}
        {pendingOrders > 0 && (
          <div className="ml-auto">
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-yellow-600 rounded-full">
              {pendingOrders}
            </span>
          </div>
        )}
      </div>

      {/* Prontos */}
      <div className="flex items-center p-1.5 sm:p-2 md:p-3 lg:p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
        <Clock className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-600 mr-1 sm:mr-2 md:mr-3 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-xs md:text-sm font-medium text-green-900">
            Prontos
          </p>
          <p className="text-xs text-green-600">Pedidos finalizados</p>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center p-1.5 sm:p-2 md:p-3 lg:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
        <Clock className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-600 mr-1 sm:mr-2 md:mr-3 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-xs md:text-sm font-medium text-gray-900">
            Total Hoje
          </p>
          <p className="text-xs text-gray-600">
            {totalOrders > 0 ? (
              <span className="font-bold text-gray-700">
                {totalOrders} pedidos
              </span>
            ) : (
              "Nenhum pedido"
            )}
          </p>
        </div>
        {/* Badge de contagem */}
        {totalOrders > 0 && (
          <div className="ml-auto">
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gray-600 rounded-full">
              {totalOrders}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
