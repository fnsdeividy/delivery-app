"use client";

import { cn } from "@/lib/utils";
import {
  formatForInput,
  parseBRLToCents,
  validateCurrencyValue,
} from "@/lib/utils/currency";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";

interface CurrencyInputProps {
  value?: number; // Valor em centavos
  onChange?: (cents: number) => void;
  onBlur?: (cents: number) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: number; // Valor mínimo em centavos
  max?: number; // Valor máximo em centavos
  allowEmpty?: boolean; // Permite campo vazio (sem custo)
  className?: string;
  label?: string;
  error?: string;
  id?: string;
  name?: string;
  required?: boolean;
  "aria-describedby"?: string;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      value = 0,
      onChange,
      onBlur,
      placeholder = "0,00",
      disabled = false,
      min = 0,
      max = 9999999,
      allowEmpty = true,
      className,
      label,
      error,
      id,
      name,
      required = false,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [hasError, setHasError] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const cursorPositionRef = useRef<number>(0);

    // Atualiza o valor de exibição quando o valor prop muda
    useEffect(() => {
      if (!isFocused) {
        if (value === 0 && allowEmpty) {
          setDisplayValue("");
        } else {
          setDisplayValue(formatForInput(value));
        }
      }
    }, [value, isFocused, allowEmpty]);

    // Valida o valor atual
    const validateValue = useCallback(
      (cents: number) => {
        if (allowEmpty && cents === 0) {
          setHasError(false);
          return true;
        }

        const validation = validateCurrencyValue(cents, min, max);
        setHasError(!validation.isValid);
        return validation.isValid;
      },
      [allowEmpty, min, max]
    );

    // Processa a entrada do usuário
    const processInput = useCallback(
      (inputValue: string) => {
        // Remove caracteres não numéricos exceto vírgula e ponto
        const cleanValue = inputValue
          .replace(/[^\d,.-]/g, "")
          .replace(/^-/, "")
          .trim();

        if (!cleanValue) {
          if (allowEmpty) {
            setDisplayValue("");
            onChange?.(0);
            setHasError(false);
            return;
          } else {
            setDisplayValue("0,00");
            onChange?.(0);
            return;
          }
        }

        // Converte para centavos
        const cents = parseBRLToCents(cleanValue);

        // Valida o valor
        const isValid = validateValue(cents);

        if (isValid) {
          // Formata para exibição
          const formatted = formatForInput(cents);
          setDisplayValue(formatted);
          onChange?.(cents);
        } else {
          // Mantém o valor anterior se inválido
          setDisplayValue(displayValue);
        }
      },
      [allowEmpty, onChange, validateValue, displayValue]
    );

    // Manipula mudanças no input
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        processInput(inputValue);
      },
      [processInput]
    );

    // Manipula foco
    const handleFocus = useCallback(() => {
      setIsFocused(true);
      setHasError(false);

      // Salva posição do cursor
      if (inputRef.current) {
        cursorPositionRef.current = inputRef.current.selectionStart || 0;
      }
    }, []);

    // Manipula blur
    const handleBlur = useCallback(() => {
      setIsFocused(false);

      // Valida o valor final
      const cents = parseBRLToCents(displayValue);
      const isValid = validateValue(cents);

      if (isValid) {
        // Formata para exibição final
        if (cents === 0 && allowEmpty) {
          setDisplayValue("");
        } else {
          setDisplayValue(formatForInput(cents));
        }
        onBlur?.(cents);
      } else {
        // Reverte para o valor anterior se inválido
        setDisplayValue(formatForInput(value));
      }
    }, [displayValue, validateValue, allowEmpty, onBlur, value]);

    // Manipula colagem
    const handlePaste = useCallback(
      (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData("text");
        processInput(pastedText);
      },
      [processInput]
    );

    // Manipula teclas especiais
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Permite teclas de navegação e controle
        if (
          [
            "Backspace",
            "Delete",
            "ArrowLeft",
            "ArrowRight",
            "Tab",
            "Enter",
          ].includes(e.key) ||
          (e.ctrlKey && ["a", "c", "v", "x", "z"].includes(e.key.toLowerCase()))
        ) {
          return;
        }

        // Permite apenas números, vírgula e ponto
        if (!/[\d,.-]/.test(e.key)) {
          e.preventDefault();
        }
      },
      []
    );

    const inputId =
      id || `currency-input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const describedBy = [ariaDescribedBy, errorId].filter(Boolean).join(" ");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 text-sm font-medium">R$</span>
          </div>

          <input
            ref={ref || inputRef}
            type="text"
            id={inputId}
            name={name}
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            aria-describedby={describedBy}
            aria-invalid={hasError || !!error}
            className={cn(
              "block w-full pl-8 pr-3 py-2 border rounded-md shadow-sm",
              "focus:ring-2 focus:ring-purple-500 focus:border-purple-500",
              "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
              "text-sm placeholder-gray-400",
              hasError || error
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300",
              className
            )}
            {...props}
          />
        </div>

        {(hasError || error) && (
          <p
            id={errorId}
            className="mt-1 text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            {error || "Valor inválido"}
          </p>
        )}

        {!hasError && !error && (
          <p className="mt-1 text-xs text-gray-500">
            {allowEmpty
              ? "Deixe vazio para adicional sem custo"
              : "Digite o valor em reais"}
          </p>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
export type { CurrencyInputProps };
