"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import {
  useDashboardUpdateOrderStatus,
  useOrdersByStore,
} from "@/hooks/useOrderStatus";
import { useStoreConfig } from "@/lib/store/useStoreConfig";
import { calculateOrderStats, filterOrders } from "@/lib/utils/order-utils";
import { OrderStatus } from "@/types/cardapio-api";
import { Order } from "@/types/order";
import { ArrowsClockwise } from "@phosphor-icons/react";
import { useParams } from "next/navigation";
import { useState } from "react";

// Componentes
import {
  EmptyOrdersList,
  OrderCard,
  OrderDetailsModal,
  OrderFilters,
  OrdersLoading,
  OrderStats,
} from "@/components/orders";

export default function PedidosPage() {
  const params = useParams();
  const slug = params.storeSlug as string;

  const { config, loading } = useStoreConfig(slug);
  const { user, isAuthenticated } = useAuthContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Hooks da API Cardap.IO - só buscar pedidos se estiver autenticado
  const {
    data: ordersData,
    isLoading: loadingOrders,
    refetch: refetchOrders,
    error: ordersError,
  } = useOrdersByStore(slug, 1, 10);
  const updateStatusMutation = useDashboardUpdateOrderStatus();

  const orders = ordersData?.data || [];

  // Filtrar pedidos
  const filteredOrders = filterOrders(
    orders,
    searchTerm,
    selectedStatus,
    selectedPaymentStatus
  );

  // Atualizar status do pedido
  const handleStatusUpdate = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: orderId,
        status: newStatus,
        storeSlug: slug,
      });
      refetchOrders();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar status do pedido");
    }
  };

  // Estatísticas
  const stats = calculateOrderStats(orders);

  // Handlers
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleCloseDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  const hasActiveFilters = Boolean(
    searchTerm || selectedStatus !== "all" || selectedPaymentStatus !== "all"
  );

  if (loading || loadingOrders) {
    return <OrdersLoading />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-600">Gerencie os pedidos da sua loja</p>
        </div>
        <button
          onClick={() => refetchOrders()}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
        >
          <ArrowsClockwise className="h-4 w-4" />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Estatísticas */}
      <OrderStats stats={stats} orders={orders} />

      {/* Filtros */}
      <OrderFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedPaymentStatus={selectedPaymentStatus}
        setSelectedPaymentStatus={setSelectedPaymentStatus}
      />

      {/* Lista de Pedidos */}
      <div className="space-y-4">
        {filteredOrders.map((order: Order) => (
          <OrderCard
            key={order.id}
            order={order}
            onStatusUpdate={handleStatusUpdate}
            onViewDetails={handleViewDetails}
          />
        ))}

        {filteredOrders.length === 0 && (
          <EmptyOrdersList hasFilters={hasActiveFilters} />
        )}
      </div>

      {/* Modal de Detalhes do Pedido */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={showOrderDetails}
        onClose={handleCloseDetails}
      />
    </div>
  );
}
