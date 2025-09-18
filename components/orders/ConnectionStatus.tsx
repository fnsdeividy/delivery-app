"use client";

import {
  ArrowsClockwise,
  CheckCircle,
  WarningCircle,
  WifiHigh,
  WifiSlash,
  XCircle,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";

interface ConnectionStatusProps {
  isConnected: boolean;
  connectionError: string | null;
  onReconnect: () => void;
  lastUpdate?: Date;
  reconnectAttempts?: number;
  maxReconnectAttempts?: number;
}

export function ConnectionStatus({
  isConnected,
  connectionError,
  onReconnect,
  lastUpdate,
  reconnectAttempts = 0,
  maxReconnectAttempts = 5,
}: ConnectionStatusProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [pulse, setPulse] = useState(false);

  // Efeito de pulso para indicar atividade
  useEffect(() => {
    if (isConnected) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, lastUpdate]);

  const getStatusInfo = () => {
    if (isConnected) {
      return {
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        text: "Conectado",
        description: "Sincronização ativa",
      };
    }

    if (connectionError) {
      return {
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        text: "Desconectado",
        description: connectionError,
      };
    }

    return {
      icon: WarningCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      text: "Conectando...",
      description: "Estabelecendo conexão",
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  const canReconnect = !isConnected && reconnectAttempts < maxReconnectAttempts;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="relative">
      {/* Status Principal */}
      <div
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
          statusInfo.bgColor
        } ${statusInfo.borderColor} ${pulse ? "animate-pulse" : ""}`}
      >
        <div className={`${statusInfo.color} ${pulse ? "animate-pulse" : ""}`}>
          {isConnected ? (
            <WifiHigh className="h-4 w-4" />
          ) : (
            <WifiSlash className="h-4 w-4" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
            {isConnected && lastUpdate && (
              <span className="text-xs text-gray-500">
                {formatTime(lastUpdate)}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 truncate">
            {statusInfo.description}
          </p>
        </div>

        <div className="flex items-center space-x-1">
          {canReconnect && (
            <button
              onClick={onReconnect}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Reconectar"
            >
              <ArrowsClockwise className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title={showDetails ? "Ocultar detalhes" : "Mostrar detalhes"}
          >
            <StatusIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Detalhes Expandidos */}
      {showDetails && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Status da Conexão</h4>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className={statusInfo.color}>{statusInfo.text}</span>
              </div>

              {lastUpdate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Última atualização:</span>
                  <span className="text-gray-900">
                    {formatTime(lastUpdate)}
                  </span>
                </div>
              )}

              {reconnectAttempts > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Tentativas de reconexão:
                  </span>
                  <span className="text-gray-900">
                    {reconnectAttempts}/{maxReconnectAttempts}
                  </span>
                </div>
              )}

              {connectionError && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Erro:</span>
                  <span className="text-red-600 text-xs">
                    {connectionError}
                  </span>
                </div>
              )}
            </div>

            {canReconnect && (
              <button
                onClick={onReconnect}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowsClockwise className="h-4 w-4" />
                <span>Reconectar</span>
              </button>
            )}

            <div className="text-xs text-gray-500 pt-2 border-t">
              <p>• WebSocket: {isConnected ? "Ativo" : "Inativo"}</p>
              <p>• SSE: Disponível como fallback</p>
              <p>• Atualizações em tempo real</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
