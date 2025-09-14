"use client";

import { ProtectedProductRoute } from "@/components/ProtectedProductRoute";
import { ProductBasicInfo } from "@/components/products/ProductBasicInfo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useToast } from "@/hooks/useToast";
import { apiClient } from "@/lib/api-client";
import {
  Product,
  ProductAddonDto,
  ProductIngredientDto,
  UpdateProductDto,
} from "@/types/cardapio-api";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

type UIIngredient = {
  id: string;
  name: string;
  selected: boolean;
};

type UIAddon = {
  id: string;
  name: string;
  priceText: string;
  price: number;
};

type BaseOptions = {
  breadType?: string;
  doneness?: string;
  doughType?: string;
  pizzaSize?: string;
  beverageSize?: string;
};

// Funções auxiliares
const sanitizeLetters = (value: string | undefined | null) => {
  if (!value || typeof value !== "string") return "";
  return value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "");
};

const sanitizeInteger = (value: string | undefined | null) => {
  if (!value || typeof value !== "string") return "";
  return value.replace(/[^\d]/g, "");
};

const sanitizeDecimalToString = (value: string | undefined | null) => {
  if (!value || typeof value !== "string") return "";
  let v = value.replace(/[^0-9.,-]/g, "");
  if (v.includes("-")) {
    const neg = v.startsWith("-") ? "-" : "";
    v = neg + v.replace(/-/g, "");
  }
  v = v.replace(/,/g, ".");
  const parts = v.split(".");
  if (parts.length > 2) {
    v = parts[0] + "." + parts.slice(1).join("");
  }
  return v;
};

const parseDecimal = (value: string): number => {
  const normalized = sanitizeDecimalToString(value);
  const n = Number(normalized);
  return isNaN(n) ? 0 : n;
};

const isValidUrlOrEmpty = (value?: string) => {
  if (!value) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);

// Catálogos default
const DEFAULT_INGREDIENTS = {
  HAMBURGUER: [
    "Pão Brioche",
    "Hambúrguer 160g",
    "Queijo Mussarela",
    "Alface",
    "Tomate",
    "Cebola Roxa",
    "Molho da Casa",
  ],
  PIZZA: [
    "Molho de Tomate",
    "Mussarela",
    "Orégano",
    "Azeitona",
    "Tomate Fatiado",
    "Manjericão",
  ],
  BEBIDA: ["Gelo", "Limão"],
};

const DEFAULT_ADDONS = [
  "Mais Queijo",
  "Bacon",
  "Cheddar",
  "Calabresa",
  "Catupiry",
  "Pepperoni",
];

export default function EditarProdutoPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.storeSlug as string;
  const productId = params.productId as string;
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { parseAndFormatBRL, formatBRL } = useCurrencyFormatter();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);

  // Guardamos strings para inputs com máscara, e números no submit
  const [formData, setFormData] = useState({
    storeSlug: slug,
    name: "",
    categoryId: "",
    priceStr: "",
    originalPriceStr: "",
    description: "",
    image: undefined as string | undefined,
    active: true,
    initialStockStr: "0",
    minStockStr: "5",
    preparationTime: 0,
  });

  // Opções por categoria (tipo do pão/ massa / tamanho, etc.)
  const [baseOptions, setBaseOptions] = useState<BaseOptions>({});

  // Ingredientes disponíveis (com seleção)
  const [ingredients, setIngredients] = useState<UIIngredient[]>([]);
  const [newIngredient, setNewIngredient] = useState("");

  // Adicionais dinâmicos
  const [addons, setAddons] = useState<UIAddon[]>([]);

  // Tags
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  // Valores numéricos derivados
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

  /** =========================
   * Validação do formulário
   * ========================= */

  // Função para verificar se uma URL é válida ou vazia
  const isValidUrlOrEmpty = (url: string | undefined): boolean => {
    if (!url || !url.trim()) return true; // URL vazia é válida
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Validação dinâmica para habilitar/desabilitar botão de salvar
  const isFormValid = useMemo(() => {
    // Campos obrigatórios básicos
    if (!formData.name.trim() || !formData.categoryId) return false;

    // Preço válido
    if (price <= 0 || price > 999999.99) return false;

    // URL da imagem válida
    if (!isValidUrlOrEmpty(formData.image)) return false;

    return true;
  }, [formData.name, formData.categoryId, formData.image, price]);

  useEffect(() => {
    loadCategories();
    loadProduct();
  }, [slug, productId]);

  useEffect(() => {
    if (product) {
      setFormData({
        storeSlug: slug,
        name: product.name || "",
        categoryId: product.categoryId || "",
        priceStr: product.price ? String(product.price) : "",
        originalPriceStr: product.originalPrice
          ? String(product.originalPrice)
          : "",
        description: product.description || "",
        image: product.image || undefined,
        active: product.active ?? true,
        initialStockStr: String(product.inventory?.quantity ?? 0),
        minStockStr: String(product.inventory?.minStock ?? 5),
        preparationTime: product.preparationTime ?? 0,
      });

      // Carregar ingredientes
      const productIngredients = product.ingredients || [];
      setIngredients(
        productIngredients.map((ing, index) => ({
          id: `existing-${index}`,
          name: ing.name,
          selected: true,
        }))
      );

      // Carregar adicionais
      const productAddons = product.addons || [];
      setAddons(
        productAddons.map((addon, index) => ({
          id: `existing-${index}`,
          name: addon.name,
          price: Number(addon.price),
          priceText: addon.price > 0 ? formatBRL(Number(addon.price)) : "",
        }))
      );

      // Carregar tags
      setTags(product.tags || []);

      // Carregar opções base das tags
      const loadedBaseOptions: BaseOptions = {};
      product.tags?.forEach((tag) => {
        if (tag.startsWith("Pão: ")) {
          loadedBaseOptions.breadType = tag.replace("Pão: ", "");
        } else if (tag.startsWith("Ponto: ")) {
          loadedBaseOptions.doneness = tag.replace("Ponto: ", "");
        } else if (tag.startsWith("Massa: ")) {
          loadedBaseOptions.doughType = tag.replace("Massa: ", "");
        } else if (tag.startsWith("Tamanho: ")) {
          loadedBaseOptions.pizzaSize = tag.replace("Tamanho: ", "");
        } else if (tag.startsWith("Volume: ")) {
          loadedBaseOptions.beverageSize = tag.replace("Volume: ", "");
        }
      });
      setBaseOptions(loadedBaseOptions);
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
      showToast("Erro ao carregar produto", "error");
      setTimeout(() => router.push(`/dashboard/${slug}/produtos`), 2000);
    } finally {
      setIsLoadingProduct(false);
    }
  };

  // Funções para gerenciar ingredientes
  const addCustomIngredient = () => {
    if (!newIngredient.trim()) return;

    const newId = `custom-${Date.now()}`;
    setIngredients((prev) => [
      ...prev,
      {
        id: newId,
        name: newIngredient.trim(),
        selected: true,
      },
    ]);
    setNewIngredient("");
  };

  const toggleIngredient = (id: string) => {
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === id ? { ...ing, selected: !ing.selected } : ing
      )
    );
  };

  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  };

  // Funções para gerenciar adicionais
  const addAddonRow = () => {
    const newId = `addon-${Date.now()}`;
    setAddons((prev) => [
      ...prev,
      {
        id: newId,
        name: "",
        price: 0,
        priceText: "",
      },
    ]);
  };

  const updateAddon = (id: string, updates: Partial<UIAddon>) => {
    setAddons((prev) =>
      prev.map((addon) => {
        if (addon.id === id) {
          const updated = { ...addon, ...updates };

          // Se atualizou o priceText, recalcular o price
          if (updates.priceText !== undefined) {
            const { value } = parseAndFormatBRL(updates.priceText);
            updated.price = value;
          }

          return updated;
        }
        return addon;
      })
    );
  };

  const removeAddon = (id: string) => {
    setAddons((prev) => prev.filter((addon) => addon.id !== id));
  };

  // Funções para gerenciar tags
  const addTag = () => {
    if (!newTag.trim()) return;
    setTags((prev) => [...prev, newTag.trim()]);
    setNewTag("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  // Funções para gerenciar opções base
  const setBase = (updates: Partial<BaseOptions>) => {
    setBaseOptions((prev) => ({ ...prev, ...updates }));
  };

  // Funções para gerenciar formulário
  const handleNameChange = (value: string) => {
    setFormData((prev) => ({ ...prev, name: sanitizeLetters(value) }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData((prev) => ({ ...prev, categoryId }));

    // Carregar ingredientes padrão baseado na categoria
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      const categoryName = category.name.toLowerCase();
      let defaultIngredients: string[] = [];

      if (categoryName.includes("hamb")) {
        defaultIngredients = DEFAULT_INGREDIENTS.HAMBURGUER;
      } else if (categoryName.includes("pizza")) {
        defaultIngredients = DEFAULT_INGREDIENTS.PIZZA;
      } else if (
        categoryName.includes("beb") ||
        categoryName.includes("drink")
      ) {
        defaultIngredients = DEFAULT_INGREDIENTS.BEBIDA;
      }

      if (defaultIngredients.length > 0) {
        setIngredients((prev) => {
          const existingNames = prev.map((ing) => ing.name);
          const newIngredients = defaultIngredients
            .filter((name) => !existingNames.includes(name))
            .map((name) => ({
              id: `default-${name}`,
              name,
              selected: false,
            }));
          return [...prev, ...newIngredients];
        });
      }
    }
  };

  const handlePriceChange = (value: string) => {
    const { text, value: numValue } = parseAndFormatBRL(value);
    setFormData((prev) => ({ ...prev, priceStr: text }));
  };

  const handleOriginalPriceChange = (value: string) => {
    const { text, value: numValue } = parseAndFormatBRL(value);
    setFormData((prev) => ({ ...prev, originalPriceStr: text }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, description: value }));
  };

  const handleImageChange = (value: string) => {
    setFormData((prev) => ({ ...prev, image: value || undefined }));
  };

  const handleInitialStockChange = (value: string) => {
    const sanitized = sanitizeInteger(value);
    setFormData((prev) => ({ ...prev, initialStockStr: sanitized }));
  };

  const handleMinStockChange = (value: string) => {
    const sanitized = sanitizeInteger(value);
    setFormData((prev) => ({ ...prev, minStockStr: sanitized }));
  };

  const handleActiveChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, active: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // Validações básicas
    if (!formData.name.trim() || !formData.categoryId) {
      showToast("Nome e categoria são obrigatórios", "error");
      return;
    }

    if (price <= 0) {
      showToast("Preço deve ser maior que zero", "error");
      return;
    }

    if (!isValidUrlOrEmpty(formData.image)) {
      showToast("URL da imagem inválida", "error");
      return;
    }

    // Validação de ingredientes selecionados (opcional)
    const selectedIngredients = ingredients.filter((i) => i.selected);

    // Validação de adicionais com preços inválidos
    const invalidAddons = addons.filter((addon) => {
      return addon.name.trim() && addon.price < 0;
    });

    if (invalidAddons.length > 0) {
      showToast("Alguns adicionais têm preços inválidos", "error");
      return;
    }

    // Monta arrays finais
    const normalizedAddons: ProductAddonDto[] = addons
      .map((a) => ({
        name: a.name.trim(),
        price: a.price,
        active: true,
      }))
      .filter((a) => a.name);

    const finalIngredients: ProductIngredientDto[] = selectedIngredients.map(
      (i) => ({
        name: i.name,
        removable: true,
        included: true,
      })
    );

    // Tags auxiliares com base nas opções selecionadas
    const optionTags: string[] = [];
    if (baseOptions.breadType) optionTags.push(`Pão: ${baseOptions.breadType}`);
    if (baseOptions.doneness) optionTags.push(`Ponto: ${baseOptions.doneness}`);
    if (baseOptions.doughType)
      optionTags.push(`Massa: ${baseOptions.doughType}`);
    if (baseOptions.pizzaSize)
      optionTags.push(`Tamanho: ${baseOptions.pizzaSize}`);
    if (baseOptions.beverageSize)
      optionTags.push(`Volume: ${baseOptions.beverageSize}`);

    // Combinar tags existentes com tags de opções
    const allTags = [
      ...tags.filter((tag) => !tag.includes(":")),
      ...optionTags,
    ];

    setIsLoading(true);
    try {
      const dataToSend: UpdateProductDto & { storeSlug: string } = {
        storeSlug: slug,
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        price: price || 0,
        description: formData.description || "",
        image: formData.image || undefined,
        originalPrice: originalPrice,
        active: formData.active,
        ingredients: finalIngredients, // Sempre enviar array, mesmo que vazio
        addons: normalizedAddons, // Sempre enviar array, mesmo que vazio
        tags: allTags,
        initialStock: initialStock >= 0 ? initialStock : 0,
        minStock: minStock >= 0 ? minStock : 0,
        ...(formData.preparationTime > 0 && {
          preparationTime: formData.preparationTime,
        }),
      };

      await apiClient.updateProduct(productId, dataToSend);
      showToast("Produto atualizado com sucesso!", "success");
      setTimeout(() => {
        router.push(`/dashboard/${slug}/produtos`);
      }, 1000);
    } catch (error: any) {
      console.error("❌ Erro ao atualizar produto:", error);
      const apiErrorMessage = error.response?.data?.message;
      const detailedMessage = Array.isArray(apiErrorMessage)
        ? apiErrorMessage.join(", ")
        : apiErrorMessage;
      const errorMessage =
        detailedMessage ||
        error.message ||
        "Erro desconhecido ao atualizar produto";
      showToast(`Erro ao atualizar produto: ${errorMessage}`, "error");
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
            <h3 className="text-sm font-medium text-red-800">
              Produto não encontrado
            </h3>
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
          <h1 className="text-2xl font-bold">Editar Produto: {product.name}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Básico */}
              <ProductBasicInfo
                formData={{
                  name: formData.name,
                  categoryId: formData.categoryId,
                  price: price,
                  originalPrice: originalPrice ?? 0,
                  description: formData.description,
                  image: formData.image,
                }}
                categories={categories}
                storeSlug={slug}
                onFormDataChange={(updates) => {
                  if (typeof updates.name === "string")
                    handleNameChange(updates.name);
                  if (typeof updates.categoryId === "string")
                    handleCategoryChange(updates.categoryId);
                  if (typeof updates.price !== "undefined")
                    handlePriceChange(String(updates.price ?? ""));
                  if (typeof updates.originalPrice !== "undefined")
                    handleOriginalPriceChange(
                      String(updates.originalPrice ?? "")
                    );
                  if (typeof updates.description === "string")
                    handleDescriptionChange(updates.description);
                  if (typeof updates.image === "string")
                    handleImageChange(updates.image);
                }}
              />

              {/* URL da Imagem */}
              <div className="space-y-2 mt-6">
                <label htmlFor="image" className="text-sm font-medium">
                  URL da Imagem
                </label>
                <input
                  id="image"
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

              {/* Opções por Categoria */}
              {formData.categoryId && (
                <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900">
                    Opções do Produto
                  </h3>

                  {/* Hambúrguer */}
                  {(() => {
                    const cat = categories.find(
                      (c) => c.id === formData.categoryId
                    );
                    const name = (cat?.name || "").toLowerCase();
                    if (name.includes("hamb")) {
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Tipo de Pão
                            </label>
                            <select
                              className="w-full px-3 py-2 border rounded-md"
                              value={baseOptions.breadType || ""}
                              onChange={(e) =>
                                setBase({ breadType: e.target.value })
                              }
                            >
                              {[
                                "Brioche",
                                "Australiano",
                                "Tradicional",
                                "Integral",
                              ].map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Ponto da Carne
                            </label>
                            <select
                              className="w-full px-3 py-2 border rounded-md"
                              value={baseOptions.doneness || ""}
                              onChange={(e) =>
                                setBase({ doneness: e.target.value })
                              }
                            >
                              {[
                                "Mal passado",
                                "Ao ponto",
                                "Ao ponto para mais",
                                "Bem passado",
                              ].map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    }
                    if (name.includes("pizza")) {
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Tipo de Massa
                            </label>
                            <select
                              className="w-full px-3 py-2 border rounded-md"
                              value={baseOptions.doughType || ""}
                              onChange={(e) =>
                                setBase({ doughType: e.target.value })
                              }
                            >
                              {[
                                "Tradicional",
                                "Fina",
                                "Grossa",
                                "Napolitana",
                                "Integral",
                              ].map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Tamanho
                            </label>
                            <select
                              className="w-full px-3 py-2 border rounded-md"
                              value={baseOptions.pizzaSize || ""}
                              onChange={(e) =>
                                setBase({ pizzaSize: e.target.value })
                              }
                            >
                              {[
                                "Pequena (25cm)",
                                "Média (30cm)",
                                "Grande (35cm)",
                                "Família (40cm)",
                              ].map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    }
                    if (name.includes("beb") || name.includes("drink")) {
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Volume
                            </label>
                            <select
                              className="w-full px-3 py-2 border rounded-md"
                              value={baseOptions.beverageSize || ""}
                              onChange={(e) =>
                                setBase({ beverageSize: e.target.value })
                              }
                            >
                              {[
                                "Lata 350ml",
                                "Garrafa 600ml",
                                "1 Litro",
                                "1,5 Litro",
                              ].map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}

              {/* Ingredientes */}
              <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">
                  Ingredientes
                </h3>

                {ingredients.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Selecione uma categoria para carregar sugestões de
                    ingredientes ou adicione os seus abaixo.
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {ingredients.map((ing) => (
                    <label
                      key={ing.id}
                      className="flex items-center justify-between gap-2 px-3 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={ing.selected}
                          onChange={() => toggleIngredient(ing.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          aria-describedby={`ingredient-${ing.id}-description`}
                        />
                        <span id={`ingredient-${ing.id}-description`}>
                          {ing.name}
                        </span>
                      </div>
                      {ing.id.startsWith("custom-") && (
                        <button
                          type="button"
                          onClick={() => removeIngredient(ing.id)}
                          className="text-red-600 hover:underline text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded px-1"
                          title={`Remover ingrediente ${ing.name}`}
                          aria-label={`Remover ingrediente ${ing.name}`}
                        >
                          Remover
                        </button>
                      )}
                    </label>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomIngredient();
                      }
                    }}
                    placeholder="Adicionar ingrediente (ex.: Mais Queijo)"
                    className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Nome do novo ingrediente"
                  />
                  <Button
                    type="button"
                    onClick={addCustomIngredient}
                    disabled={!newIngredient.trim()}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Marque/desmarque para incluir no produto. Você pode adicionar
                  ingredientes personalizados.
                </p>
              </div>

              {/* Adicionais */}
              <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Adicionais (Extras)
                  </h3>
                  <Button type="button" variant="outline" onClick={addAddonRow}>
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar linha
                  </Button>
                </div>

                {addons.map((addon, index) => {
                  const brl =
                    addon.price > 0 ? formatBRL(addon.price) : "Sem custo";
                  return (
                    <div
                      key={addon.id}
                      className="grid grid-cols-1 md:grid-cols-[1fr_220px_40px] gap-3 items-start"
                    >
                      {/* Nome do adicional */}
                      <div className="space-y-1">
                        <label
                          className="sr-only"
                          htmlFor={`addon-name-${index}`}
                        >
                          Nome do adicional {index + 1}
                        </label>
                        <input
                          id={`addon-name-${index}`}
                          type="text"
                          value={addon.name}
                          onChange={(e) =>
                            updateAddon(addon.id, { name: e.target.value })
                          }
                          placeholder="Ex.: Mais queijo, Bacon, Cheddar..."
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label={`Nome do adicional ${index + 1}`}
                        />
                        <p className="text-[11px] text-gray-500">
                          Dica: use nomes curtos e claros (ex.: "Bacon Crisp")
                        </p>
                      </div>

                      {/* Preço extra com preview BRL */}
                      <div className="space-y-1">
                        <label
                          className="sr-only"
                          htmlFor={`addon-price-${index}`}
                        >
                          Preço do adicional {index + 1}
                        </label>

                        <input
                          id={`addon-price-${index}`}
                          type="text"
                          inputMode="numeric"
                          value={addon.priceText}
                          onChange={(e) =>
                            updateAddon(addon.id, {
                              priceText: e.target.value,
                            })
                          }
                          onBlur={() => {
                            updateAddon(addon.id, {
                              priceText:
                                addon.price > 0 ? formatBRL(addon.price) : "",
                            });
                          }}
                          placeholder="R$ 0,00"
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label={`Preço do adicional ${index + 1}`}
                        />

                        <p className="text-[11px] text-gray-500">
                          Digite apenas números (ex.: 250 vira R$ 2,50)
                        </p>
                      </div>

                      {/* Remover */}
                      <div className="h-10 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeAddon(addon.id)}
                          className="h-10 w-10 flex items-center justify-center rounded-md border hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                          title={`Remover adicional ${addon.name || index + 1}`}
                          aria-label={`Remover adicional ${
                            addon.name || index + 1
                          }`}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                <p className="text-xs text-gray-500">
                  Deixe o preço vazio para adicional sem custo. O valor será
                  somado ao preço base no checkout (lógica no front/back).
                </p>
              </div>

              {/* Controle de Estoque */}
              <div className="space-y-4 mt-2 p-4 border border-gray-200 rounded-lg">
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

              {/* Tags */}
              <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">Tags</h3>

                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                        aria-label={`Remover tag ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Adicionar tag"
                    className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    disabled={!newTag.trim()}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Status Ativo */}
              <div className="flex items-center space-x-2 mt-2">
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
                  onClick={() => router.push(`/dashboard/${slug}/produtos`)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  className={`flex items-center gap-2 transition-colors ${
                    isFormValid && !isLoading
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-gray-400 cursor-not-allowed text-gray-200"
                  }`}
                  title={
                    !isFormValid
                      ? "Preencha todos os campos obrigatórios"
                      : "Salvar alterações"
                  }
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedProductRoute>
  );
}
