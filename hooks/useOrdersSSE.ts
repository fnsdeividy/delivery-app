import { useCallback, useEffect, useRef, useState } from "react";

interface OrderEvent {
  type: "NEW_ORDER" | "ORDER_UPDATED" | "ORDER_CANCELLED";
  payload: any;
  timestamp: string;
}

interface UseOrdersSSEOptions {
  storeSlug: string;
  onNewOrder?: (order: any) => void;
  onOrderUpdated?: (order: any) => void;
  onOrderCancelled?: (order: any) => void;
  onError?: (error: Event) => void;
}

export function useOrdersSSE({
  storeSlug,
  onNewOrder,
  onOrderUpdated,
  onOrderCancelled,
  onError,
}: UseOrdersSSEOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Memoizar callbacks para evitar reconexões desnecessárias
  const handleNewOrder = useCallback(
    (order: any) => {
      onNewOrder?.(order);
    },
    [onNewOrder]
  );

  const handleOrderUpdated = useCallback(
    (order: any) => {
      onOrderUpdated?.(order);
    },
    [onOrderUpdated]
  );

  const handleOrderCancelled = useCallback(
    (order: any) => {
      onOrderCancelled?.(order);
    },
    [onOrderCancelled]
  );

  const handleError = useCallback(
    (error: Event) => {
      onError?.(error);
    },
    [onError]
  );

  useEffect(() => {
    if (!storeSlug) return;

    // Fechar conexão anterior se existir
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Criar nova conexão SSE (usar backend direto)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const eventSource = new EventSource(
      `${baseUrl}/api/v1/orders/public/stream?storeSlug=${storeSlug}`
    );

    eventSourceRef.current = eventSource;

    // Evento de conexão aberta
    eventSource.onopen = () => {
      console.log("🔗 SSE conectado para loja:", storeSlug);
      setIsConnected(true);
      setConnectionError(null);
    };

    // Evento de mensagem recebida
    eventSource.onmessage = (event) => {
      try {
        const data: OrderEvent = JSON.parse(event.data);

        console.log("📨 Evento SSE recebido:", data);

        switch (data.type) {
          case "NEW_ORDER":
            handleNewOrder(data.payload);
            break;

          case "ORDER_UPDATED":
            handleOrderUpdated(data.payload);
            break;

          case "ORDER_CANCELLED":
            handleOrderCancelled(data.payload);
            break;
        }
      } catch (error) {
        console.error("❌ Erro ao processar evento SSE:", error);
      }
    };

    // Evento de erro
    eventSource.onerror = (error) => {
      console.error("❌ Erro na conexão SSE:", error);
      setIsConnected(false);
      setConnectionError("Erro na conexão em tempo real");
      handleError(error);
    };

    // Cleanup ao desmontar componente
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
    };
  }, [storeSlug]); // Removido as dependências dos callbacks para evitar reconexões

  // Função para reconectar manualmente
  const reconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setConnectionError(null);
    // O useEffect será executado novamente
  };

  return {
    isConnected,
    connectionError,
    reconnect,
  };
}
