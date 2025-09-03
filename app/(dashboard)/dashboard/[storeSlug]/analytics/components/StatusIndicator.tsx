"use client";

interface StatusIndicatorProps {
  isAuthenticated: boolean;
  hasErrors: boolean;
  hasData: boolean;
  isLoading: boolean;
  errors: {
    analyticsError?: Error;
    orderStatsError?: Error;
    topProductsError?: Error;
    customerMetricsError?: Error;
    peakHoursError?: Error;
  };
}

export default function StatusIndicator({
  isAuthenticated,
  hasErrors,
  hasData,
  isLoading,
  errors,
}: StatusIndicatorProps) {
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Autenticação Necessária
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                Faça login para acessar os dados de analytics da sua loja.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasErrors) {
    return (
      <div className="mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erro ao Carregar Dados
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Ocorreu um erro ao carregar dados da API. Verifique sua
                  conexão e tente novamente.
                </p>
                <div className="mt-2">
                  <p className="font-medium">Erros detectados:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {errors.analyticsError && (
                      <li>Analytics: {errors.analyticsError.message}</li>
                    )}
                    {errors.orderStatsError && (
                      <li>Métricas: {errors.orderStatsError.message}</li>
                    )}
                    {errors.topProductsError && (
                      <li>Produtos: {errors.topProductsError.message}</li>
                    )}
                    {errors.customerMetricsError && (
                      <li>Clientes: {errors.customerMetricsError.message}</li>
                    )}
                    {errors.peakHoursError && (
                      <li>Horários: {errors.peakHoursError.message}</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasData) {
    return (
      <div className="mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Dados da API
              </h3>
              <p className="mt-1 text-sm text-green-700">
                A página está exibindo dados reais da API da sua loja.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800">
              Nenhum Dado Disponível
            </h3>
            <p className="mt-1 text-sm text-gray-700">
              Não há dados disponíveis para exibir no momento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
