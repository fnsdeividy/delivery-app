"use client";

import { CartItem } from "../../contexts/CartContext";
import { ProductAddon, ProductIngredient } from "../../types/cardapio-api";

interface OrderItemDetailsProps {
  item: CartItem;
  primaryColor?: string;
}

export function OrderItemDetails({
  item,
  primaryColor = "#f97316",
}: OrderItemDetailsProps) {
  const { customizations, product } = item;

  // Se não há customizações, não exibe nada
  if (!customizations) {
    return null;
  }

  const hasAddons =
    customizations.selectedAddons &&
    Object.keys(customizations.selectedAddons).length > 0;
  const hasRemovedIngredients =
    customizations.removedIngredients &&
    customizations.removedIngredients.length > 0;
  const hasSpecialInstructions =
    customizations.specialInstructions &&
    customizations.specialInstructions.trim().length > 0;

  // Se não há nenhuma customização, não exibe nada
  if (!hasAddons && !hasRemovedIngredients && !hasSpecialInstructions) {
    return null;
  }

  return (
    <div className="mt-2 space-y-2">
      {/* Adicionais */}
      {hasAddons && (
        <div className="space-y-1">
          {Object.entries(customizations.selectedAddons).map(
            ([addonId, quantity]) => {
              const addon = product.addons?.find(
                (a: ProductAddon) => a.id === addonId
              );
              if (!addon) return null;

              return (
                <div
                  key={addonId}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-green-600 font-medium">
                    +{quantity}x {addon.name}
                  </span>
                  <span className="text-gray-600">
                    R$ {(addon.price * quantity).toFixed(2).replace(".", ",")}
                  </span>
                </div>
              );
            }
          )}
        </div>
      )}

      {/* Ingredientes removidos */}
      {hasRemovedIngredients && (
        <div className="space-y-1">
          {customizations.removedIngredients.map((ingredientId) => {
            const ingredient = product.ingredients?.find(
              (i: ProductIngredient) => i.id === ingredientId
            );
            if (!ingredient) return null;

            return (
              <div key={ingredientId} className="flex items-center text-sm">
                <span className="text-red-500 font-medium">
                  –{ingredient.name}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Instruções especiais */}
      {hasSpecialInstructions && (
        <div
          className="mt-2 p-2 bg-yellow-50 border-l-4 rounded-r-lg"
          style={{ borderLeftColor: primaryColor }}
        >
          <div className="flex items-start gap-2">
            <span className="text-yellow-600 text-sm font-medium">💬</span>
            <div>
              <span className="text-sm font-medium text-gray-700">
                Observação:
              </span>
              <p className="text-sm text-gray-600 italic mt-1">
                {customizations.specialInstructions}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
