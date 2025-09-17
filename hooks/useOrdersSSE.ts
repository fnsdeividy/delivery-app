import { useAuthContext } from "@/contexts/AuthContext";
import { useCallback, useEffect, useRef, useState } from "react";

interface OrderEvent {
  type:
    | "connected"
    | "heartbeat"
    | "new_order"
    | "order_update"
    | "order_cancel";
  order?: any;
  orderId?: string;
  message?: string;
  timestamp: string;
}

interface UseOrdersSSEOptions {
  storeSlug: string;
  onNewOrder?: (order: any) => void;
  onOrderUpdate?: (orderId: string, order: any) => void;
  onOrderCancel?: (orderId: string) => void;
  enabled?: boolean;
}

export function useOrdersSSE({
  storeSlug,
  onNewOrder,
  onOrderUpdate,
  onOrderCancel,
  enabled = true,
}: UseOrdersSSEOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<OrderEvent | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const { user } = useAuthContext();

  const connect = useCallback(() => {
    if (!enabled || !storeSlug || !user?.id) return;

    // Fechar conexão existente
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const userId = user.id;
    const url = `/api/orders/events?storeSlug=${encodeURIComponent(
      storeSlug
    )}&userId=${encodeURIComponent(userId)}`;

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log("SSE conectado para pedidos");
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttempts.current = 0;
    };

    eventSource.onmessage = (event) => {
      try {
        const data: OrderEvent = JSON.parse(event.data);
        setLastEvent(data);

        switch (data.type) {
          case "connected":
            console.log("Conexão SSE estabelecida");
            break;
          case "heartbeat":
            // Manter conexão viva
            break;
          case "new_order":
            console.log("Novo pedido recebido:", data.order);
            onNewOrder?.(data.order);
            break;
          case "order_update":
            console.log("Pedido atualizado:", data.orderId, data.order);
            onOrderUpdate?.(data.orderId!, data.order!);
            break;
          case "order_cancel":
            console.log("Pedido cancelado:", data.orderId);
            onOrderCancel?.(data.orderId!);
            break;
        }
      } catch (error) {
        console.error("Erro ao processar evento SSE:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("Erro na conexão SSE:", error);
      setIsConnected(false);
      setConnectionError("Erro na conexão em tempo real");

      // Tentar reconectar com backoff exponencial
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.pow(2, reconnectAttempts.current) * 1000; // 1s, 2s, 4s, 8s, 16s
        reconnectAttempts.current++;

        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(
            `Tentando reconectar SSE (tentativa ${reconnectAttempts.current})`
          );
          connect();
        }, delay);
      } else {
        console.error("Máximo de tentativas de reconexão atingido");
        setConnectionError("Não foi possível conectar em tempo real");
      }
    };
  }, [enabled, storeSlug, user?.id]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
    reconnectAttempts.current = 0;
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttempts.current = 0;
    connect();
  }, [disconnect, connect]);

  useEffect(() => {
    if (enabled && storeSlug && user?.id) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, storeSlug, user?.id, connect, disconnect]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connectionError,
    lastEvent,
    reconnect,
    disconnect,
  };
}

// Hook específico para página de pedidos
export function useOrdersPageSSE(
  storeSlug: string,
  callbacks?: {
    onNewOrder?: (order: any) => void;
    onOrderUpdate?: (orderId: string, order: any) => void;
    onOrderCancel?: (orderId: string) => void;
  }
) {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  // Usar refs para os callbacks para evitar re-criações desnecessárias
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const handleNewOrder = useCallback((order: any) => {
    setOrders((prev) => [order, ...prev]);
    callbacksRef.current?.onNewOrder?.(order);
  }, []);

  const handleOrderUpdate = useCallback(
    (orderId: string, updatedOrder: any) => {
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updatedOrder : order))
      );
      callbacksRef.current?.onOrderUpdate?.(orderId, updatedOrder);
    },
    []
  );

  const handleOrderCancel = useCallback((orderId: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
    callbacksRef.current?.onOrderCancel?.(orderId);
  }, []);

  const sse = useOrdersSSE({
    storeSlug,
    onNewOrder: handleNewOrder,
    onOrderUpdate: handleOrderUpdate,
    onOrderCancel: handleOrderCancel,
  });

  // Carregar pedidos iniciais
  useEffect(() => {
    const loadInitialOrders = async () => {
      if (!storeSlug || hasLoadedInitial) return;

      setIsLoading(true);
      try {
        // Usar o endpoint público para carregar pedidos iniciais
        const response = await fetch(
          `http://localhost:3001/api/v1/orders/public?storeSlug=${encodeURIComponent(
            storeSlug
          )}&page=1&limit=50`
        );
        const data = await response.json();

        if (data.data) {
          setOrders(data.data);
          setHasLoadedInitial(true);
        }
      } catch (error) {
        console.error("Erro ao carregar pedidos iniciais:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialOrders();
  }, [storeSlug, hasLoadedInitial]);

  return {
    ...sse,
    orders,
    setOrders,
    isLoading,
    setIsLoading,
  };
}
