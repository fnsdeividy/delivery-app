"use client";

import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { UIAddon } from "@/types/product-form";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { Plus, Trash2 } from "lucide-react";

interface ProductAddonsSectionProps {
  addons: UIAddon[];
  onAddAddonRow: () => void;
  onUpdateAddon: (id: string, updates: Partial<UIAddon>) => void;
  onRemoveAddon: (id: string) => void;
  onClearAllAddons: () => void;
}

export function ProductAddonsSection({
  addons,
  onAddAddonRow,
  onUpdateAddon,
  onRemoveAddon,
  onClearAllAddons,
}: ProductAddonsSectionProps) {
  const { formatBRL } = useCurrencyFormatter();

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Adicionais (Extras)
        </h3>
        <div className="flex gap-2">
          {addons.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={onClearAllAddons}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Limpar todos
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onAddAddonRow}>
            <Plus className="h-4 w-4 mr-1" />
            Adicionar linha
          </Button>
        </div>
      </div>

      {addons.map((addon, index) => {
        const brl = addon.price > 0 ? formatBRL(addon.price) : "Sem custo";
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
                  onUpdateAddon(addon.id, { name: e.target.value })
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
              <CurrencyInput
                id={`addon-price-${index}`}
                value={addon.price}
                onChange={(value) => {
                  onUpdateAddon(addon.id, {
                    price: value,
                    priceText: value > 0 ? formatBRL(value) : "",
                  });
                }}
                placeholder="R$ 0,00"
                helperText="Digite apenas números (ex.: 250 vira R$ 2,50)"
                min={0}
                max={999.99}
                className="text-sm"
              />
            </div>

            {/* Remover */}
            <div className="h-10 flex items-center justify-center">
              <button
                type="button"
                onClick={() => onRemoveAddon(addon.id)}
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
        Deixe o preço vazio para adicional sem custo. O valor será somado ao
        preço base no checkout (lógica no front/back).
      </p>
    </div>
  );
}