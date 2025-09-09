"use client";

import { useStore, useUpdateStore } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { UpdateStoreDto } from "@/types/cardapio-api";
import { Eye, EyeSlash, Upload } from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface StoreVisualConfigProps {
  storeSlug: string;
}

interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export function StoreVisualConfig({ storeSlug }: StoreVisualConfigProps) {
  const [formData, setFormData] = useState<UpdateStoreDto>({
    config: {
      logo: "",
      banner: "",
      primaryColor: "#FF6B35",
      secondaryColor: "#2C3E50",
      accentColor: "#E74C3C",
      backgroundColor: "#FFFFFF",
      textColor: "#2C3E50",
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Buscar dados da loja
  const { data: storeData, isLoading: isLoadingStore } = useStore(storeSlug);
  const updateStoreMutation = useUpdateStore();

  // Inicializar formulário com dados da loja
  useEffect(() => {
    if (storeData) {
      setFormData({
        config: {
          logo: storeData.config?.logo || "",
          banner: storeData.config?.banner || "",
          primaryColor: storeData.config?.primaryColor || "#FF6B35",
          secondaryColor: storeData.config?.secondaryColor || "#2C3E50",
          accentColor: storeData.config?.accentColor || "#E74C3C",
          backgroundColor: storeData.config?.backgroundColor || "#FFFFFF",
          textColor: storeData.config?.textColor || "#2C3E50",
        },
      });
    }
  }, [storeData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("config.")) {
      const fieldName = name.replace("config.", "");
      setFormData((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          [fieldName]: value,
        },
      }));
    }

    // Limpar erro do campo
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleColorChange = (colorType: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [colorType]: value,
      },
    }));
  };

  const handleFileUpload = async (file: File, type: "logo" | "banner") => {
    if (!file) return;

    try {
      // Fazer upload usando o apiClient
      const uploadResult = await apiClient.upload<{
        success: boolean;
        fileName: string;
        fileSize: number;
        mimeType: string;
        url: string;
        path: string;
        message: string;
      }>(`/stores/${storeSlug}/upload`, file);

      // Atualizar o estado com a URL retornada pelo backend
      setFormData((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          [type]: uploadResult.url,
        },
      }));

      console.log(`Upload de ${type} realizado com sucesso:`, uploadResult);
    } catch (error: unknown) {
      console.error(`Erro ao fazer upload de ${type}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      alert(`Erro ao fazer upload da imagem: ${errorMessage}`);
    } finally {
      if (type === "logo") {
        setUploadingLogo(false);
      } else {
        setUploadingBanner(false);
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.config?.primaryColor) {
      newErrors.primaryColor = "Cor primária é obrigatória";
    }

    if (!formData.config?.secondaryColor) {
      newErrors.secondaryColor = "Cor secundária é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await updateStoreMutation.mutateAsync({
        slug: storeSlug,
        storeData: formData,
      });

      // Sucesso
      alert("Configurações visuais atualizadas com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar configurações visuais:", error);
      alert("Erro ao atualizar configurações visuais");
    }
  };

  const resetToDefaults = () => {
    setFormData({
      config: {
        logo: "",
        banner: "",
        primaryColor: "#FF6B35",
        secondaryColor: "#2C3E50",
        accentColor: "#E74C3C",
        backgroundColor: "#FFFFFF",
        textColor: "#2C3E50",
      },
    });
  };

  if (isLoadingStore) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">
          Carregando configurações visuais...
        </span>
      </div>
    );
  }

  const colorScheme: ColorScheme = {
    primary: formData.config?.primaryColor || "#FF6B35",
    secondary: formData.config?.secondaryColor || "#2C3E50",
    accent: formData.config?.accentColor || "#E74C3C",
    background: formData.config?.backgroundColor || "#FFFFFF",
    text: formData.config?.textColor || "#2C3E50",
  };

  return (
    <div className="space-y-6">
      {/* Header com Preview */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Configurações Visuais
        </h3>
        <button
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {isPreviewMode ? (
            <>
              <EyeSlash className="w-4 h-4 mr-2" />
              Ocultar Preview
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Ver Preview
            </>
          )}
        </button>
      </div>

      {/* Preview da Loja */}
      {isPreviewMode && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            Preview da Loja
          </h4>
          <div
            className="w-full h-48 rounded-lg relative overflow-hidden"
            style={{ backgroundColor: colorScheme.background }}
          >
            {/* Banner */}
            {formData.config?.banner && (
              <div className="relative w-full h-full">
                <Image
                  src={formData.config.banner}
                  alt="Banner da loja"
                  fill
                  className="object-cover"
                  unoptimized
                  onError={() =>
                    setImageErrors((prev) => ({ ...prev, banner: true }))
                  }
                  onLoad={() =>
                    setImageErrors((prev) => ({ ...prev, banner: false }))
                  }
                />
              </div>
            )}

            {/* Logo */}
            {formData.config?.logo && (
              <div className="absolute top-4 left-4">
                <div className="relative w-16 h-16">
                  <Image
                    src={formData.config.logo}
                    alt="Logo da loja"
                    fill
                    className="rounded-lg object-cover"
                    unoptimized
                    onError={() =>
                      setImageErrors((prev) => ({ ...prev, logo: true }))
                    }
                    onLoad={() =>
                      setImageErrors((prev) => ({ ...prev, logo: false }))
                    }
                  />
                </div>
              </div>
            )}

            {/* Nome da Loja */}
            <div className="absolute bottom-4 left-4">
              <h2
                className="text-2xl font-bold"
                style={{ color: colorScheme.text }}
              >
                {storeData?.name || "Nome da Loja"}
              </h2>
              <p className="text-sm" style={{ color: colorScheme.primary }}>
                {storeData?.description || "Descrição da loja"}
              </p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="mt-4 flex space-x-2">
            <button
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: colorScheme.primary }}
            >
              Fazer Pedido
            </button>
            <button
              className="px-4 py-2 rounded-lg border font-medium"
              style={{
                borderColor: colorScheme.secondary,
                color: colorScheme.secondary,
              }}
            >
              Ver Cardápio
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload de Imagens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h4 className="text-md font-semibold text-gray-900 mb-4">
              Logo da Loja
            </h4>

            <div className="space-y-4">
              {formData.config?.logo && (
                <div className="flex justify-center">
                  <div className="relative w-24 h-24">
                    {imageErrors.logoPreview ? (
                      <div className="w-24 h-24 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-500">
                          Erro ao carregar
                        </span>
                      </div>
                    ) : (
                      <Image
                        src={formData.config.logo}
                        alt="Logo atual"
                        fill
                        className="rounded-lg object-cover border border-gray-200"
                        unoptimized
                        onError={() =>
                          setImageErrors((prev) => ({
                            ...prev,
                            logoPreview: true,
                          }))
                        }
                        onLoad={() =>
                          setImageErrors((prev) => ({
                            ...prev,
                            logoPreview: false,
                          }))
                        }
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadingLogo(true);
                        handleFileUpload(file, "logo");
                      }
                    }}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      {uploadingLogo
                        ? "Fazendo upload..."
                        : "Clique para fazer upload"}
                    </span>
                  </div>
                </label>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Recomendado: 200x200px, formato PNG ou JPG
              </p>
            </div>
          </div>

          {/* Banner */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h4 className="text-md font-semibold text-gray-900 mb-4">
              Banner da Loja
            </h4>

            <div className="space-y-4">
              {formData.config?.banner && (
                <div className="flex justify-center">
                  <div className="relative w-full h-24">
                    {imageErrors.bannerPreview ? (
                      <div className="w-full h-24 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-500">
                          Erro ao carregar banner
                        </span>
                      </div>
                    ) : (
                      <Image
                        src={formData.config.banner}
                        alt="Banner atual"
                        fill
                        className="rounded-lg object-cover border border-gray-200"
                        unoptimized
                        onError={() =>
                          setImageErrors((prev) => ({
                            ...prev,
                            bannerPreview: true,
                          }))
                        }
                        onLoad={() =>
                          setImageErrors((prev) => ({
                            ...prev,
                            bannerPreview: false,
                          }))
                        }
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <label className="cursor-pointer w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadingBanner(true);
                        handleFileUpload(file, "banner");
                      }
                    }}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      {uploadingBanner
                        ? "Fazendo upload..."
                        : "Clique para fazer upload"}
                    </span>
                  </div>
                </label>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Recomendado: 1200x400px, formato PNG ou JPG
              </p>
            </div>
          </div>
        </div>

        {/* Esquema de Cores */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            Esquema de Cores
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Cor Primária */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor Primária
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.config?.primaryColor || "#FF6B35"}
                  onChange={(e) =>
                    handleColorChange("primaryColor", e.target.value)
                  }
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  name="config.primaryColor"
                  value={formData.config?.primaryColor || "#FF6B35"}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="#FF6B35"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Usada para botões principais e destaques
              </p>
            </div>

            {/* Cor Secundária */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor Secundária
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.config?.secondaryColor || "#2C3E50"}
                  onChange={(e) =>
                    handleColorChange("secondaryColor", e.target.value)
                  }
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  name="config.secondaryColor"
                  value={formData.config?.secondaryColor || "#2C3E50"}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="#2C3E50"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Usada para textos e elementos secundários
              </p>
            </div>

            {/* Cor de Destaque */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor de Destaque
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.config?.accentColor || "#E74C3C"}
                  onChange={(e) =>
                    handleColorChange("accentColor", e.target.value)
                  }
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  name="config.accentColor"
                  value={formData.config?.accentColor || "#E74C3C"}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="#E74C3C"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Usada para alertas e informações importantes
              </p>
            </div>

            {/* Cor de Fundo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor de Fundo
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.config?.backgroundColor || "#FFFFFF"}
                  onChange={(e) =>
                    handleColorChange("backgroundColor", e.target.value)
                  }
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  name="config.backgroundColor"
                  value={formData.config?.backgroundColor || "#FFFFFF"}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="#FFFFFF"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Cor de fundo principal da loja
              </p>
            </div>

            {/* Cor do Texto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor do Texto
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.config?.textColor || "#2C3E50"}
                  onChange={(e) =>
                    handleColorChange("textColor", e.target.value)
                  }
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  name="config.textColor"
                  value={formData.config?.textColor || "#2C3E50"}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="#2C3E50"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Cor principal dos textos
              </p>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={resetToDefaults}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Restaurar Padrões
          </button>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              {isPreviewMode ? "Ocultar Preview" : "Ver Preview"}
            </button>

            <button
              type="submit"
              disabled={updateStoreMutation.isPending}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateStoreMutation.isPending
                ? "Salvando..."
                : "Salvar Alterações"}
            </button>
          </div>
        </div>

        {/* Mensagens de Erro/Sucesso */}
        {updateStoreMutation.isError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 text-sm">
              Erro ao atualizar configurações visuais:{" "}
              {updateStoreMutation.error?.message}
            </p>
          </div>
        )}

        {updateStoreMutation.isSuccess && (
          <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
            <p className="text-purple-700 text-sm">
              ✅ Configurações visuais atualizadas com sucesso!
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
