import { useEffect, useState } from "react";
import { useOrdersSSE } from "../../hooks/useOrdersSSE";
import { calculateChange } from "../../lib/utils/order-utils";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  customer: {
    name: string;
    phone: string;
  };
  items: any[];
  createdAt: string;
}

interface OrdersListWithSSEProps {
  storeSlug: string;
}

export function OrdersListWithSSE({ storeSlug }: OrdersListWithSSEProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar pedidos iniciais (apenas uma vez)
  useEffect(() => {
    const loadInitialOrders = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/v1/orders/public?storeSlug=${storeSlug}&page=1&limit=50`
        );
        const data = await response.json();
        setOrders(data.data);
      } catch (error) {
        console.error("Erro ao carregar pedidos iniciais:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialOrders();
  }, [storeSlug]);

  // Configurar SSE para atualizações em tempo real
  const { isConnected, connectionError, reconnect } = useOrdersSSE({
    storeSlug,
    onNewOrder: (newOrder: Order) => {
      console.log("🆕 Adicionando novo pedido:", newOrder);
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
    },
    onOrderUpdated: (updatedOrder: Order) => {
      console.log("🔄 Atualizando pedido:", updatedOrder);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
    },
    onOrderCancelled: (cancelledOrder: Order) => {
      console.log("❌ Removendo pedido cancelado:", cancelledOrder);
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== cancelledOrder.id)
      );
    },
    onError: (error) => {
      console.error("Erro na conexão SSE:", error);
    },
  });

  if (isLoading) {
    return <div>Carregando pedidos...</div>;
  }

  return (
    <div className="orders-container">
      {/* Status da conexão SSE */}
      <div className="connection-status mb-4">
        {isConnected ? (
          <div className="flex items-center text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Conectado em tempo real
          </div>
        ) : (
          <div className="flex items-center text-red-600">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            Desconectado
            {connectionError && (
              <button
                onClick={reconnect}
                className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-sm"
              >
                Reconectar
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lista de pedidos */}
      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Nenhum pedido encontrado
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="order-card border rounded-lg p-4 mb-4 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">Pedido #{order.orderNumber}</h3>
                  <p className="text-sm text-gray-600">
                    {order.customer.name} - {order.customer.phone}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    R$ {order.total.toFixed(2)}
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      order.status === "RECEIVED"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "CONFIRMED"
                        ? "bg-blue-100 text-blue-800"
                        : order.status === "DELIVERED"
                        ? "bg-green-100 text-green-800"
                        : order.status === "CANCELLED"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Itens do pedido */}
              {order.items && order.items.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Itens:
                  </h4>
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {item.quantity}x {item.name} - R${" "}
                        {item.price.toFixed(2)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Informações de Pagamento, Observações e Troco */}
              <div className="mt-3 space-y-2">
                {/* Forma de Pagamento */}
                {order.paymentMethod && (
                  <div className="flex items-center space-x-2 text-sm">
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
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Troco:</span>
                    </div>
                    <span className="text-gray-700 font-semibold">
                      R${" "}
                      {calculateChange(
                        order.cashChangeAmount,
                        order.total
                      ).toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Observações */}
                {order.notes && (
                  <div className="flex items-start space-x-2 text-sm">
                    <div className="flex items-center space-x-1 text-gray-600 mt-0.5">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="font-medium">Observações:</span>
                    </div>
                    <span className="text-gray-700 italic">
                      "{order.notes}"
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
