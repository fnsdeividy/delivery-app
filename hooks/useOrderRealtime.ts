"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface UseOrderRealtimeOptions {
  storeSlug: string;
  enabled?: boolean;
}

export function useOrderRealtime({
  storeSlug,
  enabled = true,
}: UseOrderRealtimeOptions) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Por enquanto, vamos simular conexão "em tempo real"
  // já que o backend não tem implementação de WebSocket
  useEffect(() => {
    if (!enabled || !storeSlug) {
      setIsConnected(false);
      return;
    }

    // Simular conexão ativa (o polling real é feito pelo useOrdersByStore)
    setIsConnected(true);
    setError(null);

    return () => {
      setIsConnected(false);
    };
  }, [enabled, storeSlug]);

  // Função para simular envio de mensagem (não implementada sem WebSocket)
  const sendMessage = (message: any) => {
    console.warn("WebSocket não disponível. Mensagem não enviada:", message);
  };

  return {
    isConnected,
    error,
    sendMessage,
  };
}
