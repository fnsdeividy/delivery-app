"use client";

import { Category, BaseOptions } from "@/types/product-form";

interface ProductCategoryOptionsProps {
  categoryId: string;
  categories: Category[];
  baseOptions: BaseOptions;
  onBaseOptionsChange: (updates: Partial<BaseOptions>) => void;
}

export function ProductCategoryOptions({
  categoryId,
  categories,
  baseOptions,
  onBaseOptionsChange,
}: ProductCategoryOptionsProps) {
  if (!categoryId) return null;

  const category = categories.find((c) => c.id === categoryId);
  const categoryName = (category?.name || "").toLowerCase();

  const renderHamburgerOptions = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Tipo de Pão</label>
        <select
          className="w-full px-3 py-2 border rounded-md"
          value={baseOptions.breadType || ""}
          onChange={(e) => onBaseOptionsChange({ breadType: e.target.value })}
        >
          {["Brioche", "Australiano", "Tradicional", "Integral"].map(
            (opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            )
          )}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Ponto da Carne</label>
        <select
          className="w-full px-3 py-2 border rounded-md"
          value={baseOptions.doneness || ""}
          onChange={(e) => onBaseOptionsChange({ doneness: e.target.value })}
        >
          {["Mal passado", "Ao ponto", "Ao ponto para mais", "Bem passado"].map(
            (opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            )
          )}
        </select>
      </div>
    </div>
  );

  const renderPizzaOptions = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Tipo de Massa</label>
        <select
          className="w-full px-3 py-2 border rounded-md"
          value={baseOptions.doughType || ""}
          onChange={(e) => onBaseOptionsChange({ doughType: e.target.value })}
        >
          {["Tradicional", "Fina", "Grossa", "Napolitana", "Integral"].map(
            (opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            )
          )}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Tamanho</label>
        <select
          className="w-full px-3 py-2 border rounded-md"
          value={baseOptions.pizzaSize || ""}
          onChange={(e) => onBaseOptionsChange({ pizzaSize: e.target.value })}
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

  const renderBeverageOptions = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Volume</label>
        <select
          className="w-full px-3 py-2 border rounded-md"
          value={baseOptions.beverageSize || ""}
          onChange={(e) =>
            onBaseOptionsChange({ beverageSize: e.target.value })
          }
        >
          {["Lata 350ml", "Garrafa 600ml", "1 Litro", "1,5 Litro"].map(
            (opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            )
          )}
        </select>
      </div>
    </div>
  );

  const renderOptions = () => {
    if (categoryName.includes("hamb")) return renderHamburgerOptions();
    if (categoryName.includes("pizza")) return renderPizzaOptions();
    if (categoryName.includes("beb") || categoryName.includes("drink"))
      return renderBeverageOptions();
    return null;
  };

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium text-gray-900">Opções do Produto</h3>
      {renderOptions()}
    </div>
  );
}