"use client";

import { useTokenSync } from "@/hooks/useTokenSync";
import { apiClient } from "@/lib/api-client";
import { AuthResponse, User, UserStoreAssociation } from "@/types/cardapio-api";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentStore: UserStoreAssociation | null;
  userStores: UserStoreAssociation[];
  login: (
    email: string,
    password: string,
    storeSlug?: string
  ) => Promise<AuthResponse>;
  loginByPhone: (phone: string, name?: string) => Promise<AuthResponse>;
  register: (userData: any) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  setCurrentStore: (storeSlug: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userStores, setUserStores] = useState<UserStoreAssociation[]>([]);
  const [currentStore, setCurrentStoreState] =
    useState<UserStoreAssociation | null>(null);
  const router = useRouter();

  const { isSynced } = useTokenSync();

  const refreshUserData = async () => {
    try {
      if (apiClient.isAuthenticated()) {
        // Primeiro, tentar obter dados do localStorage
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setUserStores(userData.stores || []);

            const currentStoreSlug =
              userData.currentStoreSlug || apiClient.getCurrentStoreSlug();
            if (currentStoreSlug) {
              const store = userData.stores?.find(
                (s: UserStoreAssociation) => s.storeSlug === currentStoreSlug
              );
              setCurrentStoreState(store || null);
            }
            return;
          } catch {
            localStorage.removeItem("user");
          }
        }

        // Se não há dados salvos, tentar decodificar o token como fallback
        const token = apiClient.getCurrentToken();
        if (token) {
          try {
            const tokenParts = token.split(".");
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));

              const currentUser: User = {
                id: payload.sub || payload.id || "unknown",
                email: payload.email || "",
                name: payload.name || payload.email || "",
                role: payload.role || "USER",
                storeSlug: payload.storeSlug || undefined,
                active: payload.active !== false,
                phone: payload.phone || undefined,
                createdAt: payload.iat
                  ? new Date(payload.iat * 1000).toISOString()
                  : new Date().toISOString(),
                updatedAt: payload.iat
                  ? new Date(payload.iat * 1000).toISOString()
                  : new Date().toISOString(),
                lastLogin: payload.iat
                  ? new Date(payload.iat * 1000).toISOString()
                  : undefined,
                stores: payload.stores || [],
                currentStoreSlug: payload.storeSlug || undefined,
              };

              setUser(currentUser);
              setUserStores(currentUser.stores || []);

              const currentStoreSlug =
                currentUser.currentStoreSlug || apiClient.getCurrentStoreSlug();
              if (currentStoreSlug) {
                const store = currentUser.stores?.find(
                  (s: UserStoreAssociation) => s.storeSlug === currentStoreSlug
                );
                setCurrentStoreState(store || null);
              }

              localStorage.setItem("user", JSON.stringify(currentUser));
            }
          } catch {
            // Se falhar ao decodificar o token, limpar tudo
            apiClient.logout();
            localStorage.removeItem("user");
            setUser(null);
            setUserStores([]);
            setCurrentStoreState(null);
          }
        }
      }
    } catch {
      localStorage.removeItem("user");
      setUser(null);
      setUserStores([]);
      setCurrentStoreState(null);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!isSynced) {
          return;
        }

        if (apiClient.isAuthenticated()) {
          await refreshUserData();
        } else {
          const savedUser = localStorage.getItem("user");
          if (savedUser) {
            try {
              const userData = JSON.parse(savedUser);
              setUser(userData);
              setUserStores(userData.stores || []);

              const currentStoreSlug =
                userData.currentStoreSlug || apiClient.getCurrentStoreSlug();
              if (currentStoreSlug) {
                const store = userData.stores?.find(
                  (s: UserStoreAssociation) => s.storeSlug === currentStoreSlug
                );
                setCurrentStoreState(store || null);
              }
            } catch {
              localStorage.removeItem("user");
            }
          }
        }
      } catch {
        apiClient.logout();
        localStorage.removeItem("user");
        setUser(null);
        setUserStores([]);
        setCurrentStoreState(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isSynced]);

  const login = async (
    email: string,
    password: string,
    storeSlug?: string
  ): Promise<AuthResponse> => {
    try {
      const response = await apiClient.authenticate(email, password, storeSlug);

      // Estruturar dados do usuário corretamente
      const userData: User = {
        id: response.user.id,
        email: response.user.email || "",
        name: response.user.name || "",
        role: response.user.role || "USER",
        storeSlug: response.user.storeSlug || undefined,
        active: response.user.active !== false,
        phone: response.user.phone || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        stores: response.user.userStores || [],
        currentStoreSlug: response.user.storeSlug || undefined,
      };

      setUser(userData);
      setUserStores(userData.stores || []);

      if (userData.currentStoreSlug) {
        const store = userData.stores?.find(
          (s) => s.storeSlug === userData.currentStoreSlug
        );
        setCurrentStoreState(store || null);
      }

      localStorage.setItem("user", JSON.stringify(userData));

      return response;
    } catch (error) {
      throw error;
    }
  };

  const loginByPhone = async (
    phone: string,
    name?: string
  ): Promise<AuthResponse> => {
    try {
      const response = await apiClient.authenticateByPhone(phone, name);

      // Estruturar dados do usuário corretamente
      const userData: User = {
        id: response.user.id,
        email: response.user.email || "",
        name: response.user.name || "",
        role: response.user.role || "USER",
        storeSlug: response.user.storeSlug || undefined,
        active: response.user.active !== false,
        phone: response.user.phone || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        stores: response.user.userStores || [],
        currentStoreSlug: response.user.storeSlug || undefined,
      };

      setUser(userData);
      setUserStores(userData.stores || []);

      if (userData.currentStoreSlug) {
        const store = userData.stores?.find(
          (s) => s.storeSlug === userData.currentStoreSlug
        );
        setCurrentStoreState(store || null);
      }

      localStorage.setItem("user", JSON.stringify(userData));

      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any): Promise<AuthResponse> => {
    try {
      const response = await apiClient.register(userData);

      // Estruturar dados do usuário corretamente
      const userDataWithDates: User = {
        id: response.user.id,
        email: response.user.email || "",
        name: response.user.name || "",
        role: response.user.role || "USER",
        storeSlug: response.user.storeSlug || undefined,
        active: response.user.active !== false,
        phone: response.user.phone || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        stores: response.user.userStores || [],
        currentStoreSlug: response.user.storeSlug || undefined,
      };

      setUser(userDataWithDates);
      setUserStores(userDataWithDates.stores || []);

      if (userDataWithDates.currentStoreSlug) {
        const store = userDataWithDates.stores?.find(
          (s) => s.storeSlug === userDataWithDates.currentStoreSlug
        );
        setCurrentStoreState(store || null);
      }

      localStorage.setItem("user", JSON.stringify(userDataWithDates));

      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
    setUserStores([]);
    setCurrentStoreState(null);
    localStorage.removeItem("user");
    localStorage.removeItem("currentStoreSlug");
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const setCurrentStore = async (storeSlug: string) => {
    try {
      const updatedUser = await apiClient.setCurrentStore({ storeSlug });
      setUser(updatedUser);
      setUserStores(updatedUser.stores || []);

      const store = updatedUser.stores?.find((s) => s.storeSlug === storeSlug);
      setCurrentStoreState(store || null);

      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    currentStore,
    userStores,
    login,
    loginByPhone,
    register,
    logout,
    updateUser,
    setCurrentStore,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext deve ser usado dentro de um AuthProvider");
  }
  return context;
}

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}
