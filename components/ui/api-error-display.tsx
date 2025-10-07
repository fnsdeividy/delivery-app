"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";

interface ApiErrorDisplayProps {
  error: string | null;
  isConnected: boolean;
  onRetry?: () => void;
  lastPoll?: Date | null;
}

export function ApiErrorDisplay({
  error,
  isConnected,
  onRetry,
  lastPoll,
}: ApiErrorDisplayProps) {
  if (!error && isConnected) {
    return null;
  }

  const getErrorIcon = () => {
    if (!isConnected) {
      return <WifiOff className="h-4 w-4" />;
    }
    return <AlertTriangle className="h-4 w-4" />;
  };

  const getErrorTitle = () => {
    if (!isConnected) {
      return "Conexão perdida";
    }
    return "Erro na API";
  };

  const getErrorDescription = () => {
    if (!isConnected) {
      return "Não foi possível conectar ao servidor. Verifique sua conexão com a internet.";
    }
    return error || "Ocorreu um erro inesperado.";
  };

  const formatLastPoll = () => {
    if (!lastPoll) return "Nunca";

    const now = new Date();
    const diffMs = now.getTime() - lastPoll.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Agora mesmo";
    if (diffMins === 1) return "1 minuto atrás";
    return `${diffMins} minutos atrás`;
  };

  return (
    <Alert variant={isConnected ? "default" : "destructive"} className="mb-4">
      {getErrorIcon()}
      <AlertTitle>{getErrorTitle()}</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-2">
          <p>{getErrorDescription()}</p>

          {lastPoll && (
            <p className="text-sm text-muted-foreground">
              Última atualização: {formatLastPoll()}
            </p>
          )}

          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

// Componente específico para erro de conexão com API
export function ApiConnectionError({
  error,
  onRetry,
}: {
  error: string | null;
  onRetry?: () => void;
}) {
  if (!error) return null;

  return (
    <div className="flex items-center justify-center min-h-[200px] p-6">
      <div className="text-center max-w-md">
        <WifiOff className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Erro de Conexão
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        )}
      </div>
    </div>
  );
}
