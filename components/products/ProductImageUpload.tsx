"use client";

import { useToast } from "@/hooks/useToast";
import { useOptimizedImage } from "@/hooks/useOptimizedImage";
import { apiClient } from "@/lib/api-client";
import { normalizeImageUrl } from "@/lib/utils";
import { Image as ImageIcon, UploadSimple, X } from "@phosphor-icons/react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useCallback, memo } from "react";

interface ProductImageUploadProps {
  imageUrl?: string;
  storeSlug: string;
  onImageChange: (url: string) => void;
}

const ProductImageUploadComponent = ({
  imageUrl,
  storeSlug,
  onImageChange,
}: ProductImageUploadProps) => {
  const { showToast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(
    imageUrl ? normalizeImageUrl(imageUrl) : null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Otimização de imagem
  const { src: optimizedSrc, loading: imageLoading, error: imageError } = useOptimizedImage({
    src: imagePreview || '',
    fallback: '/placeholder-image.png',
    quality: 80,
    lazy: true
  });

  const normalizeUrl = (url: string | undefined): string | null => {
    if (!url) return null;
    try {
      return normalizeImageUrl(url);
    } catch (e) {
      return url;
    }
  };

  const handleImageChange = useCallback((url: string) => {
    onImageChange(url);
    setImagePreview(normalizeUrl(url) || null);
  }, [onImageChange]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      showToast("Formato inválido. Use JPEG, PNG, GIF ou WEBP.", "error");
      return;
    }

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("Imagem muito grande. Tamanho máximo: 5MB", "error");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadTimer = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 300);

      const response = await apiClient.uploadProductImageByStore(
        storeSlug,
        file
      );
      clearInterval(uploadTimer);
      setUploadProgress(100);

      if (response && response.url) {
        handleImageChange(response.url);
        showToast("Imagem carregada com sucesso!", "success");
      } else {
        throw new Error("URL da imagem não retornada pelo servidor");
      }
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error);
      showToast(
        `Erro ao carregar imagem: ${error.message || "Erro desconhecido"}`,
        "error"
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    onImageChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="mt-4 space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Imagem do Produto
      </label>

      {/* Preview da imagem */}
      <div
        className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        {imagePreview ? (
          <div className="relative w-full h-48 mb-4">
            <Image
              src={imagePreview}
              alt="Preview do produto"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain rounded-lg"
              onError={() => {
                setImagePreview(null);
                showToast("Erro ao carregar imagem", "error");
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              title="Remover imagem"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="text-center">
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 text-purple-600 animate-spin mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Carregando imagem...
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">{uploadProgress}%</p>
              </div>
            ) : (
              <>
                <ImageIcon size={48} className="text-gray-400 mb-4" />
                <div className="flex items-center justify-center mb-2">
                  <UploadSimple size={20} className="text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-600">
                    Clique para fazer upload
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF ou WEBP até 5MB
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        disabled={isUploading}
      />

      {/* Campo de URL alternativo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ou insira uma URL de imagem
        </label>
        <input
          type="url"
          value={imageUrl || ""}
          onChange={(e) => handleImageChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="https://exemplo.com/imagem.jpg"
          disabled={isUploading}
        />
      </div>
    </div>
  );
};

// Memoizar o componente para evitar re-renders desnecessários
export const ProductImageUpload = memo(ProductImageUploadComponent);
