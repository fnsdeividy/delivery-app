// Configurações centralizadas da aplicação
export const config = {
  // Configurações da API
  api: {
    baseURL: process.env.NEXT_PUBLIC_CARDAPIO_API_URL || 'http://localhost:3001/api/v1',
    timeout: 10000,
    endpoints: {
      auth: {
        login: '/auth/login',
        register: '/auth/register',
      },
      users: '/users',
      stores: '/stores',
      products: '/products',
      orders: '/orders',
      health: '/health',
      status: '/status',
      analytics: '/audit/analytics',
    }
  },

  // Configurações da aplicação
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Cardapio.IO Delivery',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },

  // Configurações de ambiente
  env: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  },

  // Configurações de cache
  cache: {
    ttl: parseInt(process.env.NEXT_PUBLIC_CACHE_TTL || '300000'),
    staleTime: parseInt(process.env.NEXT_PUBLIC_QUERY_STALE_TIME || '60000'),
  }
}

// Validação das configurações
export function validateConfig() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_CARDAPIO_API_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET'
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.warn('⚠️ Variáveis de ambiente ausentes:', missingVars)
  }

  return {
    isValid: missingVars.length === 0,
    missingVars
  }
}

// Configurações específicas para desenvolvimento
export const devConfig = {
  ...config,
  api: {
    ...config.api,
    debug: true,
    logRequests: true,
    logResponses: true,
  }
}

// Configurações específicas para produção
export const prodConfig = {
  ...config,
  api: {
    ...config.api,
    debug: false,
    logRequests: false,
    logResponses: false,
  }
}

// Exportar configuração baseada no ambiente
export const appConfig = process.env.NODE_ENV === 'production' ? prodConfig : devConfig 