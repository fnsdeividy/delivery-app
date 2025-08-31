"use client";

import ColorInput from "@/components/ui/ColorInput";
import FileUpload from "@/components/ui/FileUpload";
import { apiClient } from "@/lib/api-client";
import { useStoreConfig } from "@/lib/store/useStoreConfig";
import {
  evaluateContrast,
  validateHexColor,
} from "@/lib/utils/color-validation";
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  FloppyDisk,
  Palette,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ColorScheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

interface BrandingConfig {
  logo?: string;
  favicon?: string;
  banner?: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

interface FileUploadState {
  logo: { uploading: boolean };
  favicon: { uploading: boolean };
  banner: { uploading: boolean };
}

interface ValidationError {
  field: string;
  message: string;
}

export default function VisualConfigPage() {
  const params = useParams();
  const router = useRouter();
  const storeSlug = params?.storeSlug as string;

  const { config, loading, error } = useStoreConfig(storeSlug);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );

  const [branding, setBranding] = useState<BrandingConfig>({
    logo: "",
    favicon: "",
    banner: "",
    primaryColor: "#d97706",
    secondaryColor: "#92400e",
    backgroundColor: "#fef3c7",
    textColor: "#1f2937",
    accentColor: "#f59e0b",
  });

  const [fileUploads, setFileUploads] = useState<FileUploadState>({
    logo: { uploading: false },
    favicon: { uploading: false },
    banner: { uploading: false },
  });

  // Esquemas de cores pré-definidos
  const colorSchemes: ColorScheme[] = [
    {
      name: "Laranja Clássico",
      primaryColor: "#d97706",
      secondaryColor: "#92400e",
      backgroundColor: "#fef3c7",
      textColor: "#1f2937",
      accentColor: "#f59e0b",
    },
    {
      name: "Azul Profissional",
      primaryColor: "#2563eb",
      secondaryColor: "#1e40af",
      backgroundColor: "#eff6ff",
      textColor: "#1f2937",
      accentColor: "#3b82f6",
    },
    {
      name: "Verde Natural",
      primaryColor: "#059669",
      secondaryColor: "#047857",
      backgroundColor: "#ecfdf5",
      textColor: "#1f2937",
      accentColor: "#10b981",
    },
    {
      name: "Roxo Elegante",
      primaryColor: "#7c3aed",
      secondaryColor: "#5b21b6",
      backgroundColor: "#faf5ff",
      textColor: "#1f2937",
      accentColor: "#8b5cf6",
    },
    {
      name: "Rosa Moderno",
      primaryColor: "#db2777",
      secondaryColor: "#be185d",
      backgroundColor: "#fdf2f8",
      textColor: "#1f2937",
      accentColor: "#ec4899",
    },
  ];

  // Carregar configuração atual
  useEffect(() => {
    if (config?.branding) {
      setBranding({
        logo: config.branding.logo || "",
        favicon: config.branding.favicon || "",
        banner: config.branding.banner || "",
        primaryColor: config.branding.primaryColor || "#d97706",
        secondaryColor: config.branding.secondaryColor || "#92400e",
        backgroundColor: config.branding.backgroundColor || "#fef3c7",
        textColor: config.branding.textColor || "#1f2937",
        accentColor: config.branding.accentColor || "#f59e0b",
      });
    }
  }, [config]);

  // Debug: Monitorar mudanças no estado branding
  useEffect(() => {
    console.log("🔍 Estado branding atualizado:", branding);
  }, [branding]);

  // Aplicar esquema de cores
  const applyColorScheme = (scheme: ColorScheme) => {
    setBranding((prev) => ({
      ...prev,
      primaryColor: scheme.primaryColor,
      secondaryColor: scheme.secondaryColor,
      backgroundColor: scheme.backgroundColor,
      textColor: scheme.textColor,
      accentColor: scheme.accentColor,
    }));
  };

  // Validar configuração antes de salvar
  const validateConfig = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Validar cores
    try {
      validateHexColor(branding.primaryColor);
      validateHexColor(branding.secondaryColor);
      validateHexColor(branding.backgroundColor);
      validateHexColor(branding.textColor);
      validateHexColor(branding.accentColor);
    } catch (err) {
      errors.push({ field: "colors", message: "Cores inválidas detectadas" });
    }

    // Verificar contraste texto/background
    const textBackgroundContrast = evaluateContrast(
      branding.textColor,
      branding.backgroundColor
    );
    if (textBackgroundContrast.contrast < 4.5) {
      errors.push({
        field: "contrast",
        message: `Contraste entre texto e fundo muito baixo: ${textBackgroundContrast.contrast.toFixed(
          2
        )}:1 (mínimo recomendado: 4.5:1)`,
      });
    }

    return errors;
  };

  // Salvar configuração
  const saveConfig = async () => {
    try {
      // Validar antes de salvar
      const errors = validateConfig();
      if (errors.length > 0) {
        setValidationErrors(errors);
        setMessage({
          type: "error",
          text: "Erro de validação. Verifique os campos destacados.",
        });
        return;
      }

      setSaving(true);
      setMessage(null);
      setValidationErrors([]);

      // Preparar dados para salvar - Estrutura correta para a API
      const configData = {
        config: {
          logo: branding.logo,
          favicon: branding.favicon,
          banner: branding.banner,
          primaryColor: branding.primaryColor,
          secondaryColor: branding.secondaryColor,
          backgroundColor: branding.backgroundColor,
          textColor: branding.textColor,
          accentColor: branding.accentColor,
        },
      };


      // Chamar API para salvar
      const response = await apiClient.patch(
        `/stores/${storeSlug}/config`,
        configData
      );

      setMessage({
        type: "success",
        text: "Configuração salva com sucesso!",
      });

      // Limpar mensagem após 3 segundos
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error("Erro ao salvar configuração:", error);

      let errorMessage = "Erro ao salvar configuração";

      if (error?.status === 403) {
        errorMessage =
          "Acesso negado. Você não tem permissão para alterar esta configuração.";
      } else if (error?.status === 404) {
        errorMessage = "Loja não encontrada.";
      } else if (error?.status === 422) {
        errorMessage = "Dados inválidos. Verifique as informações enviadas.";
      } else if (error?.status === 500) {
        errorMessage = "Erro interno do servidor. Tente novamente mais tarde.";
      } else if (error?.status === 401) {
        errorMessage = "Sessão expirada. Faça login novamente.";
      }

      setMessage({
        type: "error",
        text: errorMessage,
      });

      setTimeout(() => setMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Upload de arquivo
  const handleFileUpload = async (
    file: File,
    type: "logo" | "favicon" | "banner"
  ) => {
    try {
      setFileUploads((prev) => ({
        ...prev,
        [type]: { uploading: true },
      }));

      setMessage(null);

      const response = await apiClient.upload(
        `/stores/${storeSlug}/upload`,
        file
      );

      // Atualizar estado local com nova URL
      const responseData = response as any;
      const newUrl = responseData.url || responseData.path || "";
      setBranding((prev) => ({
        ...prev,
        [type === "logo" ? "logo" : type === "favicon" ? "favicon" : "banner"]:
          newUrl,
      }));

      setMessage({
        type: "success",
        text: `${
          type === "logo" ? "Logo" : type === "favicon" ? "Favicon" : "Banner"
        } enviado com sucesso!`,
      });

      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error(`Erro ao enviar ${type}:`, error);

      let errorMessage = `Erro ao enviar ${type}`;

      if (error?.status === 403) {
        errorMessage =
          "Acesso negado. Você não tem permissão para fazer upload.";
      } else if (error?.status === 413) {
        errorMessage = "Arquivo muito grande. Use um arquivo menor.";
      } else if (error?.status === 415) {
        errorMessage = "Tipo de arquivo não suportado. Use JPG, PNG ou SVG.";
      } else if (error?.status === 500) {
        errorMessage = "Erro interno do servidor. Tente novamente mais tarde.";
      } else if (error?.status === 401) {
        errorMessage = "Sessão expirada. Faça login novamente.";
      }

      setMessage({
        type: "error",
        text: errorMessage,
      });

      setTimeout(() => setMessage(null), 5000);
    } finally {
      setFileUploads((prev) => ({
        ...prev,
        [type]: { uploading: false },
      }));
    }
  };

  // Remover arquivo
  const handleRemoveFile = (type: "logo" | "favicon" | "banner") => {
    setBranding((prev) => ({
      ...prev,
      [type === "logo" ? "logo" : type === "favicon" ? "favicon" : "banner"]:
        "",
    }));
  };

  // Renderizar loading
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  // Renderizar erro (sem forçar logout/redirect)
  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <WarningCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Problema ao carregar configurações
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>{error}</p>
              <p className="mt-2">
                Tente recarregar a página ou verificar sua conexão.
              </p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-200"
              >
                Recarregar Página
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aparência Visual</h1>
          <p className="text-gray-600">
            Personalize cores, logo, banner e identidade visual da sua loja
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2"
          >
            <Eye size={20} />
            {showPreview ? "Ocultar" : "Visualizar"}
          </button>

          <button
            onClick={saveConfig}
            disabled={saving}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FloppyDisk size={20} />
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      {/* Link Voltar */}
      <div className="flex items-center">
        <button
          onClick={() => router.push(`/dashboard/${storeSlug}`)}
          className="text-purple-600 hover:text-purple-700 flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={16} />
          Voltar ao Dashboard
        </button>
      </div>

      {/* Mensagens */}
      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle size={20} className="text-green-600" />
            ) : (
              <WarningCircle size={20} className="text-red-600" />
            )}
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Erros de validação */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-red-800 mb-2">
            Erros de Validação:
          </h3>
          <ul className="text-sm text-red-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações de Marca */}
        <div className="space-y-6">
          {/* Logo */}
          <FileUpload
            type="logo"
            currentValue={branding.logo}
            onFileSelect={(file) => handleFileUpload(file, "logo")}
            onRemove={() => handleRemoveFile("logo")}
            uploading={fileUploads.logo.uploading}
            accept="image/jpeg, image/png, image/svg+xml"
            maxSize="2MB"
            recommendedSize="PNG/SVG recomendado"
          />

          {/* Favicon */}
          <FileUpload
            type="favicon"
            currentValue={branding.favicon}
            onFileSelect={(file) => handleFileUpload(file, "favicon")}
            onRemove={() => handleRemoveFile("favicon")}
            uploading={fileUploads.favicon.uploading}
            accept="image/png, image/x-icon"
            maxSize="500KB"
            recommendedSize="32×32px PNG/ICO"
          />

          {/* Banner */}
          <FileUpload
            type="banner"
            currentValue={branding.banner}
            onFileSelect={(file) => handleFileUpload(file, "banner")}
            onRemove={() => handleRemoveFile("banner")}
            uploading={fileUploads.banner.uploading}
            accept="image/jpeg, image/png"
            maxSize="3MB"
            recommendedSize="1200×300px"
          />
        </div>

        {/* Esquemas de Cores */}
        <div className="space-y-6">
          {/* Esquemas Pré-definidos */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Esquemas de Cores
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {colorSchemes.map((scheme) => (
                <button
                  key={scheme.name}
                  onClick={() => applyColorScheme(scheme)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 text-left transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {scheme.name}
                    </span>
                    <Palette size={16} className="text-gray-400" />
                  </div>

                  <div className="flex space-x-2">
                    <div
                      className="w-6 h-6 rounded border border-gray-200"
                      style={{ backgroundColor: scheme.primaryColor }}
                    />
                    <div
                      className="w-6 h-6 rounded border border-gray-200"
                      style={{ backgroundColor: scheme.secondaryColor }}
                    />
                    <div
                      className="w-6 h-6 rounded border border-gray-200"
                      style={{ backgroundColor: scheme.accentColor }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Cores Personalizadas */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Cores Personalizadas
            </h3>

            <div className="space-y-4">
              <ColorInput
                label="Cor Primária"
                value={branding.primaryColor}
                onChange={(value) =>
                  setBranding((prev) => ({
                    ...prev,
                    primaryColor: value,
                  }))
                }
                backgroundColor={branding.backgroundColor}
                textColor={branding.textColor}
              />

              <ColorInput
                label="Cor Secundária"
                value={branding.secondaryColor}
                onChange={(value) =>
                  setBranding((prev) => ({
                    ...prev,
                    secondaryColor: value,
                  }))
                }
                backgroundColor={branding.backgroundColor}
                textColor={branding.textColor}
              />

              <ColorInput
                label="Cor de Fundo"
                value={branding.backgroundColor}
                onChange={(value) =>
                  setBranding((prev) => ({
                    ...prev,
                    backgroundColor: value,
                  }))
                }
                backgroundColor={branding.backgroundColor}
                textColor={branding.textColor}
              />

              <ColorInput
                label="Cor do Texto"
                value={branding.textColor}
                onChange={(value) =>
                  setBranding((prev) => ({
                    ...prev,
                    textColor: value,
                  }))
                }
                backgroundColor={branding.backgroundColor}
                textColor={branding.textColor}
              />

              <ColorInput
                label="Cor de Destaque"
                value={branding.accentColor}
                onChange={(value) =>
                  setBranding((prev) => ({
                    ...prev,
                    accentColor: value,
                  }))
                }
                backgroundColor={branding.backgroundColor}
                textColor={branding.textColor}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Preview da Identidade Visual
          </h3>

          <div
            className="p-6 rounded-lg border-2 border-dashed border-gray-300"
            style={{
              backgroundColor: branding.backgroundColor,
              color: branding.textColor,
            }}
          >
            <div className="text-center space-y-4">
              {branding.logo && (
                <img
                  src={branding.logo}
                  alt="Logo preview"
                  className="h-20 mx-auto object-contain"
                />
              )}

              <h4
                className="text-2xl font-bold"
                style={{ color: branding.primaryColor }}
              >
                Nome da Loja
              </h4>

              <p className="text-lg" style={{ color: branding.secondaryColor }}>
                Descrição da loja
              </p>

              <div className="flex justify-center space-x-4">
                <button
                  className="px-6 py-2 rounded-md font-medium"
                  style={{
                    backgroundColor: branding.primaryColor,
                    color: "#ffffff",
                  }}
                >
                  Botão Primário
                </button>

                <button
                  className="px-6 py-2 rounded-md font-medium border-2"
                  style={{
                    borderColor: branding.secondaryColor,
                    color: branding.secondaryColor,
                  }}
                >
                  Botão Secundário
                </button>
              </div>

              <div
                className="inline-block px-4 py-2 rounded-md text-sm font-medium"
                style={{
                  backgroundColor: branding.accentColor,
                  color: "#ffffff",
                }}
              >
                Destaque
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
