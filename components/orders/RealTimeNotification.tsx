"use client";

import { Order, OrderStatus } from "@/types/cardapio-api";
import {
  CheckCircle,
  Clock,
  CookingPot,
  SpeakerHigh,
  SpeakerX,
  Truck,
  X,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";

interface RealTimeNotificationProps {
  order: Order | null;
  onClose: () => void;
  onViewDetails: (order: Order) => void;
  autoCloseDelay?: number;
  enableSound?: boolean;
}

const statusIcons = {
  [OrderStatus.RECEIVED]: Clock,
  [OrderStatus.CONFIRMED]: CheckCircle,
  [OrderStatus.PREPARING]: CookingPot,
  [OrderStatus.READY]: CheckCircle,
  [OrderStatus.DELIVERING]: Truck,
  [OrderStatus.DELIVERED]: CheckCircle,
  [OrderStatus.CANCELLED]: X,
};

const statusColors = {
  [OrderStatus.RECEIVED]: "text-blue-600 bg-blue-50",
  [OrderStatus.CONFIRMED]: "text-green-600 bg-green-50",
  [OrderStatus.PREPARING]: "text-orange-600 bg-orange-50",
  [OrderStatus.READY]: "text-purple-600 bg-purple-50",
  [OrderStatus.DELIVERING]: "text-indigo-600 bg-indigo-50",
  [OrderStatus.DELIVERED]: "text-green-600 bg-green-50",
  [OrderStatus.CANCELLED]: "text-red-600 bg-red-50",
};

const statusMessages = {
  [OrderStatus.RECEIVED]: "Novo pedido recebido!",
  [OrderStatus.CONFIRMED]: "Pedido confirmado!",
  [OrderStatus.PREPARING]: "Pedido em preparo!",
  [OrderStatus.READY]: "Pedido pronto!",
  [OrderStatus.DELIVERING]: "Pedido saiu para entrega!",
  [OrderStatus.DELIVERED]: "Pedido entregue!",
  [OrderStatus.CANCELLED]: "Pedido cancelado!",
};

export function RealTimeNotification({
  order,
  onClose,
  onViewDetails,
  autoCloseDelay = 5000,
  enableSound = true,
}: RealTimeNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(enableSound);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Configurar áudio
  useEffect(() => {
    if (typeof window !== "undefined" && soundEnabled) {
      const audioCtx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      setAudioContext(audioCtx);
    }
  }, [soundEnabled]);

  // Mostrar notificação quando houver um pedido
  useEffect(() => {
    if (order) {
      setIsVisible(true);
      playNotificationSound();

      // Auto-close após delay
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Delay para animação
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [order, autoCloseDelay, onClose]);

  // Tocar som de notificação
  const playNotificationSound = () => {
    if (!soundEnabled || !audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Som de notificação (duas notas)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn("Erro ao reproduzir som de notificação:", error);
    }
  };

  // Toggle som
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  if (!order || !isVisible) return null;

  const StatusIcon = statusIcons[order.status] || Clock;
  const statusColor = statusColors[order.status] || "text-gray-600 bg-gray-50";
  const statusMessage = statusMessages[order.status] || "Atualização de pedido";

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden animate-in slide-in-from-right-5 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-50">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-full ${statusColor}`}>
              <StatusIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {statusMessage}
              </h3>
              <p className="text-xs text-gray-500">
                {formatTime(order.createdAt)}
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
                <SpeakerHigh className="h-4 w-4" />
              ) : (
                <SpeakerX className="h-4 w-4" />
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
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">
                  Pedido #{order.orderNumber || order.id.slice(-8)}
                </p>
                <p className="text-sm text-gray-600">
                  {order.customer?.name || "Cliente"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatCurrency(Number(order.total))}
                </p>
                <p className="text-xs text-gray-500">
                  {order.items?.length || 0} item(s)
                </p>
              </div>
            </div>

            {/* Items preview */}
            {order.items && order.items.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Itens:</p>
                <div className="space-y-1">
                  {order.items.slice(0, 2).map((item, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-gray-600 truncate">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-gray-500">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-xs text-gray-400">
                      +{order.items.length - 2} mais...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Observações:</p>
                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  {order.notes.length > 100
                    ? `${order.notes.substring(0, 100)}...`
                    : order.notes}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-2 mt-4">
            <button
              onClick={() => {
                onViewDetails(order);
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Ver Detalhes
            </button>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="px-3 py-2 text-gray-600 text-sm font-medium hover:text-gray-800 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all duration-1000 ease-linear"
            style={{
              width: "100%",
              animation: "shrink 5s linear forwards",
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
