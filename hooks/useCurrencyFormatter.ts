import { useCallback } from "react";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function useCurrencyFormatter() {
  const parseAndFormatBRL = useCallback(
    (raw: string): { text: string; value: number } => {
      if (!raw || raw.trim() === "") return { text: "", value: 0 };

      // Remove caracteres não numéricos exceto vírgula e ponto
      let cleaned = raw.replace(/[^\d,.]/g, "");

      if (!cleaned) return { text: "", value: 0 };

      // Lógica para determinar se vírgula é decimal ou separador de milhares
      let normalized: string;

      // Se tem vírgula e ponto
      if (cleaned.includes(",") && cleaned.includes(".")) {
        // Vírgula vem depois do ponto = vírgula é decimal
        if (cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")) {
          normalized = cleaned.replace(/\./g, "").replace(/,/g, ".");
        } else {
          // Ponto vem depois da vírgula = ponto é decimal
          normalized = cleaned.replace(/,/g, "").replace(/\./g, ".");
        }
      }
      // Se só tem vírgula
      else if (cleaned.includes(",") && !cleaned.includes(".")) {
        const parts = cleaned.split(",");
        // Se a parte após a vírgula tem 1-2 dígitos, é decimal
        if (parts.length === 2 && parts[1].length <= 2) {
          normalized = cleaned.replace(/,/g, ".");
        } else {
          // Caso contrário, remove vírgulas (separadores de milhares)
          normalized = cleaned.replace(/,/g, "");
        }
      }
      // Se só tem ponto
      else if (cleaned.includes(".") && !cleaned.includes(",")) {
        const parts = cleaned.split(".");
        // Se a parte após o ponto tem 1-2 dígitos, é decimal
        if (parts.length === 2 && parts[1].length <= 2) {
          normalized = cleaned;
        } else {
          // Caso contrário, remove pontos (separadores de milhares)
          normalized = cleaned.replace(/\./g, "");
        }
      }
      // Só números
      else {
        normalized = cleaned;
      }

      // Converter para número
      const value = parseFloat(normalized);
      if (isNaN(value) || !isFinite(value) || value < 0) {
        return { text: "", value: 0 };
      }

      return { text: brl.format(value), value };
    },
    []
  );

  const formatBRL = useCallback((value: number): string => {
    try {
      return brl.format(isFinite(value) ? value : 0);
    } catch {
      return "R$ 0,00";
    }
  }, []);

  const parseIntegerDigits = useCallback(
    (raw: string, maxLen = 9): { text: string; value: number } => {
      const digits = (raw ?? "").replace(/\D+/g, "").slice(0, maxLen);
      if (!digits) return { text: "", value: 0 };
      const normalized = String(parseInt(digits, 10));
      const safe = Number.isFinite(Number(normalized)) ? Number(normalized) : 0;
      return { text: normalized, value: safe };
    },
    []
  );

  // Função para processar valores colados (suporta diferentes formatos)
  const parsePastedValue = useCallback(
    (pastedValue: string): { text: string; value: number } => {
      if (!pastedValue || pastedValue.trim() === "")
        return { text: "", value: 0 };

      // Remove espaços e símbolos de moeda
      let cleaned = pastedValue
        .replace(/R\$\s*/g, "") // Remove R$ e espaços
        .replace(/\s/g, "") // Remove todos os espaços
        .trim();

      // Remove caracteres não numéricos exceto vírgula e ponto
      cleaned = cleaned.replace(/[^\d,.]/g, "");

      if (!cleaned) return { text: "", value: 0 };

      // Usar a mesma lógica do parseAndFormatBRL
      let normalized: string;

      // Se tem vírgula e ponto
      if (cleaned.includes(",") && cleaned.includes(".")) {
        // Vírgula vem depois do ponto = vírgula é decimal
        if (cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")) {
          normalized = cleaned.replace(/\./g, "").replace(/,/g, ".");
        } else {
          // Ponto vem depois da vírgula = ponto é decimal
          normalized = cleaned.replace(/,/g, "").replace(/\./g, ".");
        }
      }
      // Se só tem vírgula
      else if (cleaned.includes(",") && !cleaned.includes(".")) {
        const parts = cleaned.split(",");
        // Se a parte após a vírgula tem 1-2 dígitos, é decimal
        if (parts.length === 2 && parts[1].length <= 2) {
          normalized = cleaned.replace(/,/g, ".");
        } else {
          // Caso contrário, remove vírgulas (separadores de milhares)
          normalized = cleaned.replace(/,/g, "");
        }
      }
      // Se só tem ponto
      else if (cleaned.includes(".") && !cleaned.includes(",")) {
        const parts = cleaned.split(".");
        // Se a parte após o ponto tem 1-2 dígitos, é decimal
        if (parts.length === 2 && parts[1].length <= 2) {
          normalized = cleaned;
        } else {
          // Caso contrário, remove pontos (separadores de milhares)
          normalized = cleaned.replace(/\./g, "");
        }
      }
      // Só números
      else {
        normalized = cleaned;
      }

      const value = parseFloat(normalized);
      if (isNaN(value) || !isFinite(value) || value < 0) {
        return { text: "", value: 0 };
      }

      return { text: brl.format(value), value };
    },
    []
  );

  return {
    parseAndFormatBRL,
    formatBRL,
    parseIntegerDigits,
    parsePastedValue,
  };
}
