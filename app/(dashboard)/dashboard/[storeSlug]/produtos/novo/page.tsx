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
  CreateProductDto,
  ProductAddonDto,
  ProductIngredientDto,
} from "@/types/cardapio-api";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface Category {
  id: string;
  name: string;
}

/** =========================
 * Helpers de sanitização/formatos
 * ========================= */

// Letras (inclui acentos) e espaços
const sanitizeLetters = (value: string) =>
  value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "");

// Apenas inteiros (positivo)
const sanitizeInteger = (value: string) => value.replace(/[^\d]/g, "");

// Decimais (permite dígitos, ponto e vírgula; normaliza para ponto e 1 separador)
const sanitizeDecimalToString = (value: string) => {
  let v = value.replace(/[^0-9.,-]/g, "");
  // Permite um sinal negativo apenas na primeira posição (a seguir bloqueamos preços negativos ao salvar)
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

// Formata número para BRL (R$)
const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);

/** =========================
 * Tipos locais (UI)
 * ========================= */

type UIIngredient = {
  id: string;
  name: string;
  selected: boolean;
};

type UIAddon = {
  id: string;
  name: string;
  priceText: string; // texto formatado para exibição
  price: number; // valor numérico
};

type BaseOptions = {
  breadType?: string; // Hambúrguer
  doneness?: string; // Hambúrguer – ponto da carne
  doughType?: string; // Pizza
  pizzaSize?: string; // Pizza
  beverageSize?: string; // Bebida
};

/** =========================
 * Catálogos default
 * ========================= */

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

/** =========================
 * Componente
 * ========================= */

export default function NovoProdutoPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.storeSlug as string;
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { parseAndFormatBRL, formatBRL } = useCurrencyFormatter();

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

  // Opções por categoria (tipo do pão/ massa / tamanho, etc.)
  const [baseOptions, setBaseOptions] = useState<BaseOptions>({});

  // Ingredientes disponíveis (com seleção)
  const [ingredients, setIngredients] = useState<UIIngredient[]>([]);
  const [newIngredient, setNewIngredient] = useState("");

  // Adicionais dinâmicos
  const [addons, setAddons] = useState<UIAddon[]>([]);

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
   * Carregar categorias
   * ========================= */
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

  /** =========================
   * Reagir à categoria selecionada
   * ========================= */
  useEffect(() => {
    if (!formData.categoryId || categories.length === 0) return;
    const currentCat = categories.find((c) => c.id === formData.categoryId);
    const catName = (currentCat?.name || "").toLowerCase();

    // Ingredientes default
    let defaults: string[] = [];
    if (catName.includes("hamb")) defaults = DEFAULT_INGREDIENTS.HAMBURGUER;
    else if (catName.includes("pizza")) defaults = DEFAULT_INGREDIENTS.PIZZA;
    else if (catName.includes("beb") || catName.includes("drink"))
      defaults = DEFAULT_INGREDIENTS.BEBIDA;

    setIngredients(
      defaults.map((name, idx) => ({
        id: `def-${idx}`,
        name,
        selected: true,
      }))
    );

    // Adicionais default
    setAddons(
      DEFAULT_ADDONS.map((name, idx) => ({
        id: `addon-${idx}`,
        name,
        priceText: "", // usuário define o preço extra se quiser
        price: 0,
      }))
    );

    // Opções base iniciais
    if (catName.includes("hamb")) {
      setBaseOptions({
        breadType: "Brioche",
        doneness: "Ao ponto",
      });
    } else if (catName.includes("pizza")) {
      setBaseOptions({
        doughType: "Tradicional",
        pizzaSize: "Média (30cm)",
      });
    } else if (catName.includes("beb") || catName.includes("drink")) {
      setBaseOptions({
        beverageSize: "Lata 350ml",
      });
    } else {
      setBaseOptions({});
    }
  }, [formData.categoryId, categories]);

  /** =========================
   * Handlers de mudança por campo
   * ========================= */

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
    setFormData((prev) => ({ ...prev, description: value }));
  };

  const handleImageChange = (value: string) => {
    const v = value.trim();
    setFormData((prev) => ({ ...prev, image: v || undefined }));
  };

  const handleActiveChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, active: checked }));
  };

  // Base options handlers
  const setBase = (updates: Partial<BaseOptions>) =>
    setBaseOptions((prev) => ({ ...prev, ...updates }));

  // Ingredientes
  const toggleIngredient = (id: string) => {
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === id ? { ...ing, selected: !ing.selected } : ing
      )
    );
  };

  const addCustomIngredient = () => {
    const name = newIngredient.trim();
    if (!name) return;

    // Verifica se já existe um ingrediente com o mesmo nome
    const exists = ingredients.some(
      (ing) => ing.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      showToast("Este ingrediente já foi adicionado", "error");
      return;
    }

    setIngredients((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, name, selected: true },
    ]);
    setNewIngredient("");
  };

  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  // Adicionais
  const addAddonRow = () => {
    setAddons((prev) => [
      ...prev,
      { id: `row-${Date.now()}`, name: "", priceText: "", price: 0 },
    ]);
  };

  const updateAddon = (id: string, updates: Partial<UIAddon>) => {
    setAddons((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;

        const newAddon = { ...a };

        if ("name" in updates) {
          newAddon.name = updates.name ?? "";
        }

        if ("priceText" in updates) {
          const { text, value } = parseAndFormatBRL(updates.priceText ?? "");
          newAddon.priceText = text;
          newAddon.price = value;
        }

        return newAddon;
      })
    );
  };

  const removeAddon = (id: string) => {
    setAddons((prev) => prev.filter((a) => a.id !== id));
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
    setBaseOptions({});
    setIngredients([]);
    setAddons([]);
  };

  /** =========================
   * Submit
   * ========================= */
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

    // Validação de ingredientes selecionados
    const selectedIngredients = ingredients.filter((i) => i.selected);
    if (selectedIngredients.length === 0) {
      showToast("Selecione pelo menos um ingrediente", "error");
      return;
    }

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

    setIsLoading(true);
    try {
      const productData: CreateProductDto & {
        baseOptions?: BaseOptions;
      } = {
        storeSlug: slug,
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        price: price || 0,
        description: formData.description || "",
        image: formData.image || undefined,
        originalPrice: originalPrice,
        active: formData.active,
        ingredients: finalIngredients,
        addons: normalizedAddons,
        tags: optionTags,
        initialStock: initialStock >= 0 ? initialStock : 0,
        minStock: minStock >= 0 ? minStock : 0,
        baseOptions,
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

  /** =========================
   * UI
   * ========================= */
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
                          Dica: use nomes curtos e claros (ex.: “Bacon Crisp”)
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
