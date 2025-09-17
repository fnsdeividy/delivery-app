"use client";

import { ProtectedProductRoute } from "@/components/ProtectedProductRoute";
import { ProductAvailability } from "@/components/products/ProductAvailability";
import { ProductBasicInfo } from "@/components/products/ProductBasicInfo";
import { ProductClassifications } from "@/components/products/ProductClassifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCardapioAuth } from "@/hooks/useCardapioAuth";
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
const sanitizeLetters = (value: string | undefined | null) => {
  if (!value || typeof value !== "string") return "";
  return value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "");
};

// Apenas inteiros (positivo)
const sanitizeInteger = (value: string | undefined | null) => {
  if (!value || typeof value !== "string") return "";
  return value.replace(/[^\d]/g, "");
};

// Decimais (permite dígitos, ponto e vírgula; normaliza para ponto e 1 separador)
const sanitizeDecimalToString = (value: string | undefined | null) => {
  if (!value || typeof value !== "string") return "";
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
  const { isAuthenticated } = useCardapioAuth();
  const { showToast } = useToast();
  const { parseAndFormatBRL, formatBRL } = useCurrencyFormatter();

  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formStartTime, setFormStartTime] = useState<number>(Date.now());
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Verificar autenticação e preparar redirecionamento
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = isAuthenticated();

      if (!authStatus) {
        setShouldRedirect(true);
      }
    };

    // Verificar imediatamente
    checkAuth();

    // Verificar novamente após um pequeno delay para garantir que o token foi carregado
    const timeoutId = setTimeout(checkAuth, 100);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated]);

  // Redirecionar se necessário
  useEffect(() => {
    if (shouldRedirect) {
      router.push("/login");
    }
  }, [shouldRedirect, router]);

  // Mostrar loading se não estiver autenticado
  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  // Guardamos strings para inputs com máscara, e números no submit
  const [formData, setFormData] = useState({
    storeSlug: slug,
    productType: "FOOD" as "FOOD" | "BEVERAGE",
    name: "",
    categoryId: "",
    priceStr: "", // string para digitação (aceita vírgula/ponto)
    originalPriceStr: "", // string para digitação (aceita vírgula/ponto)
    description: "",
    image: undefined as string | undefined,
    images: [] as string[],
    active: true,
    initialStockStr: "0", // inteiro como string
    minStockStr: "5", // inteiro como string
    // Fiscais
    ncm: "",
    cest: "",
    // Bebidas
    alcoholic: false,
    alcoholPercentageStr: "0",
    // Unidade/Porção
    unit: "",
    volumeStr: "",
    volumeUnit: "ml" as "ml" | "l",
    // Classificações e tags
    classifications: [] as string[],
    tags: [] as string[],
    tagColor: "blue" as string,
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
  const alcoholPercentage = useMemo(
    () => Number(sanitizeDecimalToString(formData.alcoholPercentageStr) || "0"),
    [formData.alcoholPercentageStr]
  );
  const volume = useMemo(
    () => Number(sanitizeDecimalToString(formData.volumeStr) || "0"),
    [formData.volumeStr]
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
   * Validação do formulário e funcionalidades UX
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

  // Validação por passo
  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        // Passo 1: Tipo de produto é sempre válido (tem valor padrão)
        return true;

      case 2:
        // Passo 2: Nome, categoria e preço são obrigatórios
        return (
          formData.name.trim() !== "" &&
          formData.categoryId !== "" &&
          price > 0 &&
          price <= 999999.99 &&
          isValidUrlOrEmpty(formData.image)
        );

      case 3:
        // Passo 3: Detalhes opcionais - validações específicas se preenchidos
        const hasInvalidAddons = addons.some(
          (addon) => addon.name.trim() && addon.price < 0
        );

        // Validação específica para bebidas alcoólicas
        const isBeverageValid =
          formData.productType !== "BEVERAGE" ||
          !formData.alcoholic ||
          (alcoholPercentage > 0 && alcoholPercentage <= 100);

        return !hasInvalidAddons && isBeverageValid;

      case 4:
        // Passo 4: Pré-visualização - todos os campos obrigatórios já validados
        return true;

      default:
        return false;
    }
  }, [
    currentStep,
    formData.name,
    formData.categoryId,
    formData.image,
    formData.productType,
    formData.alcoholic,
    price,
    alcoholPercentage,
    addons,
  ]);

  // Validação dinâmica para habilitar/desabilitar botão de salvar
  const isFormValid = useMemo(() => {
    // Campos obrigatórios básicos
    if (!formData.name.trim() || !formData.categoryId) return false;

    // Preço válido
    if (price <= 0 || price > 999999.99) return false;

    // URL da imagem válida
    if (!isValidUrlOrEmpty(formData.image)) return false;

    // Validação específica para bebidas alcoólicas
    if (
      formData.productType === "BEVERAGE" &&
      formData.alcoholic &&
      (alcoholPercentage <= 0 || alcoholPercentage > 100)
    ) {
      return false;
    }

    // Validação de adicionais com preços inválidos
    const hasInvalidAddons = addons.some(
      (addon) => addon.name.trim() && addon.price < 0
    );
    if (hasInvalidAddons) return false;

    return true;
  }, [
    formData.name,
    formData.categoryId,
    formData.image,
    formData.productType,
    formData.alcoholic,
    price,
    alcoholPercentage,
    addons,
  ]);

  // Scroll para o topo ao trocar de passo
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

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

    if (isAuthenticated() && slug) {
      loadCategories();
      setFormStartTime(Date.now());
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

  const handleProductTypeChange = (value: "FOOD" | "BEVERAGE") => {
    setFormData((prev) => ({ ...prev, productType: value }));
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

  const handleAddImageToGallery = (url: string) => {
    const v = url.trim();
    if (!v) return;
    setFormData((prev) => ({
      ...prev,
      images: Array.from(new Set([...(prev.images || []), v])),
    }));
  };

  const removeImageFromGallery = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((u) => u !== url),
    }));
  };

  const handleActiveChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, active: checked }));
  };

  const handleFiscalChange = (
    updates: Partial<Pick<typeof formData, "ncm" | "cest">>
  ) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleBeverageChange = (
    updates: Partial<
      Pick<typeof formData, "alcoholic" | "alcoholPercentageStr">
    >
  ) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleUnitPortionChange = (
    updates: Partial<Pick<typeof formData, "unit" | "volumeStr" | "volumeUnit">>
  ) => {
    setFormData((prev) => ({ ...prev, ...updates }));
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
      productType: "FOOD" as "FOOD" | "BEVERAGE",
      name: "",
      categoryId: "",
      priceStr: "",
      originalPriceStr: "",
      description: "",
      image: undefined,
      images: [],
      active: true,
      initialStockStr: "0",
      minStockStr: "5",
      // Fiscais
      ncm: "",
      cest: "",
      // Bebidas
      alcoholic: false,
      alcoholPercentageStr: "0",
      // Unidade/Porção
      unit: "",
      volumeStr: "",
      volumeUnit: "ml" as "ml" | "l",
      // Classificações e tags
      classifications: [],
      tags: [],
      tagColor: "blue",
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

    if (price <= 0 || price > 999999.99) {
      showToast("Preço deve ser maior que zero", "error");
      return;
    }

    if (
      formData.productType === "BEVERAGE" &&
      formData.alcoholic &&
      (alcoholPercentage <= 0 || alcoholPercentage > 100)
    ) {
      showToast("Teor alcoólico deve estar entre 0 e 100%", "error");
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

    setIsLoading(true);
    try {
      const productData: CreateProductDto & {
        baseOptions?: BaseOptions;
      } = {
        storeSlug: slug,
        productType: formData.productType,
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        price: price || 0,
        description: formData.description || "",
        image: formData.image || undefined,
        images:
          formData.images && formData.images.length > 0
            ? formData.images
            : undefined,
        originalPrice: originalPrice,
        active: formData.active,
        ncm: formData.ncm || undefined,
        cest: formData.cest || undefined,
        alcoholic:
          formData.productType === "BEVERAGE"
            ? !!formData.alcoholic
            : undefined,
        alcoholPercentage:
          formData.productType === "BEVERAGE" && formData.alcoholic
            ? alcoholPercentage
            : undefined,
        unit: formData.unit || undefined,
        volume: volume || undefined,
        volumeUnit: formData.volumeUnit || undefined,
        ingredients: finalIngredients.length > 0 ? finalIngredients : undefined,
        addons: normalizedAddons.length > 0 ? normalizedAddons : undefined,
        tags: [...optionTags, ...formData.tags],
        classifications:
          formData.classifications.length > 0
            ? formData.classifications
            : undefined,
        tagColor: formData.tagColor !== "blue" ? formData.tagColor : undefined,
        initialStock: initialStock >= 0 ? initialStock : 0,
        minStock: minStock >= 0 ? minStock : 0,
        baseOptions,
      };

      await apiClient.createProduct(productData);
      showToast("Produto criado com sucesso!", "success");

      // Métrica de duração
      try {
        const durationMs = Date.now() - formStartTime;
        await apiClient.logProductFormMetric({
          storeSlug: slug,
          durationMs,
          completed: true,
        });
      } catch {}

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
            <CardTitle>Cadastro de Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Steps Indicator */}
              <div
                className="flex items-center gap-3 mb-2"
                aria-label="Etapas do cadastro"
              >
                {[1, 2, 3, 4].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCurrentStep(s as 1 | 2 | 3 | 4)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium border ${
                      currentStep === s
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                    aria-current={currentStep === s ? "step" : undefined}
                  >
                    {`Passo ${s}`}
                  </button>
                ))}
              </div>

              {/* Passo 1: Tipo de Produto */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Tipo de Produto</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Tipo
                      </label>
                      <select
                        value={formData.productType}
                        onChange={(e) =>
                          handleProductTypeChange(e.target.value as any)
                        }
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Selecione se é comida ou bebida"
                      >
                        <option value="FOOD">Comida</option>
                        <option value="BEVERAGE">Bebida</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Campos variam conforme o tipo (ex.: teor alcoólico para
                        bebidas)
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 ">
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      variant="purple"
                      disabled={!isStepValid}
                    >
                      Próximo
                    </Button>
                  </div>
                </div>
              )}

              {/* Passo 2: Informações Básicas */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Informações Básicas
                    </h3>
                    {!isStepValid && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-700">
                          <strong>Campos obrigatórios:</strong> Nome, categoria,
                          preço e URL da imagem são necessários para continuar.
                        </p>
                      </div>
                    )}
                  </div>
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

                  {/* Preço (com máscara BRL) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="price" className="text-sm font-medium">
                        Preço <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="price"
                        type="text"
                        inputMode="numeric"
                        value={formData.priceStr}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        onBlur={() =>
                          setFormData((p) => ({
                            ...p,
                            priceStr: formatBRL(price),
                          }))
                        }
                        placeholder="R$ 0,00"
                        aria-label="Campo para preço em reais"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                          formData.priceStr && (price <= 0 || price > 999999.99)
                            ? "border-red-500 focus:ring-red-500"
                            : "focus:ring-blue-500"
                        }`}
                      />
                      {formData.priceStr &&
                        (price <= 0 || price > 999999.99) && (
                          <p className="text-[11px] text-red-500">
                            Preço deve ser maior que zero e menor que R$
                            999.999,99
                          </p>
                        )}
                      <p className="text-[11px] text-gray-500">
                        Digite números; usamos máscara BRL automaticamente
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="originalPrice"
                        className="text-sm font-medium"
                      >
                        Preço Original (opcional)
                      </label>
                      <input
                        id="originalPrice"
                        type="text"
                        inputMode="numeric"
                        value={formData.originalPriceStr}
                        onChange={(e) =>
                          handleOriginalPriceChange(e.target.value)
                        }
                        onBlur={() =>
                          setFormData((p) => ({
                            ...p,
                            originalPriceStr: originalPrice
                              ? formatBRL(originalPrice)
                              : "",
                          }))
                        }
                        placeholder="R$ 0,00"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* URL da Imagem */}
                  <div className="space-y-2 mt-2">
                    <label htmlFor="image" className="text-sm font-medium">
                      URL da Imagem <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="image"
                      type="text"
                      inputMode="url"
                      pattern="https?://.*"
                      value={formData.image ?? ""}
                      onChange={(e) => handleImageChange(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        formData.image && !isValidUrlOrEmpty(formData.image)
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                    {formData.image && !isValidUrlOrEmpty(formData.image) && (
                      <p className="text-[11px] text-red-500">
                        URL inválida. Deve começar com http:// ou https://
                      </p>
                    )}
                    <div className="flex gap-2 items-center">
                      <input
                        type="url"
                        placeholder="Adicionar mais imagens (opcional)"
                        className="flex-1 px-3 py-2 border rounded-md"
                        aria-label="Adicionar imagem à galeria"
                        onKeyDown={(e: any) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddImageToGallery(e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                    </div>
                    {formData.images?.length ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.images.map((u) => (
                          <div
                            key={u}
                            className="flex items-center gap-2 border rounded px-2 py-1 text-xs"
                          >
                            <span className="truncate max-w-[200px]" title={u}>
                              {u}
                            </span>
                            <button
                              type="button"
                              className="text-red-600"
                              onClick={() => removeImageFromGallery(u)}
                              aria-label="Remover imagem"
                            >
                              Remover
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <p className="text-xs text-gray-500">
                      Aceita URLs começando com http:// ou https://
                    </p>
                  </div>

                  <div className="flex justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                    >
                      Voltar
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      variant="purple"
                      disabled={!isStepValid}
                    >
                      Próximo
                    </Button>
                  </div>
                </div>
              )}

              {/* Passo 3: Detalhes Opcionais */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Detalhes Opcionais
                    </h3>
                    {!isStepValid && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-700">
                          <strong>Validação:</strong> Verifique se os adicionais
                          têm preços válidos e se as bebidas alcoólicas têm teor
                          alcoólico correto.
                        </p>
                      </div>
                    )}
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
                      Marque/desmarque para incluir no produto. Você pode
                      adicionar ingredientes personalizados.
                    </p>
                  </div>

                  {/* Adicionais */}
                  <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        Adicionais (Extras)
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addAddonRow}
                      >
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
                              Dica: use nomes curtos e claros (ex.: “Bacon
                              Crisp”)
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
                                    addon.price > 0
                                      ? formatBRL(addon.price)
                                      : "",
                                });
                              }}
                              placeholder="R$ 0,00"
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                                addon.name.trim() && addon.price < 0
                                  ? "border-red-500 focus:ring-red-500"
                                  : "focus:ring-blue-500"
                              }`}
                              aria-label={`Preço do adicional ${index + 1}`}
                            />
                            {addon.name.trim() && addon.price < 0 && (
                              <p className="text-[11px] text-red-500">
                                Preço não pode ser negativo
                              </p>
                            )}

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
                              title={`Remover adicional ${
                                addon.name || index + 1
                              }`}
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

                  {/* Classificações e Tags */}
                  <ProductClassifications
                    formData={{
                      classifications: formData.classifications,
                      tags: formData.tags,
                      tagColor: formData.tagColor,
                    }}
                    onFormDataChange={(updates) => {
                      setFormData((prev) => ({ ...prev, ...updates }));
                    }}
                  />

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
                          onChange={(e) =>
                            handleInitialStockChange(e.target.value)
                          }
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
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            const catName = categories.find(
                              (c) => c.id === formData.categoryId
                            )?.name;
                            try {
                              const res = await apiClient.getNcmCestSuggestions(
                                {
                                  categoryName: catName,
                                  productType: formData.productType,
                                }
                              );
                              if (res?.suggestions?.length) {
                                setFormData((p) => ({
                                  ...p,
                                  ncm: res.suggestions[0].ncm,
                                  cest: res.suggestions[0].cest,
                                }));
                                showToast(
                                  "Sugestão aplicada com sucesso",
                                  "success"
                                );
                              } else {
                                showToast(
                                  "Nenhuma sugestão encontrada",
                                  "error"
                                );
                              }
                            } catch (err) {
                              showToast("Erro ao buscar sugestões", "error");
                            }
                          }}
                        >
                          Sugerir NCM/CEST
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Unidade/Porção */}
                  <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900">
                      Unidade/Porção
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium">
                          Unidade (ex.: 300g, serve 1)
                        </label>
                        <input
                          type="text"
                          value={formData.unit}
                          onChange={(e) =>
                            handleUnitPortionChange({ unit: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="300g, serve 1"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Volume</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formData.volumeStr}
                          onChange={(e) =>
                            handleUnitPortionChange({
                              volumeStr: sanitizeDecimalToString(
                                e.target.value
                              ),
                            })
                          }
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="350"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">
                          Unidade de Volume
                        </label>
                        <select
                          value={formData.volumeUnit}
                          onChange={(e) =>
                            handleUnitPortionChange({
                              volumeUnit: e.target.value as any,
                            })
                          }
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="ml">ml</option>
                          <option value="l">l</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Disponibilidade */}
                  <ProductAvailability
                    formData={{}}
                    onFormDataChange={() => {}}
                  />

                  {/* Campos Fiscais */}
                  <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900">
                      Códigos Fiscais
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium">NCM</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={8}
                          value={formData.ncm}
                          onChange={(e) =>
                            handleFiscalChange({
                              ncm: e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 8),
                            })
                          }
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex.: 22030000 (Cervejas)"
                          aria-label="Código NCM"
                        />
                        <p className="text-[11px] text-gray-500">
                          Obrigatório para emissão fiscal.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">CEST</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={9}
                          value={formData.cest}
                          onChange={(e) =>
                            handleFiscalChange({
                              cest: e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 9),
                            })
                          }
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex.: 17.01.900"
                          aria-label="Código CEST"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bebidas - restrição etária */}
                  {formData.productType === "BEVERAGE" && (
                    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-yellow-50">
                      <h3 className="text-lg font-medium text-gray-900">
                        Informações de Bebida
                      </h3>
                      <div className="flex items-center gap-2">
                        <input
                          id="alcoholic"
                          type="checkbox"
                          checked={formData.alcoholic}
                          onChange={(e) =>
                            handleBeverageChange({
                              alcoholic: e.target.checked,
                            })
                          }
                          className="h-4 w-4"
                        />
                        <label htmlFor="alcoholic" className="text-sm">
                          Contém álcool
                        </label>
                      </div>
                      {formData.alcoholic && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-sm font-medium">
                              Teor alcoólico (%)
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={formData.alcoholPercentageStr}
                              onChange={(e) =>
                                handleBeverageChange({
                                  alcoholPercentageStr: sanitizeDecimalToString(
                                    e.target.value
                                  ),
                                })
                              }
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                                formData.alcoholic &&
                                (alcoholPercentage <= 0 ||
                                  alcoholPercentage > 100)
                                  ? "border-red-500 focus:ring-red-500"
                                  : "focus:ring-blue-500"
                              }`}
                              placeholder="Ex.: 4,5"
                              aria-label="Teor alcoólico"
                            />
                            {formData.alcoholic &&
                              (alcoholPercentage <= 0 ||
                                alcoholPercentage > 100) && (
                                <p className="text-[11px] text-red-500">
                                  Teor alcoólico deve estar entre 0 e 100%
                                </p>
                              )}
                          </div>
                          <div className="md:col-span-2 flex items-center text-sm text-red-700">
                            Venda proibida para menores de 18 anos
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                    >
                      Voltar
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      variant="purple"
                      disabled={!isStepValid}
                    >
                      Próximo
                    </Button>
                  </div>
                </div>
              )}

              {/* Passo 4: Pré-visualização e Publicação */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Pré-visualização</h3>
                  <div className="p-4 border rounded-lg flex items-start gap-4">
                    {formData.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formData.image}
                        alt={formData.name || "Produto"}
                        className="w-24 h-24 object-cover rounded"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        Sem foto
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold">
                        {formData.name || "Nome do produto"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formData.description || "Descrição do produto"}
                      </div>
                      <div className="mt-2 font-bold">
                        {formatBRL(price || 0)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formData.productType === "BEVERAGE"
                          ? "Bebida"
                          : "Comida"}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(3)}
                    >
                      Voltar
                    </Button>
                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={isLoading || !isFormValid}
                        className={`flex items-center gap-2 transition-colors ${
                          isFormValid && !isLoading
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-gray-400 cursor-not-allowed text-gray-200"
                        }`}
                        aria-label="Salvar e publicar produto"
                        title={
                          !isFormValid
                            ? "Preencha todos os campos obrigatórios"
                            : "Salvar produto"
                        }
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {isLoading ? "Publicando..." : "Salvar e Publicar"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

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
                    disabled={isLoading || !isFormValid}
                    className={`flex items-center gap-2 transition-colors ${
                      isFormValid && !isLoading
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-400 cursor-not-allowed text-gray-200"
                    }`}
                    title={
                      !isFormValid
                        ? "Preencha todos os campos obrigatórios"
                        : "Salvar produto"
                    }
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
