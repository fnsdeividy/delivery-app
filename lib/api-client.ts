import {
  AnalyticsData,
  AuthContext,
  AuthResponse,
  Category,
  CreateCategoryDto,
  CreateOrderDto,
  CreateProductDto,
  CreateStockMovementDto,
  CreateStoreDto,
  CreateUserDto,
  CreateUserStoreDto,
  Inventory,
  LoginDto,
  Order,
  OrderStats,
  PaginatedResponse,
  Product,
  SetCurrentStoreDto,
  StockMovement,
  Store,
  StoreStats,
  UpdateCategoryDto,
  UpdateInventoryDto,
  UpdateOrderDto,
  UpdateProductDto,
  UpdateStoreDto,
  UpdateUserDto,
  UpdateUserStoreDto,
  User,
  UserPermissions,
  UserStoreAssociation
} from '@/types/cardapio-api'
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { appConfig } from './config'

// Interfaces para tipagem de erros
interface ApiErrorResponse {
  message?: string
  error?: string
  status?: number
}

interface ApiError extends Error {
  status?: number
  data?: ApiErrorResponse
  isAxiosError?: boolean
}

// Configuração do cliente HTTP
class ApiClient {
  private client: AxiosInstance
  private baseURL: string
  private isDev: boolean

  constructor() {
    this.baseURL = appConfig.api.baseURL
    this.isDev = appConfig.env.isDevelopment

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: appConfig.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  // ===== CONFIGURAÇÃO DE INTERCEPTORS =====

  private setupInterceptors(): void {
    this.setupRequestInterceptor()
    this.setupResponseInterceptor()
  }

  private setupRequestInterceptor(): void {
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken()
        
        if (appConfig.api.logRequests) {
          this.log('🔑 Request Interceptor', { 
            hasToken: !!token, 
            url: config.url 
          })
        }

        if (token) {
          config.headers.Authorization = `Bearer ${token}`
                  if (appConfig.api.logRequests) {
          this.log('🔑 Token adicionado aos headers')
        }
        }
        
        return config
      },
      (error) => Promise.reject(error)
    )
  }

  private setupResponseInterceptor(): void {
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
              if (appConfig.api.logResponses) {
        this.log('✅ Response Interceptor', {
          status: response.status,
          url: response.config.url,
          dataType: typeof response.data
        })
      }
        return response
      },
      (error: AxiosError) => {
        this.handleResponseError(error)
        return Promise.reject(error)
      }
    )
  }

  private handleResponseError(error: AxiosError): void {
    this.log('❌ Response Error', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message
    })

    if (error.response?.status === 401) {
      this.log('🔒 Token expirado, redirecionando para login')
      this.clearAuthToken()
      this.redirectToLogin()
    }

    // Processar erro com ErrorHandler se disponível
    this.processErrorWithHandler(error)
  }

  private processErrorWithHandler(error: AxiosError): void {
    if (typeof window !== 'undefined') {
      import('./error-handler').then(({ ErrorHandler }) => {
        const apiError = ErrorHandler.handleApiError(error)
        ErrorHandler.logError(error, 'API Client')
      }).catch(() => {
        if (appConfig.api.debug) {
          this.log('Error handler não disponível')
        }
      })
    }
  }

  // ===== GERENCIAMENTO DE TOKENS =====

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cardapio_token')
    }
    return null
  }

  private setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cardapio_token', token)
      document.cookie = `cardapio_token=${token}; path=/; max-age=86400; SameSite=Strict`
    }
  }

  private clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cardapio_token')
      document.cookie = 'cardapio_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
  }

  private redirectToLogin(): void {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  // ===== MÉTODOS HTTP PRINCIPAIS =====

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config)
      return response.data
    } catch (error) {
      throw this.createApiError(error)
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      if (appConfig.api.logRequests) {
        this.log('📤 Enviando POST', { url, dataType: typeof data })
      }

      const response = await this.client.post<T>(url, data, config)

      if (appConfig.api.logResponses) {
        this.log('📥 Resposta POST', {
          status: response.status,
          dataType: typeof response.data
        })
      }

      if (response.status === 200 || response.status === 201) {
        return response.data
      }

      throw new Error(`Status inesperado: ${response.status}`)
    } catch (error) {
      if (appConfig.api.debug) {
        this.log('❌ Erro na requisição POST', { error })
      }
      throw this.createApiError(error)
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config)
      return response.data
    } catch (error) {
      throw this.createApiError(error)
    }
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.patch<T>(url, data, config)
      return response.data
    } catch (error) {
      throw this.createApiError(error)
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config)
      return response.data
    } catch (error) {
      throw this.createApiError(error)
    }
  }

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
      throw this.createApiError(error)
    }
  }

  // ===== AUTENTICAÇÃO =====

  async authenticate(email: string, password: string, storeSlug?: string): Promise<AuthResponse> {
    try {
      if (appConfig.api.logRequests) {
        this.log('🔐 Iniciando autenticação')
      }

      const loginData: LoginDto = { email, password }
      // storeSlug agora é completamente opcional - o backend irá identificar automaticamente

      const response = await this.post<AuthResponse>('/auth/login', loginData)
      const token = response.access_token

      this.setAuthToken(token)
      if (appConfig.api.logResponses) {
        this.log('💾 Token armazenado')
      }

      return response
    } catch (error) {
      if (appConfig.api.debug) {
        this.log('❌ Erro na autenticação', { error })
      }
      throw this.createApiError(error)
    }
  }

  async register(userData: CreateUserDto): Promise<AuthResponse> {
    try {
      const response = await this.post<AuthResponse>('/auth/register', userData)
      const token = response.access_token
      this.setAuthToken(token)
      return response
    } catch (error) {
      throw this.createApiError(error)
    }
  }

  logout(): void {
    this.clearAuthToken()
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken()
  }

  getCurrentToken(): string | null {
    return this.getAuthToken()
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.get<User>('/users/me')
      return response
    } catch (error) {
      if (appConfig.api.debug) {
        this.log('❌ Erro ao obter usuário atual', { error })
      }
      throw this.createApiError(error)
    }
  }

  async getCurrentUserContext(): Promise<AuthContext> {
    try {
      const response = await this.get<AuthContext>('/users/me/context')
      return response
    } catch (error) {
      if (appConfig.api.debug) {
        this.log('❌ Erro ao obter contexto do usuário', { error })
      }
      throw this.createApiError(error)
    }
  }

  async setCurrentStore(data: SetCurrentStoreDto): Promise<User> {
    try {
      const response = await this.patch<User>('/users/me/current-store', data)
      // Atualizar localStorage com a nova loja atual
      localStorage.setItem('currentStoreSlug', data.storeSlug)
      return response
    } catch (error) {
      if (appConfig.api.debug) {
        this.log('❌ Erro ao definir loja atual', { error })
      }
      throw this.createApiError(error)
    }
  }

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
            if (appConfig.api.debug) {
            this.log('⚠️ Erro ao decodificar token', { decodeError })
          }
          }
        }
      }

      return null
    } catch (error) {
      if (appConfig.api.debug) {
        this.log('❌ Erro ao obter storeSlug atual', { error })
      }
      return null
    }
  }

  async updateStoreContext(storeSlug: string): Promise<void> {
    try {
      if (appConfig.api.logRequests) {
        this.log('🔄 Atualizando contexto da loja', { storeSlug })
      }

      const currentToken = this.getAuthToken()
      if (!currentToken) {
        if (appConfig.api.debug) {
          this.log('⚠️ Nenhum token encontrado para atualizar contexto')
        }
        return
      }

      const tokenParts = currentToken.split('.')
      if (tokenParts.length !== 3) {
        if (appConfig.api.debug) {
          this.log('⚠️ Token JWT inválido')
        }
        return
      }

      try {
        const payload = JSON.parse(atob(tokenParts[1]))
        
        if (payload.storeSlug === storeSlug) {
          if (appConfig.api.logResponses) {
            this.log('✅ StoreSlug já está correto no token')
          }
          return
        }

        localStorage.setItem('currentStoreSlug', storeSlug)
        if (appConfig.api.logResponses) {
          this.log('💾 StoreSlug atualizado no localStorage', { storeSlug })
        }

      } catch (decodeError) {
                  if (appConfig.api.debug) {
            this.log('⚠️ Erro ao decodificar token, continuando...', { decodeError })
          }
          localStorage.setItem('currentStoreSlug', storeSlug)
          if (appConfig.api.logResponses) {
            this.log('💾 StoreSlug armazenado no localStorage (fallback)', { storeSlug })
          }
      }

    } catch (error) {
      if (appConfig.api.debug) {
        this.log('❌ Erro ao atualizar contexto da loja', { error })
      }
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

  // ===== USER-STORE ASSOCIATIONS (RBAC) =====

  async getUserStoreAssociations(userId: string): Promise<UserStoreAssociation[]> {
    try {
      const response = await this.get<UserStoreAssociation[]>(`/users/${userId}/stores`)
      return response
    } catch (error) {
      if (appConfig.api.debug) {
        this.log('❌ Erro ao obter associações usuário-loja', { error })
      }
      throw this.createApiError(error)
    }
  }

  async createUserStoreAssociation(data: CreateUserStoreDto): Promise<UserStoreAssociation> {
    try {
      const response = await this.post<UserStoreAssociation>('/user-stores', data)
      return response
    } catch (error) {
      if (appConfig.api.debug) {
        this.log('❌ Erro ao criar associação usuário-loja', { error })
      }
      throw this.createApiError(error)
    }
  }

  async updateUserStoreAssociation(
    userId: string, 
    storeId: string, 
    data: UpdateUserStoreDto
  ): Promise<UserStoreAssociation> {
    try {
      const response = await this.patch<UserStoreAssociation>(
        `/users/${userId}/stores/${storeId}`, 
        data
      )
      return response
    } catch (error) {
      if (appConfig.api.debug) {
        this.log('❌ Erro ao atualizar associação usuário-loja', { error })
      }
      throw this.createApiError(error)
    }
  }

  async deleteUserStoreAssociation(userId: string, storeId: string): Promise<void> {
    try {
      await this.delete<void>(`/users/${userId}/stores/${storeId}`)
    } catch (error) {
      if (appConfig.api.debug) {
        this.log('❌ Erro ao remover associação usuário-loja', { error })
      }
      throw this.createApiError(error)
    }
  }

  async getUserPermissions(storeSlug?: string): Promise<UserPermissions> {
    try {
      const url = storeSlug ? `/users/me/permissions?store=${storeSlug}` : '/users/me/permissions'
      const response = await this.get<UserPermissions>(url)
      return response
    } catch (error) {
      if (appConfig.api.debug) {
        this.log('❌ Erro ao obter permissões do usuário', { error })
      }
      throw this.createApiError(error)
    }
  }

  // ===== LOJAS =====

  async getStores(page = 1, limit = 10): Promise<PaginatedResponse<Store>> {
    try {
      return await this.get<PaginatedResponse<Store>>(`/stores?page=${page}&limit=${limit}`)
    } catch (error) {
      if (appConfig.api.debug) {
        this.log('❌ Erro ao buscar lojas', { error })
      }
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
    return this.post<Store>(`/stores/${id}/approve`, { approved: true })
  }

  async rejectStore(id: string, reason?: string): Promise<Store> {
    return this.post<Store>(`/stores/${id}/reject`, {
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

  private log(message: string, data?: any): void {
    if (appConfig.api.debug) {
      console.log(message, data)
    }
  }

  private createApiError(error: unknown): ApiError {
    if (this.isAxiosError(error)) {
      return this.createAxiosError(error)
    }

    if (error instanceof Error) {
      return error as ApiError
    }

    return new Error('Erro desconhecido ocorreu.') as ApiError
  }

  private isAxiosError(error: unknown): error is AxiosError {
    return axios.isAxiosError(error)
  }

  private createAxiosError(error: AxiosError): ApiError {
    const apiError = new Error() as ApiError
    apiError.isAxiosError = true

    if (error.response) {
      const { status, data } = error.response
      apiError.status = status
      apiError.data = data as ApiErrorResponse

      switch (status) {
        case 400:
          apiError.message = (data as ApiErrorResponse)?.message || 'Dados inválidos. Verifique as informações enviadas.'
          break
        case 401:
          apiError.message = 'Não autorizado. Faça login novamente.'
          break
        case 403:
          apiError.message = 'Acesso negado. Você não tem permissão para esta ação.'
          break
        case 404:
          apiError.message = 'Recurso não encontrado.'
          break
        case 409:
          apiError.message = (data as ApiErrorResponse)?.message || 'Conflito detectado. Verifique se os dados já existem.'
          break
        case 422:
          apiError.message = (data as ApiErrorResponse)?.message || 'Dados inválidos. Verifique a validação.'
          break
        case 500:
          apiError.message = 'Erro interno do servidor. Tente novamente mais tarde.'
          break
        default:
          apiError.message = (data as ApiErrorResponse)?.message || `Erro ${status}: ${(data as ApiErrorResponse)?.error || 'Erro desconhecido'}`
      }
    } else if (error.code === 'ECONNABORTED') {
      apiError.message = 'Tempo limite da requisição excedido. Verifique sua conexão.'
    } else if (error.code === 'ERR_NETWORK') {
      apiError.message = 'Erro de conexão. Verifique sua internet e tente novamente.'
    } else {
      apiError.message = error.message || 'Erro desconhecido ocorreu.'
    }

    return apiError
  }

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
