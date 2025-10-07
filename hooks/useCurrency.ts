import {
  centsToReais,
  formatCentsToBRL,
  reaisToCents,
  validateCurrencyValue,
} from "@/lib/utils/currency";
import { useCallback, useState } from "react";

interface UseCurrencyOptions {
  initialValue?: number; // Valor inicial em centavos
  min?: number; // Valor mínimo em centavos
  max?: number; // Valor máximo em centavos
  allowEmpty?: boolean; // Permite valor vazio
}

interface UseCurrencyReturn {
  // Valor em centavos
  value: number;
  setValue: (cents: number) => void;

  // Valor em reais
  reais: number;
  setReais: (reais: number) => void;

  // Formatação
  formatted: string;
  formattedBRL: string;

  // Validação
  isValid: boolean;
  errorMessage?: string;
  validate: () => boolean;

  // Utilitários
  reset: () => void;
  isEmpty: boolean;
}

/**
 * Hook para gerenciar valores de moeda brasileira
 * Facilita a conversão entre centavos e reais, formatação e validação
 */
export function useCurrency(
  options: UseCurrencyOptions = {}
): UseCurrencyReturn {
  const {
    initialValue = 0,
    min = 0,
    max = 9999999,
    allowEmpty = true,
  } = options;

  const [value, setValueState] = useState(initialValue);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  // Valor em reais
  const reais = centsToReais(value);

  // Formatação
  const formatted =
    value === 0 && allowEmpty
      ? ""
      : value.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

  const formattedBRL = formatCentsToBRL(value);

  // Validação
  const validation = validateCurrencyValue(value, min, max);
  const isValid = allowEmpty && value === 0 ? true : validation.isValid;

  if (validation.errorMessage !== errorMessage) {
    setErrorMessage(validation.errorMessage);
  }

  // Setters
  const setValue = useCallback((cents: number) => {
    setValueState(cents);
  }, []);

  const setReais = useCallback((reais: number) => {
    setValueState(reaisToCents(reais));
  }, []);

  // Validação manual
  const validate = useCallback(() => {
    const validation = validateCurrencyValue(value, min, max);
    setErrorMessage(validation.errorMessage);
    return validation.isValid;
  }, [value, min, max]);

  // Reset
  const reset = useCallback(() => {
    setValueState(initialValue);
    setErrorMessage(undefined);
  }, [initialValue]);

  // Verifica se está vazio
  const isEmpty = value === 0 && allowEmpty;

  return {
    value,
    setValue,
    reais,
    setReais,
    formatted,
    formattedBRL,
    isValid,
    errorMessage,
    validate,
    reset,
    isEmpty,
  };
}

/**
 * Hook para gerenciar múltiplos valores de moeda
 */
export function useMultipleCurrency(
  keys: string[],
  options: UseCurrencyOptions = {}
) {
  const [values, setValues] = useState<Record<string, number>>(
    keys.reduce(
      (acc, key) => ({ ...acc, [key]: options.initialValue || 0 }),
      {}
    )
  );

  const setValue = useCallback((key: string, cents: number) => {
    setValues((prev) => ({ ...prev, [key]: cents }));
  }, []);

  const setReais = useCallback((key: string, reais: number) => {
    setValues((prev) => ({ ...prev, [key]: reaisToCents(reais) }));
  }, []);

  const getValue = useCallback((key: string) => values[key] || 0, [values]);

  const getReais = useCallback(
    (key: string) => centsToReais(values[key] || 0),
    [values]
  );

  const getFormatted = useCallback(
    (key: string) => {
      const value = values[key] || 0;
      return value === 0 && options.allowEmpty
        ? ""
        : value.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
    },
    [values, options.allowEmpty]
  );

  const getFormattedBRL = useCallback(
    (key: string) => {
      return formatCentsToBRL(values[key] || 0);
    },
    [values]
  );

  const validate = useCallback(
    (key: string) => {
      const value = values[key] || 0;
      return validateCurrencyValue(value, options.min, options.max);
    },
    [values, options.min, options.max]
  );

  const reset = useCallback(() => {
    setValues(
      keys.reduce(
        (acc, key) => ({ ...acc, [key]: options.initialValue || 0 }),
        {}
      )
    );
  }, [keys, options.initialValue]);

  const resetKey = useCallback(
    (key: string) => {
      setValues((prev) => ({ ...prev, [key]: options.initialValue || 0 }));
    },
    [options.initialValue]
  );

  return {
    values,
    setValue,
    setReais,
    getValue,
    getReais,
    getFormatted,
    getFormattedBRL,
    validate,
    reset,
    resetKey,
  };
}
