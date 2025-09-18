"use client";

import { Order, OrderStatus } from "@/types/cardapio-api";
import {
  ArrowsClockwise,
  Bell,
  CheckCircle,
  Clock,
  CookingPot,
  Eye,
  EyeSlash,
  Truck,
  WifiHigh,
  WifiSlash,
  X,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";

interface RealTimeDashboardProps {
  orders: Order[];
  isConnected: boolean;
  connectionError: string | null;
  onReconnect: () => void;
  onViewOrder: (order: Order) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

interface DashboardStats {
  total: number;
  received: number;
  confirmed: number;
  preparing: number;
  ready: number;
  delivering: number;
  delivered: number;
  cancelled: number;
  revenue: number;
}

export function RealTimeDashboard({
  orders,
  isConnected,
  connectionError,
  onReconnect,
  onViewOrder,
  onUpdateOrderStatus,
}: RealTimeDashboardProps) {
  const [showNotifications, setShowNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Calcular estatísticas
  const stats: DashboardStats = orders.reduce(
    (acc, order) => {
      acc.total++;
      acc[order.status.toLowerCase() as keyof DashboardStats]++;
      if (order.status === OrderStatus.DELIVERED) {
        acc.revenue += Number(order.total);
      }
      return acc;
    },
    {
      total: 0,
      received: 0,
      confirmed: 0,
      preparing: 0,
      ready: 0,
      delivering: 0,
      delivered: 0,
      cancelled: 0,
      revenue: 0,
    }
  );

  // Atualizar timestamp quando orders mudarem
  useEffect(() => {
    setLastUpdate(new Date());
  }, [orders]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      [OrderStatus.PENDING]: "bg-gray-100 text-gray-800",
      [OrderStatus.RECEIVED]: "bg-blue-100 text-blue-800",
      [OrderStatus.CONFIRMED]: "bg-green-100 text-green-800",
      [OrderStatus.PREPARING]: "bg-orange-100 text-orange-800",
      [OrderStatus.READY]: "bg-purple-100 text-purple-800",
      [OrderStatus.DELIVERING]: "bg-indigo-100 text-indigo-800",
      [OrderStatus.DELIVERED]: "bg-green-100 text-green-800",
      [OrderStatus.CANCELLED]: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: OrderStatus) => {
    const icons = {
      [OrderStatus.PENDING]: Clock,
      [OrderStatus.RECEIVED]: Clock,
      [OrderStatus.CONFIRMED]: CheckCircle,
      [OrderStatus.PREPARING]: CookingPot,
      [OrderStatus.READY]: CheckCircle,
      [OrderStatus.DELIVERING]: Truck,
      [OrderStatus.DELIVERED]: CheckCircle,
      [OrderStatus.CANCELLED]: X,
    };
    return icons[status] || Clock;
  };

  const getStatusLabel = (status: OrderStatus) => {
    const labels = {
      [OrderStatus.PENDING]: "Pendentes",
      [OrderStatus.RECEIVED]: "Recebidos",
      [OrderStatus.CONFIRMED]: "Confirmados",
      [OrderStatus.PREPARING]: "Em Preparo",
      [OrderStatus.READY]: "Prontos",
      [OrderStatus.DELIVERING]: "Entregando",
      [OrderStatus.DELIVERED]: "Entregues",
      [OrderStatus.CANCELLED]: "Cancelados",
    };
    return labels[status] || status;
  };

  // Pedidos recentes (últimos 10)
  const recentOrders = orders
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header com status de conexão */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Dashboard em Tempo Real
            </h2>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <WifiHigh className="h-4 w-4" />
                  <span className="text-sm font-medium">Conectado</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-red-600">
                  <WifiSlash className="h-4 w-4" />
                  <span className="text-sm font-medium">Desconectado</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500">
              Última atualização: {formatTime(lastUpdate)}
            </div>
            {connectionError && (
              <button
                onClick={onReconnect}
                className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 flex items-center space-x-1"
              >
                <ArrowsClockwise className="h-4 w-4" />
                <span>Reconectar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 xl:grid-cols-8 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
        {Object.entries(stats).map(([key, value]) => {
          if (key === "total" || key === "revenue") return null;

          const status = key.toUpperCase() as OrderStatus;
          const Icon = getStatusIcon(status);
          const color = getStatusColor(status);

          return (
            <div
              key={key}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-1.5 sm:p-2 md:p-3 lg:p-4 min-h-[60px] sm:min-h-[70px] md:min-h-[80px]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 h-full">
                <div
                  className={`p-1 sm:p-1.5 md:p-2 rounded-full ${color} flex-shrink-0 self-center sm:self-start`}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                </div>
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 leading-tight">
                    {value}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate leading-tight">
                    {getStatusLabel(status)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumo financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                Total de Pedidos
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                {stats.total}
              </p>
            </div>
            <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                Receita Total
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                {formatCurrency(stats.revenue)}
              </p>
            </div>
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                Ticket Médio
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">
                {stats.total > 0
                  ? formatCurrency(stats.revenue / stats.total)
                  : "R$ 0,00"}
              </p>
            </div>
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Pedidos recentes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Pedidos Recentes
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title={
                  showNotifications
                    ? "Ocultar notificações"
                    : "Mostrar notificações"
                }
              >
                {showNotifications ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeSlash className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {recentOrders.map((order) => {
            const StatusIcon = getStatusIcon(order.status);
            const statusColor = getStatusColor(order.status);

            return (
              <div
                key={order.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${statusColor}`}>
                      <StatusIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Pedido #{order.orderNumber || order.id.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.customer?.name || "Cliente"} •{" "}
                        {formatTime(new Date(order.createdAt))}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(Number(order.total))}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.items?.length || 0} item(s)
                      </p>
                    </div>

                    <button
                      onClick={() => onViewOrder(order)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {recentOrders.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum pedido recente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
