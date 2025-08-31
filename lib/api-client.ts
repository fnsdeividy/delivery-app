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
  private lastLoggedToken: string | null = null;

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

        // Log apenas quando necessário (primeira vez ou mudanças)
        if (apiConfig.api.debug && !this.lastLoggedToken) {
          this.lastLoggedToken = token;
        }

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          // Log apenas quando o token muda
          if (apiConfig.api.debug && this.lastLoggedToken !== token) {
            this.log("🔑 Token atualizado nos headers", {
              tokenLength: token.length,
            });
            this.lastLoggedToken = token;
          }
        } else if (apiConfig.api.debug && this.lastLoggedToken !== null) {
          // Log apenas quando o token é removido
          this.log("⚠️ Token removido dos headers");
          this.lastLoggedToken = null;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  private setupResponseInterceptor(): void {
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        if (apiConfig.api.logResponses) {
          this.log("✅ Response Interceptor", {
            status: response.status,
            url: response.config.url,
            dataType: typeof response.data,
          });
        }
        return response;
      },
      async (error: AxiosError) => {
        // Tentar refresh token apenas uma vez em caso de 401
        if (
          error.response?.status === 401 &&
          error.config &&
          !(error.config as any)._retry
        ) {
          (error.config as any)._retry = true;

          try {
            this.log("🔄 Tentando refresh token...");
            // Por enquanto, não implementamos refresh token, mas não limpamos o token automaticamente
            // O componente React deve tratar o erro 401 adequadamente
            this.log("⚠️ Refresh token não implementado, mantendo token atual");
          } catch (refreshError) {
            this.log("❌ Falha no refresh token, limpando token");
            this.logout();
          }
        }

        // Não processar outros erros automaticamente - deixar o componente React decidir
        this.handleResponseError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleResponseError(error: AxiosError): void {
    // Não logar erros de cancelamento
    if (error.code === "ERR_CANCELED" || error.message === "canceled") {
      return;
    }

    this.log("❌ Response Error", {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
    });

    // Não limpar token automaticamente em nenhum erro - deixar o componente React decidir
    if (error.response?.status === 401) {
      this.log("🔒 Token expirado ou inválido - componente React deve tratar");
      // Não chamar clearAuthToken() aqui
    } else if (error.response?.status === 403) {
      this.log("🚫 Acesso negado - componente React deve tratar");
      // Não chamar clearAuthToken() aqui
    } else if (error.response?.status === 500) {
      this.log("💥 Erro interno do servidor - componente React deve tratar");
      // Não chamar clearAuthToken() aqui
    }

    // Processar erro com ErrorHandler se disponível
    this.processErrorWithHandler(error);
  }

  private processErrorWithHandler(error: AxiosError): void {
    // Não processar erros de cancelamento
    if (error.code === "ERR_CANCELED" || error.message === "canceled") {
      return;
    }

    if (typeof window !== "undefined") {
      import("./error-handler")
        .then(({ ErrorHandler }) => {
          const apiError = ErrorHandler.handleApiError(error);
          ErrorHandler.logError(error, "API Client");
        })
        .catch(() => {
          if (apiConfig.api.debug) {
            this.log("Error handler não disponível");
          }
        });
    }
  }

  // ===== GERENCIAMENTO DE TOKENS =====

  /**
   * Armazena o token de autenticação
   */
  private storeAuthToken(token: string): void {
    try {
      // Armazenar no localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("cardapio_token", token);
        // Cookie com expiração de 2 horas (7200 segundos)
        document.cookie = `cardapio_token=${token}; path=/; max-age=7200; SameSite=Strict`;
      }
    } catch (error) {
      console.error("❌ Erro ao armazenar token:", error);
    }
  }

  /**
   * Obtém o token de autenticação
   */
  private getAuthToken(): string | null {
    try {
      // Tentar obter do localStorage primeiro
      if (typeof window !== "undefined") {
        const localToken = localStorage.getItem("cardapio_token");
        if (localToken) return localToken;
      }

      // Fallback para cookie
      const cookies = document.cookie.split(";");
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "cardapio_token" && value) {
          return value;
        }
      }

      return null;
    } catch (error) {
      console.error("❌ Erro ao obter token:", error);
      return null;
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    if (!token) return false;

    try {
      // Verificar se o token não expirou
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp && payload.exp > Date.now() / 1000;
    } catch (error) {
      console.error("❌ Erro ao verificar token:", error);
      return false;
    }
  }

  /**
   * Obtém o token atual
   */
  getCurrentToken(): string | null {
    return this.getAuthToken();
  }

  /**
   * Faz logout do usuário
   */
  logout(): void {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("cardapio_token");
        // Remover cookie
        document.cookie =
          "cardapio_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    } catch (error) {
      console.error("❌ Erro ao fazer logout:", error);
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
      console.log("🌐 POST Request iniciado:", {
        url: this._baseURL + url,
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        hasToken: !!this.getAuthToken()
      });

      const response = await this.client.post<T>(url, data, config);

      console.log("✅ POST Response recebido:", {
        status: response.status,
        statusText: response.statusText,
        hasData: !!response.data
      });

      if (response.status === 200 || response.status === 201) {
        return response.data;
      }

      throw new Error(`Status inesperado: ${response.status}`);
    } catch (error) {
      console.error("❌ POST Request falhou:", {
        url: this._baseURL + url,
        error: error,
        status: (error as any)?.response?.status,
        message: (error as any)?.message
      });
      
      if (apiConfig.api.debug) {
        this.log("❌ Erro na requisição POST", { error });
      }
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

  // ===== AUTENTICAÇÃO =====

  /**
   * Autentica um usuário com email e senha
   */
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

      // Armazenar token automaticamente
      if (response.access_token) {
        this.storeAuthToken(response.access_token);
      }

      return response;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  /**
   * Registra um novo usuário
   */
  async register(userData: CreateUserDto): Promise<AuthResponse> {
    try {
      const response = await this.post<AuthResponse>(
        "/auth/register",
        userData
      );

      // Armazenar token automaticamente
      if (response.access_token) {
        this.storeAuthToken(response.access_token);
      }

      return response;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  // TODO: Endpoint /users/me/context não está disponível no backend ainda
  // Comentado temporariamente até a implementação
  async getCurrentUserContext(): Promise<AuthContext> {
    try {
      // const response = await this.get<AuthContext>('/users/me/context')
      // return response

      // Fallback temporário: retornar dados do localStorage
      // TODO: Implementar quando o endpoint estiver disponível
      if (typeof window !== "undefined") {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            // Usando dados do localStorage como fallback
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
          } catch (e) {
            // Erro ao parsear dados do localStorage
          }
        }
      }

      // Se não conseguir obter dados do localStorage, retornar objeto vazio em vez de lançar erro
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
      if (apiConfig.api.debug) {
        this.log("❌ Erro ao obter contexto do usuário", { error });
      }
      throw this.createApiError(error);
    }
  }

  async setCurrentStore(data: SetCurrentStoreDto): Promise<User> {
    try {
      const response = await this.patch<User>("/users/me/current-store", data);

      // Atualizar localStorage com a nova loja atual (SSR-safe)
      safeLocalStorage.setItem("currentStoreSlug", data.storeSlug);

      if (apiConfig.api.debug) {
        this.log("✅ Loja atual definida com sucesso", {
          storeSlug: data.storeSlug,
        });
      }

      return response;
    } catch (error) {
      if (apiConfig.api.debug) {
        this.log("❌ Erro ao definir loja atual", { error });
      }
      throw this.createApiError(error);
    }
  }

  getCurrentStoreSlug(): string | null {
    try {
      // 1. Tentar obter do localStorage primeiro (SSR-safe)
      const storedStoreSlug = safeLocalStorage.getItem("currentStoreSlug");
      if (storedStoreSlug) {
        return storedStoreSlug;
      }

      // 2. Tentar obter do token JWT
      const currentToken = this.getAuthToken();
      if (currentToken) {
        const tokenParts = currentToken.split(".");
        if (tokenParts.length === 3) {
          try {
            const payload = JSON.parse(atob(tokenParts[1]));
            return payload.storeSlug || null;
          } catch (decodeError) {
            if (apiConfig.api.debug) {
              this.log("⚠️ Erro ao decodificar token", { decodeError });
            }
          }
        }
      }

      return null;
    } catch (error) {
      if (apiConfig.api.debug) {
        this.log("❌ Erro ao obter storeSlug atual", { error });
      }
      return null;
    }
  }

  async updateStoreContext(storeSlug: string): Promise<void> {
    try {
      if (apiConfig.api.logRequests) {
        this.log("🔄 Atualizando contexto da loja", { storeSlug });
      }

      const currentToken = this.getAuthToken();
      if (!currentToken) {
        return;
      }

      const tokenParts = currentToken.split(".");
      if (tokenParts.length !== 3) {
        if (apiConfig.api.debug) {
          this.log("⚠️ Token JWT inválido");
        }
        return;
      }

      try {
        const payload = JSON.parse(atob(tokenParts[1]));

        if (payload.storeSlug === storeSlug) {
          if (apiConfig.api.debug) {
            this.log("✅ StoreSlug já está correto no token");
          }
          return;
        }

        safeLocalStorage.setItem("currentStoreSlug", storeSlug);
        if (apiConfig.api.debug) {
          this.log("💾 StoreSlug atualizado no localStorage", { storeSlug });
        }
      } catch (decodeError) {
        if (apiConfig.api.debug) {
          this.log("⚠️ Erro ao decodificar token, continuando...", {
            decodeError,
          });
        }
        safeLocalStorage.setItem("currentStoreSlug", storeSlug);
        if (apiConfig.api.debug) {
          this.log("💾 StoreSlug armazenado no localStorage (fallback)", {
            storeSlug,
          });
        }
      }
    } catch (error) {
      if (apiConfig.api.debug) {
        this.log("❌ Erro ao atualizar contexto da loja", { error });
      }
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
  // Comentado temporariamente até a implementação
  async getUserStoreAssociations(
    userId: string
  ): Promise<UserStoreAssociation[]> {
    try {
      // const response = await this.get<UserStoreAssociation[]>(`/users/${userId}/stores`)
      // return response

      // Fallback temporário: retornar array vazio
      // TODO: Implementar quando o endpoint estiver disponível
      return [];
    } catch (error) {
      if (apiConfig.api.debug) {
        this.log("❌ Erro ao obter associações usuário-loja", { error });
      }
      throw this.createApiError(error);
    }
  }

  // TODO: Endpoint /user-stores não está disponível no backend ainda
  // Comentado temporariamente até a implementação
  async createUserStoreAssociation(
    data: CreateUserStoreDto
  ): Promise<UserStoreAssociation> {
    try {
      // const response = await this.post<UserStoreAssociation>('/user-stores', data)
      // return response

      // Fallback temporário: retornar dados mockados
      // TODO: Implementar quando o endpoint estiver disponível
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
      if (apiConfig.api.debug) {
        this.log("❌ Erro ao criar associação usuário-loja", { error });
      }
      throw this.createApiError(error);
    }
  }

  // TODO: Endpoint /users/{userId}/stores/{storeId} não está disponível no backend ainda
  // Comentado temporariamente até a implementação
  async updateUserStoreAssociation(
    userId: string,
    storeId: string,
    data: UpdateUserStoreDto
  ): Promise<UserStoreAssociation> {
    try {
      // const response = await this.patch<UserStoreAssociation>(
      //   `/users/${userId}/stores/${storeId}`,
      //   data
      // )
      // return response

      // Fallback temporário: retornar dados mockados
      // TODO: Implementar quando o endpoint estiver disponível
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
      if (apiConfig.api.debug) {
        this.log("❌ Erro ao atualizar associação usuário-loja", { error });
      }
      throw this.createApiError(error);
    }
  }

  // TODO: Endpoint /users/{userId}/stores/{storeId} não está disponível no backend ainda
  // Comentado temporariamente até a implementação
  async deleteUserStoreAssociation(
    userId: string,
    storeId: string
  ): Promise<void> {
    try {
      // await this.delete<void>(`/users/${userId}/stores/${storeId}`)

      // Fallback temporário: não fazer nada
      // TODO: Implementar quando o endpoint estiver disponível
      console.warn(
        "Endpoint /users/{userId}/stores/{storeId} não implementado no backend ainda"
      );
    } catch (error) {
      if (apiConfig.api.debug) {
        this.log("❌ Erro ao remover associação usuário-loja", { error });
      }
      throw this.createApiError(error);
    }
  }

  // TODO: Endpoint /users/me/permissions não está disponível no backend ainda
  // Comentado temporariamente até a implementação
  async getUserPermissions(storeSlug?: string): Promise<UserPermissions> {
    try {
      // const url = storeSlug ? `/users/me/permissions?store=${storeSlug}` : '/users/me/permissions'
      // const response = await this.get<UserPermissions>(url)
      // return response

      // Fallback temporário: retornar permissões básicas
      // TODO: Implementar quando o endpoint estiver disponível
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
      if (apiConfig.api.debug) {
        this.log("❌ Erro ao obter permissões do usuário", { error });
      }
      throw this.createApiError(error);
    }
  }

  // ===== LOJAS =====

  async getStores(page = 1, limit = 10): Promise<PaginatedResponse<Store>> {
    try {
      return await this.get<PaginatedResponse<Store>>(
        `/stores?page=${page}&limit=${limit}`
      );
    } catch (error) {
      throw error;
    }
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
    return this.get<Category[]>(`/stores/${storeSlug}/categories`);
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
    
    console.log("🔧 ApiClient.createProduct chamado");
    console.log("📋 Dados recebidos:", productData);
    console.log("🏪 StoreSlug extraído:", storeSlug);
    console.log("📤 Dados sem storeSlug:", productDataWithoutStoreSlug);
    console.log("🌐 URL completa:", `/products?storeSlug=${storeSlug}`);
    
    const token = this.getAuthToken();
    console.log("🔐 Token disponível:", !!token);
    console.log("🔑 Token preview:", token ? token.substring(0, 20) + "..." : "NENHUM");
    
    try {
      const result = await this.post<Product>(
        `/products?storeSlug=${storeSlug}`,
        productDataWithoutStoreSlug
      );
      console.log("✅ ApiClient.createProduct - Sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ ApiClient.createProduct - Erro:", error);
      throw error;
    }
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

  // ===== UTILITÁRIOS =====

  private log(message: string, data?: any): void {
    if (apiConfig.api.debug) {
      console.log(message, data);
    }
  }

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

    // Tratar erros de cancelamento especificamente
    if (error.code === "ERR_CANCELED" || error.message === "canceled") {
      apiError.message = "Requisição cancelada";
      apiError.status = 0; // Status especial para requisições canceladas
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
