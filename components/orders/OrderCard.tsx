import {
  formatCurrency,
  formatDateTime,
  getPaymentStatusInfo,
  getStatusInfo,
} from "@/lib/utils/order-utils";
import { Order, OrderStatus, PaymentStatus } from "@/types/cardapio-api";
import { MapPin, Phone, User } from "@phosphor-icons/react";
import { useState } from "react";
import CancelOrderModal from "./CancelOrderModal";

interface OrderCardProps {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  onConfirmOrder: (orderId: string) => Promise<void>;
  onCancelOrder: (orderId: string, reason?: string) => Promise<void>;
  onViewDetails: (order: Order) => void;
}

export default function OrderCard({
  order,
  onStatusUpdate,
  onConfirmOrder,
  onCancelOrder,
  onViewDetails,
}: OrderCardProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);

  const statusInfo = getStatusInfo(order.status as OrderStatus);
  const paymentStatusInfo = getPaymentStatusInfo(
    order.paymentStatus as PaymentStatus
  );
  const StatusIcon = statusInfo.icon;

  const getDeliveryTypeLabel = (type: string) => {
    switch (type) {
      case "DELIVERY":
        return "Entrega";
      case "PICKUP":
        return "Retirada";
      case "TABLE":
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
            {getDeliveryTypeLabel(order.type)}
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
                ?.map((item: any) => `${item.quantity}x ${item.name}`)
                .join(", ")}
            </p>
          </div>

          <div className="flex space-x-2">
            {order.status === OrderStatus.RECEIVED && (
              <>
                <button
                  onClick={() => onConfirmOrder(order.id)}
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Cancelar
                </button>
              </>
            )}

            {order.status === OrderStatus.CONFIRMED && (
              <button
                onClick={() => onStatusUpdate(order.id, OrderStatus.PREPARING)}
                className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                Preparar
              </button>
            )}

            {order.status === OrderStatus.PREPARING && (
              <button
                onClick={() => onStatusUpdate(order.id, OrderStatus.READY)}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Pronto
              </button>
            )}

            {order.status === OrderStatus.READY &&
              order.type === "DELIVERY" && (
                <div className="flex flex-col items-end space-y-1">
                  <button
                    onClick={() =>
                      onStatusUpdate(order.id, OrderStatus.DELIVERING)
                    }
                    className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                  >
                    Saiu para Entrega
                  </button>
                  <span className="text-xs text-amber-600 font-medium">
                    ⏰ Auto-transição em 2min
                  </span>
                </div>
              )}

            {order.status === OrderStatus.READY &&
              order.type !== "DELIVERY" && (
                <button
                  onClick={() =>
                    onStatusUpdate(order.id, OrderStatus.DELIVERED)
                  }
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Entregue
                </button>
              )}

            {order.status === OrderStatus.DELIVERING && (
              <button
                onClick={() => onStatusUpdate(order.id, OrderStatus.DELIVERED)}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Entregue
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Cancelamento */}
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={(reason) => onCancelOrder(order.id, reason)}
        orderNumber={order.id}
      />
    </div>
  );
}
