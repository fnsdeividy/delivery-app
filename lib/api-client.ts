import {
    AnalyticsData,
    AuthResponse,
    Category,
    CreateCategoryDto,
    CreateOrderDto,
    CreateProductDto,
    CreateStockMovementDto,
    CreateStoreDto,
    CreateUserDto,
    Inventory,
    LoginDto,
    Order,
    OrderStats,
    PaginatedResponse,
    Product,
    StockMovement,
    Store,
    StoreStats,
    UpdateCategoryDto,
    UpdateInventoryDto,
    UpdateOrderDto,
    UpdateProductDto,
    UpdateStoreDto,
    UpdateUserDto,
    User
} from '@/types/cardapio-api'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// Configuração base do cliente HTTP
class ApiClient {
  private client: AxiosInstance
  private baseURL: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_CARDAPIO_API_URL || 'http://localhost:3000/api/v1'
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Interceptor para adicionar token de autenticação
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken()
        console.log('🔑 Interceptor Request: Token encontrado:', !!token)
        console.log('🔑 Interceptor Request: URL:', config.url)
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
          console.log('🔑 Interceptor Request: Token adicionado aos headers')
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Interceptor para tratamento de respostas
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log('✅ Interceptor Response: Resposta recebida:', {
          status: response.status,
          url: response.config.url,
          data: response.data
        })
        return response
      },
      (error) => {
        console.error('❌ Interceptor Response: Erro na resposta:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data
        })
        
        if (error.response?.status === 401) {
          // Token expirado ou inválido
          console.warn('🔒 Token expirado ou inválido, redirecionando para login')
          this.clearAuthToken()
          window.location.href = '/login'
        }
        
        // Processar erro com o ErrorHandler se disponível
        if (typeof window !== 'undefined') {
          import('./error-handler').then(({ ErrorHandler }) => {
            const apiError = ErrorHandler.handleApiError(error)
            ErrorHandler.logError(error, 'API Client')
          }).catch(() => {
            // Fallback se o error-handler não estiver disponível
            console.error('Error handler not available')
          })
        }
        
        return Promise.reject(error)
      }
    )
  }

  // Métodos para gerenciar token de autenticação
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cardapio_token')
    }
    return null
  }

  private setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cardapio_token', token)
      
      // Também armazenar em cookie para o middleware acessar
      document.cookie = `cardapio_token=${token}; path=/; max-age=86400; SameSite=Strict`
    }
  }

  private clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cardapio_token')
      
      // Remover cookie também
      document.cookie = 'cardapio_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
  }

  // Método para fazer requisições GET
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Método para fazer requisições POST
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      console.log('📤 Enviando POST para:', url, 'com dados:', data)
      
      const response = await this.client.post<T>(url, data, config)
      
      console.log('📥 Resposta POST recebida:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        dataType: typeof response.data
      })
      
      // Aceitar tanto 200 quanto 201 como sucesso
      if (response.status === 200 || response.status === 201) {
        console.log('✅ Status de sucesso, retornando dados:', response.data)
        return response.data
      }
      
      console.error('❌ Status inesperado:', response.status)
      throw new Error(`Status inesperado: ${response.status}`)
    } catch (error) {
      console.error('❌ Erro na requisição POST:', error)
      
      // Tratamento específico para erro 409 (Conflict)
      if (error.response?.status === 409) {
        const errorMessage = error.response.data?.message || 'Conflito detectado. Verifique se os dados já existem.'
        console.error('🚫 Erro de conflito (409):', errorMessage)
        throw new Error(`Conflito: ${errorMessage}`)
      }
      
      // Tratamento específico para erro 400 (Bad Request)
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || 'Dados inválidos. Verifique as informações enviadas.'
        console.error('⚠️ Erro de validação (400):', errorMessage)
        throw new Error(`Validação: ${errorMessage}`)
      }
      
      throw this.handleError(error)
    }
  }

  // Método para fazer requisições PUT
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Método para fazer requisições PATCH
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.patch<T>(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Método para fazer requisições DELETE
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Método para fazer upload de arquivos
  async upload<T>(url: string, file: File, config?: AxiosRequestConfig): Promise<T> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await this.client.post<T>(url, formData, {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // ===== AUTENTICAÇÃO =====
  
  // Método para autenticação e armazenamento do token
  async authenticate(email: string, password: string, storeSlug?: string): Promise<AuthResponse> {
    try {
      console.log('🔐 Iniciando autenticação no apiClient')
      
      const loginData: LoginDto = { email, password }
      if (storeSlug) {
        loginData.storeSlug = storeSlug
      }
      
      console.log('📋 Dados de login:', loginData)
      
      const response = await this.post<AuthResponse>('/auth/login', loginData)
      
      console.log('🔑 Resposta de autenticação recebida:', response)
      console.log('🔍 Tipo da resposta:', typeof response)
      console.log('🔍 Estrutura da resposta:', Object.keys(response || {}))
      
      const token = response.access_token
      console.log('🎫 Token extraído:', token)
      console.log('🔍 Tipo do token:', typeof token)
      
      this.setAuthToken(token)
      console.log('💾 Token armazenado no localStorage')
      
      return response
    } catch (error) {
      console.error('❌ Erro na autenticação:', error)
      throw this.handleError(error)
    }
  }

  // Método para registro
  async register(userData: CreateUserDto): Promise<AuthResponse> {
    try {
      const response = await this.post<AuthResponse>('/auth/register', userData)
      
      const token = response.access_token
      this.setAuthToken(token)
      return response
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Método para logout
  logout(): void {
    this.clearAuthToken()
  }

  // Método para verificar se está autenticado
  isAuthenticated(): boolean {
    return !!this.getAuthToken()
  }

  // Método para obter token atual
  getCurrentToken(): string | null {
    return this.getAuthToken()
  }

  // Método para obter o storeSlug atual do contexto
  getCurrentStoreSlug(): string | null {
    try {
      // 1. Tentar obter do localStorage primeiro
      const storedStoreSlug = localStorage.getItem('currentStoreSlug')
      if (storedStoreSlug) {
        return storedStoreSlug
      }
      
      // 2. Tentar obter do token JWT
      const currentToken = this.getAuthToken()
      if (currentToken) {
        const tokenParts = currentToken.split('.')
        if (tokenParts.length === 3) {
          try {
            const payload = JSON.parse(atob(tokenParts[1]))
            return payload.storeSlug || null
          } catch (decodeError) {
            console.warn('⚠️ Erro ao decodificar token para obter storeSlug:', decodeError)
          }
        }
      }
      
      return null
    } catch (error) {
      console.error('❌ Erro ao obter storeSlug atual:', error)
      return null
    }
  }

  // Método para atualizar contexto da loja no token
  async updateStoreContext(storeSlug: string): Promise<void> {
    try {
      console.log('🔄 Atualizando contexto da loja:', storeSlug)
      
      // Verificar se há um token atual
      const currentToken = this.getAuthToken()
      if (!currentToken) {
        console.warn('⚠️ Nenhum token encontrado para atualizar contexto')
        return
      }

      // Decodificar o token atual para obter informações do usuário
      const tokenParts = currentToken.split('.')
      if (tokenParts.length !== 3) {
        console.warn('⚠️ Token JWT inválido, não é possível atualizar contexto')
        return
      }

      try {
        const payload = JSON.parse(atob(tokenParts[1]))
        console.log('🔍 Payload do token atual:', { 
          email: payload.email, 
          role: payload.role, 
          currentStoreSlug: payload.storeSlug 
        })

        // Se o storeSlug já estiver correto, não fazer nada
        if (payload.storeSlug === storeSlug) {
          console.log('✅ StoreSlug já está correto no token')
          return
        }

        // Armazenar o novo storeSlug no localStorage para uso futuro
        localStorage.setItem('currentStoreSlug', storeSlug)
        console.log('💾 StoreSlug atualizado no localStorage:', storeSlug)

        // Invalidar queries relacionadas para forçar refresh
        // Nota: Isso será feito pelo hook que chama este método
        
      } catch (decodeError) {
        console.warn('⚠️ Erro ao decodificar token, continuando...', decodeError)
        // Fallback: armazenar no localStorage
        localStorage.setItem('currentStoreSlug', storeSlug)
        console.log('💾 StoreSlug armazenado no localStorage (fallback):', storeSlug)
      }
      
    } catch (error) {
      console.error('❌ Erro ao atualizar contexto da loja:', error)
      throw new Error('Falha ao atualizar contexto da loja')
    }
  }

  // ===== USUÁRIOS =====
  
  async getUsers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    return this.get<PaginatedResponse<User>>(`/users?page=${page}&limit=${limit}`)
  }

  async getUserById(id: string): Promise<User> {
    return this.get<User>(`/users/${id}`)
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    return this.post<User>('/users', userData)
  }

  async updateUser(id: string, userData: UpdateUserDto): Promise<User> {
    return this.patch<User>(`/users/${id}`, userData)
  }

  async deleteUser(id: string): Promise<void> {
    return this.delete<void>(`/users/${id}`)
  }

  // ===== LOJAS =====
  
  async getStores(page = 1, limit = 10): Promise<PaginatedResponse<Store>> {
    console.log('🔍 API Client: Buscando lojas...', { page, limit })
    try {
      const response = await this.get<PaginatedResponse<Store>>(`/stores?page=${page}&limit=${limit}`)
      console.log('✅ API Client: Lojas recebidas:', response)
      return response
    } catch (error) {
      console.error('❌ API Client: Erro ao buscar lojas:', error)
      throw error
    }
  }

  async getStoreBySlug(slug: string): Promise<Store> {
    return this.get<Store>(`/stores/${slug}`)
  }

  async createStore(storeData: CreateStoreDto): Promise<Store> {
    return this.post<Store>('/stores', storeData)
  }

  async updateStore(slug: string, storeData: UpdateStoreDto): Promise<Store> {
    return this.patch<Store>(`/stores/${slug}`, storeData)
  }

  async deleteStore(slug: string): Promise<void> {
    return this.delete<void>(`/stores/${slug}`)
  }

  async approveStore(id: string): Promise<Store> {
    return this.patch<Store>(`/v1/stores/${id}/approve`, { approved: true })
  }

  async rejectStore(id: string, reason?: string): Promise<Store> {
    return this.patch<Store>(`/v1/stores/${id}/reject`, { 
      approved: false, 
      reason: reason || 'Rejeitada pelo administrador' 
    })
  }

  async getStoreStats(slug: string): Promise<StoreStats> {
    return this.get<StoreStats>(`/stores/${slug}/stats`)
  }

  // ===== CATEGORIAS =====
  
  async getCategories(storeSlug: string): Promise<Category[]> {
    return this.get<Category[]>(`/stores/${storeSlug}/categories`)
  }

  async createCategory(categoryData: CreateCategoryDto): Promise<Category> {
    return this.post<Category>('/categories', categoryData)
  }

  async updateCategory(id: string, categoryData: UpdateCategoryDto): Promise<Category> {
    return this.patch<Category>(`/categories/${id}`, categoryData)
  }

  async deleteCategory(id: string): Promise<void> {
    return this.delete<void>(`/categories/${id}`)
  }

  // ===== PRODUTOS =====
  
  async getProducts(storeSlug: string, page = 1, limit = 10): Promise<PaginatedResponse<Product>> {
    return this.get<PaginatedResponse<Product>>(`/stores/${storeSlug}/products?page=${page}&limit=${limit}`)
  }

  async getProductById(id: string): Promise<Product> {
    return this.get<Product>(`/products/${id}`)
  }

  async createProduct(productData: CreateProductDto): Promise<Product> {
    return this.post<Product>('/products', productData)
  }

  async updateProduct(id: string, productData: UpdateProductDto): Promise<Product> {
    return this.patch<Product>(`/products/${id}`, productData)
  }

  async deleteProduct(id: string): Promise<void> {
    return this.delete<void>(`/products/${id}`)
  }

  async searchProducts(storeSlug: string, query: string): Promise<Product[]> {
    return this.get<Product[]>(`/stores/${storeSlug}/products/search?q=${encodeURIComponent(query)}`)
  }

  // ===== ESTOQUE =====
  
  async getInventory(storeSlug: string): Promise<Inventory[]> {
    return this.get<Inventory[]>(`/stores/${storeSlug}/inventory`)
  }

  async updateInventory(id: string, inventoryData: UpdateInventoryDto): Promise<Inventory> {
    return this.patch<Inventory>(`/inventory/${id}`, inventoryData)
  }

  async createStockMovement(movementData: CreateStockMovementDto): Promise<StockMovement> {
    return this.post<StockMovement>('/stock-movements', movementData)
  }

  async getStockMovements(productId: string): Promise<StockMovement[]> {
    return this.get<StockMovement[]>(`/products/${productId}/stock-movements`)
  }

  // ===== PEDIDOS =====
  
  async getOrders(storeSlug: string, page = 1, limit = 10): Promise<PaginatedResponse<Order>> {
    return this.get<PaginatedResponse<Order>>(`/stores/${storeSlug}/orders?page=${page}&limit=${limit}`)
  }

  async getOrderById(id: string): Promise<Order> {
    return this.get<Order>(`/orders/${id}`)
  }

  async createOrder(orderData: CreateOrderDto): Promise<Order> {
    return this.post<Order>('/orders', orderData)
  }

  async updateOrder(id: string, orderData: UpdateOrderDto): Promise<Order> {
    return this.patch<Order>(`/orders/${id}`, orderData)
  }

  async cancelOrder(id: string): Promise<Order> {
    return this.patch<Order>(`/orders/${id}`, { status: 'CANCELLED' })
  }

  async getOrderStats(storeSlug: string): Promise<OrderStats> {
    return this.get<OrderStats>(`/stores/${storeSlug}/orders/stats`)
  }

  // ===== ANALYTICS =====
  
  async getAnalytics(storeSlug: string, period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<AnalyticsData> {
    return this.get<AnalyticsData>(`/stores/${storeSlug}/analytics?period=${period}`)
  }

  // ===== UTILITÁRIOS =====

  // Método para tratar erros de forma padronizada
  private handleError(error: any): Error {
    console.error('🔍 Analisando erro:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code
    })

    // Se já é um Error personalizado, retornar como está
    if (error instanceof Error && !error.message.includes('Request failed')) {
      return error
    }

    // Tratamento específico para erros HTTP
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          return new Error(data?.message || 'Dados inválidos. Verifique as informações enviadas.')
        case 401:
          return new Error('Não autorizado. Faça login novamente.')
        case 403:
          return new Error('Acesso negado. Você não tem permissão para esta ação.')
        case 404:
          return new Error('Recurso não encontrado.')
        case 409:
          return new Error(data?.message || 'Conflito detectado. Verifique se os dados já existem.')
        case 422:
          return new Error(data?.message || 'Dados inválidos. Verifique a validação.')
        case 500:
          return new Error('Erro interno do servidor. Tente novamente mais tarde.')
        default:
          return new Error(data?.message || `Erro ${status}: ${data?.error || 'Erro desconhecido'}`)
      }
    }

    // Tratamento para erros de rede
    if (error.code === 'ECONNABORTED') {
      return new Error('Tempo limite da requisição excedido. Verifique sua conexão.')
    }

    if (error.code === 'ERR_NETWORK') {
      return new Error('Erro de conexão. Verifique sua internet e tente novamente.')
    }

    // Erro genérico
    return new Error(error.message || 'Erro desconhecido ocorreu.')
  }

  // Método para verificar saúde da API
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health')
      return true
    } catch {
      return false
    }
  }
}

// Instância singleton do cliente
export const apiClient = new ApiClient()

// Exportar tipos úteis
export type { AxiosRequestConfig, AxiosResponse }
