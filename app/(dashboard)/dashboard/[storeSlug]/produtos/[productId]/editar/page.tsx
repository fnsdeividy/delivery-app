"use client";

import { ProtectedProductRoute } from "@/components/ProtectedProductRoute";
import { useCardapioAuth } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { Product, UpdateProductDto } from "@/types/cardapio-api";
import { ArrowLeft, Plus, X } from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Ingredient {
  name: string;
  included: boolean;
  removable: boolean;
}

interface Addon {
  name: string;
  price: number;
  category: string;
  maxQuantity: number;
  active: boolean;
}

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function parseAndFormatBRL(raw: string): { text: string; value: number } {
  const onlyDigits = (raw ?? "").replace(/\D+/g, "");
  if (!onlyDigits) return { text: "", value: 0 };
  const safeDigits = onlyDigits.slice(0, 15);
  const cents = Number(safeDigits);
  const value = cents / 100;
  return { text: brl.format(value), value };
}

function formatBRL(value: number): string {
  try {
    return brl.format(isFinite(value) ? value : 0);
  } catch {
    return "R$ 0,00";
  }
}

function parseIntegerDigits(raw: string, maxLen = 9): { text: string; value: number } {
  const digits = (raw ?? "").replace(/\D+/g, "").slice(0, maxLen);
  if (!digits) return { text: "", value: 0 };
  const normalized = String(parseInt(digits, 10));
  const safe = Number.isFinite(Number(normalized)) ? Number(normalized) : 0;
  return { text: normalized, value: safe };
}

export default function EditarProdutoPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.storeSlug as string;
  const productId = params.productId as string;
  const { isAuthenticated, getCurrentToken } = useCardapioAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<UpdateProductDto>({
    name: "",
    description: "",
    price: 0,
    originalPrice: 0,
    categoryId: "",
    image: undefined,
    active: true,
    ingredients: [],
    addons: [],
    tags: [],
    tagColor: "#3B82F6",
    initialStock: 0,
    minStock: 5,
  });

  const [priceText, setPriceText] = useState<string>("");
  const [originalPriceText, setOriginalPriceText] = useState<string>("");
  const [initialStockText, setInitialStockText] = useState<string>("");
  const [minStockText, setMinStockText] = useState<string>("");

  const [newIngredient, setNewIngredient] = useState<Ingredient>({
    name: "",
    included: true,
    removable: true,
  });

  const [newAddon, setNewAddon] = useState<Addon>({
    name: "",
    price: 0,
    category: "",
    maxQuantity: 1,
    active: true,
  });
  const [newAddonPriceText, setNewAddonPriceText] = useState<string>("");
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    loadCategories();
    loadProduct();
  }, [slug, productId]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        originalPrice: product.originalPrice || 0,
        categoryId: product.categoryId || "",
        image: product.image || undefined,
        active: product.active ?? true,
        ingredients: product.ingredients || [],
        addons: product.addons || [],
        tags: product.tags || [],
        tagColor: product.tagColor || "#3B82F6",
        initialStock: product.initialStock ?? product.inventory?.quantity ?? 0,
        minStock: product.minStock ?? product.inventory?.minStock ?? 5,
      });

      setPriceText(product.price ? formatBRL(product.price) : "");
      setOriginalPriceText(product.originalPrice ? formatBRL(product.originalPrice) : "");
      const initialStockValue = product.initialStock ?? product.inventory?.quantity;
      setInitialStockText(
        initialStockValue && initialStockValue > 0 ? String(initialStockValue) : ""
      );

      const minStockValue = product.minStock ?? product.inventory?.minStock;
      setMinStockText(minStockValue && minStockValue > 0 ? String(minStockValue) : "");
    }
  }, [product]);

  const loadCategories = async () => {
    try {
      const response = await apiClient.get<any>(`/stores/${slug}/categories`);
      const categoriesData = response.data || response;
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error: any) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const loadProduct = async () => {
    try {
      setIsLoadingProduct(true);
      const productData = await apiClient.getProductById(productId, slug);
      setProduct(productData);
    } catch (error: any) {
      console.error("❌ Erro ao carregar produto:", error);
      showToast("Erro ao carregar produto", 'error');
      setTimeout(() => router.push(`/dashboard/${slug}/produtos`), 2000);
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      toast.style.transform = 'translateX(full)';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.categoryId || (formData.price || 0) <= 0) {
      showToast("Por favor, preencha todos os campos obrigatórios", 'error');
      return;
    }

    const dataToSend: UpdateProductDto & { storeSlug: string } = {
      ...formData,
      storeSlug: slug,
      price: Number(formData.price) || 0,
      originalPrice: (Number(formData.originalPrice) || 0) > 0 ? Number(formData.originalPrice) : undefined,
      image: formData.image?.trim() || undefined,
      description: formData.description?.trim() || "",
      initialStock: (Number(formData.initialStock) || 0) > 0 ? Number(formData.initialStock) : undefined,
      minStock: (Number(formData.minStock) || 0) > 0 ? Number(formData.minStock) : undefined,
    };

    try {
      setIsLoading(true);
      await apiClient.updateProduct(productId, dataToSend);
      showToast("Produto atualizado com sucesso!", 'success');
      setTimeout(() => {
        router.push(`/dashboard/${slug}/produtos`);
      }, 1000);
    } catch (error: any) {
      console.error("❌ Erro ao atualizar produto:", error);
      const apiErrorMessage = error.response?.data?.message;
      const detailedMessage = Array.isArray(apiErrorMessage) ? apiErrorMessage.join(', ') : apiErrorMessage;
      const errorMessage = detailedMessage || error.message || "Erro desconhecido ao atualizar produto";
      showToast(`Erro ao atualizar produto: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <ProtectedProductRoute storeSlug={slug} requiredAction="write">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando produto...</p>
            </div>
          </div>
        </div>
      </ProtectedProductRoute>
    );
  }

  if (!product) {
    return (
      <ProtectedProductRoute storeSlug={slug} requiredAction="write">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-6">
            <h3 className="text-sm font-medium text-red-800">Produto não encontrado</h3>
            <p className="mt-2 text-sm text-red-700">
              O produto que você está tentando editar não foi encontrado.
            </p>
            <button
              onClick={() => router.push(`/dashboard/${slug}/produtos`)}
              className="mt-4 bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
            >
              Voltar para Produtos
            </button>
          </div>
        </div>
      </ProtectedProductRoute>
    );
  }

  return (
    <ProtectedProductRoute storeSlug={slug} requiredAction="write">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push(`/dashboard/${slug}/produtos`)}
            className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
            type="button"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Editar Produto: {product.name}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Informações Básicas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      categoryId: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={priceText}
                  onChange={(e) => {
                    const { text, value } = parseAndFormatBRL(e.target.value);
                    setPriceText(text);
                    setFormData((prev) => ({ ...prev, price: value }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço Original
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={originalPriceText}
                  onChange={(e) => {
                    const { text, value } = parseAndFormatBRL(e.target.value);
                    setOriginalPriceText(text);
                    setFormData((prev) => ({ ...prev, originalPrice: value }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL da Imagem
              </label>
              <input
                type="url"
                value={formData.image || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, image: e.target.value || undefined }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, active: e.target.checked }))
                }
                className="mr-3 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Produto ativo (disponível para pedidos)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push(`/dashboard/${slug}/produtos`)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </ProtectedProductRoute>
  );
}
