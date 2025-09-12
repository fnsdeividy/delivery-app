/**
 * Utilitários para formatação e conversão de moeda brasileira (BRL)
 */

/**
 * Converte centavos para valor em reais (float)
 * @param cents - Valor em centavos (inteiro)
 * @returns Valor em reais (float)
 */
export function centsToReais(cents: number): number {
  return cents / 100;
}

/**
 * Converte reais para centavos (inteiro)
 * @param reais - Valor em reais (float)
 * @returns Valor em centavos (inteiro)
 */
export function reaisToCents(reais: number): number {
  return Math.round(reais * 100);
}

/**
 * Formata valor em centavos para string BRL
 * @param cents - Valor em centavos (inteiro)
 * @returns String formatada (ex: "R$ 2,50")
 */
export function formatCentsToBRL(cents: number): string {
  const reais = centsToReais(cents);
  return formatReaisToBRL(reais);
}

/**
 * Formata valor em reais para string BRL
 * @param reais - Valor em reais (float)
 * @returns String formatada (ex: "R$ 2,50")
 */
export function formatReaisToBRL(reais: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(reais);
}

/**
 * Remove formatação BRL e converte para centavos
 * @param brlString - String formatada (ex: "R$ 2,50" ou "2,50")
 * @returns Valor em centavos (inteiro)
 */
export function parseBRLToCents(brlString: string): number {
  if (!brlString || brlString.trim() === "") {
    return 0;
  }

  // Remove caracteres não numéricos exceto vírgula e ponto
  const cleanString = brlString
    .replace(/[^\d,.-]/g, "") // Remove tudo exceto dígitos, vírgula, ponto e hífen
    .replace(/^-/, "") // Remove hífen do início
    .trim();

  if (!cleanString) {
    return 0;
  }

  // Se tem vírgula, trata como separador decimal brasileiro
  if (cleanString.includes(",")) {
    // Se tem ponto também, remove o ponto (milhares)
    const withoutThousands = cleanString.replace(/\./g, "");
    const parts = withoutThousands.split(",");

    if (parts.length === 2) {
      // Formato: 1.234,56
      const integerPart = parts[0] || "0";
      const decimalPart = parts[1].padEnd(2, "0").substring(0, 2);
      return parseInt(integerPart + decimalPart, 10);
    } else {
      // Formato: 1234,56 (sem separador de milhares)
      const integerPart = parts[0] || "0";
      const decimalPart = parts[1].padEnd(2, "0").substring(0, 2);
      return parseInt(integerPart + decimalPart, 10);
    }
  }

  // Se tem apenas ponto, pode ser decimal americano ou separador de milhares
  if (cleanString.includes(".")) {
    const parts = cleanString.split(".");

    if (parts.length === 2) {
      // Se a parte decimal tem 1-2 dígitos, trata como decimal americano
      if (parts[1].length <= 2) {
        const integerPart = parts[0] || "0";
        const decimalPart = parts[1].padEnd(2, "0").substring(0, 2);
        return parseInt(integerPart + decimalPart, 10);
      } else {
        // Trata como separador de milhares
        const withoutThousands = cleanString.replace(/\./g, "");
        return parseInt(withoutThousands, 10) * 100;
      }
    } else {
      // Múltiplos pontos - separador de milhares
      const withoutThousands = cleanString.replace(/\./g, "");
      return parseInt(withoutThousands, 10) * 100;
    }
  }

  // Apenas números inteiros - trata como centavos
  return parseInt(cleanString, 10);
}

/**
 * Remove formatação BRL e converte para reais
 * @param brlString - String formatada (ex: "R$ 2,50" ou "2,50")
 * @returns Valor em reais (float)
 */
export function parseBRLToReais(brlString: string): number {
  return centsToReais(parseBRLToCents(brlString));
}

/**
 * Valida se o valor está dentro dos limites permitidos
 * @param cents - Valor em centavos
 * @param minCents - Valor mínimo em centavos (padrão: 0)
 * @param maxCents - Valor máximo em centavos (padrão: 9999999)
 * @returns Objeto com isValid e errorMessage
 */
export function validateCurrencyValue(
  cents: number,
  minCents: number = 0,
  maxCents: number = 9999999
): { isValid: boolean; errorMessage?: string } {
  if (isNaN(cents) || cents < 0) {
    return {
      isValid: false,
      errorMessage: "Valor deve ser um número válido",
    };
  }

  if (cents < minCents) {
    return {
      isValid: false,
      errorMessage: `Valor mínimo é ${formatCentsToBRL(minCents)}`,
    };
  }

  if (cents > maxCents) {
    return {
      isValid: false,
      errorMessage: `Valor máximo é ${formatCentsToBRL(maxCents)}`,
    };
  }

  return { isValid: true };
}

/**
 * Formata valor para exibição durante digitação (sem R$)
 * @param cents - Valor em centavos
 * @returns String formatada para digitação (ex: "2,50")
 */
export function formatForInput(cents: number): string {
  if (cents === 0) return "";

  const reais = centsToReais(cents);
  return reais.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Extrai apenas os números de uma string
 * @param str - String com números
 * @returns String apenas com números
 */
export function extractNumbers(str: string): string {
  return str.replace(/\D/g, "");
}

/**
 * Formata número para padrão brasileiro
 * @param value - Valor numérico
 * @returns String formatada (ex: "1.234,56")
 */
export function formatNumberBR(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
