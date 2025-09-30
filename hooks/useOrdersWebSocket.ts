import { Order, OrderStatus } from "@/types/cardapio-api";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface UseOrdersWebSocketProps {
  storeSlug: string;
  token: string;
  onNewOrder?: (data: {
    order: Order;
    orderNumber: string;
    customerName: string;
    total: number;
    itemsCount: number;
  }) => void;
  onOrderUpdated?: (order: Order) => void;
  onOrderCancelled?: (order: Order) => void;
  onStatsUpdated?: (stats: any) => void;
  onOrderCountersUpdated?: (counters: {
    newOrders: number;
    totalOrders: number;
    pendingOrders: number;
  }) => void;
  onError?: (error: string) => void;
}

interface WebSocketState {
  isConnected: boolean;
  connectionError: string | null;
  reconnectAttempts: number;
  lastPing: Date | null;
}

export function useOrdersWebSocket({
  storeSlug,
  token,
  onNewOrder,
  onOrderUpdated,
  onOrderCancelled,
  onStatsUpdated,
  onOrderCountersUpdated,
  onError,
}: UseOrdersWebSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const isConnectingRef = useRef<boolean>(false);

  // Manter callbacks estáveis entre renders para não recriar a conexão
  const onNewOrderRef = useRef<typeof onNewOrder>();
  const onOrderUpdatedRef = useRef<typeof onOrderUpdated>();
  const onOrderCancelledRef = useRef<typeof onOrderCancelled>();
  const onStatsUpdatedRef = useRef<typeof onStatsUpdated>();
  const onOrderCountersUpdatedRef = useRef<typeof onOrderCountersUpdated>();
  const onErrorRef = useRef<typeof onError>();

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    connectionError: null,
    reconnectAttempts: 0,
    lastPing: null,
  });

  useEffect(() => {
    onNewOrderRef.current = onNewOrder;
  }, [onNewOrder]);
  useEffect(() => {
    onOrderUpdatedRef.current = onOrderUpdated;
  }, [onOrderUpdated]);
  useEffect(() => {
    onOrderCancelledRef.current = onOrderCancelled;
  }, [onOrderCancelled]);
  useEffect(() => {
    onStatsUpdatedRef.current = onStatsUpdated;
  }, [onStatsUpdated]);
  useEffect(() => {
    onOrderCountersUpdatedRef.current = onOrderCountersUpdated;
  }, [onOrderCountersUpdated]);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const maxReconnectAttempts = 5;
  const reconnectDelay = 1000; // 1 segundo

  // Função para conectar
  const connect = useCallback(() => {
    if (socketRef.current?.connected || isConnectingRef.current) {
      return;
    }
    if (!token) {
      console.warn("WebSocket: token ausente, conexão não iniciada");
      return;
    }

    try {
      isConnectingRef.current = true;
      const socket = io(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/orders`,
        {
          auth: {
            token,
          },
          // deixar o Socket.IO decidir transporte (polling -> upgrade para websocket)
          timeout: 10000,
          forceNew: false,
        }
      );

      socketRef.current = socket;

      // Eventos de conexão
      socket.on("connect", () => {
        console.log("🔌 WebSocket conectado");
        setState((prev) => ({
          ...prev,
          isConnected: true,
          connectionError: null,
          reconnectAttempts: 0,
        }));

        // Entrar na sala da loja
        socket.emit("join_store", { storeSlug });
        isConnectingRef.current = false;
      });

      socket.on("connected", (data) => {
        console.log("✅ Autenticado no WebSocket:", data);
      });

      socket.on("joined_store", (data) => {
        console.log("🏪 Entrou na loja:", data);
      });

      socket.on("disconnect", (reason) => {
        console.log("🔌 WebSocket desconectado:", reason);
        setState((prev) => ({
          ...prev,
          isConnected: false,
          connectionError:
            reason === "io server disconnect"
              ? "Desconectado pelo servidor"
              : "Conexão perdida",
        }));
      });

      socket.on("connect_error", (error) => {
        console.error("❌ Erro de conexão WebSocket:", error);
        setState((prev) => ({
          ...prev,
          isConnected: false,
          connectionError: error.message || "Erro de conexão",
        }));
        isConnectingRef.current = false;
      });

      // Eventos de pedidos
      socket.on("new_order", (data) => {
        console.log("🆕 Novo pedido recebido via WebSocket:", data);
        onNewOrderRef.current?.(data);
      });

      socket.on("order_updated", (data) => {
        console.log("🔄 Pedido atualizado via WebSocket:", data);
        onOrderUpdatedRef.current?.(data.order);
      });

      socket.on("order_cancelled", (data) => {
        console.log("❌ Pedido cancelado via WebSocket:", data);
        onOrderCancelledRef.current?.(data.order);
      });

      socket.on("stats_updated", (data) => {
        console.log("📊 Estatísticas atualizadas via WebSocket:", data);
        onStatsUpdatedRef.current?.(data.stats);
      });

      socket.on("order_counters_updated", (data) => {
        console.log(
          "🔢 Contadores de pedidos atualizados via WebSocket:",
          data
        );
        onOrderCountersUpdatedRef.current?.(data.counters);
      });

      socket.on("store_stats", (stats) => {
        console.log("📊 Estatísticas iniciais da loja:", stats);
        onStatsUpdatedRef.current?.(stats);
      });

      socket.on("orders_data", (data) => {
        console.log("📋 Dados de pedidos recebidos:", data);
        // Aqui você pode processar os dados de pedidos se necessário
      });

      socket.on("error", (error) => {
        console.error("❌ Erro no WebSocket:", error);
        onErrorRef.current?.(error.message || "Erro desconhecido");
      });

      // Ping/Pong para manter conexão ativa
      socket.on("pong", (data) => {
        setState((prev) => ({
          ...prev,
          lastPing: new Date(data.timestamp),
        }));
      });

      // Solicitar pedidos iniciais
      socket.emit("request_orders", {
        storeSlug,
        page: 1,
        limit: 50,
      });
    } catch (error) {
      console.error("Erro ao criar conexão WebSocket:", error);
      onErrorRef.current?.(
        error instanceof Error ? error.message : "Erro desconhecido"
      );
      isConnectingRef.current = false;
    }
  }, [storeSlug, token]);

  // Função para desconectar
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setState((prev) => ({
        ...prev,
        isConnected: false,
        connectionError: null,
      }));
    }
  }, []);

  // Função para reconectar
  const reconnect = useCallback(() => {
    if (state.reconnectAttempts >= maxReconnectAttempts) {
      console.log("❌ Máximo de tentativas de reconexão atingido");
      return;
    }

    setState((prev) => ({
      ...prev,
      reconnectAttempts: prev.reconnectAttempts + 1,
      connectionError: null,
    }));

    setTimeout(() => {
      disconnect();
      connect();
    }, reconnectDelay);
  }, [
    state.reconnectAttempts,
    maxReconnectAttempts,
    reconnectDelay,
    disconnect,
    connect,
  ]);

  // Função para atualizar status do pedido
  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("update_order_status", {
          orderId,
          status,
          storeSlug,
        });

        // Retornar uma Promise para permitir aguardar a confirmação
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Timeout ao atualizar status do pedido"));
          }, 10000);

          const handleStatusUpdate = (data: any) => {
            if (data.orderId === orderId) {
              clearTimeout(timeout);
              socketRef.current?.off(
                "order_status_updated",
                handleStatusUpdate
              );
              if (data.success) {
                resolve(data);
              } else {
                reject(new Error(data.error || "Erro ao atualizar status"));
              }
            }
          };

          socketRef.current?.on("order_status_updated", handleStatusUpdate);
        });
      } else {
        console.warn(
          "WebSocket não conectado. Não é possível atualizar status do pedido."
        );
        return Promise.reject(new Error("WebSocket não conectado"));
      }
    },
    [storeSlug]
  );

  // Função para solicitar pedidos
  const requestOrders = useCallback(
    (filters?: { page?: number; limit?: number; status?: string }) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("request_orders", {
          storeSlug,
          ...filters,
        });
      }
    },
    [storeSlug]
  );

  // Função para enviar ping
  const sendPing = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("ping");
    }
  }, []);

  // Efeito para conectar/desconectar
  useEffect(() => {
    if (!storeSlug) return;
    if (!token || token.trim().length < 10) return; // evita conectar com token vazio/curto

    connect();

    return () => {
      disconnect();
    };
  }, [storeSlug, token, connect, disconnect]);

  // Efeito para reconexão automática
  useEffect(() => {
    if (!state.isConnected && state.reconnectAttempts < maxReconnectAttempts) {
      const timer = setTimeout(() => {
        reconnect();
      }, reconnectDelay);

      return () => clearTimeout(timer);
    }
  }, [
    state.isConnected,
    state.reconnectAttempts,
    maxReconnectAttempts,
    reconnectDelay,
    reconnect,
  ]);

  // Efeito para ping periódico
  useEffect(() => {
    if (state.isConnected) {
      const pingInterval = setInterval(() => {
        sendPing();
      }, 10000); // Ping a cada 10 segundos

      return () => clearInterval(pingInterval);
    }
  }, [state.isConnected, sendPing]);

  return {
    isConnected: state.isConnected,
    connectionError: state.connectionError,
    reconnectAttempts: state.reconnectAttempts,
    lastPing: state.lastPing,
    connect,
    disconnect,
    reconnect,
    updateOrderStatus,
    requestOrders,
    sendPing,
  };
}
