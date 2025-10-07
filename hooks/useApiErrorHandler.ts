import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface ApiError {
  status?: number;
  message?: string;
  data?: any;
}

export function useApiErrorHandler() {
  const router = useRouter();

  const handleError = useCallback(
    (error: ApiError, context?: string) => {
      // Ignorar erros de cancelamento
      if (error.status === 0 && error.message === "Requisição cancelada") {
        return {
          type: "cancelled",
          message: "Requisição cancelada",
          shouldRedirect: false,
        };
      }

      console.error(`❌ Erro na API ${context ? `(${context})` : ""}:`, error);

      // Tratar erros específicos sem fazer logout desnecessário
      switch (error.status) {
        case 400:
          return {
            type: "validation",
            message:
              error.message ||
              "Dados inválidos. Verifique as informações enviadas.",
            shouldRedirect: false,
          };

        case 401:
          return {
            type: "unauthorized",
            message: "Sessão expirada. Faça login novamente.",
            shouldRedirect: true,
            redirectTo: "/login",
          };

        case 403:
          return {
            type: "forbidden",
            message: "Você não tem permissão para realizar esta ação.",
            shouldRedirect: true,
            redirectTo: "/unauthorized",
          };

        case 404:
          return {
            type: "not_found",
            message: "Recurso não encontrado.",
            shouldRedirect: false,
          };

        case 409:
          return {
            type: "conflict",
            message:
              error.message ||
              "Conflito detectado. Verifique se os dados já existem.",
            shouldRedirect: false,
          };

        case 422:
          return {
            type: "validation",
            message: error.message || "Dados inválidos. Verifique a validação.",
            shouldRedirect: false,
          };

        case 500:
          return {
            type: "server_error",
            message: "Erro interno do servidor. Tente novamente mais tarde.",
            shouldRedirect: false,
          };

        default:
          return {
            type: "unknown",
            message: error.message || "Erro desconhecido ocorreu.",
            shouldRedirect: false,
          };
      }
    },
    [router]
  );

  const handleErrorWithRedirect = useCallback(
    (error: ApiError, context?: string) => {
      const errorInfo = handleError(error, context);

      if (errorInfo.shouldRedirect && errorInfo.redirectTo) {
        router.push(errorInfo.redirectTo);
      }

      return errorInfo;
    },
    [handleError, router]
  );

  return {
    handleError,
    handleErrorWithRedirect,
  };
}
