"use client";

import { Button } from "@/components/ui/button";
import { UIIngredient } from "@/types/product-form";
import { Plus } from "lucide-react";

interface ProductIngredientsSectionProps {
  ingredients: UIIngredient[];
  newIngredient: string;
  onNewIngredientChange: (value: string) => void;
  onAddCustomIngredient: () => void;
  onToggleIngredient: (id: string) => void;
  onRemoveIngredient: (id: string) => void;
}

export function ProductIngredientsSection({
  ingredients,
  newIngredient,
  onNewIngredientChange,
  onAddCustomIngredient,
  onToggleIngredient,
  onRemoveIngredient,
}: ProductIngredientsSectionProps) {
  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900">Ingredientes</h3>

      {ingredients.length === 0 && (
        <p className="text-sm text-gray-500">
          Selecione uma categoria para carregar sugestões de ingredientes ou
          adicione os seus abaixo.
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
                onChange={() => onToggleIngredient(ing.id)}
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
                onClick={() => onRemoveIngredient(ing.id)}
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
          onChange={(e) => onNewIngredientChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAddCustomIngredient();
            }
          }}
          placeholder="Adicionar ingrediente (ex.: Mais Queijo)"
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Nome do novo ingrediente"
        />
        <Button
          type="button"
          onClick={onAddCustomIngredient}
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
  );
}