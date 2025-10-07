"use client";

import { useOrdersWebSocket } from "@/hooks/useOrdersWebSocket";
import { useTokenManager } from "@/hooks/useTokenManager";
import { AlertCircle, CheckCircle, Clock, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";

interface WebSocketDebugProps {
  storeSlug: string;
  className?: string;
}

export function WebSocketDebug({
  storeSlug,
  className = "",
}: WebSocketDebugProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const tokenManager = useTokenManager();

  const {
    isConnected,
    connectionError,
    authError,
    reconnectAttempts,
    isConnecting,
  } = useOrdersWebSocket({
    storeSlug,
    onError: (error) => {
      console.error("WebSocket Debug - Erro:", error);
    },
    onAuthError: (error) => {
      console.error("WebSocket Debug - Erro de Auth:", error);
    },
  });

  const getStatusIcon = () => {
    if (authError) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (isConnecting) return <Clock className="w-4 h-4 text-yellow-500" />;
    if (isConnected) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <WifiOff className="w-4 h-4 text-gray-500" />;
  };

  const getStatusText = () => {
    if (authError) return "Erro de Autenticação";
    if (isConnecting) return "Conectando...";
    if (isConnected) return "Conectado";
    if (connectionError) return "Desconectado";
    return "Desconectado";
  };

  const getStatusColor = () => {
    if (authError) return "text-red-600";
    if (isConnecting) return "text-yellow-600";
    if (isConnected) return "text-green-600";
    return "text-gray-600";
  };

  return (
    <div className={`bg-white border rounded-lg p-3 ${className}`}>
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            WebSocket: {getStatusText()}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          {reconnectAttempts > 0 && (
            <span>Tentativas: {reconnectAttempts}</span>
          )}
          <Wifi className="w-3 h-3" />
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <span className={`ml-1 ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Loja:</span>
              <span className="ml-1 text-gray-600">{storeSlug}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Token:</span>
              <span
                className={`ml-1 ${
                  tokenManager.isValid ? "text-green-600" : "text-red-600"
                }`}
              >
                {tokenManager.isValid ? "Válido" : "Inválido"}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Expira em:</span>
              <span className="ml-1 text-gray-600">
                {tokenManager.timeUntilExpiry
                  ? `${Math.floor(tokenManager.timeUntilExpiry / 60)}min`
                  : "N/A"}
              </span>
            </div>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-200 rounded p-2">
              <div className="font-medium text-red-800">
                Erro de Autenticação:
              </div>
              <div className="text-red-700">{authError}</div>
            </div>
          )}

          {connectionError && !authError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
              <div className="font-medium text-yellow-800">
                Erro de Conexão:
              </div>
              <div className="text-yellow-700">{connectionError}</div>
            </div>
          )}

          <div className="text-gray-500 text-xs">
            Última validação:{" "}
            {tokenManager.lastValidation?.toLocaleTimeString() || "N/A"}
          </div>
        </div>
      )}
    </div>
  );
}
