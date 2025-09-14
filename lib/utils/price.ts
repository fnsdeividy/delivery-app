/**
 * Formata preços para exibição, lidando com diferentes tipos de dados
 * @param price - Preço que pode ser number, string, ou objeto Decimal
 * @returns String formatada no padrão brasileiro (R$ 0,00)
 */
export const formatPrice = (price: any): string => {
  if (price === null || price === undefined) return "0,00";

  if (typeof price === "string") {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? "0,00" : numPrice.toFixed(2).replace(".", ",");
  }

  if (typeof price === "number") {
    return price.toFixed(2).replace(".", ",");
  }

  if (price && typeof price === "object" && "toString" in price) {
    const numPrice = parseFloat(price.toString());
    return isNaN(numPrice) ? "0,00" : numPrice.toFixed(2).replace(".", ",");
  }

  return "0,00";
};

/**
 * Converte preço para número, lidando com diferentes tipos de dados
 * @param price - Preço que pode ser number, string, ou objeto Decimal
 * @returns Número ou 0 se inválido
 */
export const parsePrice = (price: any): number => {
  if (price === null || price === undefined) return 0;

  if (typeof price === "number") {
    return price;
  }

  if (typeof price === "string") {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? 0 : numPrice;
  }

  if (price && typeof price === "object" && "toString" in price) {
    const numPrice = parseFloat(price.toString());
    return isNaN(numPrice) ? 0 : numPrice;
  }

  return 0;
};
