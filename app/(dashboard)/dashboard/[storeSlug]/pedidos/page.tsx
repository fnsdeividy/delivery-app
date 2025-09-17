"use client";

import { cancelOrderAction, updateOrderAction } from "@/app/actions/orders";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrdersPageSSE } from "@/hooks/useOrdersSSE";
import { useStoreConfig } from "@/lib/store/useStoreConfig";
import { calculateOrderStats } from "@/lib/utils/order-utils";
import { Order, OrderStatus } from "@/types/cardapio-api";
import { ArrowsClockwise, WifiHigh, WifiSlash } from "@phosphor-icons/react";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";

// Componentes
import {
  EmptyOrdersList,
  OrderCard,
  OrderDetailsModal,
  OrderFilters,
  OrdersLoading,
  OrderStats,
} from "@/components/orders";
import { NewOrderNotification } from "@/components/orders/NewOrderNotification";

export default function PedidosPage() {
  const params = useParams();
  const slug = params.storeSlug as string;

  const { config, loading } = useStoreConfig(slug);
  const { user, isAuthenticated } = useAuthContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newOrderNotification, setNewOrderNotification] =
    useState<Order | null>(null);

  // SSE para atualizações em tempo real
  const {
    orders,
    setOrders,
    isLoading: loadingOrders,
    isConnected: isRealtimeConnected,
    connectionError,
    reconnect,
  } = useOrdersPageSSE(slug, {
    onNewOrder: (order) => {
      setNewOrderNotification(order);
    },
    onOrderUpdate: (orderId, updatedOrder) => {
      // Atualizar pedido na lista
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updatedOrder : order))
      );
    },
    onOrderCancel: (orderId) => {
      // Remover pedido cancelado da lista
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
    },
  });

  // Os pedidos iniciais são carregados pelo hook useOrdersPageSSE

  // Filtrar pedidos localmente
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !searchTerm ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;
    const matchesPaymentStatus =
      selectedPaymentStatus === "all" ||
      (selectedPaymentStatus === "paid"
        ? order.paymentStatus === "PAID"
        : selectedPaymentStatus === "pending"
        ? order.paymentStatus === "PENDING"
        : true);

    const matchesDateRange =
      !startDate ||
      !endDate ||
      (new Date(order.createdAt) >= new Date(startDate) &&
        new Date(order.createdAt) <= new Date(endDate));

    return (
      matchesSearch && matchesStatus && matchesPaymentStatus && matchesDateRange
    );
  });

  // Atualizar status do pedido usando Server Action
  const handleStatusUpdate = useCallback(
    async (orderId: string, newStatus: OrderStatus) => {
      try {
        const result = await updateOrderAction({
          orderId,
          status: newStatus,
        });

        if (!result.success) {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error("Erro ao atualizar status:", error);
        alert("Erro ao atualizar status do pedido");
      }
    },
    []
  );

  // Confirmar pedido
  const handleConfirmOrder = useCallback(async (orderId: string) => {
    try {
      const result = await updateOrderAction({
        orderId,
        status: OrderStatus.CONFIRMED,
      });

      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Erro ao confirmar pedido:", error);
      alert("Erro ao confirmar pedido");
    }
  }, []);

  // Cancelar pedido usando Server Action
  const handleCancelOrder = useCallback(
    async (orderId: string, reason?: string) => {
      try {
        const result = await cancelOrderAction(orderId, slug);

        if (!result.success) {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error("Erro ao cancelar pedido:", error);
        alert("Erro ao cancelar pedido");
      }
    },
    [slug]
  );

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

  if (loading) {
    return <OrdersLoading />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
            {isAuthenticated && (
              <div className="flex items-center space-x-1">
                {isRealtimeConnected ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <WifiHigh className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Atualização Automática
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-yellow-600">
                    <WifiSlash className="h-4 w-4" />
                    <span className="text-sm font-medium">Manual</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-gray-600">Gerencie os pedidos da sua loja</p>
        </div>
        <div className="flex items-center space-x-2">
          {connectionError && (
            <button
              onClick={reconnect}
              className="bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700 flex items-center space-x-2 text-sm"
            >
              <ArrowsClockwise className="h-4 w-4" />
              <span>Reconectar</span>
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <ArrowsClockwise className="h-4 w-4" />
            <span>Atualizar</span>
          </button>
        </div>
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
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      {/* Lista de Pedidos */}
      <div className="space-y-4">
        {filteredOrders.map((order: Order) => (
          <OrderCard
            key={order.id}
            order={order}
            onStatusUpdate={handleStatusUpdate}
            onConfirmOrder={handleConfirmOrder}
            onCancelOrder={handleCancelOrder}
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

      {/* Notificação de Novo Pedido */}
      <NewOrderNotification
        newOrder={newOrderNotification}
        onClose={() => setNewOrderNotification(null)}
      />
    </div>
  );
}
