/**
 * Configuração centralizada para rotas de API v1
 * Centraliza a configuração da API externa
 */

export const API_CONFIG = {
  // URL base da API externa
  BASE_URL: 'http://localhost:3001/api/v1',
  
  // Timeout para requisições (em ms)
  TIMEOUT: 10000,
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Endpoints disponíveis
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
    },
    HEALTH: '/health',
    STORES: '/stores',
    USERS: '/users',
  }
} as const

/**
 * Função helper para fazer requisições para a API externa
 */
export async function fetchExternalAPI(
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`
  
  const defaultOptions: RequestInit = {
    ...options,
    headers: {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...options.headers,
    },
  }

  return fetch(url, defaultOptions)
}

/**
 * Função helper para tratar respostas da API externa
 */
export async function handleExternalAPIResponse<T>(
  response: Response
): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `HTTP ${response.status}`)
  }
  
  return response.json()
} 