import { useEffect, useState } from "react";
import { apiClient } from "./api-client";

export interface BackendStatus {
  isConnected: boolean;
  baseUrl: string;
  responseTime: number;
  lastCheck: Date;
  error?: string;
}

class BackendConnectionChecker {
  private static instance: BackendConnectionChecker;
  private status: BackendStatus = {
    isConnected: false,
    baseUrl: "",
    responseTime: 0,
    lastCheck: new Date(),
  };

  private constructor() {
    this.status.baseUrl =
      process.env.NEXT_PUBLIC_CARDAPIO_API_URL ||
      "http://localhost:3001/api/v1";
  }

  static getInstance(): BackendConnectionChecker {
    if (!BackendConnectionChecker.instance) {
      BackendConnectionChecker.instance = new BackendConnectionChecker();
    }
    return BackendConnectionChecker.instance;
  }

  async checkConnection(): Promise<BackendStatus> {
    const startTime = Date.now();

    try {
      const isHealthy = await apiClient.healthCheck();
      const responseTime = Date.now() - startTime;

      this.status = {
        isConnected: isHealthy,
        baseUrl: this.status.baseUrl,
        responseTime,
        lastCheck: new Date(),
      };

      if (!isHealthy) {
        this.status.error = "Backend não respondeu ao health check";
      }

      return this.status;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      this.status = {
        isConnected: false,
        baseUrl: this.status.baseUrl,
        responseTime,
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };

      return this.status;
    }
  }

  getStatus(): BackendStatus {
    return { ...this.status };
  }

  async waitForConnection(maxAttempts = 10, delayMs = 1000): Promise<boolean> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const status = await this.checkConnection();
      if (status.isConnected) {
        return true;
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    console.error("❌ Falha ao conectar ao backend após todas as tentativas");
    return false;
  }

  // Método para verificar se o backend está acessível
  async isBackendAccessible(): Promise<boolean> {
    try {
      const response = await fetch(`${this.status.baseUrl}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Timeout de 5 segundos
        signal: AbortSignal.timeout(5000),
      });

      return response.ok;
    } catch (error) {
      console.error("❌ Erro ao verificar acessibilidade do backend:", error);
      return false;
    }
  }

  // Método para obter informações detalhadas do backend
  async getBackendInfo(): Promise<{
    version?: string;
    environment?: string;
    timestamp?: string;
    endpoints?: string[];
  }> {
    try {
      const response = await fetch(`${this.status.baseUrl}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          version: data.version,
          environment: data.environment,
          timestamp: data.timestamp,
          endpoints: data.endpoints,
        };
      }

      return {};
    } catch (error) {
      console.error("❌ Erro ao obter informações do backend:", error);
      return {};
    }
  }
}

// Instância singleton
export const backendChecker = BackendConnectionChecker.getInstance();

// Hook para usar no React (se necessário)
export function useBackendConnection() {
  const [status, setStatus] = useState<BackendStatus>({
    isConnected: false,
    baseUrl: "",
    responseTime: 0,
    lastCheck: new Date(),
  });

  useEffect(() => {
    const checkConnection = async () => {
      const connectionStatus = await backendChecker.checkConnection();
      setStatus(connectionStatus);
    };

    checkConnection();

    // Verificar a cada 30 segundos
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  return status;
}
