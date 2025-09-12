"use client";

import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { useState } from "react";

/**
 * Exemplo de uso do CurrencyInput
 * Demonstra todas as funcionalidades implementadas
 */
export function CurrencyInputExample() {
  const [productPrice, setProductPrice] = useState(0);
  const [addonPrice, setAddonPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [freeAddonPrice, setFreeAddonPrice] = useState(0);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Exemplo de CurrencyInput
        </h1>
        <p className="text-gray-600">
          Demonstração das funcionalidades do input de moeda brasileira
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Exemplo 1: Preço obrigatório */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Preço do Produto (Obrigatório)
          </h2>
          <CurrencyInput
            label="Preço *"
            value={productPrice}
            onChange={setProductPrice}
            placeholder="0,00"
            required
            min={0}
            max={9999999}
            allowEmpty={false}
            id="product-price"
            name="productPrice"
            aria-describedby="product-price-help"
          />
          <p id="product-price-help" className="text-sm text-gray-500">
            Valor atual: {productPrice} centavos (R${" "}
            {(productPrice / 100).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
            )
          </p>
        </div>

        {/* Exemplo 2: Preço opcional */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Preço Original (Opcional)
          </h2>
          <CurrencyInput
            label="Preço Original"
            value={originalPrice}
            onChange={setOriginalPrice}
            placeholder="0,00"
            min={0}
            max={9999999}
            allowEmpty={true}
            id="original-price"
            name="originalPrice"
            aria-describedby="original-price-help"
          />
          <p id="original-price-help" className="text-sm text-gray-500">
            Deixe vazio se não houver preço original
          </p>
        </div>

        {/* Exemplo 3: Adicional com custo */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Adicional com Custo
          </h2>
          <CurrencyInput
            label="Preço do Adicional"
            value={addonPrice}
            onChange={setAddonPrice}
            placeholder="0,00"
            min={0}
            max={9999999}
            allowEmpty={true}
            id="addon-price"
            name="addonPrice"
            aria-describedby="addon-price-help"
          />
          <p id="addon-price-help" className="text-sm text-gray-500">
            Deixe vazio para adicional sem custo
          </p>
        </div>

        {/* Exemplo 4: Adicional gratuito */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Adicional Gratuito
          </h2>
          <CurrencyInput
            label="Preço do Adicional"
            value={freeAddonPrice}
            onChange={setFreeAddonPrice}
            placeholder="0,00"
            min={0}
            max={9999999}
            allowEmpty={true}
            id="free-addon-price"
            name="freeAddonPrice"
            aria-describedby="free-addon-price-help"
          />
          <p id="free-addon-price-help" className="text-sm text-gray-500">
            Este adicional será gratuito se deixado vazio
          </p>
        </div>
      </div>

      {/* Resumo dos valores */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Resumo dos Valores
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Preço do Produto:</span>
            <span className="font-medium">
              R${" "}
              {(productPrice / 100).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Preço Original:</span>
            <span className="font-medium">
              {originalPrice > 0
                ? `R$ ${(originalPrice / 100).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}`
                : "Não definido"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Adicional com Custo:</span>
            <span className="font-medium">
              {addonPrice > 0
                ? `R$ ${(addonPrice / 100).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}`
                : "Gratuito"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Adicional Gratuito:</span>
            <span className="font-medium">
              {freeAddonPrice > 0
                ? `R$ ${(freeAddonPrice / 100).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}`
                : "Gratuito"}
            </span>
          </div>
        </div>
      </div>

      {/* Instruções de uso */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          💡 Como Usar
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Digite apenas números: "250" vira "R$ 2,50"</li>
          <li>• Use vírgula para decimais: "2,50"</li>
          <li>• Use ponto para decimais: "2.50"</li>
          <li>• Cole valores formatados: "R$ 2,50"</li>
          <li>• Deixe vazio para valores gratuitos (quando permitido)</li>
          <li>• O valor é sempre enviado em centavos para a API</li>
        </ul>
      </div>
    </div>
  );
}
