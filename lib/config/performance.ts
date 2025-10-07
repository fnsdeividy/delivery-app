// Configurações de performance para o aplicativo

export const PERFORMANCE_CONFIG = {
  // Configurações de cache
  CACHE: {
    // Tempos de cache em milissegundos
    STALE_TIME: {
      STATIC: 30 * 60 * 1000, // 30 minutos para dados estáticos
      DYNAMIC: 5 * 60 * 1000, // 5 minutos para dados dinâmicos
      REALTIME: 30 * 1000, // 30 segundos para dados em tempo real
    },
    GC_TIME: {
      STATIC: 60 * 60 * 1000, // 1 hora
      DYNAMIC: 15 * 60 * 1000, // 15 minutos
      REALTIME: 5 * 60 * 1000, // 5 minutos
    },
  },

  // Configurações de debounce
  DEBOUNCE: {
    SEARCH: 300, // 300ms para pesquisas
    INPUT: 500, // 500ms para inputs
    SCROLL: 100, // 100ms para scroll events
  },

  // Configurações de throttle
  THROTTLE: {
    RESIZE: 250, // 250ms para resize events
    SCROLL: 100, // 100ms para scroll events
    API_CALLS: 1000, // 1 segundo entre chamadas de API
  },

  // Configurações de lazy loading
  LAZY_LOADING: {
    INTERSECTION_MARGIN: "50px", // Margem para intersection observer
    THRESHOLD: 0.1, // Threshold para intersection observer
    ROOT_MARGIN: "0px 0px 100px 0px", // Margem do root
  },

  // Configurações de imagens
  IMAGES: {
    QUALITY: {
      HIGH: 90,
      MEDIUM: 75,
      LOW: 60,
    },
    SIZES: {
      THUMBNAIL: 150,
      SMALL: 300,
      MEDIUM: 600,
      LARGE: 1200,
    },
    FORMATS: ["image/webp", "image/avif"],
  },

  // Configurações de bundle
  BUNDLE: {
    MAX_CHUNK_SIZE: 250000, // 250KB por chunk
    VENDOR_CHUNK_SIZE: 100000, // 100KB para vendor
    COMMON_CHUNK_SIZE: 50000, // 50KB para common
  },

  // Configurações de API
  API: {
    TIMEOUT: 10000, // 10 segundos
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 300, // 300ms
    BATCH_SIZE: 10, // Tamanho do batch para múltiplas requisições
  },

  // Configurações de animações
  ANIMATIONS: {
    DURATION: {
      FAST: 150,
      NORMAL: 300,
      SLOW: 500,
    },
    EASING: {
      EASE_IN: "cubic-bezier(0.4, 0, 1, 1)",
      EASE_OUT: "cubic-bezier(0, 0, 0.2, 1)",
      EASE_IN_OUT: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },

  // Configurações de monitoramento
  MONITORING: {
    PERFORMANCE_THRESHOLD: 2000, // 2 segundos para carregamento
    MEMORY_THRESHOLD: 50 * 1024 * 1024, // 50MB
    ERROR_RATE_THRESHOLD: 0.05, // 5% de taxa de erro
  },
};

// Função para obter configuração de cache baseada no tipo de dados
export function getCacheConfig(type: "static" | "dynamic" | "realtime") {
  return {
    staleTime:
      PERFORMANCE_CONFIG.CACHE.STALE_TIME[
        type.toUpperCase() as keyof typeof PERFORMANCE_CONFIG.CACHE.STALE_TIME
      ],
    gcTime:
      PERFORMANCE_CONFIG.CACHE.GC_TIME[
        type.toUpperCase() as keyof typeof PERFORMANCE_CONFIG.CACHE.GC_TIME
      ],
  };
}

// Função para obter configuração de imagem baseada no contexto
export function getImageConfig(
  context: "thumbnail" | "product" | "banner" | "logo"
) {
  const configs = {
    thumbnail: {
      quality: PERFORMANCE_CONFIG.IMAGES.QUALITY.LOW,
      size: PERFORMANCE_CONFIG.IMAGES.SIZES.THUMBNAIL,
    },
    product: {
      quality: PERFORMANCE_CONFIG.IMAGES.QUALITY.MEDIUM,
      size: PERFORMANCE_CONFIG.IMAGES.SIZES.MEDIUM,
    },
    banner: {
      quality: PERFORMANCE_CONFIG.IMAGES.QUALITY.HIGH,
      size: PERFORMANCE_CONFIG.IMAGES.SIZES.LARGE,
    },
    logo: {
      quality: PERFORMANCE_CONFIG.IMAGES.QUALITY.HIGH,
      size: PERFORMANCE_CONFIG.IMAGES.SIZES.SMALL,
    },
  };

  return configs[context];
}

// Função para verificar se deve usar lazy loading
export function shouldUseLazyLoading(
  priority: boolean = false,
  aboveFold: boolean = false
) {
  return !priority && !aboveFold;
}

// Função para calcular tamanho de chunk baseado no tamanho do arquivo
export function calculateChunkSize(
  fileSize: number
): "small" | "medium" | "large" {
  if (fileSize < PERFORMANCE_CONFIG.BUNDLE.VENDOR_CHUNK_SIZE) return "small";
  if (fileSize < PERFORMANCE_CONFIG.BUNDLE.MAX_CHUNK_SIZE) return "medium";
  return "large";
}
