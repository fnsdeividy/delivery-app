"use client";

import { OrderTimelineAdvanced } from "@/components/OrderTimelineAdvanced";
import { useOrdersByStore, useUpdateOrderStatus } from "@/hooks";
import { useStoreConfig } from "@/lib/store/useStoreConfig";
import { OrderStatus, PaymentStatus } from "@/types/cardapio-api";
import {
  ArrowsClockwise,
  CurrencyDollar,
  Eye,
  MagnifyingGlass,
  Package,
  Phone,
  User,
  XCircle,
} from "@phosphor-icons/react";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function PedidosPageWithTimeline() {
  const params = useParams();
  const slug = params.slug as string;

  const { config, loading } = useStoreConfig(slug);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Hooks da API Cardap.IO
  const {
    data: ordersData,
    isLoading: loadingOrders,
    refetch: refetchOrders,
  } = useOrdersByStore(slug);
  const updateStatusMutation = useUpdateOrderStatus();

  const orders = ordersData?.data || [];

  // Filtrar pedidos
  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch =
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.phone?.includes(searchTerm);

    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;
    const matchesPaymentStatus =
      selectedPaymentStatus === "all" ||
      order.paymentStatus === selectedPaymentStatus;

    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        status: newStatus,
      });
      refetchOrders();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
      [OrderStatus.RECEIVED]: "bg-blue-100 text-blue-800",
      [OrderStatus.CONFIRMED]: "bg-green-100 text-green-800",
      [OrderStatus.PREPARING]: "bg-orange-100 text-orange-800",
      [OrderStatus.ASSEMBLING]: "bg-purple-100 text-purple-800",
      [OrderStatus.PACKAGING]: "bg-indigo-100 text-indigo-800",
      [OrderStatus.READY]: "bg-emerald-100 text-emerald-800",
      [OrderStatus.DELIVERING]: "bg-cyan-100 text-cyan-800",
      [OrderStatus.DELIVERED]: "bg-green-100 text-green-800",
      [OrderStatus.CANCELLED]: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: OrderStatus) => {
    const labels: Record<OrderStatus, string> = {
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
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-600">Gerencie os pedidos da sua loja</p>
        </div>
        <button
          onClick={() => refetchOrders()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowsClockwise className="h-4 w-4" />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Nome, telefone ou ID do pedido"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os status</option>
              <option value={OrderStatus.RECEIVED}>Recebido</option>
              <option value={OrderStatus.CONFIRMED}>Confirmado</option>
              <option value={OrderStatus.PREPARING}>Preparando</option>
              <option value={OrderStatus.ASSEMBLING}>Montando</option>
              <option value={OrderStatus.PACKAGING}>Embalando</option>
              <option value={OrderStatus.READY}>Pronto</option>
              <option value={OrderStatus.DELIVERING}>Entregando</option>
              <option value={OrderStatus.DELIVERED}>Entregue</option>
              <option value={OrderStatus.CANCELLED}>Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pagamento
            </label>
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os status</option>
              <option value={PaymentStatus.PENDING}>Pendente</option>
              <option value={PaymentStatus.PAID}>Pago</option>
              <option value={PaymentStatus.FAILED}>Falhou</option>
              <option value={PaymentStatus.REFUNDED}>Reembolsado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="space-y-4">
        {loadingOrders ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando pedidos...</p>
          </div>
        ) : (
          filteredOrders.map((order: any) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Pedido #{order.id}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {order.customer?.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {order.customer?.phone}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CurrencyDollar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.total || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Timeline do Pedido */}
                    <div className="mb-4">
                      <OrderTimelineAdvanced
                        orderId={order.id}
                        storeSlug={slug}
                        currentStatus={order.status}
                        onStatusChange={(newStatus) => {
                          handleStatusUpdate(order.id, newStatus);
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="flex items-center space-x-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Ver Detalhes</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhum pedido encontrado
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ||
              selectedStatus !== "all" ||
              selectedPaymentStatus !== "all"
                ? "Tente ajustar os filtros de busca."
                : "Ainda não há pedidos registrados."}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Pedido */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Pedido #{selectedOrder.id}
                </h3>
                <button
                  onClick={() => {
                    setShowOrderDetails(false);
                    setSelectedOrder(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Timeline Completa */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">
                    Linha do Tempo
                  </h4>
                  <OrderTimelineAdvanced
                    orderId={selectedOrder.id}
                    storeSlug={slug}
                    currentStatus={selectedOrder.status}
                    onStatusChange={(newStatus) => {
                      handleStatusUpdate(selectedOrder.id, newStatus);
                      setSelectedOrder({ ...selectedOrder, status: newStatus });
                    }}
                  />
                </div>

                {/* Informações do Cliente */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Cliente</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm">
                      <strong>Nome:</strong> {selectedOrder.customer?.name}
                    </p>
                    <p className="text-sm">
                      <strong>Email:</strong> {selectedOrder.customer?.email}
                    </p>
                    <p className="text-sm">
                      <strong>Telefone:</strong> {selectedOrder.customer?.phone}
                    </p>
                    {selectedOrder.deliveryAddress && (
                      <p className="text-sm">
                        <strong>Endereço:</strong>{" "}
                        {selectedOrder.deliveryAddress}
                      </p>
                    )}
                  </div>
                </div>

                {/* Itens do Pedido */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Itens</h4>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {item.productName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.quantity}x {formatCurrency(item.price)}
                            {item.notes && ` • ${item.notes}`}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          {formatCurrency(item.total)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resumo Financeiro */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Resumo</h4>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Subtotal:</span>
                      <span className="text-sm">
                        {formatCurrency(selectedOrder.subtotal || 0)}
                      </span>
                    </div>
                    {selectedOrder.deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Taxa de entrega:</span>
                        <span className="text-sm">
                          {formatCurrency(selectedOrder.deliveryFee || 0)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-1">
                      <span className="text-sm font-medium">Total:</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(selectedOrder.total || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
