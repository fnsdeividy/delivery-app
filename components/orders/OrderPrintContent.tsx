import { Order, OrderStatus, PaymentStatus } from "@/types/cardapio-api";
import { Printer } from "@phosphor-icons/react";
import { forwardRef } from "react";

interface OrderPrintContentProps {
  order: Order;
}

export const OrderPrintContent = forwardRef<
  HTMLDivElement,
  OrderPrintContentProps
>(({ order }, ref) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusLabel = (status: OrderStatus) => {
    const labels = {
      [OrderStatus.PENDING]: "Pendente",
      [OrderStatus.RECEIVED]: "Recebido",
      [OrderStatus.CONFIRMED]: "Confirmado",
      [OrderStatus.PREPARING]: "Em Preparo",
      [OrderStatus.READY]: "Pronto",
      [OrderStatus.DELIVERING]: "Entregando",
      [OrderStatus.DELIVERED]: "Entregue",
      [OrderStatus.CANCELLED]: "Cancelado",
    };
    return labels[status] || status;
  };

  const getPaymentStatusLabel = (status: PaymentStatus) => {
    const labels = {
      [PaymentStatus.PENDING]: "Pendente",
      [PaymentStatus.PAID]: "Pago",
      [PaymentStatus.FAILED]: "Falhou",
      [PaymentStatus.REFUNDED]: "Reembolsado",
    };
    return labels[status] || status;
  };

  const getDeliveryTypeLabel = (type: string) => {
    return type === "DELIVERY" ? "Delivery" : "Retirada";
  };

  return (
    <div ref={ref} className="bg-white text-black p-4 max-w-sm mx-auto">
      {/* Cabeçalho */}
      <div className="text-center mb-4 border-b-2 border-black pb-2">
        <div className="flex items-center justify-center mb-1">
          <Printer className="h-5 w-5 text-black mr-1" />
          <h1 className="text-lg font-bold">PEDIDO #{order.orderNumber}</h1>
        </div>
        <div className="text-sm">{formatDateTime(order.createdAt)}</div>
        <div className="text-sm font-medium">
          Status: {getStatusLabel(order.status as OrderStatus)}
        </div>
      </div>

      {/* Cliente */}
      <div className="mb-3">
        <h2 className="text-sm font-bold border-b border-gray-300 pb-1 mb-2">
          CLIENTE
        </h2>
        <div className="text-sm space-y-1">
          <div>
            <strong>Nome:</strong> {order.customer.name}
          </div>
          <div>
            <strong>Telefone:</strong> {order.customer.phone}
          </div>
          {order.customer.email && (
            <div>
              <strong>Email:</strong> {order.customer.email}
            </div>
          )}
        </div>
      </div>

      {/* Endereço (se delivery) */}
      {order.type === "DELIVERY" && (
        <div className="mb-3">
          <h2 className="text-sm font-bold border-b border-gray-300 pb-1 mb-2">
            ENDEREÇO
          </h2>
          <div className="text-sm">
            <div>Endereço de entrega</div>
          </div>
        </div>
      )}

      {/* Itens */}
      <div className="mb-3">
        <h2 className="text-sm font-bold border-b border-gray-300 pb-1 mb-2">
          ITENS
        </h2>
        <div className="space-y-2">
          {order.items?.map((item, index) => (
            <div key={index} className="text-sm">
              <div className="font-medium">
                {item.quantity}x {item.product.name}
              </div>
              <div className="text-right font-bold">
                {formatCurrency(item.price * item.quantity)}
              </div>

              {/* Personalizações */}
              {item.customizations?.addons &&
                item.customizations.addons.length > 0 && (
                  <div className="ml-2 text-xs text-gray-600">
                    {item.customizations.addons.map(
                      (addon: any, idx: number) => (
                        <div key={idx}>
                          • {addon.name}
                          {addon.price > 0 && (
                            <span className="text-green-600 ml-1">
                              (+{formatCurrency(addon.price)})
                            </span>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>

      {/* Observações Gerais */}
      {order.notes && (
        <div className="mb-3">
          <h2 className="text-sm font-bold border-b border-gray-300 pb-1 mb-2">
            OBSERVAÇÕES
          </h2>
          <div className="text-sm italic bg-orange-50 p-2 rounded">
            "{order.notes}"
          </div>
        </div>
      )}

      {/* Resumo */}
      <div className="mb-3">
        <h2 className="text-sm font-bold border-b border-gray-300 pb-1 mb-2">
          RESUMO
        </h2>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.deliveryFee > 0 && (
            <div className="flex justify-between">
              <span>Taxa de Entrega:</span>
              <span>{formatCurrency(order.deliveryFee)}</span>
            </div>
          )}
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Desconto:</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t pt-1">
            <span>TOTAL:</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="mb-3">
        <h2 className="text-sm font-bold border-b border-gray-300 pb-1 mb-2">
          INFORMAÇÕES
        </h2>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>Pagamento:</span>
            <span>{order.paymentMethod || "Não informado"}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span>
              {getPaymentStatusLabel(order.paymentStatus as PaymentStatus)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tipo:</span>
            <span>{getDeliveryTypeLabel(order.type)}</span>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div className="text-center text-xs text-gray-500 border-t pt-2">
        <div>
          Documento gerado em {formatDateTime(new Date().toISOString())}
        </div>
        <div className="mt-1">Obrigado pela preferência!</div>
      </div>
    </div>
  );
});

OrderPrintContent.displayName = "OrderPrintContent";
