import { formatCurrency, getPaymentStatusInfo } from "@/lib/utils/order-utils";
import { PaymentStatus } from "@/types/cardapio-api";
import { Order } from "@/types/order";
import { XCircle } from "@phosphor-icons/react";

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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Pedido #{order.id}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Informações do Cliente */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Cliente</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm">
                  <strong>Nome:</strong> {order.customer?.name}
                </p>
                <p className="text-sm">
                  <strong>Email:</strong> {order.customer?.email}
                </p>
                <p className="text-sm">
                  <strong>Telefone:</strong> {order.customer?.phone}
                </p>
                {order.deliveryAddress && (
                  <p className="text-sm">
                    <strong>Endereço:</strong> {order.deliveryAddress}
                  </p>
                )}
              </div>
            </div>

            {/* Itens do Pedido */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Itens</h4>
              <div className="space-y-2">
                {order.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.productName}</p>
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
                    {formatCurrency(order.subtotal || 0)}
                  </span>
                </div>
                {order.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Taxa de entrega:</span>
                    <span className="text-sm">
                      {formatCurrency(order.deliveryFee || 0)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-1">
                  <span className="text-sm font-medium">Total:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(order.total || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Informações</h4>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Tipo de entrega:</span>
                  <span className="text-sm">
                    {getDeliveryTypeLabel(order.deliveryType)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Forma de pagamento:</span>
                  <span className="text-sm">
                    {getPaymentMethodLabel(order.paymentMethod)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Status do pagamento:</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
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
                {order.notes && (
                  <div>
                    <span className="text-sm font-medium">Observações:</span>
                    <p className="text-sm text-gray-600 mt-1">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Ações */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
