import { useState, useCallback } from 'react';

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function useCurrencyFormatter() {
  const parseAndFormatBRL = useCallback((raw: string): { text: string; value: number } => {
    const onlyDigits = (raw ?? "").replace(/\D+/g, "");
    if (!onlyDigits) return { text: "", value: 0 };
    const safeDigits = onlyDigits.slice(0, 15);
    const cents = Number(safeDigits);
    const value = cents / 100;
    return { text: brl.format(value), value };
  }, []);

  const formatBRL = useCallback((value: number): string => {
    try {
      return brl.format(isFinite(value) ? value : 0);
    } catch {
      return "R$ 0,00";
    }
  }, []);

  const parseIntegerDigits = useCallback((
    raw: string,
    maxLen = 9
  ): { text: string; value: number } => {
    const digits = (raw ?? "").replace(/\D+/g, "").slice(0, maxLen);
    if (!digits) return { text: "", value: 0 };
    const normalized = String(parseInt(digits, 10));
    const safe = Number.isFinite(Number(normalized)) ? Number(normalized) : 0;
    return { text: normalized, value: safe };
  }, []);

  return {
    parseAndFormatBRL,
    formatBRL,
    parseIntegerDigits,
  };
}
