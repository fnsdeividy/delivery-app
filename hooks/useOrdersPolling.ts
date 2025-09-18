import { useAuthContext } from "@/contexts/AuthContext";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseOrdersPollingOptions {
  storeSlug: string;
  onNewOrder?: (order: any) => void;
  onOrderUpdate?: (orderId: string, order: any) => void;
  onOrderCancel?: (orderId: string) => void;
  enabled?: boolean;
  pollInterval?: number;
}

export function useOrdersPolling({
  storeSlug,
  onNewOrder,
  onOrderUpdate,
  onOrderCancel,
  enabled = true,
  pollInterval = 5000, // 5 segundos
}: UseOrdersPollingOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastPoll, setLastPoll] = useState<Date | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuthContext();

  // Função para buscar pedidos
  const fetchOrders = useCallback(async () => {
    if (!storeSlug || !user?.id) return;

    try {
      const response = await fetch(
        `http://localhost:3001/api/v1/orders/public?storeSlug=${encodeURIComponent(
          storeSlug
        )}&page=1&limit=50`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.data) {
        const newOrders = data.data;

        // Comparar com pedidos anteriores para detectar mudanças
        setOrders((prevOrders) => {
          const orderMap = new Map(
            prevOrders.map((order) => [order.id, order])
          );
          const changes: {
            type: "new" | "update" | "cancel";
            order: any;
            orderId?: string;
          }[] = [];

          // Verificar novos pedidos e atualizações
          newOrders.forEach((newOrder: any) => {
            const existingOrder = orderMap.get(newOrder.id);

            if (!existingOrder) {
              // Novo pedido
              changes.push({ type: "new", order: newOrder });
            } else if (
              existingOrder.status !== newOrder.status ||
              existingOrder.paymentStatus !== newOrder.paymentStatus
            ) {
              // Pedido atualizado
              changes.push({
                type: "update",
                order: newOrder,
                orderId: newOrder.id,
              });
            }
          });

          // Verificar pedidos cancelados (que não estão mais na lista)
          const newOrderIds = new Set(newOrders.map((order: any) => order.id));
          prevOrders.forEach((prevOrder) => {
            if (
              !newOrderIds.has(prevOrder.id) &&
              prevOrder.status !== "CANCELLED"
            ) {
              changes.push({
                type: "cancel",
                order: prevOrder,
                orderId: prevOrder.id,
              });
            }
          });

          // Processar mudanças
          changes.forEach((change) => {
            switch (change.type) {
              case "new":
                onNewOrder?.(change.order);
                break;
              case "update":
                onOrderUpdate?.(change.orderId!, change.order);
                break;
              case "cancel":
                onOrderCancel?.(change.orderId!);
                break;
            }
          });

          return newOrders;
        });

        setLastPoll(new Date());
        setIsConnected(true);
        setConnectionError(null);
      }
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      setConnectionError("Erro ao buscar pedidos");
      setIsConnected(false);
    }
  }, [storeSlug, user?.id, onNewOrder, onOrderUpdate, onOrderCancel]);

  // Iniciar polling
  const startPolling = useCallback(() => {
    if (!enabled || !storeSlug || !user?.id) return;

    // Buscar imediatamente
    fetchOrders();

    // Configurar polling
    pollingRef.current = setInterval(() => {
      fetchOrders();
    }, pollInterval);

    setIsConnected(true);
  }, [enabled, storeSlug, user?.id, fetchOrders, pollInterval]);

  // Parar polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Reconectar
  const reconnect = useCallback(() => {
    stopPolling();
    setTimeout(() => {
      startPolling();
    }, 1000);
  }, [stopPolling, startPolling]);

  // Efeito para gerenciar polling
  useEffect(() => {
    if (enabled && storeSlug && user?.id) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, storeSlug, user?.id, startPolling, stopPolling]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    isConnected,
    connectionError,
    lastPoll,
    orders,
    setOrders,
    isLoading,
    setIsLoading,
    reconnect,
    disconnect: stopPolling,
    fetchOrders,
  };
}

// Hook específico para página de pedidos com polling
export function useOrdersPagePolling(
  storeSlug: string,
  callbacks?: {
    onNewOrder?: (order: any) => void;
    onOrderUpdate?: (orderId: string, order: any) => void;
    onOrderCancel?: (orderId: string) => void;
  }
) {
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  // Usar refs para os callbacks para evitar re-criações desnecessárias
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const handleNewOrder = useCallback((order: any) => {
    callbacksRef.current?.onNewOrder?.(order);
  }, []);

  const handleOrderUpdate = useCallback(
    (orderId: string, updatedOrder: any) => {
      callbacksRef.current?.onOrderUpdate?.(orderId, updatedOrder);
    },
    []
  );

  const handleOrderCancel = useCallback((orderId: string) => {
    callbacksRef.current?.onOrderCancel?.(orderId);
  }, []);

  const polling = useOrdersPolling({
    storeSlug,
    onNewOrder: handleNewOrder,
    onOrderUpdate: handleOrderUpdate,
    onOrderCancel: handleOrderCancel,
    pollInterval: 3000, // 3 segundos para página de pedidos
  });

  // Marcar como carregado inicialmente
  useEffect(() => {
    if (polling.orders.length > 0 && !hasLoadedInitial) {
      setHasLoadedInitial(true);
    }
  }, [polling.orders.length, hasLoadedInitial]);

  return {
    ...polling,
    hasLoadedInitial,
  };
}
