import { Order } from "@/types/cardapio-api";
import { useEffect, useState } from "react";

// ❌ ANTES: Componente com polling (REMOVER)
export function OrdersListWithPolling({ storeSlug }: { storeSlug: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ❌ PROBLEMA: Polling a cada segundo
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/v1/orders/public?storeSlug=${storeSlug}&page=1&limit=50`
        );
        const data = await response.json();
        setOrders(data.data);
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
      }
    }, 1000); // ❌ A cada 1 segundo!

    // Carregar dados iniciais
    const loadInitialData = async () => {
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

    loadInitialData();

    // Cleanup
    return () => {
      clearInterval(interval);
    };
  }, [storeSlug]);

  return (
    <div>
      <h2>Pedidos (com polling - REMOVER)</h2>
      {/* Renderizar lista de pedidos */}
    </div>
  );
}

// ✅ DEPOIS: Componente com SSE (USAR)
export function OrdersListWithSSE({ storeSlug }: { storeSlug: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Carregar dados iniciais apenas uma vez
  useEffect(() => {
    const loadInitialData = async () => {
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

    loadInitialData();
  }, [storeSlug]);

  // Configurar SSE para atualizações em tempo real
  useEffect(() => {
    if (!storeSlug) return;

    const eventSource = new EventSource(
      `/api/v1/orders/public/stream?storeSlug=${storeSlug}`
    );

    eventSource.onopen = () => {
      console.log("🔗 SSE conectado");
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "NEW_ORDER":
            console.log("🆕 Novo pedido:", data.payload);
            setOrders((prev) => [data.payload, ...prev]);
            break;

          case "ORDER_UPDATED":
            console.log("🔄 Pedido atualizado:", data.payload);
            setOrders((prev) =>
              prev.map((order) =>
                order.id === data.payload.id ? data.payload : order
              )
            );
            break;

          case "ORDER_CANCELLED":
            console.log("❌ Pedido cancelado:", data.payload);
            setOrders((prev) =>
              prev.filter((order) => order.id !== data.payload.id)
            );
            break;
        }
      } catch (error) {
        console.error("Erro ao processar evento SSE:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("Erro na conexão SSE:", error);
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [storeSlug]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2>Pedidos (com SSE - USAR)</h2>
        <div className="flex items-center">
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
          />
          <span className="text-sm">
            {isConnected ? "Conectado" : "Desconectado"}
          </span>
        </div>
      </div>
      {/* Renderizar lista de pedidos */}
    </div>
  );
}
