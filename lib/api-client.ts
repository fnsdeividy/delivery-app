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
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
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
        return response
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expirado ou inválido
          this.clearAuthToken()
          window.location.href = '/login'
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
      const response = await this.client.post<T>(url, data, config)
      
      // Aceitar tanto 200 quanto 201 como sucesso
      if (response.status === 200 || response.status === 201) {
        return response.data
      }
      
      throw new Error(`Status inesperado: ${response.status}`)
    } catch (error) {
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

  // Método para autenticação e armazenamento do token
  async authenticate(email: string, password: string, storeSlug?: string): Promise<string> {
    try {
      const loginData: any = { email, password }
      if (storeSlug) {
        loginData.storeSlug = storeSlug
      }
      
      const response = await this.post<{ access_token: string; user: any }>('/auth/login', loginData)
      
      const token = response.access_token
      this.setAuthToken(token)
      return token
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

  // Tratamento de erros
  private handleError(error: any): Error {
    if (error.response) {
      // Erro da API com resposta
      const message = error.response.data?.message || error.response.data?.error || 'Erro na requisição'
      const status = error.response.status
      return new Error(`[${status}] ${message}`)
    } else if (error.request) {
      // Erro de rede
      return new Error('Erro de conexão. Verifique sua internet.')
    } else {
      // Erro genérico
      return new Error(error.message || 'Erro desconhecido')
    }
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
