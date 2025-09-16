import {
  formatCurrency,
  formatDateTime,
  getPaymentStatusInfo,
  getStatusInfo,
} from "@/lib/utils/order-utils";
import { OrderStatus, PaymentStatus } from "@/types/cardapio-api";
import { Order } from "@/types/order";
import { MapPin, Phone, User } from "@phosphor-icons/react";

interface OrderCardProps {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  onViewDetails: (order: Order) => void;
}

export default function OrderCard({
  order,
  onStatusUpdate,
  onViewDetails,
}: OrderCardProps) {
  const statusInfo = getStatusInfo(order.status as OrderStatus);
  const paymentStatusInfo = getPaymentStatusInfo(
    order.paymentStatus as PaymentStatus
  );
  const StatusIcon = statusInfo.icon;

  const getDeliveryTypeLabel = (type: string) => {
    switch (type) {
      case "delivery":
        return "Entrega";
      case "pickup":
        return "Retirada";
      case "table":
        return "Mesa";
      default:
        return type;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <StatusIcon className="h-5 w-5 text-gray-400" />
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
          </div>
          <span className="text-sm text-gray-500">#{order.id}</span>
          <span className="text-sm text-gray-500">
            {formatDateTime(order.createdAt)}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentStatusInfo.color}`}
          >
            {paymentStatusInfo.label}
          </span>
          <button
            onClick={() => onViewDetails(order)}
            className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Ver Detalhes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {order.customer?.name}
            </p>
            <p className="text-xs text-gray-500">{order.customer?.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">{order.customer?.phone}</span>
        </div>

        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">
            {getDeliveryTypeLabel(order.deliveryType)}
          </span>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              {order.items?.length || 0} item
              {order.items?.length > 1 ? "s" : ""} •{" "}
              {formatCurrency(order.total || 0)}
            </p>
            <p className="text-xs text-gray-500">
              {order.items
                ?.map((item: any) => `${item.quantity}x ${item.productName}`)
                .join(", ")}
            </p>
          </div>

          <div className="flex space-x-2">
            {order.status === OrderStatus.RECEIVED && (
              <>
                <button
                  onClick={() =>
                    onStatusUpdate(order.id, OrderStatus.CONFIRMED)
                  }
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Confirmar
                </button>
                <button
                  onClick={() =>
                    onStatusUpdate(order.id, OrderStatus.CANCELLED)
                  }
                  className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Cancelar
                </button>
              </>
            )}

            {order.status === OrderStatus.CONFIRMED && (
              <button
                onClick={() => onStatusUpdate(order.id, OrderStatus.PREPARING)}
                className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Preparar
              </button>
            )}

            {order.status === OrderStatus.PREPARING && (
              <button
                onClick={() => onStatusUpdate(order.id, OrderStatus.READY)}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
              >
                Pronto
              </button>
            )}

            {order.status === OrderStatus.READY &&
              order.deliveryType === "delivery" && (
                <button
                  onClick={() =>
                    onStatusUpdate(order.id, OrderStatus.DELIVERING)
                  }
                  className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Entregar
                </button>
              )}

            {order.status === OrderStatus.READY &&
              order.deliveryType !== "delivery" && (
                <button
                  onClick={() =>
                    onStatusUpdate(order.id, OrderStatus.DELIVERED)
                  }
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Entregue
                </button>
              )}

            {order.status === OrderStatus.DELIVERING && (
              <button
                onClick={() => onStatusUpdate(order.id, OrderStatus.DELIVERED)}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
              >
                Entregue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
