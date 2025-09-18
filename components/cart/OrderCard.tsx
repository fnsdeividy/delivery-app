"use client";

import {
  CheckCircle,
  Clock,
  Eye,
  Package,
  ShoppingCart,
  XCircle,
} from "@phosphor-icons/react";
import { useAuthContext } from "../../contexts/AuthContext";
import { Order, OrderStatus } from "../../types/cardapio-api";
import { OrderItemCustomizations } from "../orders/OrderItemCustomizations";

interface OrderCardProps {
  order: Order;
  primaryColor?: string;
  onViewDetails: (order: Order) => void;
  onRepeatOrder: (order: Order) => void;
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
    [OrderStatus.PENDING]: "Pendente",
    [OrderStatus.RECEIVED]: "Recebido",
    [OrderStatus.CONFIRMED]: "Confirmado",
    [OrderStatus.PREPARING]: "Preparando",
    [OrderStatus.READY]: "Pronto",
    [OrderStatus.DELIVERING]: "Saiu para entrega",
    [OrderStatus.DELIVERED]: "Entregue",
    [OrderStatus.CANCELLED]: "Cancelado",
  };
  return statusMap[status] || status;
};

const getStatusColor = (status: OrderStatus) => {
  const colorMap: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: "#6b7280",
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

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.DELIVERED:
      return <CheckCircle className="h-4 w-4" />;
    case OrderStatus.CANCELLED:
      return <XCircle className="h-4 w-4" />;
    case OrderStatus.PREPARING:
    case OrderStatus.READY:
    case OrderStatus.DELIVERING:
      return <Package className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const isOrderInProgress = (status: OrderStatus) => {
  return [
    OrderStatus.RECEIVED,
    OrderStatus.CONFIRMED,
    OrderStatus.PREPARING,
    OrderStatus.READY,
    OrderStatus.DELIVERING,
  ].includes(status);
};

const isOrderFinished = (status: OrderStatus) => {
  return status === OrderStatus.DELIVERED;
};

const isOrderCancelled = (status: OrderStatus) => {
  return status === OrderStatus.CANCELLED;
};

export default function OrderCard({
  order,
  primaryColor = "#f97316",
  onViewDetails,
  onRepeatOrder,
}: OrderCardProps) {
  const { isAuthenticated } = useAuthContext();

  const handleRepeatOrder = () => {
    onRepeatOrder(order);
  };

  const getOrderStatusCategory = () => {
    if (isOrderFinished(order.status)) return "Finalizado";
    if (isOrderInProgress(order.status)) return "Em andamento";
    if (isOrderCancelled(order.status)) return "Cancelado";
    return "Desconhecido";
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header do Pedido */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">
            Pedido #{order.orderNumber}
          </span>
          <div
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full text-white"
            style={{ backgroundColor: getStatusColor(order.status) }}
          >
            {getStatusIcon(order.status)}
            <span>{getStatusText(order.status)}</span>
          </div>
        </div>
        <span className="text-xs text-gray-500">
          {getOrderStatusCategory()}
        </span>
      </div>

      {/* Data e Hora */}
      <div className="text-xs text-gray-500 mb-3">
        Pedido realizado em:{" "}
        {new Date(order.createdAt).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>

      {/* Resumo dos Itens */}
      <div className="space-y-2 mb-3">
        <h4 className="text-sm font-medium text-gray-700">Resumo dos itens:</h4>
        {order.items.slice(0, 3).map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {item.quantity}x {item.name}
              </span>
              <span className="font-medium">
                R$ {formatPrice(item.price * item.quantity)}
              </span>
            </div>

            {/* Resumo das customizações */}
            {item.customizations && (
              <OrderItemCustomizations
                customizations={item.customizations}
                variant="compact"
              />
            )}
          </div>
        ))}
        {order.items.length > 3 && (
          <div className="text-xs text-gray-500">
            +{order.items.length - 3} item(s) adicional(is)
          </div>
        )}
      </div>

      {/* Valor Total */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-100 mb-4">
        <span className="font-semibold text-gray-900">Valor Total:</span>
        <span className="font-bold text-lg" style={{ color: primaryColor }}>
          R$ {formatPrice(order.total)}
        </span>
      </div>

      {/* Tempo Estimado (se aplicável) */}
      {order.estimatedDeliveryTime && isOrderInProgress(order.status) && (
        <div className="flex items-center gap-1 mb-4 text-sm text-gray-600 bg-blue-50 p-2 rounded">
          <Clock className="h-4 w-4" />
          <span>
            Entrega estimada:{" "}
            {new Date(order.estimatedDeliveryTime).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      )}

      {/* Ações Disponíveis */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(order)}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          <Eye className="h-4 w-4" />
          Detalhes do pedido
        </button>

        <button
          onClick={handleRepeatOrder}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: primaryColor }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <ShoppingCart className="h-4 w-4" />
          Repetir pedido
        </button>
      </div>

      {/* Aviso para usuários não logados */}
      {!isAuthenticated && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          <strong>Atenção:</strong> Para finalizar pedidos, você precisa estar
          logado.
        </div>
      )}
    </div>
  );
}
