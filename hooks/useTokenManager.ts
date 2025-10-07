import { apiClient } from "@/lib/api-client";
import { useCallback, useEffect, useRef, useState } from "react";

interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  expiresAt?: Date;
  timeUntilExpiry?: number;
}

interface TokenManagerState {
  token: string | null;
  isValid: boolean;
  isExpired: boolean;
  timeUntilExpiry: number | null;
  lastValidation: Date | null;
}

/**
 * Hook para gerenciar tokens JWT com validação automática e renovação
 */
export function useTokenManager() {
  const [state, setState] = useState<TokenManagerState>({
    token: null,
    isValid: false,
    isExpired: false,
    timeUntilExpiry: null,
    lastValidation: null,
  });

  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Valida um token JWT e retorna informações sobre sua validade
   */
  const validateToken = useCallback((token: string): TokenValidationResult => {
    try {
      if (!token || token.trim().length === 0) {
        return { isValid: false, isExpired: true };
      }

      const parts = token.split(".");
      if (parts.length !== 3) {
        return { isValid: false, isExpired: true };
      }

      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = payload.exp;
      
      if (!expiresAt) {
        return { isValid: false, isExpired: true };
      }

      const isExpired = expiresAt <= now;
      const timeUntilExpiry = expiresAt - now;

      return {
        isValid: !isExpired,
        isExpired,
        expiresAt: new Date(expiresAt * 1000),
        timeUntilExpiry: Math.max(0, timeUntilExpiry),
      };
    } catch (error) {
      console.error("❌ Erro ao validar token:", error);
      return { isValid: false, isExpired: true };
    }
  }, []);

  /**
   * Atualiza o estado do token baseado na validação
   */
  const updateTokenState = useCallback((token: string | null) => {
    if (!token) {
      setState({
        token: null,
        isValid: false,
        isExpired: true,
        timeUntilExpiry: null,
        lastValidation: new Date(),
      });
      return;
    }

    const validation = validateToken(token);
    setState({
      token,
      isValid: validation.isValid,
      isExpired: validation.isExpired,
      timeUntilExpiry: validation.timeUntilExpiry || null,
      lastValidation: new Date(),
    });

    // Agendar próxima validação se o token ainda for válido
    if (validation.isValid && validation.timeUntilExpiry) {
      // Validar novamente 5 minutos antes da expiração
      const nextValidationIn = Math.max(60000, (validation.timeUntilExpiry - 300) * 1000);
      
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
      
      validationTimeoutRef.current = setTimeout(() => {
        updateTokenState(token);
      }, nextValidationIn);
    }
  }, [validateToken]);

  /**
   * Obtém o token atual do apiClient
   */
  const getCurrentToken = useCallback((): string | null => {
    return apiClient.getCurrentToken();
  }, []);

  /**
   * Verifica se o usuário está autenticado
   */
  const isAuthenticated = useCallback((): boolean => {
    return apiClient.isAuthenticated();
  }, []);

  /**
   * Força uma renovação do token (logout + redirect para login)
   */
  const forceTokenRefresh = useCallback(() => {
    console.warn("🔄 Forçando renovação de token - redirecionando para login");
    apiClient.logout();
    
    // Redirecionar para login após um pequeno delay
    setTimeout(() => {
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login?error=session_expired";
      }
    }, 1000);
  }, []);

  /**
   * Obtém um token válido para uso em WebSocket
   * Retorna null se não houver token válido
   */
  const getValidTokenForWebSocket = useCallback((): string | null => {
    const token = getCurrentToken();
    
    if (!token) {
      console.warn("⚠️ Nenhum token disponível para WebSocket");
      return null;
    }

    const validation = validateToken(token);
    
    if (!validation.isValid) {
      console.warn("⚠️ Token inválido para WebSocket:", {
        isExpired: validation.isExpired,
        expiresAt: validation.expiresAt,
      });
      
      // Se o token está expirado, forçar renovação
      if (validation.isExpired) {
        forceTokenRefresh();
      }
      
      return null;
    }

    // Se o token expira em menos de 5 minutos, avisar
    if (validation.timeUntilExpiry && validation.timeUntilExpiry < 300) {
      console.warn("⚠️ Token expira em breve:", {
        timeUntilExpiry: validation.timeUntilExpiry,
        expiresAt: validation.expiresAt,
      });
    }

    return token;
  }, [getCurrentToken, validateToken, forceTokenRefresh]);

  /**
   * Inicializa o monitoramento do token
   */
  useEffect(() => {
    // Validar token inicial
    const initialToken = getCurrentToken();
    updateTokenState(initialToken);

    // Monitorar mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cardapio_token") {
        updateTokenState(e.newValue);
      }
    };

    // Monitorar mudanças na visibilidade da página
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const currentToken = getCurrentToken();
        updateTokenState(currentToken);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [getCurrentToken, updateTokenState]);

  return {
    // Estado atual
    token: state.token,
    isValid: state.isValid,
    isExpired: state.isExpired,
    timeUntilExpiry: state.timeUntilExpiry,
    lastValidation: state.lastValidation,

    // Métodos
    getCurrentToken,
    getValidTokenForWebSocket,
    isAuthenticated,
    validateToken,
    forceTokenRefresh,
    updateTokenState,
  };
}