"use client";

import { CurrencyInput } from "@/components/ui/currency-input";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { ProductFormData } from "@/types/product-form";

interface ProductPricingSectionProps {
  formData: ProductFormData;
  onFormDataChange: (updates: Partial<ProductFormData>) => void;
  price: number;
  originalPrice: number | undefined;
}

export function ProductPricingSection({
  formData,
  onFormDataChange,
  price,
  originalPrice,
}: ProductPricingSectionProps) {
  const { parseAndFormatBRL, formatBRL } = useCurrencyFormatter();

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium text-gray-900">Preços</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CurrencyInput
          id="price"
          label="Preço Principal"
          value={price}
          onChange={(value) => {
            const { text } = parseAndFormatBRL(String(value));
            onFormDataChange({ priceStr: text });
          }}
          placeholder="R$ 0,00"
          helperText="Preço de venda do produto"
          min={0.01}
          max={999999.99}
          required
          error={price <= 0 || price > 999999.99}
        />

        <CurrencyInput
          id="originalPrice"
          label="Preço Original (Opcional)"
          value={originalPrice || 0}
          onChange={(value) => {
            const { text } = parseAndFormatBRL(String(value));
            onFormDataChange({
              originalPriceStr: text,
            });
          }}
          placeholder="R$ 0,00"
          helperText="Preço antes do desconto (para mostrar desconto)"
          min={0}
          max={999999.99}
        />
      </div>

      {originalPrice && originalPrice > price && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            <span className="font-medium">Desconto:</span>{" "}
            {formatBRL(originalPrice - price)}(
            {Math.round(((originalPrice - price) / originalPrice) * 100)}
            % off)
          </p>
        </div>
      )}
    </div>
  );
}