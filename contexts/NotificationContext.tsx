"use client";

import { DashboardNewOrderNotification } from "@/components/orders/DashboardNewOrderNotification";
import { useCardapioAuth } from "@/hooks";
import { useOrdersSSE } from "@/hooks/useOrdersSSE";
import { useOrdersWebSocket } from "@/hooks/useOrdersWebSocket";
import { Order } from "@/types/cardapio-api";
import { createContext, useContext, useRef, useState } from "react";

interface NotificationData {
  order: Order;
  orderNumber: string;
  customerName: string;
  total: number;
  itemsCount: number;
  timestamp: string;
}

interface NotificationContextType {
  showNotification: (data: NotificationData) => void;
  hideNotification: () => void;
  isNotificationVisible: boolean;
  orderCounters: {
    newOrders: number;
    totalOrders: number;
    pendingOrders: number;
  };
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: React.ReactNode;
  storeSlug: string;
}

export function NotificationProvider({
  children,
  storeSlug,
}: NotificationProviderProps) {
  const { isAuthenticated, getCurrentToken } = useCardapioAuth();
  const [notificationData, setNotificationData] =
    useState<NotificationData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [orderCounters, setOrderCounters] = useState({
    newOrders: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });
  // Evitar notificações duplicadas quando WebSocket e SSE estiverem ativos
  const lastNotifiedOrderIdRef = useRef<string | null>(null);

  // Configurar WebSocket para notificações de novos pedidos
  useOrdersWebSocket({
    storeSlug,
    // Token será obtido automaticamente pelo hook
    onNewOrder: (data) => {
      console.log("🎉 Novo pedido recebido no dashboard:", data);
      if (data?.order?.id && lastNotifiedOrderIdRef.current === data.order.id) {
        return;
      }
      lastNotifiedOrderIdRef.current = data?.order?.id ?? null;

      // Adicionar timestamp aos dados antes de chamar showNotification
      const notificationData: NotificationData = {
        ...data,
        timestamp: new Date().toISOString(),
      };
      showNotification(notificationData);
    },
    onOrderCountersUpdated: (counters) => {
      setOrderCounters(counters);
    },
    onStatsUpdated: (stats) => {
      if (!stats) return;
      const statusCounts = stats.statusCounts || {};
      setOrderCounters({
        newOrders: statusCounts["RECEIVED"] || 0,
        totalOrders: stats.totalOrders || 0,
        pendingOrders:
          (statusCounts["PREPARING"] || 0) + (statusCounts["CONFIRMED"] || 0),
      });
    },
    onError: (error) => {
      console.error("Erro no WebSocket do dashboard:", error);
    },
    onAuthError: (error) => {
      console.error("Erro de autenticação no WebSocket do dashboard:", error);
      // O hook já gerencia o redirecionamento para login
    },
  });

  // Fallback/Complemento: SSE global para todas as rotas
  useOrdersSSE({
    storeSlug,
    onNewOrder: (order: any) => {
      try {
        if (order?.id && lastNotifiedOrderIdRef.current === order.id) {
          return;
        }
        lastNotifiedOrderIdRef.current = order?.id ?? null;
        const notification = {
          order,
          orderNumber: order?.orderNumber || order?.id?.slice?.(-8) || "",
          customerName: order?.customer?.name || "Cliente",
          total: Number(order?.total ?? 0),
          itemsCount: Array.isArray(order?.items) ? order.items.length : 0,
          timestamp: new Date().toISOString(),
        } as NotificationData;
        console.log("🔔 NEW_ORDER via SSE (global):", notification);
        showNotification(notification);
      } catch (err) {
        console.warn("Falha ao processar NEW_ORDER via SSE:", err);
      }
    },
    onOrderUpdated: () => { },
    onOrderCancelled: () => { },
    onError: (e) => {
      console.warn("SSE erro (global):", e);
    },
  });

  const showNotification = (data: NotificationData) => {
    setNotificationData(data);
    setIsVisible(true);
  };

  const hideNotification = () => {
    setIsVisible(false);
    setTimeout(() => {
      setNotificationData(null);
    }, 300); // Delay para animação
  };

  const value: NotificationContextType = {
    showNotification,
    hideNotification,
    isNotificationVisible: isVisible,
    orderCounters,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Notificação Global */}
      <DashboardNewOrderNotification
        notificationData={notificationData}
        onClose={hideNotification}
        autoCloseDelay={10000}
        enableSound={true}
        storeSlug={storeSlug}
      />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification deve ser usado dentro de um NotificationProvider"
    );
  }
  return context;
}
