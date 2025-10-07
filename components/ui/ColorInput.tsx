"use client";

import {
  evaluateContrast,
  validateHexColor,
} from "@/lib/utils/color-validation";
import { CheckCircle, Info, WarningCircle } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  backgroundColor?: string;
  textColor?: string;
  className?: string;
  disabled?: boolean;
  showContrastWarning?: boolean;
  required?: boolean;
  placeholder?: string;
}

export const ColorInput = ({
  label,
  value,
  onChange,
  backgroundColor,
  textColor,
  className = "",
  disabled = false,
  showContrastWarning = true,
  required = false,
  placeholder = "#000000",
}: ColorInputProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [error, setError] = useState<string>("");
  const [contrastWarning, setContrastWarning] = useState<string>("");
  const [contrastInfo, setContrastInfo] = useState<{
    contrast: number;
    meetsWCAGAA: boolean;
    meetsWCAGAAA: boolean;
  } | null>(null);

  // Sincronizar inputValue com value externo
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const validateAndUpdateColor = (newValue: string) => {
    // Limpar estados anteriores
    setError("");
    setContrastWarning("");
    setContrastInfo(null);

    // Validar formato da cor
    const validation = validateHexColor(newValue);
    if (!validation.isValid) {
      setError(validation.error || "Formato de cor inválido");
      return false;
    }

    // Normalizar e atualizar
    const normalized = validation.normalized!;
    setInputValue(normalized);
    onChange(normalized);

    // Verificar contraste se tiver background e text
    if (showContrastWarning && backgroundColor && textColor) {
      const contrastResult = evaluateContrast(normalized, backgroundColor);
      setContrastInfo(contrastResult);

      if (contrastResult.contrast < 4.5) {
        setContrastWarning(
          `Contraste baixo: ${contrastResult.contrast.toFixed(
            2
          )}:1 (recomendado: 4.5:1 para WCAG AA)`
        );
      }
    }

    return true;
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);

    // Validar quando o input tiver 7 caracteres (formato completo #RRGGBB)
    // ou 4 caracteres (formato abreviado #RGB)
    if (newValue.length === 7 || newValue.length === 4) {
      validateAndUpdateColor(newValue);
    }
  };

  const handleColorPickerChange = (color: string) => {
    validateAndUpdateColor(color);
  };

  const handleInputBlur = () => {
    // Validar quando o usuário sair do campo
    if (inputValue && inputValue !== value) {
      validateAndUpdateColor(inputValue);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      validateAndUpdateColor(inputValue);
    }
  };

  const getContrastIcon = () => {
    if (!contrastInfo) return null;

    if (contrastInfo.meetsWCAGAAA) {
      return <CheckCircle size={16} className="text-green-600" />;
    } else if (contrastInfo.meetsWCAGAA) {
      return <Info size={16} className="text-blue-600" />;
    } else {
      return <WarningCircle size={16} className="text-yellow-600" />;
    }
  };

  const getContrastStatus = () => {
    if (!contrastInfo) return "";

    if (contrastInfo.meetsWCAGAAA) {
      return "Excelente contraste (WCAG AAA)";
    } else if (contrastInfo.meetsWCAGAA) {
      return "Bom contraste (WCAG AA)";
    } else {
      return "Contraste baixo";
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="flex items-center space-x-3">
        <input
          type="color"
          value={value}
          onChange={(e) => handleColorPickerChange(e.target.value)}
          className="w-12 h-10 border border-gray-300 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
        />

        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            className={`w-full px-3 py-2 border rounded-md font-mono text-sm ${
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            } focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed`}
            placeholder={placeholder}
            disabled={disabled}
          />

          {/* Indicador de status */}
          {contrastInfo && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {getContrastIcon()}
            </div>
          )}
        </div>
      </div>

      {/* Erro de validação */}
      {error && (
        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
          <WarningCircle size={16} />
          {error}
        </p>
      )}

      {/* Aviso de contraste */}
      {contrastWarning && (
        <p className="text-sm text-yellow-600 mt-1 flex items-center gap-1">
          <WarningCircle size={16} />
          {contrastWarning}
        </p>
      )}

      {/* Informações de contraste */}
      {contrastInfo && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">
              Contraste: {contrastInfo.contrast.toFixed(2)}:1
            </span>
            <span
              className={`text-xs px-2 py-1 rounded ${
                contrastInfo.meetsWCAGAAA
                  ? "bg-green-100 text-green-800"
                  : contrastInfo.meetsWCAGAA
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {getContrastStatus()}
            </span>
          </div>

          <div className="mt-1 text-gray-500">
            <p>• WCAG AA: mínimo 4.5:1 para texto normal</p>
            <p>• WCAG AAA: mínimo 7:1 para texto normal</p>
          </div>
        </div>
      )}

      {/* Preview da cor */}
      <div className="mt-2 flex items-center space-x-2">
        <span className="text-xs text-gray-500">Preview:</span>
        <div
          className="w-6 h-6 rounded border border-gray-300"
          style={{ backgroundColor: value }}
        />
        <span className="text-xs font-mono text-gray-600">{value}</span>
      </div>
    </div>
  );
};

export default ColorInput;
