"use client";

import { cancelOrderAction, updateOrderAction } from "@/app/actions/orders";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrdersPagePolling } from "@/hooks/useOrdersPolling";
import { useStoreConfig } from "@/lib/store/useStoreConfig";
import { calculateOrderStats } from "@/lib/utils/order-utils";
import { Order, OrderStatus } from "@/types/cardapio-api";
import {
  ArrowsClockwise,
  WarningCircle,
  WifiHigh,
  WifiSlash,
  X,
} from "@phosphor-icons/react";
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
  const [actionLoading, setActionLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Polling para atualizações em tempo real
  const {
    orders,
    setOrders,
    isLoading: loadingOrders,
    isConnected: isRealtimeConnected,
    connectionError,
    reconnect,
  } = useOrdersPagePolling(slug, {
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

  // Os pedidos iniciais são carregados pelo hook useOrdersPagePolling

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
      const actionKey = `update-${orderId}`;
      setActionLoading((prev) => ({ ...prev, [actionKey]: true }));
      setErrorMessage(null);

      try {
        const result = await updateOrderAction({
          orderId,
          status: newStatus,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        // Atualizar estado local imediatamente
        if (result.order) {
          setOrders((prev) =>
            prev.map((order) => (order.id === orderId ? result.order : order))
          );
        }
      } catch (error) {
        console.error("Erro ao atualizar status:", error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Erro ao atualizar status do pedido"
        );
      } finally {
        setActionLoading((prev) => ({ ...prev, [actionKey]: false }));
      }
    },
    [setOrders]
  );

  // Confirmar pedido
  const handleConfirmOrder = useCallback(
    async (orderId: string) => {
      const actionKey = `confirm-${orderId}`;
      setActionLoading((prev) => ({ ...prev, [actionKey]: true }));
      setErrorMessage(null);

      try {
        const result = await updateOrderAction({
          orderId,
          status: OrderStatus.CONFIRMED,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        // Atualizar estado local imediatamente
        if (result.order) {
          setOrders((prev) =>
            prev.map((order) => (order.id === orderId ? result.order : order))
          );
        }
      } catch (error) {
        console.error("Erro ao confirmar pedido:", error);
        setErrorMessage(
          error instanceof Error ? error.message : "Erro ao confirmar pedido"
        );
      } finally {
        setActionLoading((prev) => ({ ...prev, [actionKey]: false }));
      }
    },
    [setOrders]
  );

  // Cancelar pedido usando Server Action
  const handleCancelOrder = useCallback(
    async (orderId: string, reason?: string) => {
      const actionKey = `cancel-${orderId}`;
      setActionLoading((prev) => ({ ...prev, [actionKey]: true }));
      setErrorMessage(null);

      try {
        const result = await cancelOrderAction(orderId, slug);

        if (!result.success) {
          throw new Error(result.error);
        }

        // Atualizar estado local imediatamente
        if (result.order) {
          setOrders((prev) =>
            prev.map((order) => (order.id === orderId ? result.order : order))
          );
        }
      } catch (error) {
        console.error("Erro ao cancelar pedido:", error);
        setErrorMessage(
          error instanceof Error ? error.message : "Erro ao cancelar pedido"
        );
      } finally {
        setActionLoading((prev) => ({ ...prev, [actionKey]: false }));
      }
    },
    [slug, setOrders]
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
      {/* Notificação de Erro */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
          <WarningCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-800 text-sm">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-600 hover:text-red-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

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
                      Sincronização Ativa
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-yellow-600">
                    <WifiSlash className="h-4 w-4" />
                    <span className="text-sm font-medium">Desconectado</span>
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
            isLoading={
              actionLoading[`update-${order.id}`] ||
              actionLoading[`confirm-${order.id}`] ||
              actionLoading[`cancel-${order.id}`]
            }
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
