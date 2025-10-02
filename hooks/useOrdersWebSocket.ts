import { apiClient } from "@/lib/api-client";
import { buildOrdersWebSocketUrl } from "@/lib/utils/url-validation";
import { Order, OrderStatus } from "@/types/cardapio-api";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useTokenManager } from "./useTokenManager";

interface UseOrdersWebSocketProps {
  storeSlug: string;
  token?: string; // Token agora é opcional, será obtido automaticamente se não fornecido
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
  onAuthError?: (error: string) => void; // Novo callback para erros de autenticação
}

interface WebSocketState {
  isConnected: boolean;
  connectionError: string | null;
  reconnectAttempts: number;
  lastPing: Date | null;
  authError: string | null;
  isConnecting: boolean;
}

export function useOrdersWebSocket({
  storeSlug,
  token: providedToken,
  onNewOrder,
  onOrderUpdated,
  onOrderCancelled,
  onStatsUpdated,
  onOrderCountersUpdated,
  onError,
  onAuthError,
}: UseOrdersWebSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const isConnectingRef = useRef<boolean>(false);
  const tokenManager = useTokenManager();

  // Manter callbacks estáveis entre renders para não recriar a conexão
  const onNewOrderRef = useRef<typeof onNewOrder>();
  const onOrderUpdatedRef = useRef<typeof onOrderUpdated>();
  const onOrderCancelledRef = useRef<typeof onOrderCancelled>();
  const onStatsUpdatedRef = useRef<typeof onStatsUpdated>();
  const onOrderCountersUpdatedRef = useRef<typeof onOrderCountersUpdated>();
  const onErrorRef = useRef<typeof onError>();
  const onAuthErrorRef = useRef<typeof onAuthError>();

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    connectionError: null,
    reconnectAttempts: 0,
    lastPing: null,
    authError: null,
    isConnecting: false,
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
  useEffect(() => {
    onAuthErrorRef.current = onAuthError;
  }, [onAuthError]);

  const maxReconnectAttempts = 5;
  const reconnectDelay = 1000; // 1 segundo

  // Função para conectar
  const connect = useCallback(() => {
    if (socketRef.current?.connected || isConnectingRef.current) {
      return;
    }

    // Obter token válido (usar fornecido ou obter automaticamente)
    const token = providedToken || tokenManager.getValidTokenForWebSocket();

    if (!token) {
      const errorMsg = "Token de autenticação não disponível para WebSocket";
      console.warn("⚠️ WebSocket:", errorMsg);
      setState((prev) => ({
        ...prev,
        authError: errorMsg,
        isConnecting: false,
      }));
      onAuthErrorRef.current?.(errorMsg);
      return;
    }

    // Validar token antes de conectar
    const validation = tokenManager.validateToken(token);
    if (!validation.isValid) {
      const errorMsg = validation.isExpired
        ? "Token expirado - faça login novamente"
        : "Token inválido";
      console.error("❌ WebSocket:", errorMsg);
      setState((prev) => ({
        ...prev,
        authError: errorMsg,
        isConnecting: false,
      }));
      onAuthErrorRef.current?.(errorMsg);

      if (validation.isExpired) {
        tokenManager.forceTokenRefresh();
      }
      return;
    }

    try {
      isConnectingRef.current = true;
      setState((prev) => ({
        ...prev,
        isConnecting: true,
        authError: null,
        connectionError: null,
      }));

      // Usar a mesma URL base que o apiClient usa
      const wsUrl = buildOrdersWebSocketUrl(apiClient.baseURL);

      const socket = io(wsUrl, {
        auth: {
          token,
        },
        timeout: 10000,
        forceNew: false,
      });

      socketRef.current = socket;

      // Eventos de conexão
      socket.on("connect", () => {
        setState((prev) => ({
          ...prev,
          isConnected: true,
          connectionError: null,
          authError: null,
          reconnectAttempts: 0,
          isConnecting: false,
        }));

        // Entrar na sala da loja
        socket.emit("join_store", { storeSlug });
        isConnectingRef.current = false;
      });

      socket.on("connected", (data) => {
        setState((prev) => ({
          ...prev,
          authError: null,
        }));
      });

      socket.on("joined_store", (data) => {});

      socket.on("disconnect", (reason) => {
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          connectionError:
            reason === "io server disconnect"
              ? "Desconectado pelo servidor"
              : "Conexão perdida",
        }));
        isConnectingRef.current = false;
      });

      socket.on("connect_error", (error) => {
        const errorMessage = error.message || "Erro de conexão";
        const isAuthError =
          errorMessage.includes("Token inválido") ||
          errorMessage.includes("Token de autenticação") ||
          errorMessage.includes("Unauthorized");

        setState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          connectionError: isAuthError ? null : errorMessage,
          authError: isAuthError ? errorMessage : null,
        }));

        if (isAuthError) {
          onAuthErrorRef.current?.(errorMessage);
          tokenManager.forceTokenRefresh();
        } else {
          onErrorRef.current?.(errorMessage);
        }

        isConnectingRef.current = false;
      });

      // Eventos de pedidos
      socket.on("new_order", (data) => {
        onNewOrderRef.current?.(data);
      });

      socket.on("order_updated", (data) => {
        onOrderUpdatedRef.current?.(data.order);
      });

      socket.on("order_cancelled", (data) => {
        onOrderCancelledRef.current?.(data.order);
      });

      socket.on("stats_updated", (data) => {
        onStatsUpdatedRef.current?.(data.stats);
      });

      socket.on("order_counters_updated", (data) => {
        onOrderCountersUpdatedRef.current?.(data.counters);
      });

      socket.on("store_stats", (stats) => {
        onStatsUpdatedRef.current?.(stats);
      });

      socket.on("orders_data", (data) => {
        console.log("📋 Dados de pedidos recebidos:", data);
        // Aqui você pode processar os dados de pedidos se necessário
      });

      socket.on("error", (error) => {
        console.error("❌ Erro no WebSocket:", error);
        const errorMessage = error.message || "Erro desconhecido";
        const isAuthError =
          errorMessage.includes("Token inválido") ||
          errorMessage.includes("Token de autenticação") ||
          errorMessage.includes("Unauthorized");

        if (isAuthError) {
          setState((prev) => ({
            ...prev,
            authError: errorMessage,
          }));
          onAuthErrorRef.current?.(errorMessage);
          tokenManager.forceTokenRefresh();
        } else {
          onErrorRef.current?.(errorMessage);
        }
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
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        connectionError: errorMessage,
      }));
      onErrorRef.current?.(errorMessage);
      isConnectingRef.current = false;
    }
  }, [storeSlug, providedToken, tokenManager]);

  // Função para desconectar
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setState((prev) => ({
        ...prev,
        isConnected: false,
        connectionError: null,
        isConnecting: false,
      }));
    }
  }, []);

  // Função para reconectar
  const reconnect = useCallback(() => {
    if (state.reconnectAttempts >= maxReconnectAttempts) {
      console.log("❌ Máximo de tentativas de reconexão atingido");
      return;
    }

    // Verificar se há erro de autenticação antes de tentar reconectar
    if (state.authError) {
      console.log("❌ Erro de autenticação detectado, não tentando reconectar");
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
    state.authError,
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

    // Verificar se há token válido antes de tentar conectar
    const token = providedToken || tokenManager.getValidTokenForWebSocket();
    if (!token) {
      console.warn("⚠️ WebSocket: Token não disponível, conexão não iniciada");
      return;
    }

    // Validar token antes de conectar
    const validation = tokenManager.validateToken(token);
    if (!validation.isValid) {
      console.warn("⚠️ WebSocket: Token inválido, conexão não iniciada");
      if (validation.isExpired) {
        tokenManager.forceTokenRefresh();
      }
      return;
    }

    connect();

    return () => {
      disconnect();
    };
  }, [storeSlug, providedToken, tokenManager, connect, disconnect]);

  // Efeito para reconexão automática
  useEffect(() => {
    if (
      !state.isConnected &&
      state.reconnectAttempts < maxReconnectAttempts &&
      !state.authError &&
      !state.isConnecting
    ) {
      const timer = setTimeout(() => {
        reconnect();
      }, reconnectDelay);

      return () => clearTimeout(timer);
    }
  }, [
    state.isConnected,
    state.reconnectAttempts,
    state.authError,
    state.isConnecting,
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
    authError: state.authError,
    reconnectAttempts: state.reconnectAttempts,
    lastPing: state.lastPing,
    isConnecting: state.isConnecting,
    connect,
    disconnect,
    reconnect,
    updateOrderStatus,
    requestOrders,
    sendPing,
  };
}
