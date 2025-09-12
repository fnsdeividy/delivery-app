"use client";

import { Clock, X } from "@phosphor-icons/react";
import { useEffect } from "react";
import { usePublicOrders } from "../../hooks/usePublicOrders";
import { OrderStatus } from "../../types/cardapio-api";

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryColor?: string;
  storeSlug: string;
}

const formatPrice = (price: any): string => {
  if (price === null || price === undefined) return "0,00";

  if (typeof price === "string") {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? "0,00" : numPrice.toFixed(2).replace(".", ",");
  }

  if (typeof price === "number") {
    return price.toFixed(2).replace(".", ",");
  }

  return "0,00";
};

const getStatusText = (status: OrderStatus) => {
  const statusMap: Record<OrderStatus, string> = {
    [OrderStatus.RECEIVED]: "Recebido",
    [OrderStatus.CONFIRMED]: "Confirmado",
    [OrderStatus.PREPARING]: "Preparando",
    [OrderStatus.READY]: "Pronto",
    [OrderStatus.DELIVERING]: "Saindo para entrega",
    [OrderStatus.DELIVERED]: "Entregue",
    [OrderStatus.CANCELLED]: "Cancelado",
  };
  return statusMap[status] || status;
};

const getStatusColor = (status: OrderStatus) => {
  const colorMap: Record<OrderStatus, string> = {
    [OrderStatus.RECEIVED]: "#f59e0b",
    [OrderStatus.CONFIRMED]: "#3b82f6",
    [OrderStatus.PREPARING]: "#f97316",
    [OrderStatus.READY]: "#10b981",
    [OrderStatus.DELIVERING]: "#8b5cf6",
    [OrderStatus.DELIVERED]: "#059669",
    [OrderStatus.CANCELLED]: "#ef4444",
  };
  return colorMap[status] || "#6b7280";
};

export default function OrdersModal({
  isOpen,
  onClose,
  primaryColor = "#f97316",
  storeSlug,
}: OrdersModalProps) {
  const { orders, loading, refreshOrders } = usePublicOrders(storeSlug);

  useEffect(() => {
    if (isOpen) {
      refreshOrders();
    }
  }, [isOpen, storeSlug]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Meus Pedidos</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum pedido encontrado
                </h3>
                <p className="text-gray-600">
                  Seus pedidos aparecerão aqui após serem realizados
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-900">
                        Pedido #{order.orderNumber}
                      </span>
                      <span
                        className="px-2 py-1 text-xs font-medium rounded-full text-white"
                        style={{
                          backgroundColor: getStatusColor(order.status),
                        }}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-medium">
                            R$ {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-semibold">Total:</span>
                      <span
                        className="font-bold text-lg"
                        style={{ color: primaryColor }}
                      >
                        R$ {formatPrice(order.total)}
                      </span>
                    </div>

                    {order.estimatedDeliveryTime &&
                      order.status === OrderStatus.PREPARING && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>
                            Entrega estimada:{" "}
                            {new Date(
                              order.estimatedDeliveryTime
                            ).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      )}

                    <div className="text-xs text-gray-500 mt-2">
                      Pedido realizado em:{" "}
                      {new Date(order.createdAt).toLocaleString("pt-BR")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {orders.length > 0 && (
            <div className="border-t p-4">
              <button className="w-full py-2 text-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Ver Histórico Completo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
