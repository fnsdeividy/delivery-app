"use client";

import { ShoppingBag, Clock, TrendUp, CheckCircle, X, Eye } from "@phosphor-icons/react";
import Link from "next/link";

interface OrderManagementSectionProps {
  storeSlug: string;
}

export function OrderManagementSection({ storeSlug }: OrderManagementSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
      <h2 className="text-base md:text-lg font-medium text-gray-900 mb-3 md:mb-4 flex items-center">
        <ShoppingBag className="w-3.5 sm:w-4 md:w-5 h-3.5 sm:h-4 md:h-5 text-green-600 mr-1.5 sm:mr-2" />
        Gestão de Pedidos
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
        <Link
          href={`/dashboard/${storeSlug}/pedidos?status=novo`}
          className="flex items-center p-1.5 sm:p-2 md:p-3 lg:p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
        >
          <Clock className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-blue-600 mr-1 sm:mr-2 md:mr-3 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-blue-900">
              Novos Pedidos
            </p>
            <p className="text-xs text-blue-600">Aguardando confirmação</p>
          </div>
        </Link>
        <Link
          href={`/dashboard/${storeSlug}/pedidos?status=em_andamento`}
          className="flex items-center p-1.5 sm:p-2 md:p-3 lg:p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors"
        >
          <TrendUp className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-yellow-600 mr-1 sm:mr-2 md:mr-3 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-yellow-900">
              Em Andamento
            </p>
            <p className="text-xs text-yellow-600">Preparando pedidos</p>
          </div>
        </Link>
        <Link
          href={`/dashboard/${storeSlug}/pedidos?status=finalizado`}
          className="flex items-center p-1.5 sm:p-2 md:p-3 lg:p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
        >
          <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-600 mr-1 sm:mr-2 md:mr-3 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-green-900">
              Finalizados
            </p>
            <p className="text-xs text-green-600">Pedidos entregues</p>
          </div>
        </Link>
        <Link
          href={`/dashboard/${storeSlug}/pedidos?status=cancelado`}
          className="flex items-center p-1.5 sm:p-2 md:p-3 lg:p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
        >
          <X className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-red-600 mr-1 sm:mr-2 md:mr-3 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-red-900">
              Cancelados
            </p>
            <p className="text-xs text-red-600">Pedidos cancelados</p>
          </div>
        </Link>
      </div>
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
