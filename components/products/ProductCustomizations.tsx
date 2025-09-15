"use client";

import { Plus, X } from "@phosphor-icons/react";
import { useState } from "react";

interface Ingredient {
  name: string;
  included: boolean;
  removable: boolean;
}

interface Addon {
  name: string;
  price: number; // Valor em centavos
  category: string;
  maxQuantity: number;
  active: boolean;
}

interface ProductCustomizationsProps {
  formData: {
    ingredients?: Ingredient[];
    addons?: Addon[];
  };
  onFormDataChange: (
    updates: Partial<ProductCustomizationsProps["formData"]>
  ) => void;
}

export function ProductCustomizations({
  formData,
  onFormDataChange,
}: ProductCustomizationsProps) {
  const [newIngredient, setNewIngredient] = useState<Ingredient>({
    name: "",
    included: true,
    removable: true,
  });

  const [newAddon, setNewAddon] = useState<Addon>({
    name: "",
    price: 0, // Valor em centavos
    category: "",
    maxQuantity: 1,
    active: true,
  });

  const ingredients = formData.ingredients || [];
  const addons = formData.addons || [];

  const addIngredient = () => {
    if (newIngredient.name.trim()) {
      onFormDataChange({
        ingredients: [...ingredients, { ...newIngredient }],
      });
      setNewIngredient({ name: "", included: true, removable: true });
    }
  };

  const removeIngredient = (index: number) => {
    onFormDataChange({
      ingredients: ingredients.filter((_, i) => i !== index),
    });
  };

  const updateIngredient = (index: number, updates: Partial<Ingredient>) => {
    const updatedIngredients = ingredients.map((ingredient, i) =>
      i === index ? { ...ingredient, ...updates } : ingredient
    );
    onFormDataChange({ ingredients: updatedIngredients });
  };

  const addAddon = () => {
    if (newAddon.name.trim() && newAddon.price >= 0) {
      onFormDataChange({
        addons: [...addons, { ...newAddon }],
      });
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
    onFormDataChange({
      addons: addons.filter((_, i) => i !== index),
    });
  };

  const updateAddon = (index: number, updates: Partial<Addon>) => {
    const updatedAddons = addons.map((addon, i) =>
      i === index ? { ...addon, ...updates } : addon
    );
    onFormDataChange({ addons: updatedAddons });
  };

  const handleIngredientKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredient();
    }
  };

  const handleAddonKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addAddon();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        Personalizações do Produto
      </h2>

      {/* Ingredientes */}
      <div className="mb-8">
        <h3 className="text-md font-medium text-gray-900 mb-4">Ingredientes</h3>

        {/* Adicionar novo ingrediente */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Ingrediente
              </label>
              <input
                type="text"
                value={newIngredient.name}
                onChange={(e) =>
                  setNewIngredient((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                onKeyPress={handleIngredientKeyPress}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ex: Queijo, Alface, Tomate"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={addIngredient}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center"
              >
                <Plus size={16} className="mr-1" />
                Adicionar
              </button>
            </div>
          </div>

          <div className="flex gap-4">
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
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mr-2"
              />
              <span className="text-sm text-gray-700">Incluído por padrão</span>
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
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mr-2"
              />
              <span className="text-sm text-gray-700">Pode ser removido</span>
            </label>
          </div>
        </div>

        {/* Lista de ingredientes */}
        {ingredients.length > 0 && (
          <div className="space-y-2">
            {ingredients.map((ingredient, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex-1">
                  <span className="font-medium text-gray-900">
                    {ingredient.name}
                  </span>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={ingredient.included}
                        onChange={(e) =>
                          updateIngredient(index, {
                            included: e.target.checked,
                          })
                        }
                        className="w-3 h-3 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mr-1"
                      />
                      Incluído
                    </label>
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={ingredient.removable}
                        onChange={(e) =>
                          updateIngredient(index, {
                            removable: e.target.checked,
                          })
                        }
                        className="w-3 h-3 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mr-1"
                      />
                      Removível
                    </label>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Remover ingrediente"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Adicionais */}
      <div>
        <h3 className="text-md font-medium text-gray-900 mb-4">Adicionais</h3>

        {/* Adicionar novo adicional */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Adicional
              </label>
              <input
                type="text"
                value={newAddon.name}
                onChange={(e) =>
                  setNewAddon((prev) => ({ ...prev, name: e.target.value }))
                }
                onKeyPress={handleAddonKeyPress}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ex: Bacon, Queijo Extra"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <input
                type="text"
                value={newAddon.category}
                onChange={(e) =>
                  setNewAddon((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ex: Proteínas, Molhos"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qtd. Máxima
              </label>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newAddon.active}
                onChange={(e) =>
                  setNewAddon((prev) => ({ ...prev, active: e.target.checked }))
                }
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mr-2"
              />
              <span className="text-sm text-gray-700">Ativo</span>
            </label>

            <button
              type="button"
              onClick={addAddon}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center"
            >
              <Plus size={16} className="mr-1" />
              Adicionar
            </button>
          </div>
        </div>

        {/* Lista de adicionais */}
        {addons.length > 0 && (
          <div className="space-y-2">
            {addons.map((addon, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {addon.name}
                    </span>
                    <span className="text-green-600 font-medium">
                      {addon.price > 0
                        ? `R$ ${(addon.price / 100).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : "Gratuito"}
                    </span>
                    {addon.category && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {addon.category}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-4 mt-1 text-sm text-gray-500">
                    <span>Máx: {addon.maxQuantity}</span>
                    <span
                      className={
                        addon.active ? "text-green-600" : "text-red-600"
                      }
                    >
                      {addon.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeAddon(index)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Remover adicional"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Informações adicionais */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              💡 Dicas sobre Personalizações
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Ingredientes incluídos aparecem por padrão no produto</li>
                <li>
                  Ingredientes removíveis podem ser retirados pelo cliente
                </li>
                <li>Adicionais permitem que o cliente customize o produto</li>
                <li>Agrupe adicionais por categoria para melhor organização</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
