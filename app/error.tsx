"use client";

import { ArrowsClockwise, Warning } from "@phosphor-icons/react/dist/ssr";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Warning className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Ops! Algo deu errado
          </h1>
          <p className="text-gray-600 mb-8">
            Ocorreu um erro inesperado. Tente novamente ou entre em contato com
            o suporte.
          </p>
        </div>

        <button
          onClick={reset}
          className="inline-flex items-center justify-center w-full px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors mb-4"
        >
          <ArrowsClockwise className="w-5 h-5 mr-2" />
          Tentar novamente
        </button>

        <div className="text-sm text-gray-500">
          <p>Erro técnico: {error.message}</p>
          {error.digest && <p className="mt-1">ID: {error.digest}</p>}
        </div>
      </div>
    </div>
  );
}
