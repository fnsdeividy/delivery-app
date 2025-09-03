"use client";

import { ProtectedProductRoute } from "@/components/ProtectedProductRoute";
import { ProductBasicInfo } from "@/components/products/ProductBasicInfo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { apiClient } from "@/lib/api-client";
import { CreateProductDto } from "@/types/cardapio-api";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface Category {
  id: string;
  name: string;
}

// ======== Helpers de sanitização/validação ========

// Letras (inclui acentos) e espaços
const sanitizeLetters = (value: string) =>
  value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "");

// Apenas inteiros (positivo)
const sanitizeInteger = (value: string) => value.replace(/[^\d]/g, "");

// Decimais (permite dígitos, ponto e vírgula; normaliza para ponto e 1 separador)
const sanitizeDecimalToString = (value: string) => {
  // remove tudo que não for dígito ponto ou vírgula
  let v = value.replace(/[^0-9.,]/g, "");
  // troca vírgula por ponto
  v = v.replace(/,/g, ".");
  // mantém só o primeiro ponto
  const parts = v.split(".");
  if (parts.length > 2) {
    v = parts[0] + "." + parts.slice(1).join("");
  }
  return v;
};

// Converte string decimal (com . ou ,) para número
const parseDecimal = (value: string): number => {
  const normalized = sanitizeDecimalToString(value);
  const n = Number(normalized);
  return isNaN(n) ? 0 : n;
};

// Validação simples de URL (deixa vazio como válido)
const isValidUrlOrEmpty = (value?: string) => {
  if (!value) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export default function NovoProdutoPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.storeSlug as string;
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Guardamos strings para inputs com máscara, e números no submit
  const [formData, setFormData] = useState({
    storeSlug: slug,
    name: "",
    categoryId: "",
    priceStr: "", // string para digitação (aceita vírgula/ponto)
    originalPriceStr: "", // string para digitação (aceita vírgula/ponto)
    description: "",
    image: undefined as string | undefined,
    active: true,
    initialStockStr: "0", // inteiro como string
    minStockStr: "5", // inteiro como string
  });

  const price = useMemo(
    () => parseDecimal(formData.priceStr),
    [formData.priceStr]
  );
  const originalPrice = useMemo(
    () =>
      formData.originalPriceStr.trim()
        ? parseDecimal(formData.originalPriceStr)
        : undefined,
    [formData.originalPriceStr]
  );
  const initialStock = useMemo(
    () => Number(sanitizeInteger(formData.initialStockStr) || "0"),
    [formData.initialStockStr]
  );
  const minStock = useMemo(
    () => Number(sanitizeInteger(formData.minStockStr) || "0"),
    [formData.minStockStr]
  );

  // Carregar categorias
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await apiClient.getCategories(slug);
        setCategories(response);
      } catch (error: any) {
        console.error("Erro ao carregar categorias:", error);
        showToast("Erro ao carregar categorias", "error");
      }
    };

    if (isAuthenticated && slug) {
      loadCategories();
    }
  }, [isAuthenticated, slug, showToast]);

  // Handlers de mudança por campo (mais explícitos e seguros)
  const handleNameChange = (value: string) => {
    setFormData((prev) => ({ ...prev, name: sanitizeLetters(value) }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: value }));
  };

  const handlePriceChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      priceStr: sanitizeDecimalToString(value),
    }));
  };

  const handleOriginalPriceChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      originalPriceStr: sanitizeDecimalToString(value),
    }));
  };

  const handleInitialStockChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      initialStockStr: sanitizeInteger(value),
    }));
  };

  const handleMinStockChange = (value: string) => {
    setFormData((prev) => ({ ...prev, minStockStr: sanitizeInteger(value) }));
  };

  const handleDescriptionChange = (value: string) => {
    // descrição pode ter qualquer caractere legível; se quiser limitar, aplique regex
    setFormData((prev) => ({ ...prev, description: value }));
  };

  const handleImageChange = (value: string) => {
    const v = value.trim();
    setFormData((prev) => ({ ...prev, image: v || undefined }));
  };

  const handleActiveChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, active: checked }));
  };

  // Limpar formulário
  const clearForm = () => {
    setFormData({
      storeSlug: slug,
      name: "",
      categoryId: "",
      priceStr: "",
      originalPriceStr: "",
      description: "",
      image: undefined,
      active: true,
      initialStockStr: "0",
      minStockStr: "5",
    });
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    if (!formData.name.trim() || !formData.categoryId) {
      showToast("Nome e categoria são obrigatórios", "error");
      return;
    }

    if (!isValidUrlOrEmpty(formData.image)) {
      showToast("URL da imagem inválida", "error");
      return;
    }

    setIsLoading(true);

    try {
      const productData: CreateProductDto = {
        storeSlug: slug,
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        price: price || 0,
        description: formData.description || "",
        image: formData.image || undefined,
        originalPrice: originalPrice,
        active: formData.active,
        ingredients: [],
        addons: [],
        tags: [],
        initialStock: initialStock >= 0 ? initialStock : 0,
        minStock: minStock >= 0 ? minStock : 0,
      };

      await apiClient.createProduct(productData);
      showToast("Produto criado com sucesso!", "success");

      clearForm();

      setTimeout(() => {
        router.push(`/dashboard/${slug}/produtos`);
      }, 1200);
    } catch (error: any) {
      console.error("Erro ao criar produto:", error);
      const errorMessage =
        error?.response?.data?.message ||
        (Array.isArray(error?.response?.data?.message)
          ? error.response.data.message.join(", ")
          : "Erro ao criar produto");
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedProductRoute storeSlug={slug}>
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/${slug}/produtos`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Novo Produto</h1>
        </div>

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ProductBasicInfo já renderiza name, category, price, originalPrice, description.
                  Abaixo passamos valores já sanitizados e controlados. */}
              <ProductBasicInfo
                formData={{
                  name: formData.name,
                  categoryId: formData.categoryId,
                  price: price, // número já parseado
                  originalPrice: originalPrice ?? 0, // mantém compatibilidade se o componente espera number
                  description: formData.description,
                }}
                categories={categories}
                onFormDataChange={(updates) => {
                  // Fazemos roteamento por campo para sanitizar corretamente
                  if (typeof updates.name === "string")
                    handleNameChange(updates.name);
                  if (typeof updates.categoryId === "string")
                    handleCategoryChange(updates.categoryId);
                  if (typeof updates.price !== "undefined") {
                    handlePriceChange(String(updates.price ?? ""));
                  }
                  if (typeof updates.originalPrice !== "undefined") {
                    handleOriginalPriceChange(
                      String(updates.originalPrice ?? "")
                    );
                  }
                  if (typeof updates.description === "string")
                    handleDescriptionChange(updates.description);
                }}
              />

              {/* URL da Imagem */}
              <div className="space-y-2 mt-6">
                <label htmlFor="image" className="text-sm font-medium">
                  URL da Imagem
                </label>
                <input
                  id="image"
                  // type="url" às vezes é chato em navegadores com validação agressiva; usamos text com pattern e inputMode
                  type="text"
                  inputMode="url"
                  pattern="https?://.*"
                  value={formData.image ?? ""}
                  onChange={(e) => handleImageChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
                <p className="text-xs text-gray-500">
                  Aceita apenas URLs iniciando com http:// ou https://
                </p>
              </div>

              {/* Controle de Estoque */}
              <div className="space-y-4 mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900">
                  Controle de Estoque
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="initialStock"
                      className="text-sm font-medium text-gray-700"
                    >
                      Estoque Inicial
                    </label>
                    <input
                      id="initialStock"
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      value={formData.initialStockStr}
                      onChange={(e) => handleInitialStockChange(e.target.value)}
                      onBeforeInput={(e: any) => {
                        // bloqueia entrada não numérica em browsers que suportam
                        if (!/^\d*$/.test(e.data ?? "")) e.preventDefault();
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500">
                      Somente números inteiros (0, 1, 2...)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="minStock"
                      className="text-sm font-medium text-gray-700"
                    >
                      Estoque Mínimo
                    </label>
                    <input
                      id="minStock"
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      value={formData.minStockStr}
                      onChange={(e) => handleMinStockChange(e.target.value)}
                      onBeforeInput={(e: any) => {
                        if (!/^\d*$/.test(e.data ?? "")) e.preventDefault();
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="5"
                    />
                    <p className="text-xs text-gray-500">
                      Alerta quando estoque atingir este valor (inteiro)
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Ativo */}
              <div className="flex items-center space-x-2 mt-4">
                <input
                  id="active"
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => handleActiveChange(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="text-sm font-medium">
                  Produto ativo
                </label>
              </div>

              {/* Botões */}
              <div className="flex justify-between gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearForm}
                  disabled={isLoading}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Limpar Formulário
                </Button>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/dashboard/${slug}/produtos`)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isLoading ? "Salvando..." : "Salvar Produto"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedProductRoute>
  );
}
