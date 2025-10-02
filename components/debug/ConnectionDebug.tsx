/**
 * Componente de debug para conexões SSE e WebSocket
 * Usado para facilitar troubleshooting em produção
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import { validateUrlConfiguration } from "@/lib/utils/url-validation";
import { useEffect, useState } from "react";

interface ConnectionDebugProps {
  storeSlug?: string;
  token?: string;
}

export function ConnectionDebug({ storeSlug, token }: ConnectionDebugProps) {
  const [urlConfig, setUrlConfig] = useState<any>(null);
  const [sseTestResult, setSseTestResult] = useState<string | null>(null);
  const [wsTestResult, setWsTestResult] = useState<string | null>(null);

  useEffect(() => {
    const config = validateUrlConfiguration();
    setUrlConfig(config);
  }, []);

  const testSSEConnection = async () => {
    if (!storeSlug) {
      setSseTestResult("❌ StoreSlug não fornecido");
      return;
    }

    try {
      const { buildOrdersSSEUrl } = await import("@/lib/utils/url-validation");
      const streamUrl = buildOrdersSSEUrl(apiClient.baseURL, storeSlug);

      setSseTestResult(`🔄 Testando SSE: ${streamUrl}`);

      const eventSource = new EventSource(streamUrl);

      const timeout = setTimeout(() => {
        eventSource.close();
        setSseTestResult("⏰ Timeout na conexão SSE");
      }, 5000);

      eventSource.onopen = () => {
        clearTimeout(timeout);
        setSseTestResult("✅ SSE conectado com sucesso");
        eventSource.close();
      };

      eventSource.onerror = (error) => {
        clearTimeout(timeout);
        setSseTestResult(`❌ Erro SSE: ${error.type}`);
        eventSource.close();
      };
    } catch (error) {
      setSseTestResult(`❌ Erro ao testar SSE: ${error}`);
    }
  };

  const testWebSocketConnection = async () => {
    if (!token) {
      setWsTestResult("❌ Token não fornecido");
      return;
    }

    try {
      const { io } = await import("socket.io-client");
      const { buildOrdersWebSocketUrl } = await import(
        "@/lib/utils/url-validation"
      );
      const wsUrl = buildOrdersWebSocketUrl(apiClient.baseURL);

      setWsTestResult(`🔄 Testando WebSocket: ${wsUrl}`);

      const socket = io(wsUrl, {
        auth: { token },
        timeout: 5000,
      });

      const timeout = setTimeout(() => {
        socket.disconnect();
        setWsTestResult("⏰ Timeout na conexão WebSocket");
      }, 5000);

      socket.on("connect", () => {
        clearTimeout(timeout);
        setWsTestResult("✅ WebSocket conectado com sucesso");
        socket.disconnect();
      });

      socket.on("connect_error", (error) => {
        clearTimeout(timeout);
        setWsTestResult(`❌ Erro WebSocket: ${error.message}`);
        socket.disconnect();
      });
    } catch (error) {
      setWsTestResult(`❌ Erro ao testar WebSocket: ${error}`);
    }
  };

  if (
    process.env.NODE_ENV === "production" &&
    !process.env.NEXT_PUBLIC_DEBUG_CONNECTIONS
  ) {
    return null; // Não mostrar em produção a menos que explicitamente habilitado
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 Debug de Conexões
          <Badge variant="outline">Debug</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuração de URLs */}
        <div>
          <h4 className="font-semibold mb-2">📡 Configuração de URLs</h4>
          <div className="bg-gray-100 p-3 rounded text-sm font-mono">
            <pre>{JSON.stringify(urlConfig, null, 2)}</pre>
          </div>
        </div>

        {/* Teste SSE */}
        <div>
          <h4 className="font-semibold mb-2">🔗 Teste SSE</h4>
          <div className="flex gap-2 mb-2">
            <Button onClick={testSSEConnection} size="sm">
              Testar SSE
            </Button>
          </div>
          {sseTestResult && (
            <div className="bg-gray-100 p-2 rounded text-sm">
              {sseTestResult}
            </div>
          )}
        </div>

        {/* Teste WebSocket */}
        <div>
          <h4 className="font-semibold mb-2">🔌 Teste WebSocket</h4>
          <div className="flex gap-2 mb-2">
            <Button onClick={testWebSocketConnection} size="sm">
              Testar WebSocket
            </Button>
          </div>
          {wsTestResult && (
            <div className="bg-gray-100 p-2 rounded text-sm">
              {wsTestResult}
            </div>
          )}
        </div>

        {/* Informações do ambiente */}
        <div>
          <h4 className="font-semibold mb-2">🌍 Informações do Ambiente</h4>
          <div className="bg-gray-100 p-3 rounded text-sm">
            <div>NODE_ENV: {process.env.NODE_ENV}</div>
            <div>StoreSlug: {storeSlug || "Não fornecido"}</div>
            <div>Token: {token ? "Fornecido" : "Não fornecido"}</div>
            <div>Base URL (apiClient): {apiClient.baseURL}</div>
            <div>Timeout: {apiClient.timeout}ms</div>
            <div>Is Dev: {apiClient.isDev ? "Sim" : "Não"}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
