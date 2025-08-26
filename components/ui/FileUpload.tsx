"use client";

import { Trash, WarningCircle, X } from "@phosphor-icons/react";
import { useCallback, useRef, useState } from "react";

export interface FileUploadProps {
  type: "logo" | "favicon" | "banner" | "generic";
  currentValue?: string;
  onFileSelect: (file: File) => void;
  onRemove?: () => void;
  uploading?: boolean;
  accept: string;
  maxSize: string;
  recommendedSize?: string;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  onValidationError?: (error: string) => void;
}

export interface FileValidationRules {
  maxSizeBytes: number;
  allowedTypes: string[];
  allowedExtensions: string[];
}

const getValidationRules = (
  type: FileUploadProps["type"]
): FileValidationRules => {
  switch (type) {
    case "logo":
      return {
        maxSizeBytes: 2 * 1024 * 1024, // 2MB
        allowedTypes: ["image/jpeg", "image/png", "image/svg+xml"],
        allowedExtensions: [".jpg", ".jpeg", ".png", ".svg"],
      };
    case "favicon":
      return {
        maxSizeBytes: 500 * 1024, // 500KB
        allowedTypes: ["image/png", "image/x-icon"],
        allowedExtensions: [".png", ".ico"],
      };
    case "banner":
      return {
        maxSizeBytes: 3 * 1024 * 1024, // 3MB
        allowedTypes: ["image/jpeg", "image/png"],
        allowedExtensions: [".jpg", ".jpeg", ".png"],
      };
    default:
      return {
        maxSizeBytes: 5 * 1024 * 1024, // 5MB
        allowedTypes: ["image/*"],
        allowedExtensions: [".jpg", ".jpeg", ".png", ".gif", ".svg"],
      };
  }
};

const getTypeLabel = (type: FileUploadProps["type"]): string => {
  switch (type) {
    case "logo":
      return "Logo da Loja";
    case "favicon":
      return "Favicon";
    case "banner":
      return "Banner da Loja";
    default:
      return "Arquivo";
  }
};

const getPlaceholderIcon = (type: FileUploadProps["type"]): string => {
  switch (type) {
    case "logo":
      return "🏪";
    case "favicon":
      return "🔖";
    case "banner":
      return "🖼️";
    default:
      return "📁";
  }
};

const getPreviewDimensions = (type: FileUploadProps["type"]) => {
  switch (type) {
    case "logo":
      return "h-16 w-16";
    case "favicon":
      return "h-8 w-8";
    case "banner":
      return "w-full h-32";
    default:
      return "h-20 w-20";
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const FileUpload = ({
  type,
  currentValue,
  onFileSelect,
  onRemove,
  uploading = false,
  accept,
  maxSize,
  recommendedSize,
  className = "",
  disabled = false,
  showPreview = true,
  onValidationError,
}: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string>("");
  const [dragCounter, setDragCounter] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validationRules = getValidationRules(type);

  const validateFile = (file: File): string | null => {
    // Validar tipo MIME real
    if (
      !validationRules.allowedTypes.some((allowedType) => {
        if (allowedType === "image/*") {
          return file.type.startsWith("image/");
        }
        return validationRules.allowedTypes.includes(file.type);
      })
    ) {
      return `Tipo de arquivo não suportado. Use: ${validationRules.allowedExtensions.join(
        ", "
      )}`;
    }

    // Validar tamanho
    if (file.size > validationRules.maxSizeBytes) {
      return `Arquivo muito grande. Máximo: ${maxSize}`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      onValidationError?.(validationError);
      return;
    }

    setError("");
    onFileSelect(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setDragCounter((prev) => prev - 1);
      if (dragCounter > 0) return;

      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [dragCounter]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragCounter((prev) => prev - 1);
      if (dragCounter <= 1) {
        setIsDragOver(false);
      }
    },
    [dragCounter]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
    setError("");
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {getTypeLabel(type)}
      </h3>

      <div className="space-y-4">
        {/* Preview atual */}
        {showPreview && currentValue && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Arquivo atual:</span>
              <button
                onClick={handleRemove}
                disabled={disabled || uploading}
                className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash size={16} />
                Remover
              </button>
            </div>

            {type === "banner" ? (
              <img
                src={currentValue}
                alt={`${getTypeLabel(type)} atual`}
                className="w-full h-32 object-cover border border-gray-200 rounded"
              />
            ) : (
              <img
                src={currentValue}
                alt={`${getTypeLabel(type)} atual`}
                className={`${getPreviewDimensions(
                  type
                )} object-contain border border-gray-200 rounded`}
              />
            )}
          </div>
        )}

        {/* Área de upload */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
            isDragOver
              ? "border-purple-400 bg-purple-50 scale-[1.02]"
              : "border-gray-300 hover:border-gray-400"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onClick={() =>
            !disabled && !uploading && fileInputRef.current?.click()
          }
        >
          {uploading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-sm text-gray-600">Fazendo upload...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-4xl">{getPlaceholderIcon(type)}</div>
              <p className="text-sm text-gray-600">
                {disabled ? (
                  "Upload desabilitado"
                ) : (
                  <>
                    Arraste e solte um arquivo aqui, ou{" "}
                    <span className="text-purple-600 hover:text-purple-700 font-medium">
                      clique para escolher
                    </span>
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500">
                {accept} • Máximo: {maxSize}
                {recommendedSize && ` • Recomendado: ${recommendedSize}`}
              </p>
            </div>
          )}
        </div>

        {/* Input de arquivo oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || uploading}
        />

        {/* Erro de validação */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200 flex items-center gap-2">
            <WarningCircle size={16} className="text-red-500" />
            {error}
            <button
              onClick={() => setError("")}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Informações adicionais */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>
            • Formatos aceitos: {validationRules.allowedExtensions.join(", ")}
          </p>
          <p>• Tamanho máximo: {maxSize}</p>
          {recommendedSize && <p>• Tamanho recomendado: {recommendedSize}</p>}
          {type === "favicon" && (
            <p>• Para melhor compatibilidade, use PNG 32×32px</p>
          )}
          {type === "banner" && (
            <p>• Para melhor visualização, use 1200×300px</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
