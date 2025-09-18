"use client";

import { formatCurrency } from "@/lib/utils/order-utils";

interface OrderItemCustomizationsProps {
  customizations: any;
  variant?: "detailed" | "compact";
  className?: string;
}

export function OrderItemCustomizations({
  customizations,
  variant = "detailed",
  className = "",
}: OrderItemCustomizationsProps) {
  if (!customizations) return null;

  // Função para verificar se há customizações
  const hasCustomizations = () => {
    const hasRemovedIngredients =
      customizations.removedIngredients &&
      customizations.removedIngredients.length > 0;
    const hasAddons = customizations.addons && customizations.addons.length > 0;
    const hasObservations = customizations.observations;

    return hasRemovedIngredients || hasAddons || hasObservations;
  };

  if (!hasCustomizations()) {
    if (variant === "detailed") {
      return (
        <div
          className={`bg-gray-50 border border-gray-200 rounded-lg p-3 ${className}`}
        >
          <p className="text-sm text-gray-600 text-center">
            Sem adicionais ou modificações
          </p>
        </div>
      );
    }
    return null;
  }

  if (variant === "compact") {
    return (
      <div className={`ml-4 space-y-1 ${className}`}>
        {/* Ingredientes removidos */}
        {customizations.removedIngredients &&
          customizations.removedIngredients.length > 0 && (
            <div className="text-xs text-red-600">
              <span className="font-medium">Remover: </span>
              {customizations.removedIngredients.join(", ")}
            </div>
          )}

        {/* Adicionais */}
        {customizations.addons && customizations.addons.length > 0 && (
          <div className="text-xs text-green-600">
            <span className="font-medium">Adicionais: </span>
            {customizations.addons
              .map((addon: any) => `${addon.quantity}x ${addon.name}`)
              .join(", ")}
          </div>
        )}

        {/* Observações */}
        {customizations.observations && (
          <div className="text-xs text-blue-600">
            <span className="font-medium">Obs: </span>
            {customizations.observations}
          </div>
        )}
      </div>
    );
  }

  // Variant detailed
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="space-y-2">
        {/* Ingredientes removidos */}
        {customizations.removedIngredients &&
          customizations.removedIngredients.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <p className="text-sm font-medium text-red-700">
                  Ingredientes Removidos
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {customizations.removedIngredients.map(
                  (ingredient: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"
                    >
                      {ingredient}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

        {/* Adicionais */}
        {customizations.addons && customizations.addons.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <p className="text-sm font-medium text-green-700">
                Adicionais Incluídos
              </p>
            </div>
            <div className="space-y-1">
              {customizations.addons.map((addon: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white rounded-md p-2 border border-green-100"
                >
                  <span className="text-sm text-green-800">
                    {addon.quantity}x {addon.name}
                  </span>
                  <span className="text-sm font-medium text-green-700">
                    +{formatCurrency(addon.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Observações */}
        {customizations.observations && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <p className="text-sm font-medium text-blue-700">Observações</p>
            </div>
            <p className="text-sm text-blue-800 bg-white rounded-md p-2 border border-blue-100">
              {customizations.observations}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
