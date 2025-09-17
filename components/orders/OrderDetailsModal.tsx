import {
  formatCurrency,
  formatDateTime,
  getPaymentStatusInfo,
  getStatusInfo,
} from "@/lib/utils/order-utils";
import { Order, OrderStatus, PaymentStatus } from "@/types/cardapio-api";
import {
  Clock,
  CreditCard,
  MapPin,
  Note,
  Package,
  Phone,
  User,
  XCircle,
} from "@phosphor-icons/react";

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetailsModal({
  order,
  isOpen,
  onClose,
}: OrderDetailsModalProps) {
  if (!isOpen || !order) return null;

  const statusInfo = getStatusInfo(order.status as OrderStatus);
  const paymentStatusInfo = getPaymentStatusInfo(
    order.paymentStatus as PaymentStatus
  );
  const StatusIcon = statusInfo.icon;

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cash":
        return "Dinheiro";
      case "card":
        return "Cartão";
      case "pix":
        return "PIX";
      default:
        return method;
    }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-0 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-2xl rounded-lg bg-white">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <h3 className="text-xl font-semibold text-gray-900">
                Pedido #{order.id}
              </h3>
              <div className="flex items-center space-x-2">
                <StatusIcon className="h-5 w-5 text-gray-400" />
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informações do Cliente */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-gray-600" />
              Informações do Cliente
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.customer?.name}
                    </p>
                    <p className="text-xs text-gray-500">Nome</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.customer?.phone}
                    </p>
                    <p className="text-xs text-gray-500">Telefone</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Note className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.customer?.email}
                    </p>
                    <p className="text-xs text-gray-500">Email</p>
                  </div>
                </div>
                {order.customer?.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.customer.address}
                      </p>
                      <p className="text-xs text-gray-500">
                        Endereço de Entrega
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Itens do Pedido */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-gray-600" />
              Itens do Pedido
            </h4>
            <div className="space-y-4">
              {order.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.quantity}x {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(item.total || item.price * item.quantity)}
                    </p>
                  </div>

                  {/* Customizações do item */}
                  {item.customizations && (
                    <div className="mt-3 space-y-2">
                      {/* Ingredientes removidos */}
                      {item.customizations.removedIngredients &&
                        item.customizations.removedIngredients.length > 0 && (
                          <div className="bg-red-50 border border-red-200 rounded p-2">
                            <p className="text-xs font-medium text-red-700 mb-1">
                              Remover:
                            </p>
                            <p className="text-xs text-red-600">
                              {item.customizations.removedIngredients.join(
                                ", "
                              )}
                            </p>
                          </div>
                        )}

                      {/* Adicionais */}
                      {item.customizations.addons &&
                        item.customizations.addons.length > 0 && (
                          <div className="bg-green-50 border border-green-200 rounded p-2">
                            <p className="text-xs font-medium text-green-700 mb-1">
                              Adicionais:
                            </p>
                            {item.customizations.addons.map(
                              (addon: any, index: number) => (
                                <p
                                  key={index}
                                  className="text-xs text-green-600"
                                >
                                  {addon.quantity}x {addon.name} (+
                                  {formatCurrency(addon.price)})
                                </p>
                              )
                            )}
                          </div>
                        )}

                      {/* Observações */}
                      {(item.customizations.observations || item.notes) && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-2">
                          <p className="text-xs font-medium text-blue-700 mb-1">
                            Observações:
                          </p>
                          <p className="text-xs text-blue-600">
                            {item.customizations.observations || item.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Resumo Financeiro e Informações */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resumo Financeiro */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                Resumo Financeiro
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(order.subtotal || 0)}
                  </span>
                </div>
                {order.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Taxa de entrega:
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.deliveryFee || 0)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-300 pt-3">
                  <span className="text-base font-semibold text-gray-900">
                    Total:
                  </span>
                  <span className="text-base font-bold text-gray-900">
                    {formatCurrency(order.total || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Informações do Pedido */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-600" />
                Informações do Pedido
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Tipo de entrega:
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {getDeliveryTypeLabel(order.type)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Forma de pagamento:
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {getPaymentMethodLabel(order.paymentMethod)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Status do pagamento:
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      getPaymentStatusInfo(order.paymentStatus as PaymentStatus)
                        .color
                    }`}
                  >
                    {
                      getPaymentStatusInfo(order.paymentStatus as PaymentStatus)
                        .label
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Data do pedido:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDateTime(order.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Observações */}
          {order.notes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                <Note className="h-5 w-5 mr-2" />
                Observações do Pedido
              </h4>
              <p className="text-sm text-blue-800">{order.notes}</p>
            </div>
          )}

          {/* Ações */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
