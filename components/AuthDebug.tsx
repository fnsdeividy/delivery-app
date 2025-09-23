"use client";

import { useCardapioAuth } from "@/hooks";
import { useState } from "react";

export function AuthDebug() {
  const { isAuthenticated, getCurrentToken } = useCardapioAuth();
  const [showDebug, setShowDebug] = useState(false);

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const token = getCurrentToken();
  let tokenPayload = null;
  let tokenError = null;

  try {
    if (token) {
      tokenPayload = JSON.parse(atob(token.split(".")[1]));
    }
  } catch (error) {
    tokenError = error;
  }

  const cookies = typeof document !== "undefined" ? document.cookie : "";
  const localStorageToken =
    typeof window !== "undefined"
      ? localStorage.getItem("cardapio_token")
      : null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
      >
        🔧 Debug Auth
      </button>

      {showDebug && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-auto">
          <div className="space-y-3 text-sm">
            <div>
              <strong>Status:</strong>
              <span
                className={`ml-2 px-2 py-1 rounded text-xs ${
                  isAuthenticated()
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isAuthenticated() ? "Autenticado" : "Não autenticado"}
              </span>
            </div>

            <div>
              <strong>Token:</strong>
              <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono break-all">
                {token ? `${token.substring(0, 50)}...` : "Não encontrado"}
              </div>
            </div>

            {tokenPayload && (
              <div>
                <strong>Payload:</strong>
                <div className="mt-1 p-2 bg-gray-100 rounded text-xs">
                  <div>
                    Role: {tokenPayload.role}{" "}
                    {tokenPayload.role === "ADMIN" ? "(Logista)" : ""}
                  </div>
                  <div>Email: {tokenPayload.email}</div>
                  <div>StoreSlug: {tokenPayload.storeSlug || "N/A"}</div>
                  <div>
                    Exp:{" "}
                    {tokenPayload.exp
                      ? new Date(tokenPayload.exp * 1000).toLocaleString()
                      : "N/A"}
                  </div>
                </div>
              </div>
            )}

            {tokenError && (
              <div>
                <strong>Erro no Token:</strong>
                <div className="mt-1 p-2 bg-red-100 rounded text-xs text-red-800">
                  {tokenError.toString()}
                </div>
              </div>
            )}

            <div>
              <strong>Cookies:</strong>
              <div className="mt-1 p-2 bg-gray-100 rounded text-xs">
                {cookies.includes("cardapio_token")
                  ? "✅ cardapio_token presente"
                  : "❌ cardapio_token ausente"}
                <br />
                {cookies.includes("localStorage_token")
                  ? "✅ localStorage_token presente"
                  : "❌ localStorage_token ausente"}
              </div>
            </div>

            <div>
              <strong>LocalStorage:</strong>
              <div className="mt-1 p-2 bg-gray-100 rounded text-xs">
                {localStorageToken ? "✅ Token presente" : "❌ Token ausente"}
              </div>
            </div>

            <div>
              <strong>URL Atual:</strong>
              <div className="mt-1 p-2 bg-gray-100 rounded text-xs">
                {typeof window !== "undefined"
                  ? window.location.pathname
                  : "N/A"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
