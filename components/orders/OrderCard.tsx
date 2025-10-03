import {
  ErrorNotification,
  useErrorNotification,
} from "@/components/ui/error-notification";
import {
  calculateChange,
  formatCurrency,
  formatDateTime,
  getPaymentStatusInfo,
  getStatusInfo,
} from "@/lib/utils/order-utils";
import { Order, OrderStatus, PaymentStatus } from "@/types/cardapio-api";
import {
  CheckCircle,
  MapPin,
  Package,
  Phone,
  Printer,
  Timer,
  Truck,
  User,
  XCircle,
} from "@phosphor-icons/react";
import { useState } from "react";
import CancelOrderModal from "./CancelOrderModal";
import { OrderItemCustomizations } from "./OrderItemCustomizations";
import { OrderPrintModal } from "./OrderPrintModal";

interface OrderCardProps {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  onConfirmOrder: (orderId: string) => Promise<void>;
  onCancelOrder: (orderId: string, reason?: string) => Promise<void>;
  isLoading?: boolean;
}

interface LoadingState {
  [key: string]: boolean;
}

export default function OrderCard({
  order,
  onStatusUpdate,
  onConfirmOrder,
  onCancelOrder,
  isLoading = false,
}: OrderCardProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});
  const { notification, showNotification, hideNotification } =
    useErrorNotification();

  const statusInfo = getStatusInfo(order.status as OrderStatus);
  const paymentStatusInfo = getPaymentStatusInfo(
    order.paymentStatus as PaymentStatus
  );
  const StatusIcon = statusInfo.icon;

  // Funções para gerenciar loading states
  const setLoading = (action: string, loading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [action]: loading }));
  };

  const isActionLoading = (action: string) => loadingStates[action] || false;

  // Handlers com loading states e tratamento de erro
  const handleStatusUpdate = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    setLoading(`status-${newStatus}`, true);
    try {
      await onStatusUpdate(orderId, newStatus);
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error);
      // Mostrar feedback visual de erro
      if (error?.status === 401) {
        showNotification(
          "Sua sessão expirou. Você será redirecionado para o login.",
          "error"
        );
      } else {
        showNotification(
          `Erro ao atualizar status: ${error?.message || "Erro desconhecido"}`,
          "error"
        );
      }
    } finally {
      setLoading(`status-${newStatus}`, false);
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    setLoading("confirm", true);
    try {
      await onConfirmOrder(orderId);
    } catch (error: any) {
      console.error("Erro ao confirmar pedido:", error);
      if (error?.status === 401) {
        showNotification(
          "Sua sessão expirou. Você será redirecionado para o login.",
          "error"
        );
      } else {
        showNotification(
          `Erro ao confirmar pedido: ${error?.message || "Erro desconhecido"}`,
          "error"
        );
      }
    } finally {
      setLoading("confirm", false);
    }
  };

  const handleCancelOrder = async (orderId: string, reason?: string) => {
    setLoading("cancel", true);
    try {
      await onCancelOrder(orderId, reason);
    } catch (error: any) {
      console.error("Erro ao cancelar pedido:", error);
      if (error?.status === 401) {
        showNotification(
          "Sua sessão expirou. Você será redirecionado para o login.",
          "error"
        );
      } else {
        showNotification(
          `Erro ao cancelar pedido: ${error?.message || "Erro desconhecido"}`,
          "error"
        );
      }
    } finally {
      setLoading("cancel", false);
    }
  };

  const handlePrintOrder = () => {
    setShowPrintModal(true);
  };

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
    <div
      className={`relative bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 hover:shadow-md transition-all duration-200 ${
        isLoading ? "opacity-75 pointer-events-none" : ""
      }`}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl z-10">
          <div className="flex items-center space-x-2 text-purple-600">
            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-purple-600"></div>
            <span className="text-xs sm:text-sm font-medium">
              Processando...
            </span>
          </div>
        </div>
      )}
      {/* Header com status e informações principais */}
      <div className="flex flex-col gap-3 mb-3 sm:mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-3">
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 min-w-0 flex-1">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <StatusIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
                <span
                  className={`inline-flex items-center px-2 sm:px-2.5 py-1 rounded-full text-xs sm:text-sm font-semibold ${statusInfo.color} truncate`}
                >
                  {statusInfo.label}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-gray-500">
                <span className="text-xs sm:text-sm font-mono bg-gray-100 px-1.5 sm:px-2 py-1 rounded truncate">
                  #{order.id.slice(-8)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
            {order.paymentStatus !== PaymentStatus.PENDING && (
              <span
                className={`inline-flex items-center px-2 sm:px-2.5 py-1 rounded-full text-xs sm:text-sm font-semibold ${paymentStatusInfo.color} truncate`}
              >
                {paymentStatusInfo.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Informações do cliente e entrega */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
        <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg min-w-0">
          <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 truncate">
              {order.customer?.name || "Cliente"}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              {order.customer?.email || "Email não informado"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg min-w-0">
          <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
          <span className="text-xs sm:text-sm md:text-base font-medium text-gray-900 truncate">
            {order.customer?.phone || "Telefone não informado"}
          </span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg min-w-0 sm:col-span-2 lg:col-span-1">
          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
          <span className="text-xs sm:text-sm md:text-base font-medium text-gray-900 truncate">
            {getDeliveryTypeLabel(order.type)}
          </span>
        </div>
      </div>

      {/* Informações do pedido */}
      <div className="border-t border-gray-200 pt-3 sm:pt-4">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">
              {order.items?.length || 0} item
              {(order.items?.length || 0) > 1 ? "s" : ""}
            </p>
            <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
              {formatCurrency(order.total || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Lista de itens */}
        {order.items && order.items.length > 0 && (
          <div className="mb-3 sm:mb-4">
            <p className="text-xs font-medium text-gray-700 mb-2">
              Itens do pedido:
            </p>
            <div className="space-y-2">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-700 truncate min-w-0 flex-1 mr-2">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="text-gray-600 font-medium flex-shrink-0">
                      {formatCurrency(item.price * item.quantity)}
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
            </div>
          </div>
        )}

        {/* Informações de Pagamento, Observações e Troco */}
        <div className="mb-3 sm:mb-4 space-y-2">
          {/* Forma de Pagamento */}
          {order.paymentMethod && (
            <div className="flex items-center space-x-2 text-xs sm:text-sm">
              <div className="flex items-center space-x-1 text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium">Pagamento:</span>
              </div>
              <span className="text-gray-700 capitalize">
                {order.paymentMethod.toLowerCase()}
              </span>
            </div>
          )}

          {/* Troco para */}
          {order.cashChangeAmount && order.cashChangeAmount > 0 && (
            <div className="flex items-center space-x-2 text-xs sm:text-sm">
              <div className="flex items-center space-x-1 text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">Troco:</span>
              </div>
              <span className="text-gray-700 font-semibold">
                {formatCurrency(
                  calculateChange(order.cashChangeAmount, order.total)
                )}
              </span>
            </div>
          )}

          {/* Observações */}
          {order.notes && (
            <div className="flex items-start space-x-2 text-xs sm:text-sm">
              <div className="flex items-center space-x-1 text-gray-600 mt-0.5">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="font-medium">Observações:</span>
              </div>
              <span className="text-gray-700 italic">"{order.notes}"</span>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 justify-stretch sm:justify-end">
          {order.status === OrderStatus.RECEIVED && (
            <>
              <button
                onClick={() => handleConfirmOrder(order.id)}
                disabled={isActionLoading("confirm")}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1 sm:space-x-2 disabled:hover:shadow-sm min-h-[36px]"
              >
                {isActionLoading("confirm") ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
                    <span>Confirmando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Confirmar</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowCancelModal(true)}
                disabled={isActionLoading("cancel")}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1 sm:space-x-2 disabled:hover:shadow-sm min-h-[36px]"
              >
                <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Cancelar</span>
              </button>
            </>
          )}

          {order.status === OrderStatus.CONFIRMED && (
            <>
              <button
                onClick={() =>
                  handleStatusUpdate(order.id, OrderStatus.PREPARING)
                }
                disabled={isActionLoading("status-PREPARING")}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1 sm:space-x-2 disabled:hover:shadow-sm min-h-[36px]"
              >
                {isActionLoading("status-PREPARING") ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
                    <span>Preparando...</span>
                  </>
                ) : (
                  <>
                    <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Preparar</span>
                  </>
                )}
              </button>
              <button
                onClick={handlePrintOrder}
                disabled={isActionLoading("print")}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1 sm:space-x-2 disabled:hover:shadow-sm min-h-[36px]"
              >
                {isActionLoading("print") ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
                    <span>Imprimindo...</span>
                  </>
                ) : (
                  <>
                    <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Imprimir Pedido</span>
                  </>
                )}
              </button>
            </>
          )}

          {order.status === OrderStatus.PREPARING && (
            <>
              <button
                onClick={() => handleStatusUpdate(order.id, OrderStatus.READY)}
                disabled={isActionLoading("status-READY")}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1 sm:space-x-2 disabled:hover:shadow-sm min-h-[36px]"
              >
                {isActionLoading("status-READY") ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
                    <span>Finalizando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Pronto</span>
                  </>
                )}
              </button>
              <button
                onClick={handlePrintOrder}
                disabled={isActionLoading("print")}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1 sm:space-x-2 disabled:hover:shadow-sm min-h-[36px]"
              >
                {isActionLoading("print") ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
                    <span>Imprimindo...</span>
                  </>
                ) : (
                  <>
                    <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Imprimir Pedido</span>
                  </>
                )}
              </button>
            </>
          )}

          {order.status === OrderStatus.READY && order.type === "DELIVERY" && (
            <div className="flex flex-col items-stretch sm:items-end space-y-2 w-full">
              <button
                onClick={() =>
                  handleStatusUpdate(order.id, OrderStatus.DELIVERING)
                }
                disabled={isActionLoading("status-DELIVERING")}
                className="w-full sm:w-auto px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 disabled:hover:shadow-sm"
              >
                {isActionLoading("status-DELIVERING") ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Saindo...</span>
                  </>
                ) : (
                  <>
                    <Truck className="h-4 w-4" />
                    <span>Saiu para Entrega</span>
                  </>
                )}
              </button>
              <div className="flex items-center space-x-1 text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">
                <Timer className="h-3 w-3" />
                <span>Auto-transição em 2min</span>
              </div>
            </div>
          )}

          {order.status === OrderStatus.READY && order.type !== "DELIVERY" && (
            <button
              onClick={() =>
                handleStatusUpdate(order.id, OrderStatus.DELIVERED)
              }
              disabled={isActionLoading("status-DELIVERED")}
              className="w-full sm:w-auto px-4 py-2 text-sm bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 disabled:hover:shadow-sm"
            >
              {isActionLoading("status-DELIVERED") ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Entregando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Entregue</span>
                </>
              )}
            </button>
          )}

          {order.status === OrderStatus.DELIVERING && (
            <button
              onClick={() =>
                handleStatusUpdate(order.id, OrderStatus.DELIVERED)
              }
              disabled={isActionLoading("status-DELIVERED")}
              className="w-full sm:w-auto px-4 py-2 text-sm bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 disabled:hover:shadow-sm"
            >
              {isActionLoading("status-DELIVERED") ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Entregando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Entregue</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Modal de Cancelamento */}
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={(reason) => handleCancelOrder(order.id, reason)}
        orderNumber={order.id}
      />

      {/* Modal de Impressão */}
      {showPrintModal && (
        <OrderPrintModal
          order={order}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* Notificação de Erro */}
      <ErrorNotification
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onClose={hideNotification}
      />
    </div>
  );
}
