import { AxiosError } from "axios";

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  message: string;
  errors?: ValidationError[];
  statusCode: number;
}

export class ErrorHandler {
  /**
   * Processa erros da API e retorna uma mensagem amigável
   */
  static handleApiError(error: unknown): ApiError {
    if (error instanceof AxiosError) {
      return this.handleAxiosError(error);
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        code: "UNKNOWN_ERROR",
      };
    }

    return {
      message: "Ocorreu um erro inesperado",
      code: "UNKNOWN_ERROR",
    };
  }

  /**
   * Processa erros específicos do Axios
   */
  private static handleAxiosError(error: AxiosError): ApiError {
    const status = error.response?.status;
    const data = error.response?.data as ErrorResponse;

    switch (status) {
      case 400:
        const validationMessages = data.errors
          ?.map((err) => `${err.field}: ${err.message}`)
          .join(", ");
        return {
          message: `Erro de validação: ${validationMessages}`,
          code: "VALIDATION_ERROR",
          status,
          details: data.errors,
        };
      case 401:
        return {
          message: "Sessão expirada. Faça login novamente.",
          code: "UNAUTHORIZED",
          status,
        };
      case 403:
        return {
          message: "Você não tem permissão para realizar esta ação.",
          code: "FORBIDDEN",
          status,
        };
      case 404:
        return {
          message: "Recurso não encontrado.",
          code: "NOT_FOUND",
          status,
        };
      case 409:
        return {
          message: data?.message || "Conflito de dados.",
          code: "CONFLICT",
          status,
        };
      default:
        if (status && status >= 500) {
          return {
            message: "Erro interno do servidor. Tente novamente mais tarde.",
            code: "SERVER_ERROR",
            status,
          };
        }
        if (error.code === "NETWORK_ERROR" || !error.response) {
          return {
            message: "Erro de conexão. Verifique sua internet e tente novamente.",
            code: "NETWORK_ERROR",
          };
        }
        if (data?.message) {
          return {
            message: data.message,
            code: "API_ERROR",
            status,
          };
        }
        return {
          message:
            error.message || "Ocorreu um erro na comunicação com o servidor.",
          code: "UNKNOWN_ERROR",
          status,
        };
    }
  }

  /**
   * Verifica se o erro é de validação
   */
  static isValidationError(error: ApiError): boolean {
    return error.code === "VALIDATION_ERROR";
  }

  /**
   * Verifica se o erro é de autenticação
   */
  static isAuthError(error: ApiError): boolean {
    return error.code === "UNAUTHORIZED" || error.code === "FORBIDDEN";
  }

  /**
   * Verifica se o erro é de rede
   */
  static isNetworkError(error: ApiError): boolean {
    return error.code === "NETWORK_ERROR";
  }

  /**
   * Verifica se o erro é do servidor
   */
  static isServerError(error: ApiError): boolean {
    return error.code === "SERVER_ERROR";
  }

  /**
   * Obtém mensagens de validação formatadas
   */
  static getValidationMessages(error: ApiError): string[] {
    if (!this.isValidationError(error) || !error.details) {
      return [];
    }

    return (error.details as ValidationError[]).map(
      (err) => `${err.field}: ${err.message}`
    );
  }

  /**
   * Loga erros para debugging (apenas em desenvolvimento)
   */
  static logError(error: unknown, context?: string): void {
    if (process.env.NODE_ENV === "development") {
      // Não logar erros de cancelamento
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "ERR_CANCELED"
      ) {
        return;
      }
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        error.message === "canceled"
      ) {
        return;
      }

      console.error("Error:", error);
      if (context) {
        console.log("Context:", context);
      }
    }
  }
}

/**
 * Hook para tratamento de erros em componentes
 */
export function useErrorHandler() {
  const handleError = (error: unknown, context?: string): ApiError => {
    const apiError = ErrorHandler.handleApiError(error);
    ErrorHandler.logError(error, context);
    return apiError;
  };

  const showErrorToast = (error: ApiError) => {
    // Importar dinamicamente para evitar dependência circular
    import("../components/Toast")
      .then(({ useToast }) => {
        try {
          const { addToast } = useToast();
          addToast("error", "Erro", error.message);
        } catch {
          // Fallback para console se o toast não estiver disponível
          console.error("Error Toast:", error.message);
        }
      })
      .catch(() => {
        console.error("Error Toast:", error.message);
      });
  };

  const showSuccessToast = (title: string, message?: string) => {
    import("../components/Toast")
      .then(({ useToast }) => {
        try {
          const { addToast } = useToast();
          addToast("success", title, message);
        } catch {
          console.log("Success Toast:", title, message);
        }
      })
      .catch(() => {
        console.log("Success Toast:", title, message);
      });
  };

  const handleAndShowError = (error: unknown, context?: string) => {
    const apiError = handleError(error, context);
    showErrorToast(apiError);
    return apiError;
  };

  return {
    handleError,
    showErrorToast,
    showSuccessToast,
    handleAndShowError,
    isValidationError: ErrorHandler.isValidationError,
    isAuthError: ErrorHandler.isAuthError,
    isNetworkError: ErrorHandler.isNetworkError,
    isServerError: ErrorHandler.isServerError,
    getValidationMessages: ErrorHandler.getValidationMessages,
  };
}