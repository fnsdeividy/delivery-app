import { AxiosError } from "axios";

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
  canceled?: boolean;
  timeout?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  message?: string;
  error?: string;
  status?: number;
  statusCode?: number;
  errors?:
    | Array<{ field?: string; message?: string } | string>
    | Record<string, string[] | string>;
}

type Reporter = (payload: {
  error: unknown;
  context?: string;
  mapped?: ApiError;
}) => void;

/**
 * Utilitários internos (sem logs)
 */
const isAxiosError = (e: unknown): e is AxiosError =>
  e instanceof AxiosError ||
  (typeof e === "object" && !!e && "isAxiosError" in e);

const isCanceled = (e: AxiosError) =>
  e.code === "ERR_CANCELED" || e.message === "canceled";

const isTimeout = (e: AxiosError) => e.code === "ECONNABORTED";

/** Extrai status de múltiplas formas comuns */
const extractStatus = (err: AxiosError): number | undefined =>
  err.response?.status ??
  (typeof (err.response?.data as any)?.statusCode === "number"
    ? (err.response!.data as any).statusCode
    : undefined);

/** Extrai mensagem da resposta em formatos variados */
const extractMessage = (data?: ErrorResponse | any): string | undefined => {
  if (!data) return undefined;
  if (typeof data === "string") return data;
  return (
    data.message ||
    data.error ||
    (typeof data.detail === "string" ? data.detail : undefined)
  );
};

/** Normaliza lista de erros de validação em string[] */
const normalizeValidationErrors = (data?: ErrorResponse | any): string[] => {
  if (!data) return [];
  const out: string[] = [];

  // Caso array: [{ field, message }] | [ "msg", ... ]
  if (Array.isArray(data.errors)) {
    for (const item of data.errors) {
      if (typeof item === "string") {
        out.push(item);
      } else if (item && typeof item === "object") {
        const f = (item as any).field ?? (item as any).path ?? "";
        const m = (item as any).message ?? "";
        out.push(f ? `${f}: ${m}` : m || "");
      }
    }
  }

  // Caso objeto: { field: ["msg1","msg2"], ... }
  if (
    data.errors &&
    !Array.isArray(data.errors) &&
    typeof data.errors === "object"
  ) {
    for (const [field, val] of Object.entries(
      data.errors as Record<string, string[] | string>
    )) {
      if (Array.isArray(val)) {
        for (const v of val) out.push(`${field}: ${v}`);
      } else if (typeof val === "string") {
        out.push(`${field}: ${val}`);
      }
    }
  }

  // Alguns backends usam "details" para validação
  if (Array.isArray((data as any)?.details)) {
    for (const d of (data as any).details) {
      if (typeof d === "string") out.push(d);
      else if (d && typeof d === "object") {
        const f = (d as any).field ?? (d as any).path ?? "";
        const m = (d as any).message ?? "";
        out.push(f ? `${f}: ${m}` : m || "");
      }
    }
  }

  return out.filter(Boolean);
};

export class ErrorHandler {
  /** Reporter opcional (ex.: Sentry). Sem logs locais. */
  private static reporter: Reporter | null = null;

  static setReporter(fn: Reporter | null) {
    this.reporter = fn;
  }

  /**
   * Processa qualquer erro em ApiError amigável
   */
  static handleApiError(error: unknown): ApiError {
    if (isAxiosError(error)) {
      return this.handleAxiosError(error);
    }

    if (error instanceof Error) {
      const mapped: ApiError = {
        message: error.message,
        code: "UNKNOWN_ERROR",
      };
      this.report(mapped, error);
      return mapped;
    }

    const mapped: ApiError = {
      message: "Ocorreu um erro inesperado",
      code: "UNKNOWN_ERROR",
    };
    this.report(mapped, error);
    return mapped;
  }

  /**
   * Processa erros específicos do Axios
   */
  private static handleAxiosError(error: AxiosError): ApiError {
    // Cancelamento e timeout têm prioridade
    if (isCanceled(error)) {
      const mapped: ApiError = {
        message: "Requisição cancelada",
        code: "CANCELED",
        canceled: true,
      };
      this.report(mapped, error);
      return mapped;
    }

    if (isTimeout(error)) {
      const mapped: ApiError = {
        message: "Tempo limite da requisição excedido. Verifique sua conexão.",
        code: "TIMEOUT",
        timeout: true,
      };
      this.report(mapped, error);
      return mapped;
    }

    const status = extractStatus(error);
    const data = error.response?.data as ErrorResponse | undefined;

    // Rede sem resposta do servidor
    if (!error.response) {
      const mapped: ApiError = {
        message: "Erro de conexão. Verifique sua internet e tente novamente.",
        code: "NETWORK_ERROR",
      };
      this.report(mapped, error);
      return mapped;
    }

    // Mapeamento por status
    if (status === 400) {
      const validations = normalizeValidationErrors(data);
      const message =
        validations.length > 0
          ? `Erro de validação: ${validations.join(", ")}`
          : extractMessage(data) ||
            "Dados inválidos. Verifique as informações enviadas.";
      const mapped: ApiError = {
        message,
        code: "VALIDATION_ERROR",
        status,
        details: validations.length ? validations : data?.errors,
      };
      this.report(mapped, error);
      return mapped;
    }

    if (status === 401) {
      const mapped: ApiError = {
        message: "Sessão expirada. Faça login novamente.",
        code: "UNAUTHORIZED",
        status,
      };
      this.report(mapped, error);
      return mapped;
    }

    if (status === 403) {
      const mapped: ApiError = {
        message: "Você não tem permissão para realizar esta ação.",
        code: "FORBIDDEN",
        status,
      };
      this.report(mapped, error);
      return mapped;
    }

    if (status === 404) {
      const mapped: ApiError = {
        message: "Recurso não encontrado.",
        code: "NOT_FOUND",
        status,
      };
      this.report(mapped, error);
      return mapped;
    }

    if (status === 409) {
      const mapped: ApiError = {
        message: extractMessage(data) || "Conflito de dados.",
        code: "CONFLICT",
        status,
      };
      this.report(mapped, error);
      return mapped;
    }

    if (status && status >= 500) {
      const mapped: ApiError = {
        message: "Erro interno do servidor. Tente novamente mais tarde.",
        code: "SERVER_ERROR",
        status,
      };
      this.report(mapped, error);
      return mapped;
    }

    // Demais casos
    const mapped: ApiError = {
      message:
        extractMessage(data) ||
        error.message ||
        "Ocorreu um erro na comunicação com o servidor.",
      code: status ? "API_ERROR" : "UNKNOWN_ERROR",
      status,
      details: data,
    };
    this.report(mapped, error);
    return mapped;
  }

  /** Reporter externo opcional (ex.: Sentry). Nunca usa console. */
  static logError(error: unknown, context?: string): void {
    // compat: manter API pública, mas sem logs locais.
    if (this.reporter) {
      const mapped = this.handleApiError(error);
      this.reporter({ error, context, mapped });
    }
  }

  private static report(mapped: ApiError, raw: unknown) {
    if (this.reporter) this.reporter({ error: raw, mapped });
  }

  // ============ Predicados ============
  static isValidationError(error: ApiError): boolean {
    return error.code === "VALIDATION_ERROR";
  }

  static isAuthError(error: ApiError): boolean {
    return error.code === "UNAUTHORIZED" || error.code === "FORBIDDEN";
  }

  static isNetworkError(error: ApiError): boolean {
    return error.code === "NETWORK_ERROR";
  }

  static isServerError(error: ApiError): boolean {
    return error.code === "SERVER_ERROR";
  }

  // ============ Helpers ============
  static getValidationMessages(error: ApiError): string[] {
    if (!this.isValidationError(error)) return [];
    if (!error.details) return [];
    // Aceita array simples de strings ou estrutura de ValidationError
    if (Array.isArray(error.details)) {
      return (error.details as any[])
        .map((d) => {
          if (typeof d === "string") return d;
          if (d && typeof d === "object") {
            const f = (d as any).field ?? (d as any).path ?? "";
            const m = (d as any).message ?? "";
            return f ? `${f}: ${m}` : m || "";
          }
          return "";
        })
        .filter(Boolean);
    }
    return [];
  }
}

/**
 * Hook para tratamento de erros em componentes (sem logs).
 * Usa import dinâmico do hook de toast para evitar dependências circulares.
 */
export function useErrorHandler() {
  const handleError = (error: unknown, context?: string): ApiError => {
    const apiError = ErrorHandler.handleApiError(error);
    // report opcional (sem console)
    ErrorHandler.logError(error, context);
    return apiError;
  };

  const showErrorToast = async (error: ApiError) => {
    try {
      const mod = await import("@/hooks/useToast");
      const { useToast } = mod as any;
      const { addToast } = useToast();
      addToast("error", "Erro", error.message);
    } catch {
      // silencioso (sem fallback em console)
    }
  };

  const showSuccessToast = async (title: string, message?: string) => {
    try {
      const mod = await import("@/hooks/useToast");
      const { useToast } = mod as any;
      const { addToast } = useToast();
      addToast("success", title, message);
    } catch {
      // silencioso
    }
  };

  const handleAndShowError = (error: unknown, context?: string) => {
    const apiError = handleError(error, context);
    void showErrorToast(apiError);
    return apiError;
  };

  return {
    handleError,
    handleAndShowError,
    showErrorToast,
    showSuccessToast,
    isValidationError: ErrorHandler.isValidationError,
    isAuthError: ErrorHandler.isAuthError,
    isNetworkError: ErrorHandler.isNetworkError,
    isServerError: ErrorHandler.isServerError,
    getValidationMessages: ErrorHandler.getValidationMessages,
  };
}
