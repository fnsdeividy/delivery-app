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
  price: number;
  category: string;
  maxQuantity: number;
  active: boolean;
}

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
    image: "",
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
  });

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

  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    loadCategories();
  }, [slug]);

  const loadCategories = async () => {
    try {
      const response = await apiClient.get<any>(`/stores/${slug}/categories`);

      // O backend retorna um objeto PaginatedResponse devido ao interceptor
      // Precisamos extrair o array de categorias da propriedade 'data'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.categoryId || formData.price <= 0) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      setIsLoading(true);
      await apiClient.createProduct(formData);

      // Redirecionar para a lista de produtos com mensagem de sucesso
      router.push(`/dashboard/${slug}/produtos?success=created`);
    } catch (error: any) {
      console.error("Erro ao criar produto:", error);

      if (error.status === 403) {
        router.push("/unauthorized");
      } else if (error.status === 401) {
        router.push("/login");
      } else {
        alert(`Erro ao criar produto: ${error.message}`);
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
      setNewAddon({
        name: "",
        price: 0,
        category: "",
        maxQuantity: 1,
        active: true,
      });
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

  return (
    <ProtectedProductRoute storeSlug={slug} requiredAction="write">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push(`/dashboard/${slug}/produtos`)}
            className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Adicionar Novo Produto
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço Original (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.originalPrice}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      originalPrice: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
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
                value={formData.image}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, image: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
          </div>

          {/* Estoque */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Controle de Estoque
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estoque Inicial
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.initialStock}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      initialStock: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estoque Mínimo
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      minStock: parseInt(e.target.value) || 5,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="5"
                />
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

              <input
                type="number"
                step="0.01"
                min="0"
                value={newAddon.price}
                onChange={(e) =>
                  setNewAddon((prev) => ({
                    ...prev,
                    price: parseFloat(e.target.value) || 0,
                  }))
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Preço"
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
                min="1"
                value={newAddon.maxQuantity}
                onChange={(e) =>
                  setNewAddon((prev) => ({
                    ...prev,
                    maxQuantity: parseInt(e.target.value) || 1,
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
                        R$ {addon.price.toFixed(2)}
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
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
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
