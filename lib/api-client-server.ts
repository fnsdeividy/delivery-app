// src/lib/api-client-server.ts
// Versão server-side do ApiClient que funciona em Server Actions

import {
  CreateOrderDto,
  Order,
  PaginatedResponse,
  UpdateOrderDto,
} from "@/types/cardapio-api";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { cookies } from "next/headers";
import { apiConfig } from "./config";

// ==== TYPES DE ERRO ==== //
interface ApiErrorResponse {
  message?: string;
  error?: string;
  status?: number;
}

interface ApiError extends Error {
  status?: number;
  data?: ApiErrorResponse;
  isAxiosError?: boolean;
}

// ==== API CLIENT SERVER ==== //
class ApiClientServer {
  private client: AxiosInstance;
  private _baseURL: string;
  private _isDev: boolean;

  constructor() {
    this._baseURL = apiConfig.api.baseURL;
    this._isDev = apiConfig.env.isDevelopment;

    this.client = axios.create({
      baseURL: this._baseURL,
      timeout: apiConfig.api.timeout,
      headers: { "Content-Type": "application/json" },
    });

    this.setupInterceptors();
  }

  // ==== INTERCEPTORS ==== //
  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        this.handleResponseError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleResponseError(error: AxiosError): void {
    if (error.response?.status === 401) {
      console.error("❌ Erro 401 - Token de autenticação inválido ou expirado");
      console.error("Response data:", error.response?.data);
      console.error("Request headers:", error.config?.headers);
    } else {
      console.error("API Server Error:", error.response?.data || error.message);
    }
  }

  // ==== TOKEN ==== //
  private async getAuthToken(): Promise<string | null> {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("cardapio_token")?.value;

      if (token) {
        // Verificar se o token é válido
        try {
          const parts = token.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const now = Math.floor(Date.now() / 1000);

            // Se o token expirou, retornar null
            if (payload.exp && payload.exp <= now) {
              console.warn("Token expirado detectado no servidor");
              return null;
            }

            return token;
          }
        } catch (error) {
          console.warn("Token inválido detectado no servidor:", error);
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error("Erro ao obter token do servidor:", error);
      return null;
    }
  }

  // ==== MÉTODOS HTTP ==== //
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  async patch<T>(
    url: string,
    data: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  // ==== PEDIDOS ==== //
  async getOrders(
    storeSlug: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Order>> {
    return this.get<PaginatedResponse<Order>>(
      `/orders?storeSlug=${storeSlug}&page=${page}&limit=${limit}`
    );
  }

  async getOrderById(id: string): Promise<Order> {
    return this.get<Order>(`/orders/${id}`);
  }

  async createOrder(orderData: CreateOrderDto): Promise<Order> {
    return this.post<Order>("/orders", orderData);
  }

  async updateOrder(id: string, orderData: UpdateOrderDto): Promise<Order> {
    return this.patch<Order>(`/orders/${id}`, orderData);
  }

  // ==== ERRO HANDLING ==== //
  private createApiError(error: unknown): ApiError {
    if (this.isAxiosError(error)) return this.createAxiosError(error);
    if (error instanceof Error) return error as ApiError;
    return new Error("Erro desconhecido.") as ApiError;
  }

  private isAxiosError(error: unknown): error is AxiosError {
    return axios.isAxiosError(error);
  }

  private createAxiosError(error: AxiosError): ApiError {
    const apiError = new Error() as ApiError;
    apiError.isAxiosError = true;

    if (error.code === "ERR_CANCELED" || error.message === "canceled") {
      apiError.message = "Requisição cancelada";
      apiError.status = 0;
      return apiError;
    }

    if (error.response) {
      const { status, data } = error.response;
      apiError.status = status;
      apiError.data = data as ApiErrorResponse;
      apiError.message =
        (data as ApiErrorResponse)?.message ||
        {
          400: "Dados inválidos.",
          401: "Não autorizado. Token expirado ou inválido.",
          403: "Acesso negado.",
          404: "Recurso não encontrado.",
          409: "Conflito detectado.",
          422: "Dados inválidos.",
          500: "Erro interno do servidor.",
        }[status] ||
        `Erro ${status}: ${
          (data as ApiErrorResponse)?.error || "Erro desconhecido"
        }`;
    } else if (error.code === "ECONNABORTED") {
      apiError.message = "Tempo limite da requisição excedido.";
    } else if (error.code === "ERR_NETWORK") {
      apiError.message = "Erro de conexão.";
    } else {
      apiError.message = error.message || "Erro desconhecido.";
    }

    return apiError;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.get("/health");
      return true;
    } catch {
      return false;
    }
  }

  // ==== GETTERS ==== //
  get baseURL(): string {
    return this._baseURL;
  }
  get timeout(): number {
    return apiConfig.api.timeout;
  }
  get isDev(): boolean {
    return this._isDev;
  }
}

// ==== SINGLETON ==== //
export const apiClientServer = new ApiClientServer();
export type { AxiosRequestConfig };
