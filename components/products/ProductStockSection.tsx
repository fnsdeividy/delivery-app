"use client";

import { ProductFormData } from "@/types/product-form";

interface ProductStockSectionProps {
  formData: ProductFormData;
  onFormDataChange: (updates: Partial<ProductFormData>) => void;
}

export function ProductStockSection({
  formData,
  onFormDataChange,
}: ProductStockSectionProps) {
  const handleInitialStockChange = (value: string) => {
    const sanitized = value.replace(/[^\d]/g, "");
    onFormDataChange({ initialStockStr: sanitized });
  };

  const handleMinStockChange = (value: string) => {
    const sanitized = value.replace(/[^\d]/g, "");
    onFormDataChange({ minStockStr: sanitized });
  };

  return (
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
            onChange={(e) => handleInitialStockChange(e.target.value)}
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
      </div>
    </div>
  );
}