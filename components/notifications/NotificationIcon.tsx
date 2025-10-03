"use client";

import { Bell, X } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useNotification } from "../../contexts/NotificationContext";
import { useCardapioAuth } from "../../hooks";
import { useOrdersWebSocket } from "../../hooks/useOrdersWebSocket";
import { apiClient } from "../../lib/api-client";

interface OrderNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: {
    orderNumber: string;
    customerName: string;
    total: number;
    storeSlug: string;
    status?: string;
    paymentStatus?: string;
  };
  read: boolean;
  createdAt: string;
}

interface NotificationIconProps {
  storeSlug: string;
}

interface OrderStatusCounts {
  RECEIVED: number;
  PENDING: number;
  CONFIRMED: number;
  PREPARING: number;
  READY: number;
  DELIVERING: number;
  DELIVERED: number;
  CANCELLED: number;
}

export function NotificationIcon({ storeSlug }: NotificationIconProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState<OrderStatusCounts>({
    RECEIVED: 0,
    PENDING: 0,
    CONFIRMED: 0,
    PREPARING: 0,
    READY: 0,
    DELIVERING: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { orderCounters } = useNotification();
  const { getCurrentToken } = useCardapioAuth();

  // WebSocket para atualizações em tempo real do badge
  const { isConnected } = useOrdersWebSocket({
    storeSlug,
    onNewOrder: (data) => {
      console.log("🔔 Novo pedido recebido no NotificationIcon:", data);
      // Atualizar contadores automaticamente
      fetchOrderStats();
    },
    onOrderCountersUpdated: (counters) => {
      console.log("📊 Contadores atualizados no NotificationIcon:", counters);
      // Os contadores já são atualizados via NotificationContext
    },
    onStatsUpdated: (stats) => {
      console.log("📈 Stats atualizados no NotificationIcon:", stats);
      if (stats?.statusCounts) {
        setStatusCounts(stats.statusCounts);
      }
    },
    onError: (error) => {
      console.error("Erro no WebSocket do NotificationIcon:", error);
    },
  });

  // Buscar estatísticas de pedidos
  const fetchOrderStats = async () => {
    try {
      const token = await getCurrentToken();
      if (!token) return;

      const stats = (await apiClient.get(
        `/orders/stats?storeSlug=${storeSlug}`
      )) as any;
      setStatusCounts(stats.statusCounts || {});
    } catch (error) {
      console.error("Erro ao buscar estatísticas de pedidos:", error);
    }
  };

  // Buscar notificações quando o dropdown é aberto
  const fetchNotifications = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const token = await getCurrentToken();
      if (!token) {
        console.error("Token não disponível");
        return;
      }

      const data = (await apiClient.get(
        `/notifications/orders?storeSlug=${storeSlug}&limit=10`
      )) as any;
      setNotifications(data.notifications || []);
      setUnreadCount(data.totalUnread || 0);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Marcar notificação como lida
  const markAsRead = async (notificationId: string) => {
    try {
      const token = await getCurrentToken();
      if (!token) return;

      await apiClient.post(`/notifications/${notificationId}/read`);

      // Atualizar estado local
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  // Gerar mensagens personalizadas baseadas nos status
  const generateStatusMessages = (): string[] => {
    const messages: string[] = [];

    const receivedCount = statusCounts.RECEIVED || 0;
    const pendingCount = statusCounts.PENDING || 0;
    const confirmedCount = statusCounts.CONFIRMED || 0;
    const preparingCount = statusCounts.PREPARING || 0;
    const readyCount = statusCounts.READY || 0;

    if (receivedCount > 0) {
      messages.push(
        `Você tem ${receivedCount} pedido${
          receivedCount > 1 ? "s" : ""
        } aguardando confirmação`
      );
    }

    if (pendingCount > 0) {
      messages.push(
        `${pendingCount} pedido${
          pendingCount > 1 ? "s" : ""
        } aguardam confirmação de pagamento`
      );
    }

    if (confirmedCount > 0) {
      messages.push(
        `${confirmedCount} pedido${confirmedCount > 1 ? "s" : ""} confirmado${
          confirmedCount > 1 ? "s" : ""
        } aguardam preparo`
      );
    }

    if (preparingCount > 0) {
      messages.push(
        `${preparingCount} pedido${preparingCount > 1 ? "s" : ""} em preparação`
      );
    }

    if (readyCount > 0) {
      messages.push(
        `${readyCount} pedido${readyCount > 1 ? "s" : ""} pronto${
          readyCount > 1 ? "s" : ""
        } para entrega`
      );
    }

    return messages;
  };

  // Calcular total de pedidos que precisam de atenção
  const getTotalAttentionCount = (): number => {
    return (statusCounts.RECEIVED || 0) + (statusCounts.PENDING || 0);
  };

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      fetchNotifications();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Buscar estatísticas quando o componente é montado
  useEffect(() => {
    fetchOrderStats();
  }, [storeSlug]);

  // Atualizar estatísticas quando os contadores do contexto mudarem
  useEffect(() => {
    if (orderCounters?.newOrders !== undefined) {
      // Atualizar statusCounts baseado nos contadores em tempo real
      setStatusCounts((prev) => ({
        ...prev,
        RECEIVED: orderCounters.newOrders || 0,
        PENDING: orderCounters.pendingOrders || 0,
      }));
    }
  }, [orderCounters]);

  // Usar contador de pedidos que precisam de atenção
  // Priorizar contadores em tempo real do WebSocket, depois local, depois do contexto
  const displayCount = (() => {
    // Se há notificações não lidas, mostrar essas
    if (unreadCount > 0) {
      return unreadCount;
    }

    // Usar contadores em tempo real do WebSocket/contexto
    const realtimeNewOrders = orderCounters?.newOrders || 0;
    const localAttentionCount = getTotalAttentionCount();

    // Priorizar o maior valor entre contadores em tempo real e locais
    const finalCount = Math.max(realtimeNewOrders, localAttentionCount);
    return finalCount;
  })();

  const handleNotificationClick = (notification: OrderNotification) => {
    markAsRead(notification.id);
    router.push(`/dashboard/${storeSlug}/pedidos`);
    setIsOpen(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Agora";
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Ícone de notificação */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
        aria-label="Notificações"
      >
        <Bell className="h-6 w-6" />

        {/* Badge de contagem */}
        {displayCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {displayCount > 99 ? "99+" : displayCount}
          </span>
        )}

        {/* Indicador de conexão WebSocket */}
        {isConnected && (
          <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
        )}
      </button>

      {/* Dropdown de notificações */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 md:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[calc(100vh-8rem)] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Notificações
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Mensagens de status */}
          {generateStatusMessages().length > 0 && (
            <div className="p-4 border-b border-gray-200 bg-blue-50">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Status dos Pedidos
              </h4>
              {generateStatusMessages().map((message, index) => (
                <div key={index} className="flex items-center space-x-2 mb-1">
                  <div className="h-1.5 w-1.5 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-800">{message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Lista de notificações */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Carregando notificações...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nenhuma notificação encontrada
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          Pedido #{notification.data?.orderNumber || "N/A"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  router.push(`/dashboard/${storeSlug}/pedidos`);
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Ver todos os pedidos
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
