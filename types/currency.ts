/**
 * Tipos relacionados a moeda brasileira (BRL)
 */

export interface CurrencyValue {
  /** Valor em centavos (inteiro) */
  cents: number;
  /** Valor em reais (float) */
  reais: number;
  /** String formatada em BRL */
  formatted: string;
}

export interface CurrencyInputProps {
  /** Valor em centavos */
  value?: number;
  /** Callback quando valor muda */
  onChange?: (cents: number) => void;
  /** Callback quando perde foco */
  onBlur?: (cents: number) => void;
  /** Placeholder do input */
  placeholder?: string;
  /** Se o input está desabilitado */
  disabled?: boolean;
  /** Valor mínimo em centavos */
  min?: number;
  /** Valor máximo em centavos */
  max?: number;
  /** Se permite campo vazio */
  allowEmpty?: boolean;
  /** Classes CSS adicionais */
  className?: string;
  /** Label do input */
  label?: string;
  /** Mensagem de erro */
  error?: string;
  /** ID do input */
  id?: string;
  /** Nome do input */
  name?: string;
  /** Se é obrigatório */
  required?: boolean;
  /** ID do elemento descritivo */
  "aria-describedby"?: string;
}

export interface CurrencyValidationResult {
  /** Se o valor é válido */
  isValid: boolean;
  /** Mensagem de erro (se houver) */
  errorMessage?: string;
}

export interface CurrencyFormatOptions {
  /** Se deve incluir símbolo da moeda */
  includeSymbol?: boolean;
  /** Se deve incluir separadores de milhares */
  includeThousandsSeparator?: boolean;
  /** Número de casas decimais */
  decimalPlaces?: number;
}

export interface ProductPrice {
  /** Preço em centavos */
  priceInCents: number;
  /** Preço original em centavos (opcional) */
  originalPriceInCents?: number;
  /** Se o produto é gratuito */
  isFree: boolean;
}

export interface AddonPrice {
  /** Nome do adicional */
  name: string;
  /** Preço em centavos */
  priceInCents: number;
  /** Categoria do adicional */
  category: string;
  /** Quantidade máxima */
  maxQuantity: number;
  /** Se está ativo */
  active: boolean;
  /** Se é gratuito */
  isFree: boolean;
}
