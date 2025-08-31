"use client";

import { ProtectedProductRoute } from "@/components/ProtectedProductRoute";
import { useCardapioAuth } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { CreateProductDto } from "@/types/cardapio-api";
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
  price: number; // valor numérico em reais (ex.: 12.34)
  category: string;
  maxQuantity: number;
  active: boolean;
}

/** ===================== Helpers de moeda BRL ===================== */
const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Recebe a string digitada (qualquer coisa), mantém apenas dígitos,
 * converte para número em reais (centavos/100). Retorna {text, value}
 * onde text é "R$ 1.234,56" e value é 1234.56.
 */
function parseAndFormatBRL(raw: string): { text: string; value: number } {
  const onlyDigits = (raw ?? "").replace(/\D+/g, "");
  if (!onlyDigits) return { text: "", value: 0 };
  const safeDigits = onlyDigits.slice(0, 15);
  const cents = Number(safeDigits);
  const value = cents / 100;
  return { text: brl.format(value), value };
}

/** Formata número (reais) -> "R$ 12,30" */
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
  // normaliza para remover zeros à esquerda
  const normalized = String(parseInt(digits, 10));
  const safe = Number.isFinite(Number(normalized)) ? Number(normalized) : 0;
  return { text: normalized, value: safe };
}

/** ===================== Página ===================== */
export default function NovoProdutoPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.storeSlug as string;
  const { isAuthenticated, getCurrentToken } = useCardapioAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState<CreateProductDto>({
    name: "",
    description: "",
    price: 0,
    originalPrice: 0,
    categoryId: "",
    storeSlug: slug,
    image: undefined,
    active: true,
    ingredients: [],
    addons: [],
    nutritionalInfo: {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sodium: 0,
    },
    tags: [],
    tagColor: "#3B82F6",
    initialStock: 0,
    minStock: 5,
  });

  // Estados de exibição formatada (preço)
  const [priceText, setPriceText] = useState<string>("");
  const [originalPriceText, setOriginalPriceText] = useState<string>("");

  // Estados de exibição para estoque (inteiro sem zeros à esquerda)
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
  }, [slug]);

  // Sincroniza textos quando a página monta (caso venha com valores pré-carregados)
  useEffect(() => {
    setPriceText(formData.price ? formatBRL(formData.price) : "");
    setOriginalPriceText(formData.originalPrice ? formatBRL(formData.originalPrice) : "");
    setInitialStockText(
      formData.initialStock && formData.initialStock > 0 ? String(formData.initialStock) : ""
    );
    setMinStockText(
      formData.minStock && formData.minStock > 0 ? String(formData.minStock) : ""
    );
  }, []); // mount only

  const loadCategories = async () => {
    try {
      const response = await apiClient.get<any>(`/stores/${slug}/categories`);
      const categoriesData = response.data || response;
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error: any) {
      console.error("Erro ao carregar categorias:", error);
      if (error.status === 403) {
        router.push("/unauthorized");
      } else if (error.status === 401) {
        router.push("/login");
      }
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    // Criar toast nativo
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
      toast.style.transform = 'translateX(full)';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("🎯 handleSubmit CHAMADO - Evento:", e.type);
    e.preventDefault();
    
    console.log("🚀 Iniciando criação de produto...");
    console.log("📋 Dados do formulário:", formData);

    // Verificar autenticação antes de prosseguir
    const token = getCurrentToken();
    const authStatus = isAuthenticated();
    console.log("🔐 Status de autenticação:", { 
      isAuthenticated: authStatus, 
      hasToken: !!token,
      tokenLength: token?.length || 0 
    });

    if (!authStatus || !token) {
      console.error("❌ Usuário não autenticado");
      showToast("Sessão expirada. Faça login novamente.", 'error');
      setTimeout(() => router.push("/login"), 1000);
      return;
    }

    if (!formData.name || !formData.categoryId || formData.price <= 0) {
      const errorMsg = "Por favor, preencha todos os campos obrigatórios";
      console.error("❌ Validação falhou:", errorMsg);
      showToast(errorMsg, 'error');
      return;
    }

    // Preparar dados para envio - remover campos vazios opcionais
    const dataToSend = {
      ...formData,
      image: formData.image?.trim() || undefined,
      description: formData.description?.trim() || "",
      originalPrice: (formData.originalPrice || 0) > 0 ? formData.originalPrice : undefined,
      initialStock: (formData.initialStock || 0) > 0 ? formData.initialStock : undefined,
      minStock: (formData.minStock || 0) > 0 ? formData.minStock : undefined,
    };

    console.log("📤 Dados preparados para envio:", dataToSend);
    console.log("🏪 Store slug:", slug);
    console.log("🌐 URL da API que será chamada:", `/products?storeSlug=${slug}`);

    try {
      setIsLoading(true);
      console.log("⏳ Enviando requisição para o backend...");
      console.log("🔑 Token sendo usado:", token.substring(0, 20) + "...");
      
      const result = await apiClient.createProduct(dataToSend);
      
      console.log("✅ Produto criado com sucesso:", result);
      showToast("Produto criado com sucesso!", 'success');
      
      // Aguardar um pouco para o usuário ver o toast antes de redirecionar
      setTimeout(() => {
        router.push(`/dashboard/${slug}/produtos`);
      }, 1000);
      
    } catch (error: any) {
      console.error("❌ Erro ao criar produto:", error);
      console.error("📊 Detalhes completos do erro:", {
        status: error.status,
        message: error.message,
        data: error.data,
        response: error.response,
        isAxiosError: error.isAxiosError,
        config: error.config
      });
      
      if (error.status === 403) {
        showToast("Acesso negado. Você não tem permissão para criar produtos.", 'error');
        setTimeout(() => router.push("/unauthorized"), 2000);
      } else if (error.status === 401) {
        showToast("Sessão expirada. Faça login novamente.", 'error');
        setTimeout(() => router.push("/login"), 2000);
      } else {
        const errorMessage = error.message || "Erro desconhecido ao criar produto";
        showToast(`Erro ao criar produto: ${errorMessage}`, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addIngredient = () => {
    if (newIngredient.name.trim()) {
      setFormData((prev) => ({
        ...prev,
        ingredients: [...prev.ingredients, { ...newIngredient }],
      }));
      setNewIngredient({ name: "", included: true, removable: true });
    }
  };

  const removeIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const addAddon = () => {
    if (newAddon.name.trim() && newAddon.price >= 0) {
      setFormData((prev) => ({
        ...prev,
        addons: [...prev.addons, { ...newAddon }],
      }));
      // reset addon
      setNewAddon({
        name: "",
        price: 0,
        category: "",
        maxQuantity: 1,
        active: true,
      });
      setNewAddonPriceText("");
    }
  };

  const removeAddon = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      addons: prev.addons.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  /** ===================== Render ===================== */
  return (
    <ProtectedProductRoute storeSlug={slug} requiredAction="write">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push(`/dashboard/${slug}/produtos`)}
            className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
            type="button"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Adicionar Novo Produto
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Informações Básicas */}
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
                  placeholder="Ex: X-Burger Clássico"
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

              {/* ===== Preço (BRL) com máscara ===== */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  value={priceText}
                  onChange={(e) => {
                    const { text, value } = parseAndFormatBRL(e.target.value);
                    setPriceText(text);
                    setFormData((prev) => ({ ...prev, price: value }));
                  }}
                  onBlur={() => {
                    setPriceText(formData.price ? formatBRL(formData.price) : "");
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="R$ 0,00"
                  aria-label="Preço em reais"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Digite apenas números (ex.: 1234 vira R$ 12,34)
                </p>
              </div>

              {/* ===== Preço Original (BRL) com máscara ===== */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço Original
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  value={originalPriceText}
                  onChange={(e) => {
                    const { text, value } = parseAndFormatBRL(e.target.value);
                    setOriginalPriceText(text);
                    setFormData((prev) => ({ ...prev, originalPrice: value }));
                  }}
                  onBlur={() => {
                    setOriginalPriceText(
                      formData.originalPrice ? formatBRL(formData.originalPrice) : ""
                    );
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="R$ 0,00"
                  aria-label="Preço original em reais"
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
                placeholder="Descreva o produto..."
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
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
          </div>

          {/* Controle de Estoque */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Controle de Estoque
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Estoque Inicial (somente dígitos, sem zeros à esquerda) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estoque Inicial
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  value={initialStockText}
                  onChange={(e) => {
                    const { text, value } = parseIntegerDigits(e.target.value);
                    setInitialStockText(text);
                    setFormData((prev) => ({ ...prev, initialStock: value }));
                  }}
                  onBlur={() => {
                    // Normaliza visualmente: se 0, deixar vazio; senão, mostra o número
                    setInitialStockText(
                      formData.initialStock && formData.initialStock > 0
                        ? String(formData.initialStock)
                        : ""
                    );
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0"
                  aria-label="Estoque inicial (inteiro)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Somente números. Ex.: digite <code>02</code> → exibe <code>2</code>.
                </p>
              </div>

              {/* Estoque Mínimo (somente dígitos, sem zeros à esquerda) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estoque Mínimo
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  value={minStockText}
                  onChange={(e) => {
                    const { text, value } = parseIntegerDigits(e.target.value);
                    setMinStockText(text);
                    setFormData((prev) => ({ ...prev, minStock: value }));
                  }}
                  onBlur={() => {
                    setMinStockText(
                      formData.minStock && formData.minStock > 0
                        ? String(formData.minStock)
                        : ""
                    );
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="5"
                  aria-label="Estoque mínimo (inteiro)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Somente números. Ex.: digite <code>02</code> → exibe <code>2</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Ingredientes */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Ingredientes
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                value={newIngredient.name}
                onChange={(e) =>
                  setNewIngredient((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Nome do ingrediente"
              />

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newIngredient.included}
                  onChange={(e) =>
                    setNewIngredient((prev) => ({
                      ...prev,
                      included: e.target.checked,
                    }))
                  }
                  className="mr-2 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Incluído</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newIngredient.removable}
                  onChange={(e) =>
                    setNewIngredient((prev) => ({
                      ...prev,
                      removable: e.target.checked,
                    }))
                  }
                  className="mr-2 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Removível</span>
              </label>
            </div>

            <button
              type="button"
              onClick={addIngredient}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Plus size={16} className="mr-1" />
              Adicionar Ingrediente
            </button>

            {formData.ingredients.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{ingredient.name}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          ingredient.included
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {ingredient.included ? "Incluído" : "Não incluído"}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          ingredient.removable
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {ingredient.removable ? "Removível" : "Fixo"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Addons */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Addons/Extras
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                value={newAddon.name}
                onChange={(e) =>
                  setNewAddon((prev) => ({ ...prev, name: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Nome do addon"
              />

              {/* Preço do addon com máscara BRL */}
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={newAddonPriceText}
                onChange={(e) => {
                  const { text, value } = parseAndFormatBRL(e.target.value);
                  setNewAddonPriceText(text);
                  setNewAddon((prev) => ({ ...prev, price: value }));
                }}
                onBlur={() => {
                  setNewAddonPriceText(
                    newAddon.price ? formatBRL(newAddon.price) : ""
                  );
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="R$ 0,00"
                aria-label="Preço do addon em reais"
              />

              <input
                type="text"
                value={newAddon.category}
                onChange={(e) =>
                  setNewAddon((prev) => ({ ...prev, category: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Categoria"
              />

              <input
                type="number"
                min={1}
                value={newAddon.maxQuantity}
                onChange={(e) =>
                  setNewAddon((prev) => ({
                    ...prev,
                    maxQuantity: Number.parseInt(e.target.value || "1", 10) || 1,
                  }))
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Qtd. máx."
              />
            </div>

            <button
              type="button"
              onClick={addAddon}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Plus size={16} className="mr-1" />
              Adicionar Addon
            </button>

            {formData.addons.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.addons.map((addon, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{addon.name}</span>
                      <span className="text-sm text-gray-600">
                        {formatBRL(addon.price)}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        {addon.category || "Sem categoria"}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                        Máx: {addon.maxQuantity}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAddon(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Tags</h2>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Nova tag"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Adicionar
              </button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
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

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push(`/dashboard/${slug}/produtos`)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Criando..." : "Criar Produto"}
            </button>
          </div>
        </form>
      </div>
    </ProtectedProductRoute>
  );
}
