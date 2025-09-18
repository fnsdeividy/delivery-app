// src/lib/api-client.ts

import {
  AnalyticsData,
  AuthContext,
  AuthResponse,
  Category,
  CreateOrderDto,
  CreateProductDto,
  CreateStockMovementDto,
  CreateStoreDto,
  CreateUserDto,
  Inventory,
  Order,
  PaginatedResponse,
  Product,
  SetCurrentStoreDto,
  StockMovement,
  Store,
  UpdateInventoryDto,
  UpdateOrderDto,
  UpdateProductDto,
  UpdateStoreDto,
  UpdateUserDto,
  User,
} from "@/types/cardapio-api";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { apiConfig } from "./config";
import { safeLocalStorage } from "./utils/environment";

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

// ==== API CLIENT ==== //
class ApiClient {
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
      (config) => {
        const token = this.getAuthToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // refresh 401 only once (to implementar depois)
        if (
          error.response?.status === 401 &&
          error.config &&
          !(error.config as any)._retry
        ) {
          (error.config as any)._retry = true;
          // refresh token logic aqui se necessário
        }
        this.handleResponseError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleResponseError(error: AxiosError): void {
    // Se for erro 401, limpar token e redirecionar para login
    if (error.response?.status === 401 && typeof window !== "undefined") {
      console.error("❌ Erro 401 detectado - Token inválido ou expirado");
      console.error("Response data:", error.response?.data);
      console.error("Request URL:", error.config?.url);

      this.logout();

      // Mostrar notificação de erro antes de redirecionar
      if (typeof window !== "undefined") {
        // Verificar se já estamos na página de login para evitar loop
        if (!window.location.pathname.includes("/login")) {
          // Redirecionar para login após um pequeno delay
          setTimeout(() => {
            window.location.href = "/login?error=session_expired";
          }, 1500);
        }
      }
    }

    if (typeof window !== "undefined") {
      import("./error-handler")
        .then(({ ErrorHandler }) => {
          ErrorHandler.handleApiError(error);
          ErrorHandler.logError(error, "API Client");
        })
        .catch(() => {});
    }
  }

  // ==== TOKEN ==== //
  private storeAuthToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("cardapio_token", token);
      document.cookie = `cardapio_token=${token}; path=/; max-age=7200; SameSite=Strict`;
    }
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    const localToken = localStorage.getItem("cardapio_token");
    if (localToken) return localToken;

    // Busca no cookie
    const cookies = document.cookie.split(";").map((c) => c.trim());
    for (const cookie of cookies) {
      const [name, value] = cookie.split("=");
      if (name === "cardapio_token" && value) return value;
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    if (!token) return false;
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    try {
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp || payload.exp <= Date.now() / 1000) return false;
      return true;
    } catch {
      return false;
    }
  }

  getCurrentToken(): string | null {
    return this.getAuthToken();
  }

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cardapio_token");
      document.cookie =
        "cardapio_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
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

  async upload<T>(
    url: string,
    file: File,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const axiosConfig = {
        ...config,
        headers: { "Content-Type": "multipart/form-data" },
      };
      const response = await this.client.post<T>(url, formData, axiosConfig);
      return response.data;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  // ==== AUTENTICAÇÃO ==== //
  async authenticate(
    email: string,
    password: string,
    storeSlug?: string
  ): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>("/auth/login", {
      email,
      password,
      storeSlug,
    });
    if (response.access_token) this.storeAuthToken(response.access_token);
    return response;
  }

  async register(userData: CreateUserDto): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>("/auth/register", userData);
    if (response.access_token) this.storeAuthToken(response.access_token);
    return response;
  }

  async authenticateByPhone(
    phone: string,
    name?: string
  ): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>("/auth/phone-login", {
      phone,
      name,
    });
    if (response.access_token) this.storeAuthToken(response.access_token);
    return response;
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return this.post<{ message: string }>("/auth/request-password-reset", {
      email,
    });
  }

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return this.post<{ message: string }>("/auth/reset-password", {
      token,
      newPassword,
    });
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return this.post<{ message: string }>("/auth/change-password", {
      currentPassword,
      newPassword,
    });
  }

  async getCurrentUserContext(): Promise<AuthContext> {
    // backend ainda não implementado
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          return {
            user: userData,
            stores: userData.stores || [],
            currentStore: userData.currentStore || null,
            permissions: {
              scope: "STORE" as any,
              stores: {},
              globalPermissions: [],
            },
          };
        } catch {}
      }
    }
    // fallback
    return {
      user: {
        id: "unknown",
        email: "",
        name: "",
        role: "USER" as any,
        active: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stores: [],
      },
      stores: [],
      currentStore: undefined,
      permissions: {
        scope: "STORE" as any,
        stores: {},
        globalPermissions: [],
      },
    };
  }

  // ==== GETTERS DE CONTEXTO ==== //
  getCurrentStoreSlug(): string | null {
    const storedStoreSlug = safeLocalStorage.getItem("currentStoreSlug");
    if (storedStoreSlug) return storedStoreSlug;

    const token = this.getAuthToken();
    if (token) {
      const parts = token.split(".");
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(atob(parts[1]));
          return payload.storeSlug || null;
        } catch {}
      }
    }
    return null;
  }

  async setCurrentStore(data: SetCurrentStoreDto): Promise<User> {
    const response = await this.patch<User>("/users/me/current-store", data);
    safeLocalStorage.setItem("currentStoreSlug", data.storeSlug);
    return response;
  }

  async updateStoreContext(storeSlug: string): Promise<void> {
    safeLocalStorage.setItem("currentStoreSlug", storeSlug);
  }

  // ==== USUÁRIOS ==== //
  async getUsers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    return this.get<PaginatedResponse<User>>(
      `/users?page=${page}&limit=${limit}`
    );
  }
  async getUserById(id: string): Promise<User> {
    return this.get<User>(`/users/${id}`);
  }
  async createUser(userData: CreateUserDto): Promise<User> {
    return this.post<User>("/users", userData);
  }
  async updateUser(id: string, userData: UpdateUserDto): Promise<User> {
    return this.patch<User>(`/users/${id}`, userData);
  }
  async deleteUser(id: string): Promise<void> {
    return this.delete<void>(`/users/${id}`);
  }

  // ==== LOJAS ==== //
  async getStores(page = 1, limit = 10): Promise<PaginatedResponse<Store>> {
    return this.get<PaginatedResponse<Store>>(
      `/stores?page=${page}&limit=${limit}`
    );
  }
  async getStoreBySlug(slug: string): Promise<Store> {
    return this.get<Store>(`/stores/slug/${slug}`);
  }
  async getPublicStore(slug: string): Promise<any> {
    return this.get<any>(`/stores/public/${slug}`);
  }
  async createStore(storeData: CreateStoreDto): Promise<Store> {
    return this.post<Store>("/stores", storeData);
  }
  async updateStore(slug: string, storeData: UpdateStoreDto): Promise<Store> {
    return this.patch<Store>(`/stores/${slug}`, storeData);
  }
  async deleteStore(slug: string): Promise<void> {
    return this.delete<void>(`/stores/${slug}`);
  }

  // ==== CATEGORIAS ==== //
  async getCategories(storeSlug: string): Promise<Category[]> {
    const response = await this.get<{ data: Category[] }>(
      `/stores/${storeSlug}/categories`
    );
    return response.data;
  }

  // ==== PRODUTOS ==== //
  async getProducts(
    storeSlug: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Product>> {
    return this.get<PaginatedResponse<Product>>(
      `/stores/${storeSlug}/products?page=${page}&limit=${limit}`
    );
  }
  async getProductById(id: string, storeSlug: string): Promise<Product> {
    return this.get<Product>(`/products/${id}?storeSlug=${storeSlug}`);
  }
  async createProduct(productData: CreateProductDto): Promise<Product> {
    const { storeSlug, ...rest } = productData;
    return this.post<Product>(`/products?storeSlug=${storeSlug}`, rest);
  }
  async updateProduct(
    id: string,
    productData: UpdateProductDto & { storeSlug: string }
  ): Promise<Product> {
    const { storeSlug, ...rest } = productData;
    return this.patch<Product>(`/products/${id}?storeSlug=${storeSlug}`, rest);
  }
  async deleteProduct(id: string, storeSlug: string): Promise<void> {
    return this.delete<void>(`/products/${id}?storeSlug=${storeSlug}`);
  }
  async searchProducts(storeSlug: string, query: string): Promise<Product[]> {
    return this.get<Product[]>(
      `/stores/${storeSlug}/products/search?q=${encodeURIComponent(query)}`
    );
  }
  async uploadProductImageByStore(storeSlug: string, file: File) {
    return this.upload(`/products/upload?storeSlug=${storeSlug}`, file);
  }

  async uploadLogo(storeSlug: string, file: File) {
    return this.upload(`/stores/${storeSlug}/upload`, file);
  }

  async removeStoreLogo(storeSlug: string) {
    return this.delete(`/stores/${storeSlug}/logo`);
  }

  async getStoreLogo(
    storeSlug: string
  ): Promise<{ success: boolean; logo?: string }> {
    return this.get(`/stores/${storeSlug}/logo`);
  }

  async getNcmCestSuggestions(params: {
    categoryName?: string;
    productType?: "FOOD" | "BEVERAGE";
  }): Promise<{ suggestions: Array<{ ncm: string; cest: string }> }> {
    const q = new URLSearchParams();
    if (params.categoryName) q.set("categoryName", params.categoryName);
    if (params.productType) q.set("productType", params.productType);
    return this.get<{ suggestions: Array<{ ncm: string; cest: string }> }>(
      `/products/ncm-cest/suggestions?${q.toString()}`
    );
  }

  // ==== ESTOQUE ==== //
  async getInventory(storeSlug: string): Promise<Inventory[]> {
    return this.get<Inventory[]>(`/stores/${storeSlug}/inventory`);
  }
  async updateInventory(
    id: string,
    inventoryData: UpdateInventoryDto
  ): Promise<Inventory> {
    return this.patch<Inventory>(`/inventory/${id}`, inventoryData);
  }
  async createStockMovement(
    movementData: CreateStockMovementDto
  ): Promise<StockMovement> {
    return this.post<StockMovement>("/stock-movements", movementData);
  }
  async getStockMovements(productId: string): Promise<StockMovement[]> {
    return this.get<StockMovement[]>(`/products/${productId}/stock-movements`);
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

  // ==== PEDIDOS PÚBLICOS ==== //
  async getPublicOrders(storeSlug: string): Promise<Order[]> {
    const response = await this.get<PaginatedResponse<Order>>(
      `/orders/public?storeSlug=${storeSlug}`
    );
    return response.data || [];
  }
  async createPublicOrder(
    orderData: CreateOrderDto,
    storeSlug: string
  ): Promise<Order> {
    return this.post<Order>(`/orders/public?storeSlug=${storeSlug}`, orderData);
  }

  // ==== ANALYTICS ==== //
  async getAnalytics(
    storeSlug: string,
    period: "daily" | "weekly" | "monthly" = "daily"
  ): Promise<AnalyticsData> {
    return this.get<AnalyticsData>(
      `/analytics/store/${storeSlug}?period=${period}`
    );
  }

  async logProductFormMetric(payload: {
    storeSlug: string;
    userEmail?: string;
    durationMs: number;
    completed: boolean;
  }): Promise<{ success: boolean; id?: string }> {
    return this.post<{ success: boolean; id?: string }>(
      `/analytics/product-form`,
      payload
    );
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
          401: "Não autorizado.",
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
export const apiClient = new ApiClient();
export type { AxiosRequestConfig, AxiosResponse };
