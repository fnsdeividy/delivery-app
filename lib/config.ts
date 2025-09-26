// Configurações centralizadas da aplicação
export const config = {
  // Configurações da API
  api: {
    baseURL: (() => {
      const urlFromEnv =
        process.env.NEXT_PUBLIC_CARDAPIO_API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:3001";

      // Garante sufixo /api/v1 apenas uma vez
      const trimmed = urlFromEnv.replace(/\/$/, "");
      return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
    })(),
    timeout: 1000,
    debug: process.env.NODE_ENV === "development",
    logRequests: process.env.NODE_ENV === "development",
    logResponses: process.env.NODE_ENV === "development",
    endpoints: {
      auth: {
        login: "/auth/login",
        register: "/auth/register",
      },
      users: "/users",
      stores: "/stores",
      products: "/products",
      orders: "/orders",
      health: "/health",
      status: "/status",
      analytics: "/analytics",
    },
  },

  // Configurações do WebSocket
  ws: {
    baseURL: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001",
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
  },

  // Configurações da aplicação
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || "Cardapio.IO Delivery",
    version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
  },

  // Configurações de ambiente
  env: {
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
    isTest: process.env.NODE_ENV === "test",
  },

  // Configurações de cache
  cache: {
    ttl: parseInt(process.env.NEXT_PUBLIC_CACHE_TTL || "300000"),
    staleTime: parseInt(process.env.NEXT_PUBLIC_QUERY_STALE_TIME || "60000"),
  },
};

// Validação das configurações
export function validateConfig() {
  const requiredEnvVars = [
    "NEXT_PUBLIC_CARDAPIO_API_URL",
    "NEXTAUTH_URL",
    "NEXTAUTH_SECRET",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn("⚠️ Variáveis de ambiente ausentes:", missingVars);
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
}

// Configurações específicas para desenvolvimento
export const devConfig = {
  ...config,
  api: {
    ...config.api,
    debug: true,
    logRequests: false, // Reduzido para evitar spam
    logResponses: false, // Reduzido para evitar spam
  },
};

// Configurações específicas para produção
export const prodConfig = {
  ...config,
  api: {
    ...config.api,
    debug: false,
    logRequests: false,
    logResponses: false,
  },
};

// Exportar configuração baseada no ambiente (mantido para compatibilidade)
export const appConfig =
  process.env.NODE_ENV === "production" ? prodConfig : devConfig;

// Configuração específica para evitar logs excessivos em desenvolvimento
export const apiConfig = {
  ...config,
  api: {
    ...config.api,
    debug: process.env.NODE_ENV === "development",
    logRequests: false, // Sempre false para evitar spam
    logResponses: false, // Sempre false para evitar spam
  },
};
