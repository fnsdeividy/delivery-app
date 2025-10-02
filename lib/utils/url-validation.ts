/**
 * Utilitários para validação e construção de URLs
 */

/**
 * Valida se uma URL está bem formada
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove duplicações de /api/v1 na URL
 */
export function normalizeApiUrl(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/$/, "");

  // Se já termina com /api/v1, retorna como está
  if (trimmed.endsWith("/api/v1")) {
    return trimmed;
  }

  // Se contém /api/v1 em algum lugar, remove e adiciona no final
  const withoutApi = trimmed.replace(/\/api\/v1.*$/, "");
  return `${withoutApi}/api/v1`;
}

/**
 * Remove /api/v1 da URL para WebSocket e SSE
 * Usa a mesma lógica do apiClient para manter consistência
 */
export function getBaseUrlWithoutApi(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/$/, "");
  return trimmed.replace(/\/api\/v1$/, "");
}

/**
 * Constrói URL para SSE de pedidos usando a mesma base do apiClient
 */
export function buildOrdersSSEUrl(baseUrl: string, storeSlug: string): string {
  const normalizedBase = getBaseUrlWithoutApi(baseUrl);
  return `${normalizedBase}/api/v1/orders/public/stream?storeSlug=${encodeURIComponent(
    storeSlug
  )}`;
}

/**
 * Constrói URL para WebSocket de pedidos usando a mesma base do apiClient
 */
export function buildOrdersWebSocketUrl(baseUrl: string): string {
  const normalizedBase = getBaseUrlWithoutApi(baseUrl);
  return `${normalizedBase}/orders`;
}

/**
 * Valida configuração de URLs para debugging
 */
export function validateUrlConfiguration() {
  const baseUrl =
    process.env.NEXT_PUBLIC_CARDAPIO_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001";

  const config = {
    originalUrl: baseUrl,
    normalizedApiUrl: normalizeApiUrl(baseUrl),
    baseUrlWithoutApi: getBaseUrlWithoutApi(baseUrl),
    isValidOriginal: isValidUrl(baseUrl),
    isValidNormalized: isValidUrl(normalizeApiUrl(baseUrl)),
    isValidBaseWithoutApi: isValidUrl(getBaseUrlWithoutApi(baseUrl)),
  };

  console.log("🔧 Configuração de URLs:", config);

  return config;
}
