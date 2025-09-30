"use client";

import { formatCurrency } from "@/lib/utils/order-utils";
import { Order } from "@/types/cardapio-api";
import { Bell, Clock, Eye, ShoppingBag, X } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DashboardNewOrderNotificationProps {
  notificationData?: {
    order: Order;
    orderNumber: string;
    customerName: string;
    total: number;
    itemsCount: number;
    timestamp: string;
  } | null;
  onClose: () => void;
  autoCloseDelay?: number;
  enableSound?: boolean;
  storeSlug?: string;
}

export function DashboardNewOrderNotification({
  notificationData,
  onClose,
  autoCloseDelay = 10000, // 10 segundos
  enableSound = true,
  storeSlug,
}: DashboardNewOrderNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(enableSound);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const router = useRouter();

  // Configurar áudio
  useEffect(() => {
    if (typeof window !== "undefined" && soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        setAudioContext(audioCtx);
      } catch (error) {
        console.warn("Erro ao criar AudioContext:", error);
        setSoundEnabled(false);
      }
    }
  }, [soundEnabled]);

  // Mostrar notificação quando houver dados
  useEffect(() => {
    if (notificationData) {
      setIsVisible(true);
      playNotificationSound();

      // Auto-close após delay
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Delay para animação
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [notificationData, autoCloseDelay, onClose]);

  // Tocar som de notificação
  const playNotificationSound = () => {
    if (!soundEnabled || !audioContext) return;

    try {
      // Verificar se o contexto está suspenso e retomar se necessário
      if (audioContext.state === "suspended") {
        audioContext.resume().catch(console.warn);
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Som de notificação mais elaborado (três notas ascendentes)
      oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(700, audioContext.currentTime + 0.15);
      oscillator.frequency.setValueAtTime(900, audioContext.currentTime + 0.3);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.6
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.6);
    } catch (error) {
      console.warn("Erro ao reproduzir som de notificação:", error);
    }
  };

  // Toggle som
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  if (!notificationData || !isVisible) return null;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden animate-in slide-in-from-right-5 duration-300">
        {/* Header com animação pulsante */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-200">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                <Bell className="h-5 w-5 text-green-600" />
              </div>
              {/* Efeito de ondas */}
              <div className="absolute inset-0 w-10 h-10 bg-green-200 rounded-full animate-ping opacity-20"></div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                🎉 Novo Pedido Recebido!
              </h3>
              <p className="text-xs text-gray-600">
                {formatTime(notificationData.timestamp)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={toggleSound}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title={soundEnabled ? "Desativar som" : "Ativar som"}
            >
              {soundEnabled ? (
                <span className="text-sm">🔊</span>
              ) : (
                <span className="text-sm">🔇</span>
              )}
            </button>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="space-y-3">
            {/* Informações principais */}
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-gray-900 text-lg">
                  Pedido #{notificationData.orderNumber}
                </p>
                <p className="text-sm text-gray-600 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {notificationData.customerName}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600 text-lg">
                  {formatCurrency(notificationData.total)}
                </p>
                <p className="text-xs text-gray-500 flex items-center">
                  <ShoppingBag className="h-3 w-3 mr-1" />
                  {notificationData.itemsCount} item(s)
                </p>
              </div>
            </div>

            {/* Items preview */}
            {notificationData.order.items &&
              notificationData.order.items.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2 font-medium">
                    Itens do pedido:
                  </p>
                  <div className="space-y-1">
                    {notificationData.order.items
                      .slice(0, 3)
                      .map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-xs bg-gray-50 p-2 rounded"
                        >
                          <span className="text-gray-700 truncate">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-gray-600 font-medium">
                            {formatCurrency(Number(item.price) * item.quantity)}
                          </span>
                        </div>
                      ))}
                    {notificationData.order.items.length > 3 && (
                      <p className="text-xs text-gray-400 text-center py-1">
                        +{notificationData.order.items.length - 3} mais itens...
                      </p>
                    )}
                  </div>
                </div>
              )}

            {/* Informações de Pagamento */}
            <div className="mt-3 space-y-1">
              {notificationData.order.paymentMethod && (
                <div className="flex items-center space-x-2 text-xs">
                  <div className="flex items-center space-x-1 text-gray-500">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">Pagamento:</span>
                  </div>
                  <span className="text-gray-600 capitalize">
                    {notificationData.order.paymentMethod.toLowerCase()}
                  </span>
                </div>
              )}

              {/* Troco */}
              {notificationData.order.cashChangeAmount &&
                notificationData.order.cashChangeAmount > 0 && (
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Troco:</span>
                    </div>
                    <span className="text-gray-600 font-semibold">
                      {formatCurrency(
                        Math.max(
                          0,
                          notificationData.order.cashChangeAmount -
                            notificationData.total
                        )
                      )}
                    </span>
                  </div>
                )}
            </div>

            {/* Observações */}
            {notificationData.order.notes && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1 font-medium">
                  Observações:
                </p>
                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  {notificationData.order.notes.length > 80
                    ? `${notificationData.order.notes.substring(0, 80)}...`
                    : notificationData.order.notes}
                </p>
              </div>
            )}
          </div>

          {/* Call to Action */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  if (storeSlug) {
                    router.push(`/dashboard/${storeSlug}/pedidos`);
                  }
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
                className="flex-1 bg-green-600 text-white text-sm font-medium py-2 px-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
              >
                <Eye className="h-4 w-4" />
                <span>Ver Pedidos</span>
              </button>
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
                className="px-3 py-2 text-gray-600 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">
              Clique em "Ver Pedidos" para gerenciar este pedido
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-green-500 transition-all duration-1000 ease-linear"
            style={{
              width: "100%",
              animation: "shrink 10s linear forwards",
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
