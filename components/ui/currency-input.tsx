"use client";

import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { cn } from "@/lib/utils";
import { forwardRef, useEffect, useState } from "react";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  label?: string;
  helperText?: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  id?: string;
  name?: string;
  required?: boolean;
  autoFocus?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      value,
      onChange,
      placeholder = "R$ 0,00",
      className,
      disabled = false,
      error = false,
      label,
      helperText,
      prefix = "R$",
      suffix,
      min = 0,
      max = 999999.99,
      step = 0.01,
      id,
      name,
      required = false,
      autoFocus = false,
      onBlur,
      onFocus,
      ...props
    },
    ref
  ) => {
    const { parseAndFormatBRL, formatBRL, parsePastedValue } =
      useCurrencyFormatter();
    const [displayValue, setDisplayValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isRequiredError, setIsRequiredError] = useState(false);

    // Verificar se há erro de campo obrigatório
    useEffect(() => {
      if (required && value <= 0 && !isFocused) {
        setIsRequiredError(true);
      } else {
        setIsRequiredError(false);
      }
    }, [required, value, isFocused]);

    // Inicializar o valor de exibição apenas quando não estiver focado
    useEffect(() => {
      if (!isFocused) {
        if (value > 0) {
          const formatted = formatBRL(value);
          setDisplayValue(formatted.replace(/^R\$\s*/, ""));
        } else {
          setDisplayValue("");
        }
      }
    }, [value, formatBRL, isFocused]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Permitir apenas números, vírgulas e pontos
      const cleanValue = inputValue.replace(/[^\d,.-]/g, "");

      // Se o valor estiver vazio, limpar tudo
      if (!cleanValue) {
        setDisplayValue("");
        onChange(0);
        setHasError(false);
        return;
      }

      try {
        const { text, value: numericValue } = parseAndFormatBRL(cleanValue);

        // Validar limites apenas se o valor for válido
        if (numericValue > max) {
          setHasError(true);
          // Ainda atualiza o display para mostrar o que foi digitado
          setDisplayValue(cleanValue);
          return;
        }

        if (numericValue < min) {
          setHasError(true);
          // Ainda atualiza o display para mostrar o que foi digitado
          setDisplayValue(cleanValue);
          return;
        }

        setHasError(false);
        // Manter o valor digitado no display durante a digitação
        setDisplayValue(cleanValue);
        onChange(numericValue);
      } catch (error) {
        console.warn("Erro ao processar valor:", error);
        // Em caso de erro, ainda permite mostrar o que foi digitado
        setDisplayValue(cleanValue);
        setHasError(true);
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedValue = e.clipboardData.getData("text");

      try {
        const { text, value: numericValue } = parsePastedValue(pastedValue);

        // Validar limites apenas se o valor for válido
        if (numericValue > max) {
          setHasError(true);
          return;
        }

        if (numericValue < min) {
          setHasError(true);
          return;
        }

        setHasError(false);
        // Mostrar o valor formatado após colar
        setDisplayValue(text.replace(/^R\$\s*/, ""));
        onChange(numericValue);
      } catch (error) {
        console.warn("Erro ao processar valor colado:", error);
        setHasError(true);
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
      // Quando focar, manter o valor atual no display para edição
      if (value > 0) {
        const formatted = formatBRL(value);
        setDisplayValue(formatted.replace(/^R\$\s*/, ""));
      } else {
        setDisplayValue("");
      }
      onFocus?.();
    };

    const handleBlur = () => {
      setIsFocused(false);
      onBlur?.();

      // Formatar o valor final quando perder o foco
      if (value > 0) {
        const formatted = formatBRL(value);
        setDisplayValue(formatted.replace(/^R\$\s*/, ""));
      } else {
        setDisplayValue("");
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Permitir teclas de navegação, números e algumas teclas especiais
      const allowedKeys = [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        "PageUp",
        "PageDown",
        ",",
        ".",
        "-",
      ];

      // Permitir números
      if (e.key >= "0" && e.key <= "9") {
        return;
      }

      // Permitir teclas de navegação e especiais
      if (allowedKeys.includes(e.key)) {
        return;
      }

      // Permitir atalhos de teclado (Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z)
      if (
        e.ctrlKey &&
        ["a", "c", "v", "x", "z"].includes(e.key.toLowerCase())
      ) {
        return;
      }

      // Permitir Shift+Arrow para seleção de texto
      if (
        e.shiftKey &&
        [
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Home",
          "End",
        ].includes(e.key)
      ) {
        return;
      }

      // Bloquear outras teclas
      e.preventDefault();
    };

    const inputClasses = cn(
      "w-full px-4 py-3 text-base border rounded-lg transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-offset-1",
      "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
      "placeholder:text-gray-400",
      {
        // Estados normais
        "border-gray-300 bg-white text-gray-900":
          !error && !hasError && !isRequiredError && !disabled,
        "focus:border-blue-500 focus:ring-blue-500":
          !error && !hasError && !isRequiredError && !disabled && isFocused,

        // Estados de erro
        "border-red-300 bg-red-50 text-red-900":
          error || hasError || isRequiredError,
        "focus:border-red-500 focus:ring-red-500":
          (error || hasError || isRequiredError) && isFocused,

        // Estado desabilitado
        "border-gray-200": disabled,
      },
      className
    );

    const labelClasses = cn(
      "block text-sm font-medium mb-2 transition-colors duration-200",
      {
        "text-gray-700": !error && !hasError && !isRequiredError,
        "text-red-700": error || hasError || isRequiredError,
        "text-gray-500": disabled,
      }
    );

    const helperClasses = cn("text-xs mt-1 transition-colors duration-200", {
      "text-gray-500": !error && !hasError && !isRequiredError,
      "text-red-600": error || hasError || isRequiredError,
      "text-gray-400": disabled,
    });

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className={labelClasses}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {prefix && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none z-10">
              {prefix}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            name={name}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            autoFocus={autoFocus}
            className={cn(inputClasses, prefix && "pl-10")}
            aria-invalid={error || hasError || isRequiredError}
            aria-describedby={helperText ? `${id}-helper` : undefined}
            aria-label={label || "Campo de valor monetário"}
            aria-required={required}
            role="textbox"
            {...props}
          />

          {/* Indicador de valor formatado quando não está focado */}
          {!isFocused && value > 0 && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-400 pointer-events-none">
              {formatBRL(value)}
            </div>
          )}
        </div>

        {helperText && (
          <p id={`${id}-helper`} className={helperClasses}>
            {helperText}
          </p>
        )}

        {/* Mensagem de erro para campo obrigatório */}
        {isRequiredError && (
          <p className="text-xs text-red-600 mt-1">Valor mínimo é R$ 0,01</p>
        )}

        {/* Mensagem de erro para valor muito baixo */}
        {hasError && value < min && (
          <p className="text-xs text-red-600 mt-1">
            Valor mínimo é {formatBRL(min)}
          </p>
        )}

        {/* Mensagem de erro para valor muito alto */}
        {hasError && value > max && (
          <p className="text-xs text-red-600 mt-1">
            Valor máximo é {formatBRL(max)}
          </p>
        )}

        {/* Indicador de valor mínimo/máximo */}
        {(min > 0 || max < 999999.99) && !hasError && !isRequiredError && (
          <p className="text-xs text-gray-400 mt-1">
            Valor entre {formatBRL(min)} e {formatBRL(max)}
          </p>
        )}

        {/* Preview do valor em tempo real quando focado */}
        {isFocused && value > 0 && (
          <div
            className={cn(
              "mt-2 p-3 border rounded-md transition-all duration-300",
              {
                "bg-blue-50 border-blue-200":
                  !error && !hasError && !isRequiredError,
                "bg-red-50 border-red-200":
                  error || hasError || isRequiredError,
              }
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Valor atual:
              </span>
              <span
                className={cn("text-lg font-bold", {
                  "text-blue-900": !error && !hasError && !isRequiredError,
                  "text-red-900": error || hasError || isRequiredError,
                })}
              >
                {formatBRL(value)}
              </span>
            </div>

            {/* Status de validação */}
            <div className="mt-2 text-xs">
              <span
                className={cn("px-2 py-1 rounded-full", {
                  "bg-green-100 text-green-700":
                    value >= min && value <= max && !isRequiredError,
                  "bg-red-100 text-red-700":
                    value < min || value > max || isRequiredError,
                })}
              >
                {value >= min && value <= max && !isRequiredError
                  ? "✓ Valor válido"
                  : "✗ Valor inválido"}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
