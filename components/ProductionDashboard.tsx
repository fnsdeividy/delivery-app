"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useTimelinePerformance,
  useTimelineStats,
} from "@/hooks/useProductionTimeline";
import { OrderStatus } from "@/types/cardapio-api";
import {
  Activity,
  BarChart3,
  ChefHat,
  Clock,
  Package,
  TrendingUp,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { ProductionTimeline } from "./ProductionTimeline";

interface ProductionDashboardProps {
  storeSlug: string;
  selectedOrderId?: string;
  onOrderSelect?: (orderId: string) => void;
}

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  total: number;
  createdAt: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.RECEIVED]: "bg-blue-100 text-blue-800",
  [OrderStatus.CONFIRMED]: "bg-green-100 text-green-800",
  [OrderStatus.PREPARING]: "bg-orange-100 text-orange-800",
  [OrderStatus.ASSEMBLING]: "bg-amber-100 text-amber-800",
  [OrderStatus.PACKAGING]: "bg-purple-100 text-purple-800",
  [OrderStatus.READY]: "bg-emerald-100 text-emerald-800",
  [OrderStatus.DELIVERING]: "bg-cyan-100 text-cyan-800",
  [OrderStatus.DELIVERED]: "bg-green-100 text-green-800",
  [OrderStatus.CANCELLED]: "bg-red-100 text-red-800",
};

const statusLabels: Record<OrderStatus, string> = {
  [OrderStatus.RECEIVED]: "Recebido",
  [OrderStatus.CONFIRMED]: "Confirmado",
  [OrderStatus.PREPARING]: "Preparando",
  [OrderStatus.ASSEMBLING]: "Montando",
  [OrderStatus.PACKAGING]: "Embalando",
  [OrderStatus.READY]: "Pronto",
  [OrderStatus.DELIVERING]: "Entregando",
  [OrderStatus.DELIVERED]: "Entregue",
  [OrderStatus.CANCELLED]: "Cancelado",
};

export function ProductionDashboard({
  storeSlug,
  selectedOrderId,
  onOrderSelect,
}: ProductionDashboardProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">(
    "today"
  );

  const { data: stats, isLoading: statsLoading } = useTimelineStats(storeSlug);
  const { data: performance, isLoading: performanceLoading } =
    useTimelinePerformance(storeSlug, 30);

  // Mock data - em produção, isso viria de uma API
  const orders: Order[] = [
    {
      id: "1",
      orderNumber: "202501080001",
      status: OrderStatus.PREPARING,
      customerName: "João Silva",
      total: 25.9,
      createdAt: "2025-01-08T10:30:00Z",
      items: [
        { name: "X-Burger Especial", quantity: 1, price: 18.9 },
        { name: "Batata Frita", quantity: 1, price: 7.0 },
      ],
    },
    {
      id: "2",
      orderNumber: "202501080002",
      status: OrderStatus.ASSEMBLING,
      customerName: "Maria Santos",
      total: 32.5,
      createdAt: "2025-01-08T10:45:00Z",
      items: [
        { name: "X-Tudo", quantity: 1, price: 22.5 },
        { name: "Refrigerante", quantity: 1, price: 5.0 },
        { name: "Açaí", quantity: 1, price: 5.0 },
      ],
    },
    {
      id: "3",
      orderNumber: "202501080003",
      status: OrderStatus.PACKAGING,
      customerName: "Pedro Costa",
      total: 15.9,
      createdAt: "2025-01-08T11:00:00Z",
      items: [{ name: "X-Salada", quantity: 1, price: 15.9 }],
    },
  ];

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    onOrderSelect?.(order.id);
  };

  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter((order) => order.status === status);
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const productionStages = [
    {
      status: OrderStatus.PREPARING,
      label: "Preparação",
      icon: ChefHat,
      color: "orange",
    },
    {
      status: OrderStatus.ASSEMBLING,
      label: "Montagem",
      icon: Package,
      color: "amber",
    },
    {
      status: OrderStatus.PACKAGING,
      label: "Embalagem",
      icon: Package,
      color: "purple",
    },
    {
      status: OrderStatus.READY,
      label: "Pronto",
      icon: Truck,
      color: "emerald",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Produção</h1>
          <p className="text-gray-600">
            Acompanhe o fluxo de produção dos lanches
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={timeRange === "today" ? "default" : "outline"}
            onClick={() => setTimeRange("today")}
            size="sm"
          >
            Hoje
          </Button>
          <Button
            variant={timeRange === "week" ? "default" : "outline"}
            onClick={() => setTimeRange("week")}
            size="sm"
          >
            Semana
          </Button>
          <Button
            variant={timeRange === "month" ? "default" : "outline"}
            onClick={() => setTimeRange("month")}
            size="sm"
          >
            Mês
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Pedidos Ativos
                </p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Taxa de Conclusão
                </p>
                <p className="text-2xl font-bold">94%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                <p className="text-2xl font-bold">18min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Eficiência</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Stage */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos por Etapa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productionStages.map((stage) => {
                const stageOrders = getOrdersByStatus(stage.status);
                const Icon = stage.icon;

                return (
                  <div
                    key={stage.status}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-5 w-5 text-${stage.color}-600`} />
                      <div>
                        <h4 className="font-medium">{stage.label}</h4>
                        <p className="text-sm text-gray-600">
                          {stageOrders.length} pedidos
                        </p>
                      </div>
                    </div>
                    <Badge className={statusColors[stage.status]}>
                      {stageOrders.length}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedOrder?.id === order.id
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white hover:bg-gray-50"
                  }`}
                  onClick={() => handleOrderSelect(order)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">#{order.orderNumber}</h4>
                      <p className="text-sm text-gray-600">
                        {order.customerName}
                      </p>
                      <p className="text-sm text-gray-500">
                        R$ {order.total.toFixed(2)}
                      </p>
                    </div>
                    <Badge className={statusColors[order.status]}>
                      {statusLabels[order.status]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Order Timeline */}
      {selectedOrder && (
        <Card>
          <CardHeader>
            <CardTitle>
              Timeline - Pedido #{selectedOrder.orderNumber}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProductionTimeline
              orderId={selectedOrder.id}
              storeSlug={storeSlug}
              currentStatus={selectedOrder.status}
              showAdvanceButton={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      {performance && (
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Tempo Médio por Etapa</h4>
                <div className="space-y-2">
                  {Object.entries(performance.averageStageTimes).map(
                    ([stage, time]) => (
                      <div key={stage} className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          {statusLabels[stage as OrderStatus] || stage}
                        </span>
                        <span className="font-medium">{formatTime(time)}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Distribuição de Pedidos</h4>
                <div className="space-y-2">
                  {Object.entries(performance.stageCounts).map(
                    ([stage, count]) => (
                      <div key={stage} className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          {statusLabels[stage as OrderStatus] || stage}
                        </span>
                        <span className="font-medium">{count}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
