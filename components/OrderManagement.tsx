"use client";

import {
  useCancelOrder,
  useCreateOrder,
  useOrderStats,
  useOrders,
  useUpdateOrder,
} from "@/hooks";
import {
  Order,
  OrderStatus,
  OrderType,
  PaymentStatus,
  UpdateOrderDto,
} from "@/types/cardapio-api";
import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface OrderManagementProps {
  storeSlug: string;
}

export function OrderManagement({ storeSlug }: OrderManagementProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">(
    "all"
  );
  const [selectedType, setSelectedType] = useState<OrderType | "all">("all");

  // Hooks para pedidos
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    error: ordersError,
  } = useOrders(storeSlug, currentPage, 10);
  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrder();
  const cancelOrderMutation = useCancelOrder();

  // Stats dos pedidos
  const { data: orderStats, isLoading: isLoadingStats } =
    useOrderStats(storeSlug);

  // Filtrar pedidos
  const filteredOrders =
    ordersData?.data.filter((order: Order) => {
      const matchesSearch =
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.customer?.phone?.includes(searchTerm);

      const matchesStatus =
        selectedStatus === "all" || order.status === selectedStatus;
      const matchesType = selectedType === "all" || order.type === selectedType;

      return matchesSearch && matchesStatus && matchesType;
    }) || [];

  // Manipular mudança de status
  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      const updateData: UpdateOrderDto = {
        status: newStatus,
      };

      await updateOrderMutation.mutateAsync({
        id: orderId,
        orderData: updateData,
      });
    } catch (error) {
      console.error("Erro ao atualizar status do pedido:", error);
    }
  };

  // Manipular cancelamento
  const handleCancelOrder = async (orderId: string) => {
    if (window.confirm("Tem certeza que deseja cancelar este pedido?")) {
      try {
        await cancelOrderMutation.mutateAsync(orderId);
      } catch (error) {
        console.error("Erro ao cancelar pedido:", error);
      }
    }
  };

  // Obter cor do status
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.RECEIVED:
        return "bg-blue-100 text-blue-800";
      case OrderStatus.PREPARING:
        return "bg-yellow-100 text-yellow-800";
      case OrderStatus.READY:
        return "bg-green-100 text-green-800";
      case OrderStatus.DELIVERING:
        return "bg-purple-100 text-purple-800";
      case OrderStatus.DELIVERED:
        return "bg-green-100 text-green-800";
      case OrderStatus.CANCELLED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Obter texto do status
  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.RECEIVED:
        return "Recebido";
      case OrderStatus.PREPARING:
        return "Preparando";
      case OrderStatus.READY:
        return "Pronto";
      case OrderStatus.DELIVERING:
        return "Entregando";
      case OrderStatus.DELIVERED:
        return "Entregue";
      case OrderStatus.CANCELLED:
        return "Cancelado";
      default:
        return status;
    }
  };

  // Obter cor do tipo
  const getTypeColor = (type: OrderType) => {
    switch (type) {
      case OrderType.DELIVERY:
        return "bg-blue-100 text-blue-800";
      case OrderType.PICKUP:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Obter texto do tipo
  const getTypeText = (type: OrderType) => {
    switch (type) {
      case OrderType.DELIVERY:
        return "Entrega";
      case OrderType.PICKUP:
        return "Retirada";
      default:
        return type;
    }
  };

  // Obter cor do status de pagamento
  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return "bg-green-100 text-green-800";
      case PaymentStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case PaymentStatus.FAILED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoadingOrders) {
    return <LoadingSpinner />;
  }

  if (ordersError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-700">
          Erro ao carregar pedidos: {ordersError.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Gerenciamento de Pedidos
        </h2>
      </div>

      {/* Stats dos Pedidos */}
      {orderStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">
              {orderStats.totalOrders}
            </div>
            <div className="text-sm text-gray-600">Total de Pedidos</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              R$ {orderStats.totalRevenue.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Receita Total</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">
              {orderStats.ordersByStatus.RECEIVED || 0}
            </div>
            <div className="text-sm text-gray-600">Pedidos Pendentes</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">
              {orderStats.ordersByStatus.DELIVERED || 0}
            </div>
            <div className="text-sm text-gray-600">Pedidos Entregues</div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar pedidos por número, cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) =>
            setSelectedStatus(e.target.value as OrderStatus | "all")
          }
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os Status</option>
          <option value={OrderStatus.RECEIVED}>Recebido</option>
          <option value={OrderStatus.PREPARING}>Preparando</option>
          <option value={OrderStatus.READY}>Pronto</option>
          <option value={OrderStatus.DELIVERING}>Saiu para Entrega</option>
          <option value={OrderStatus.DELIVERED}>Entregue</option>
          <option value={OrderStatus.CANCELLED}>Cancelado</option>
        </select>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as OrderType | "all")}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os Tipos</option>
          <option value={OrderType.DELIVERY}>Entrega</option>
          <option value={OrderType.PICKUP}>Retirada</option>
        </select>
      </div>

      {/* Lista de Pedidos */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pedido
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pagamento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order: Order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      #{order.orderNumber || order.id.slice(-8)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString("pt-BR")}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {order.customer?.name || "Cliente não identificado"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.customer?.phone || "Telefone não informado"}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                      order.type
                    )}`}
                  >
                    {getTypeText(order.type)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                      order.paymentStatus
                    )}`}
                  >
                    {order.paymentStatus === PaymentStatus.PAID
                      ? "Pago"
                      : order.paymentStatus === PaymentStatus.PENDING
                      ? "Pendente"
                      : order.paymentStatus === PaymentStatus.FAILED
                      ? "Falhou"
                      : "N/A"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>R$ {order.total.toFixed(2)}</div>
                  {order.discount > 0 && (
                    <div className="text-sm text-gray-500">
                      Desconto: R$ {order.discount.toFixed(2)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-col space-y-2">
                    {/* Botões de mudança de status */}
                    {order.status === OrderStatus.RECEIVED && (
                      <button
                        onClick={() =>
                          handleStatusChange(order.id, OrderStatus.PREPARING)
                        }
                        className="text-blue-600 hover:text-blue-900 text-xs"
                        disabled={updateOrderMutation.isPending}
                      >
                        Iniciar Preparo
                      </button>
                    )}
                    {order.status === OrderStatus.PREPARING && (
                      <button
                        onClick={() =>
                          handleStatusChange(order.id, OrderStatus.READY)
                        }
                        className="text-green-600 hover:text-green-900 text-xs"
                        disabled={updateOrderMutation.isPending}
                      >
                        Marcar Pronto
                      </button>
                    )}
                    {order.status === OrderStatus.READY &&
                      order.type === OrderType.DELIVERY && (
                        <button
                          onClick={() =>
                            handleStatusChange(order.id, OrderStatus.DELIVERING)
                          }
                          className="text-purple-600 hover:text-purple-900 text-xs"
                          disabled={updateOrderMutation.isPending}
                        >
                          Iniciar Entrega
                        </button>
                      )}
                    {order.status === OrderStatus.READY &&
                      order.type === OrderType.PICKUP && (
                        <button
                          onClick={() =>
                            handleStatusChange(order.id, OrderStatus.DELIVERED)
                          }
                          className="text-green-600 hover:text-green-900 text-xs"
                          disabled={updateOrderMutation.isPending}
                        >
                          Marcar Entregue
                        </button>
                      )}
                    {order.status === OrderStatus.DELIVERING && (
                      <button
                        onClick={() =>
                          handleStatusChange(order.id, OrderStatus.DELIVERED)
                        }
                        className="text-green-600 hover:text-green-900 text-xs"
                        disabled={updateOrderMutation.isPending}
                      >
                        Confirmar Entrega
                      </button>
                    )}

                    {/* Botão de cancelamento */}
                    {order.status !== OrderStatus.DELIVERED &&
                      order.status !== OrderStatus.CANCELLED && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="text-red-600 hover:text-red-900 text-xs"
                          disabled={cancelOrderMutation.isPending}
                        >
                          Cancelar
                        </button>
                      )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {ordersData && ordersData.pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <nav className="flex space-x-2">
            {Array.from(
              { length: ordersData.pagination.totalPages },
              (_, i) => i + 1
            ).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
