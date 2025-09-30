/**
 * Funções de configuração de ambiente para a aplicação
 */

/**
 * Retorna a URL do backend baseado no ambiente
 * @returns URL do backend
 */
export function getBackendUrl(): string {
  // Em produção, usar a URL de produção do backend
  if (process.env.NODE_ENV === "production") {
    return (
      process.env.NEXT_PUBLIC_CARDAPIO_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://api.cardap.io"
    );
  }

  // Em desenvolvimento, usar a URL local do backend
  return (
    process.env.NEXT_PUBLIC_CARDAPIO_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001"
  );
}
