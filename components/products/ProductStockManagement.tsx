"use client";

import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';

interface ProductStockManagementProps {
  formData: {
    initialStock?: number;
    minStock?: number;
    maxStock?: number;
    stockAlerts?: boolean;
    autoRestock?: boolean;
    unit?: string;
    stockType?: string;
    volume?: number;
    volumeUnit?: string;
    returnable?: boolean;
    temperature?: string;
  };
  onFormDataChange: (updates: Partial<ProductStockManagementProps['formData']>) => void;
}

export function ProductStockManagement({ formData, onFormDataChange }: ProductStockManagementProps) {
  const { parseIntegerDigits } = useCurrencyFormatter();

  const validateStock = (initialStock?: number, minStock?: number, maxStock?: number) => {
    const errors = [];
    if (minStock && initialStock && minStock > initialStock) {
      errors.push("Estoque mínimo não pode ser maior que estoque inicial");
    }
    if (maxStock && initialStock && maxStock < initialStock) {
      errors.push("Estoque máximo não pode ser menor que estoque inicial");
    }
    if (minStock && maxStock && minStock > maxStock) {
      errors.push("Estoque mínimo não pode ser maior que estoque máximo");
    }
    return errors;
  };

  const stockErrors = validateStock(formData.initialStock, formData.minStock, formData.maxStock);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Controle de Estoque
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estoque Inicial
          </label>
          <input
            type="number"
            min="0"
            value={formData.initialStock || ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
              onFormDataChange({ initialStock: value });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estoque Mínimo
          </label>
          <input
            type="number"
            min="0"
            value={formData.minStock || ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
              onFormDataChange({ minStock: value });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estoque Máximo
          </label>
          <input
            type="number"
            min="0"
            value={formData.maxStock || ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
              onFormDataChange({ maxStock: value });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Estoque
          </label>
          <select
            value={formData.stockType || 'unit'}
            onChange={(e) => onFormDataChange({ stockType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="unit">Por Unidade</option>
            <option value="box">Por Caixa</option>
            <option value="infinite">Estoque Infinito</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unidade de Medida
          </label>
          <input
            type="text"
            value={formData.unit || ''}
            onChange={(e) => onFormDataChange({ unit: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ex: unidade, kg, litro"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Temperatura
          </label>
          <select
            value={formData.temperature || ''}
            onChange={(e) => onFormDataChange({ temperature: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Selecione</option>
            <option value="cold">Gelado</option>
            <option value="hot">Quente</option>
            <option value="room">Temperatura Ambiente</option>
          </select>
        </div>
      </div>

      {/* Volume (para bebidas) */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Volume
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.volume || ''}
            onChange={(e) => {
              const value = e.target.value ? parseFloat(e.target.value) : undefined;
              onFormDataChange({ volume: value });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ex: 350"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unidade de Volume
          </label>
          <select
            value={formData.volumeUnit || ''}
            onChange={(e) => onFormDataChange({ volumeUnit: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Selecione</option>
            <option value="ml">Mililitros (ml)</option>
            <option value="l">Litros (l)</option>
          </select>
        </div>
      </div>

      {/* Configurações de Alertas */}
      <div className="mt-6 space-y-4">
        <h3 className="text-md font-medium text-gray-900">Configurações de Alertas</h3>
        
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="stockAlerts"
              type="checkbox"
              checked={formData.stockAlerts || false}
              onChange={(e) => onFormDataChange({ stockAlerts: e.target.checked })}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="stockAlerts" className="font-medium text-gray-700">
              Alertas de Estoque
            </label>
            <p className="text-gray-500">
              Receber notificações quando o estoque estiver baixo
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="autoRestock"
              type="checkbox"
              checked={formData.autoRestock || false}
              onChange={(e) => onFormDataChange({ autoRestock: e.target.checked })}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="autoRestock" className="font-medium text-gray-700">
              Reposição Automática
            </label>
            <p className="text-gray-500">
              Sugerir reposição automática quando atingir estoque mínimo
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="returnable"
              type="checkbox"
              checked={formData.returnable || false}
              onChange={(e) => onFormDataChange({ returnable: e.target.checked })}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="returnable" className="font-medium text-gray-700">
              Produto Retornável
            </label>
            <p className="text-gray-500">
              Este produto pode ser devolvido (ex: garrafas de vidro)
            </p>
          </div>
        </div>
      </div>

      {/* Exibir erros de validação */}
      {stockErrors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erros de Validação:
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {stockErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
