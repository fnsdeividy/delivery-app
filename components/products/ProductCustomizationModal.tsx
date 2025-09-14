"use client";

import { Minus, Plus, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { formatPrice, parsePrice } from "../../lib/utils/price";
import { Product, ProductIngredient } from "../../types/cardapio-api";

interface ProductCustomizationModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    customizations: ProductCustomization
  ) => void;
  primaryColor?: string;
}

export interface ProductCustomization {
  selectedIngredients: string[]; // IDs dos ingredientes selecionados
  removedIngredients: string[]; // IDs dos ingredientes removidos
  selectedAddons: { [addonId: string]: number }; // ID do addon e quantidade
  specialInstructions?: string;
}

export function ProductCustomizationModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  primaryColor = "#f97316",
}: ProductCustomizationModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<{
    [key: string]: number;
  }>({});
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Reset quando o modal abre com um novo produto
  useEffect(() => {
    if (product && isOpen) {
      setQuantity(1);
      setSpecialInstructions("");
      setSelectedAddons({});

      // Inicializar ingredientes (incluídos por padrão, removíveis podem ser desmarcados)
      const includedIngredients =
        product.ingredients
          ?.filter((ing) => ing.included)
          ?.map((ing) => ing.id) || [];
      setSelectedIngredients(includedIngredients);
      setRemovedIngredients([]);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleIngredientToggle = (
    ingredientId: string,
    ingredient: ProductIngredient
  ) => {
    if (ingredient.included) {
      // Se o ingrediente vem incluído, podemos removê-lo (se for removível)
      if (ingredient.removable) {
        if (removedIngredients.includes(ingredientId)) {
          setRemovedIngredients((prev) =>
            prev.filter((id) => id !== ingredientId)
          );
        } else {
          setRemovedIngredients((prev) => [...prev, ingredientId]);
        }
      }
    } else {
      // Se o ingrediente não vem incluído, podemos adicioná-lo
      if (selectedIngredients.includes(ingredientId)) {
        setSelectedIngredients((prev) =>
          prev.filter((id) => id !== ingredientId)
        );
      } else {
        setSelectedIngredients((prev) => [...prev, ingredientId]);
      }
    }
  };

  const handleAddonChange = (
    addonId: string,
    quantity: number,
    maxQuantity?: number
  ) => {
    if (quantity <= 0) {
      const newAddons = { ...selectedAddons };
      delete newAddons[addonId];
      setSelectedAddons(newAddons);
    } else {
      const finalQuantity = maxQuantity
        ? Math.min(quantity, maxQuantity)
        : quantity;
      setSelectedAddons((prev) => ({
        ...prev,
        [addonId]: finalQuantity,
      }));
    }
  };

  const isIngredientSelected = (ingredient: ProductIngredient) => {
    if (ingredient.included) {
      return !removedIngredients.includes(ingredient.id);
    } else {
      return selectedIngredients.includes(ingredient.id);
    }
  };

  const calculateTotalPrice = () => {
    let total = parsePrice(product.price) * quantity;

    // Adicionar preço dos addons
    Object.entries(selectedAddons).forEach(([addonId, addonQuantity]) => {
      const addon = product.addons?.find((a) => a.id === addonId);
      if (addon) {
        total += parsePrice(addon.price) * addonQuantity * quantity;
      }
    });

    return total;
  };

  const handleAddToCart = () => {
    const customizations: ProductCustomization = {
      selectedIngredients,
      removedIngredients,
      selectedAddons,
      specialInstructions: specialInstructions.trim() || undefined,
    };

    onAddToCart(product, quantity, customizations);
    onClose();
  };

  const hasCustomizations =
    product.ingredients?.length > 0 || product.addons?.length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="relative inline-block w-full max-w-2xl transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:align-middle">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-4">
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600">
                  R$ {formatPrice(product.price)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto px-6 py-4">
            {/* Descrição */}
            {product.description && (
              <div className="mb-6">
                <p className="text-sm text-gray-600">{product.description}</p>
              </div>
            )}

            {/* Ingredientes */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="mb-6">
                <h4 className="mb-3 text-base font-semibold text-gray-900">
                  Ingredientes
                </h4>
                <div className="space-y-2">
                  {product.ingredients.map((ingredient) => (
                    <label
                      key={ingredient.id}
                      className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors ${
                        isIngredientSelected(ingredient)
                          ? "border-green-300 bg-green-50"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isIngredientSelected(ingredient)}
                          onChange={() =>
                            handleIngredientToggle(ingredient.id, ingredient)
                          }
                          disabled={
                            ingredient.included && !ingredient.removable
                          }
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          style={{ accentColor: primaryColor }}
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {ingredient.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        {ingredient.included && (
                          <span className="rounded-full bg-green-100 px-2 py-1 text-green-800">
                            Incluído
                          </span>
                        )}
                        {ingredient.removable && (
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-800">
                            Opcional
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Adicionais */}
            {product.addons && product.addons.length > 0 && (
              <div className="mb-6">
                <h4 className="mb-3 text-base font-semibold text-gray-900">
                  Adicionais
                </h4>
                <div className="space-y-3">
                  {product.addons
                    .filter((addon) => addon.active)
                    .map((addon) => (
                      <div
                        key={addon.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">
                              {addon.name}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              + R$ {formatPrice(addon.price)}
                            </span>
                          </div>
                          {addon.category && (
                            <span className="text-xs text-gray-500">
                              {addon.category}
                            </span>
                          )}
                        </div>
                        <div className="ml-4 flex items-center space-x-2">
                          <button
                            onClick={() =>
                              handleAddonChange(
                                addon.id,
                                (selectedAddons[addon.id] || 0) - 1,
                                addon.maxQuantity
                              )
                            }
                            disabled={(selectedAddons[addon.id] || 0) <= 0}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {selectedAddons[addon.id] || 0}
                          </span>
                          <button
                            onClick={() =>
                              handleAddonChange(
                                addon.id,
                                (selectedAddons[addon.id] || 0) + 1,
                                addon.maxQuantity
                              )
                            }
                            disabled={
                              addon.maxQuantity &&
                              (selectedAddons[addon.id] || 0) >=
                                addon.maxQuantity
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full border text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              backgroundColor: primaryColor,
                              borderColor: primaryColor,
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Observações especiais */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Observações especiais
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Ex: sem cebola, bem passado, etc."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                rows={3}
                maxLength={200}
              />
              <p className="mt-1 text-xs text-gray-500">
                {specialInstructions.length}/200 caracteres
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            {/* Quantity selector */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                Quantidade:
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Add to cart button */}
            <button
              onClick={handleAddToCart}
              className="w-full rounded-lg py-3 text-white font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              Adicionar ao carrinho - R$ {formatPrice(calculateTotalPrice())}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
