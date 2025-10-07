import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";
import React from "react";

interface ApiErrorFallbackProps {
  error: Error;
  onRetry?: () => void;
  title?: string;
  className?: string;
}

export function ApiErrorFallback({
  error,
  onRetry,
  title = "Erro ao carregar dados",
  className = "",
}: ApiErrorFallbackProps) {
  const getErrorIcon = () => {
    if (
      error.message.includes("conexão") ||
      error.message.includes("internet")
    ) {
      return <WifiOff className="h-8 w-8 text-red-500" />;
    }
    if (
      error.message.includes("servidor") ||
      error.message.includes("interno")
    ) {
      return <AlertCircle className="h-8 w-8 text-orange-500" />;
    }
    return <AlertCircle className="h-8 w-8 text-red-500" />;
  };

  const getErrorColor = () => {
    if (
      error.message.includes("conexão") ||
      error.message.includes("internet")
    ) {
      return "border-red-200 bg-red-50";
    }
    if (
      error.message.includes("servidor") ||
      error.message.includes("interno")
    ) {
      return "border-orange-200 bg-orange-50";
    }
    return "border-red-200 bg-red-50";
  };

  return (
    <div
      className={`rounded-lg border p-6 text-center ${getErrorColor()} ${className}`}
    >
      <div className="flex flex-col items-center space-y-4">
        {getErrorIcon()}

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 max-w-md">{error.message}</p>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Tentar novamente</span>
          </button>
        )}
      </div>
    </div>
  );
}

interface ApiLoadingFallbackProps {
  message?: string;
  className?: string;
}

export function ApiLoadingFallback({
  message = "Carregando dados...",
  className = "",
}: ApiLoadingFallbackProps) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-gray-50 p-6 text-center ${className}`}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}

interface ApiEmptyFallbackProps {
  message?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function ApiEmptyFallback({
  message = "Nenhum dado encontrado",
  icon,
  className = "",
}: ApiEmptyFallbackProps) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-gray-50 p-6 text-center ${className}`}
    >
      <div className="flex flex-col items-center space-y-4">
        {icon || <div className="h-8 w-8 rounded-full bg-gray-300"></div>}
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}
