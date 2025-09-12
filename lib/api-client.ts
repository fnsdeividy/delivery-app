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
  CreateUserStoreDto,
  Inventory,
  Order,
  OrderStats,
  PaginatedResponse,
  Product,
  SetCurrentStoreDto,
  StockMovement,
  Store,
  StoreStats,
  UpdateInventoryDto,
  UpdateOrderDto,
  UpdateProductDto,
  UpdateStoreDto,
  UpdateUserDto,
  UpdateUserStoreDto,
  User,
  UserPermissions,
  UserStoreAssociation,
} from "@/types/cardapio-api";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { apiConfig } from "./config";
import { safeLocalStorage } from "./utils/environment";

// Interfaces para tipagem de erros
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

// Configuração do cliente HTTP
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
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  // ===== CONFIGURAÇÃO DE INTERCEPTORS =====

  private setupInterceptors(): void {
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  private setupRequestInterceptor(): void {
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  private setupResponseInterceptor(): void {
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        // Tentar refresh token apenas uma vez em caso de 401 (a lógica de refresh não está implementada)
        if (
          error.response?.status === 401 &&
          error.config &&
          !(error.config as any)._retry
        ) {
          (error.config as any)._retry = true;
          // Sem logs e sem limpar token automaticamente; o componente deve tratar
        }

        this.handleResponseError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleResponseError(error: AxiosError): void {
    // Ignorar erros de cancelamento
    if (error.code === "ERR_CANCELED" || error.message === "canceled") return;

    // Não limpar token automaticamente; deixar o componente decidir
    // Processar erro com ErrorHandler se disponível
    this.processErrorWithHandler(error);
  }

  private processErrorWithHandler(error: AxiosError): void {
    // Ignorar erros de cancelamento
    if (error.code === "ERR_CANCELED" || error.message === "canceled") return;

    if (typeof window !== "undefined") {
      import("./error-handler")
        .then(({ ErrorHandler }) => {
          ErrorHandler.handleApiError(error);
          ErrorHandler.logError(error, "API Client");
        })
        .catch(() => {
          // silencioso
        });
    }
  }

  // ===== GERENCIAMENTO DE TOKENS =====

  /** Armazena o token de autenticação */
  private storeAuthToken(token: string): void {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("cardapio_token", token);
        document.cookie = `cardapio_token=${token}; path=/; max-age=7200; SameSite=Strict`;
      }
    } catch {
      // silencioso
    }
  }

  /** Obtém o token de autenticação */
  private getAuthToken(): string | null {
    try {
      if (typeof window === "undefined") return null;

      const localToken = localStorage.getItem("cardapio_token");
      if (localToken) return localToken;

      const cookies = document.cookie.split(";");
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "cardapio_token" && value) return value;
      }
      return null;
    } catch {
      return null;
    }
  }

  /** Verifica se o usuário está autenticado */
  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp && payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  /** Obtém o token atual */
  getCurrentToken(): string | null {
    return this.getAuthToken();
  }

  /** Faz logout do usuário */
  logout(): void {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("cardapio_token");
        document.cookie =
          "cardapio_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    } catch {
      // silencioso
    }
  }

  // ===== MÉTODOS HTTP PRINCIPAIS =====

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
      if (response.status === 200 || response.status === 201) {
        return response.data;
      }
      throw new Error(`Status inesperado: ${response.status}`);
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
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const response = await this.client.post<T>(url, formData, axiosConfig);
      return response.data;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  // ===== GESTÃO DE LOGO =====

  /** Faz upload de uma logo para uma loja */
  async uploadLogo(
    storeSlug: string,
    file: File
  ): Promise<{
    success: boolean;
    fileName: string;
    fileSize: number;
    mimeType: string;
    url: string;
    path: string;
    message: string;
  }> {
    return this.upload(`/stores/${storeSlug}/upload?type=logo`, file);
  }

  /** Obtém a logo atual de uma loja */
  async getStoreLogo(storeSlug: string): Promise<{
    success: boolean;
    logo: string | null;
    message: string;
  }> {
    return this.get(`/stores/${storeSlug}/logo`);
  }

  /** Remove a logo de uma loja */
  async removeStoreLogo(storeSlug: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.delete(`/stores/${storeSlug}/logo`);
  }

  // ===== AUTENTICAÇÃO =====

  /** Autentica um usuário com email e senha */
  async authenticate(
    email: string,
    password: string,
    storeSlug?: string
  ): Promise<AuthResponse> {
    try {
      const response = await this.post<AuthResponse>("/auth/login", {
        email,
        password,
        storeSlug,
      });

      if (response.access_token) {
        this.storeAuthToken(response.access_token);
      }
      return response;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  /** Registra um novo usuário */
  async register(userData: CreateUserDto): Promise<AuthResponse> {
    try {
      const response = await this.post<AuthResponse>(
        "/auth/register",
        userData
      );
      if (response.access_token) {
        this.storeAuthToken(response.access_token);
      }
      return response;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  /** Autentica um usuário com telefone (sem senha) */
  async authenticateByPhone(
    phone: string,
    name?: string
  ): Promise<AuthResponse> {
    try {
      const response = await this.post<AuthResponse>("/auth/phone-login", {
        phone,
        name,
      });
      if (response.access_token) {
        this.storeAuthToken(response.access_token);
      }
      return response;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  /** Solicita recuperação de senha */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      return await this.post<{ message: string }>(
        "/auth/request-password-reset",
        { email }
      );
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  /** Redefine a senha usando token */
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    try {
      return await this.post<{ message: string }>("/auth/reset-password", {
        token,
        newPassword,
      });
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  /** Altera a senha do usuário logado */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    try {
      return await this.post<{ message: string }>("/auth/change-password", {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  // TODO: Endpoint /users/me/context não está disponível no backend ainda
  async getCurrentUserContext(): Promise<AuthContext> {
    try {
      // const response = await this.get<AuthContext>('/users/me/context')
      // return response

      // Fallback temporário: retornar dados do localStorage
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
          } catch {
            // silencioso
          }
        }
      }

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
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  async setCurrentStore(data: SetCurrentStoreDto): Promise<User> {
    try {
      const response = await this.patch<User>("/users/me/current-store", data);
      safeLocalStorage.setItem("currentStoreSlug", data.storeSlug);
      return response;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  getCurrentStoreSlug(): string | null {
    try {
      const storedStoreSlug = safeLocalStorage.getItem("currentStoreSlug");
      if (storedStoreSlug) return storedStoreSlug;

      const currentToken = this.getAuthToken();
      if (currentToken) {
        const tokenParts = currentToken.split(".");
        if (tokenParts.length === 3) {
          try {
            const payload = JSON.parse(atob(tokenParts[1]));
            return payload.storeSlug || null;
          } catch {
            // silencioso
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  async updateStoreContext(storeSlug: string): Promise<void> {
    try {
      const currentToken = this.getAuthToken();
      if (!currentToken) return;

      const tokenParts = currentToken.split(".");
      if (tokenParts.length !== 3) {
        return;
      }

      try {
        const payload = JSON.parse(atob(tokenParts[1]));
        if (payload.storeSlug === storeSlug) return;

        safeLocalStorage.setItem("currentStoreSlug", storeSlug);
      } catch {
        safeLocalStorage.setItem("currentStoreSlug", storeSlug);
      }
    } catch {
      throw new Error("Falha ao atualizar contexto da loja");
    }
  }

  // ===== USUÁRIOS =====

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

  // ===== USER-STORE ASSOCIATIONS (RBAC) =====

  // TODO: Endpoint /users/{userId}/stores não está disponível no backend ainda
  async getUserStoreAssociations(
    userId: string
  ): Promise<UserStoreAssociation[]> {
    try {
      // const response = await this.get<UserStoreAssociation[]>(`/users/${userId}/stores`)
      // return response
      return [];
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  // TODO: Endpoint /user-stores não está disponível no backend ainda
  async createUserStoreAssociation(
    data: CreateUserStoreDto
  ): Promise<UserStoreAssociation> {
    try {
      // const response = await this.post<UserStoreAssociation>('/user-stores', data)
      // return response
      return {
        id: "temp-" + Date.now(),
        userId: data.userId,
        storeId: data.storeId,
        storeSlug: `store-${data.storeId}`,
        storeName: `Store ${data.storeId}`,
        role: data.role || "USER",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as UserStoreAssociation;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  // TODO: Endpoint /users/{userId}/stores/{storeId} não está disponível no backend ainda
  async updateUserStoreAssociation(
    userId: string,
    storeId: string,
    data: UpdateUserStoreDto
  ): Promise<UserStoreAssociation> {
    try {
      // const response = await this.patch<UserStoreAssociation>(`/users/${userId}/stores/${storeId}`, data)
      // return response
      return {
        id: "temp-" + Date.now(),
        userId,
        storeId,
        storeSlug: `store-${storeId}`,
        storeName: `Store ${storeId}`,
        role: data.role || "USER",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as UserStoreAssociation;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  // TODO: Endpoint /users/{userId}/stores/{storeId} não está disponível no backend ainda
  async deleteUserStoreAssociation(
    userId: string,
    storeId: string
  ): Promise<void> {
    try {
      // await this.delete<void>(`/users/${userId}/stores/${storeId}`)
      // Fallback temporário: no-op
      return;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  // TODO: Endpoint /users/me/permissions não está disponível no backend ainda
  async getUserPermissions(storeSlug?: string): Promise<UserPermissions> {
    try {
      // const url = storeSlug ? `/users/me/permissions?store=${storeSlug}` : '/users/me/permissions'
      // const response = await this.get<UserPermissions>(url)
      // return response
      return {
        scope: "STORE" as any,
        stores: storeSlug
          ? {
              [storeSlug]: {
                role: "OWNER" as any,
                permissions: ["read", "write", "delete"],
              },
            }
          : {},
        globalPermissions: [],
      } as UserPermissions;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  // ===== LOJAS =====

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

  async updateStoreConfig(slug: string, configData: any): Promise<Store> {
    return this.patch<Store>(`/stores/${slug}/config`, configData);
  }

  async deleteStore(slug: string): Promise<void> {
    return this.delete<void>(`/stores/${slug}`);
  }

  async approveStore(id: string): Promise<Store> {
    return this.post<Store>(`/stores/${id}/approve`, { approved: true });
  }

  async rejectStore(id: string, reason?: string): Promise<Store> {
    return this.post<Store>(`/stores/${id}/reject`, {
      approved: false,
      reason: reason || "Rejeitada pelo administrador",
    });
  }

  async getStoreStats(slug: string): Promise<StoreStats> {
    return this.get<StoreStats>(`/stores/${slug}/stats`);
  }

  // ===== CATEGORIAS =====

  async getCategories(storeSlug: string): Promise<Category[]> {
    const response = await this.get<{ data: Category[]; pagination: any }>(
      `/stores/${storeSlug}/categories`
    );
    return response.data;
  }

  // ===== PRODUTOS =====

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
    const { storeSlug, ...productDataWithoutStoreSlug } = productData;
    return this.post<Product>(
      `/products?storeSlug=${storeSlug}`,
      productDataWithoutStoreSlug
    );
  }

  async updateProduct(
    id: string,
    productData: UpdateProductDto & { storeSlug: string }
  ): Promise<Product> {
    const { storeSlug, ...productDataWithoutStoreSlug } = productData;
    return this.patch<Product>(
      `/products/${id}?storeSlug=${storeSlug}`,
      productDataWithoutStoreSlug
    );
  }

  async deleteProduct(id: string, storeSlug: string): Promise<void> {
    return this.delete<void>(`/products/${id}?storeSlug=${storeSlug}`);
  }

  async searchProducts(storeSlug: string, query: string): Promise<Product[]> {
    return this.get<Product[]>(
      `/stores/${storeSlug}/products/search?q=${encodeURIComponent(query)}`
    );
  }

  /** Faz upload de uma imagem para um produto */
  async uploadProductImage(
    product: CreateProductDto | Product,
    file: File
  ): Promise<{
    success: boolean;
    fileName: string;
    fileSize: number;
    mimeType: string;
    url: string;
    path: string;
    message: string;
  }> {
    const { storeSlug } = product;
    if (!storeSlug) {
      throw new Error(
        "storeSlug é obrigatório para upload de imagem do produto"
      );
    }
    return this.upload(`/products/upload?storeSlug=${storeSlug}`, file);
  }

  /** Faz upload de uma imagem para produto usando apenas storeSlug */
  async uploadProductImageByStore(
    storeSlug: string,
    file: File
  ): Promise<{
    success: boolean;
    fileName: string;
    fileSize: number;
    mimeType: string;
    url: string;
    path: string;
    message: string;
  }> {
    return this.upload(`/products/upload?storeSlug=${storeSlug}`, file);
  }

  // ===== ESTOQUE =====

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

  // ===== PEDIDOS =====

  async getOrders(
    storeSlug: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Order>> {
    return this.get<PaginatedResponse<Order>>(
      `/stores/${storeSlug}/orders?page=${page}&limit=${limit}`
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

  async cancelOrder(id: string): Promise<Order> {
    return this.patch<Order>(`/orders/${id}`, { status: "CANCELLED" });
  }

  async getOrderStats(storeSlug: string): Promise<OrderStats> {
    return this.get<OrderStats>(`/stores/${storeSlug}/orders/stats`);
  }

  // ===== PEDIDOS PÚBLICOS (CLIENTES) =====

  async createPublicOrder(
    orderData: CreateOrderDto,
    storeSlug: string
  ): Promise<Order> {
    return this.post<Order>(`/orders?storeSlug=${storeSlug}`, orderData);
  }

  async getPublicOrders(
    storeSlug: string,
    customerId?: string
  ): Promise<Order[]> {
    const url = customerId
      ? `/orders?storeSlug=${storeSlug}&customerId=${customerId}`
      : `/orders?storeSlug=${storeSlug}`;
    return this.get<Order[]>(url);
  }

  async getPublicOrderById(id: string, storeSlug: string): Promise<Order> {
    return this.get<Order>(`/orders/${id}?storeSlug=${storeSlug}`);
  }

  // ===== ANALYTICS =====

  async getAnalytics(
    storeSlug: string,
    period: "daily" | "weekly" | "monthly" = "daily"
  ): Promise<AnalyticsData> {
    return this.get<AnalyticsData>(
      `/analytics/store/${storeSlug}?period=${period}`
    );
  }

  async getStoreMetrics(storeSlug: string): Promise<any> {
    return this.get(`/analytics/store/${storeSlug}/metrics`);
  }

  async getTopProducts(storeSlug: string, limit: number = 5): Promise<any> {
    return this.get(
      `/analytics/store/${storeSlug}/top-products?limit=${limit}`
    );
  }

  async getCustomerMetrics(storeSlug: string): Promise<any> {
    return this.get(`/analytics/store/${storeSlug}/customer-metrics`);
  }

  async getPeakHours(storeSlug: string): Promise<any> {
    return this.get(`/analytics/store/${storeSlug}/peak-hours`);
  }

  // ===== GETTERS PÚBLICOS =====

  get baseURL(): string {
    return this._baseURL;
  }

  get timeout(): number {
    return apiConfig.api.timeout;
  }

  get isDev(): boolean {
    return this._isDev;
  }

  // ===== ERROS =====

  private createApiError(error: unknown): ApiError {
    if (this.isAxiosError(error)) {
      return this.createAxiosError(error);
    }
    if (error instanceof Error) {
      return error as ApiError;
    }
    return new Error("Erro desconhecido ocorreu.") as ApiError;
  }

  private isAxiosError(error: unknown): error is AxiosError {
    return axios.isAxiosError(error);
  }

  private createAxiosError(error: AxiosError): ApiError {
    const apiError = new Error() as ApiError;
    apiError.isAxiosError = true;

    // Cancelamento
    if (error.code === "ERR_CANCELED" || error.message === "canceled") {
      apiError.message = "Requisição cancelada";
      apiError.status = 0;
      return apiError;
    }

    if (error.response) {
      const { status, data } = error.response;
      apiError.status = status;
      apiError.data = data as ApiErrorResponse;

      switch (status) {
        case 400:
          apiError.message =
            (data as ApiErrorResponse)?.message ||
            "Dados inválidos. Verifique as informações enviadas.";
          break;
        case 401:
          apiError.message = "Não autorizado. Faça login novamente.";
          break;
        case 403:
          apiError.message =
            "Acesso negado. Você não tem permissão para esta ação.";
          break;
        case 404:
          apiError.message = "Recurso não encontrado.";
          break;
        case 409:
          apiError.message =
            (data as ApiErrorResponse)?.message ||
            "Conflito detectado. Verifique se os dados já existem.";
          break;
        case 422:
          apiError.message =
            (data as ApiErrorResponse)?.message ||
            "Dados inválidos. Verifique a validação.";
          break;
        case 500:
          apiError.message =
            "Erro interno do servidor. Tente novamente mais tarde.";
          break;
        default:
          apiError.message =
            (data as ApiErrorResponse)?.message ||
            `Erro ${status}: ${
              (data as ApiErrorResponse)?.error || "Erro desconhecido"
            }`;
      }
    } else if (error.code === "ECONNABORTED") {
      apiError.message =
        "Tempo limite da requisição excedido. Verifique sua conexão.";
    } else if (error.code === "ERR_NETWORK") {
      apiError.message =
        "Erro de conexão. Verifique sua internet e tente novamente.";
    } else {
      apiError.message = error.message || "Erro desconhecido ocorreu.";
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
}

// Instância singleton do cliente
export const apiClient = new ApiClient();

// Exportar tipos úteis
export type { AxiosRequestConfig, AxiosResponse };
