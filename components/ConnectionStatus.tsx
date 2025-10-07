"use client";

import { useTokenManager } from "@/hooks";
import { useOrdersWebSocket } from "@/hooks/useOrdersWebSocket";
import { AlertCircle, CheckCircle, Clock, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

interface ConnectionStatusProps {
  storeSlug: string;
  className?: string;
}

export function ConnectionStatus({
  storeSlug,
  className = "",
}: ConnectionStatusProps) {
  const [showStatus, setShowStatus] = useState(false);
  const tokenManager = useTokenManager();

  const { isConnected, connectionError, authError, isConnecting } =
    useOrdersWebSocket({
      storeSlug,
      onAuthError: (error) => {
        console.error("Erro de autenticação WebSocket:", error);
        setShowStatus(true);
      },
      onError: (error) => {
        console.error("Erro WebSocket:", error);
        setShowStatus(true);
      },
    });

  // Mostrar status quando há problemas
  useEffect(() => {
    if (authError || connectionError) {
      setShowStatus(true);
    } else if (isConnected && !isConnecting) {
      // Esconder após 3 segundos se conectado
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [authError, connectionError, isConnected, isConnecting]);

  if (!showStatus && !authError && !connectionError) {
    return null;
  }

  const getStatusInfo = () => {
    if (authError) {
      return {
        icon: <AlertCircle className="w-4 h-4" />,
        text: "Erro de autenticação",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      };
    }

    if (isConnecting) {
      return {
        icon: <Clock className="w-4 h-4 animate-spin" />,
        text: "Conectando...",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
      };
    }

    if (isConnected) {
      return {
        icon: <CheckCircle className="w-4 h-4" />,
        text: "Conectado",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      };
    }

    return {
      icon: <WifiOff className="w-4 h-4" />,
      text: "Desconectado",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
    };
  };

  const status = getStatusInfo();

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div
        className={`
        flex items-center space-x-2 px-3 py-2 rounded-lg border
        ${status.bgColor} ${status.borderColor} ${status.color}
        shadow-lg transition-all duration-300
      `}
      >
        {status.icon}
        <span className="text-sm font-medium">{status.text}</span>

        {authError && (
          <button
            onClick={() => setShowStatus(false)}
            className="ml-2 text-red-400 hover:text-red-600"
          >
            ×
          </button>
        )}
      </div>

      {authError && (
        <div className="mt-2 text-xs text-red-600 max-w-xs">{authError}</div>
      )}
    </div>
  );
}
