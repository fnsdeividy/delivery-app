import { QueryClient } from '@tanstack/react-query'

// Configuração otimizada do React Query
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Tempo que os dados ficam "frescos" (não precisam ser re-fetched)
        staleTime: 5 * 60 * 1000, // 5 minutos
        
        // Tempo que os dados ficam em cache
        gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
        
        // Número de tentativas em caso de erro
        retry: (failureCount, error: any) => {
          // Não tentar novamente para erros 4xx (cliente), exceto 408 e 429
          if (error?.response?.status >= 400 && error?.response?.status < 500) {
            if (error?.response?.status === 408 || error?.response?.status === 429) {
              return failureCount < 3
            }
            return false
          }
          // Tentar até 3 vezes para outros erros
          return failureCount < 3
        },
        
        // Delay entre tentativas (exponencial)
        retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 5000),
        
        // Re-fetch quando a janela ganha foco (útil para dados que podem ter mudado)
        refetchOnWindowFocus: false,
        
        // Re-fetch quando reconecta à internet
        refetchOnReconnect: true,
        
        // Re-fetch quando o usuário sai e volta da aba
        refetchOnMount: true,
        
        // Suspender queries (útil para SSR)
        // suspense: false, // Removido na versão mais recente do React Query
        
        // Mostrar dados antigos enquanto re-fetch
        // keepPreviousData: true, // Substituído por placeholderData na versão mais recente
        
        // Tempo máximo para uma query
        networkMode: 'online',
      },
      mutations: {
        // Número de tentativas para mutations
        retry: false,
        
        // Tempo máximo para uma mutation
        networkMode: 'online',
        
        // Tratamento de erro para mutations
        onError: (error: any) => {
          console.error('Mutation error:', error)
        },
      },
    },
  })
}

// Configurações específicas para diferentes tipos de dados
export const queryConfigs = {
  // Dados que mudam frequentemente
  realtime: {
    staleTime: 0, // Sempre stale
    gcTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 30 * 1000, // Re-fetch a cada 30 segundos
  },
  
  // Dados que mudam raramente
  static: {
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
  },
  
  // Dados de usuário (mudam pouco)
  user: {
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  },
  
  // Dados de loja (mudam moderadamente)
  store: {
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  },
  
  // Dados de produtos (mudam moderadamente)
  products: {
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  },
  
  // Dados de pedidos (mudam frequentemente)
  orders: {
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 60 * 1000, // Re-fetch a cada 1 minuto
  },
  
  // Estatísticas (mudam moderadamente)
  stats: {
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  },
}

// Função para obter configuração baseada no tipo de dados
export function getQueryConfig(type: keyof typeof queryConfigs) {
  return queryConfigs[type]
}

// Configurações de cache para diferentes entidades
export const cacheConfigs = {
  // Invalidação de cache para usuários
  users: {
    queries: ['users', 'user'],
    mutations: ['createUser', 'updateUser', 'deleteUser'],
  },
  
  // Invalidação de cache para lojas
  stores: {
    queries: ['stores', 'store', 'storeStats'],
    mutations: ['createStore', 'updateStore', 'deleteStore', 'approveStore', 'rejectStore'],
  },
  
  // Invalidação de cache para produtos
  products: {
    queries: ['products', 'product', 'categories'],
    mutations: ['createProduct', 'updateProduct', 'deleteProduct', 'createCategory', 'updateCategory', 'deleteCategory'],
  },
  
  // Invalidação de cache para pedidos
  orders: {
    queries: ['orders', 'order', 'orderStats'],
    mutations: ['createOrder', 'updateOrder', 'cancelOrder'],
  },
}

// Função para invalidar cache relacionado
export function getRelatedQueries(entity: keyof typeof cacheConfigs) {
  return cacheConfigs[entity]?.queries || []
}

// Função para invalidar cache de mutations
export function getRelatedMutations(entity: keyof typeof cacheConfigs) {
  return cacheConfigs[entity]?.mutations || []
} 