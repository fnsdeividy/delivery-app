"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  CurrencyDollar,
  ShoppingCart,
  TrendUp,
  Users,
} from "@phosphor-icons/react";

interface MetricsCardsProps {
  metrics: {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    averageOrderValue: number;
    ordersGrowth: number;
    revenueGrowth: number;
    customersGrowth: number;
  };
  formatCurrency: (value: number) => string;
  formatNumber: (value: number) => string;
}

export default function MetricsCards({
  metrics,
  formatCurrency,
  formatNumber,
}: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total de Pedidos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Total de Pedidos
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(metrics.totalOrders)}
            </p>
            <div className="flex items-center mt-2">
              {metrics.ordersGrowth > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  metrics.ordersGrowth > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {Math.abs(metrics.ordersGrowth)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">
                vs período anterior
              </span>
            </div>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <ShoppingCart className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Receita Total */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Receita Total
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(metrics.totalRevenue)}
            </p>
            <div className="flex items-center mt-2">
              {metrics.revenueGrowth > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  metrics.revenueGrowth > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {Math.abs(metrics.revenueGrowth)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">
                vs período anterior
              </span>
            </div>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <CurrencyDollar className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Clientes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Clientes</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(metrics.totalCustomers)}
            </p>
            <div className="flex items-center mt-2">
              {metrics.customersGrowth > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  metrics.customersGrowth > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {Math.abs(metrics.customersGrowth)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">
                vs período anterior
              </span>
            </div>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Ticket Médio */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Ticket Médio
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(metrics.averageOrderValue)}
            </p>
            <p className="text-sm text-gray-500 mt-2">Por pedido</p>
          </div>
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <TrendUp className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
