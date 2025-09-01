"use client";

import { useState } from 'react';
import { TextB, TextItalic, ListBullets } from "@phosphor-icons/react";
import ReactMarkdown from 'react-markdown';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface ProductBasicInfoProps {
  formData: {
    name: string;
    categoryId: string;
    price: number;
    originalPrice?: number;
    description: string;
  };
  categories: Category[];
  onFormDataChange: (updates: Partial<ProductBasicInfoProps['formData']>) => void;
}

export function ProductBasicInfo({ formData, categories, onFormDataChange }: ProductBasicInfoProps) {
  const { parseAndFormatBRL, formatBRL } = useCurrencyFormatter();
  const [priceText, setPriceText] = useState<string>(formData.price ? formatBRL(formData.price) : "");
  const [originalPriceText, setOriginalPriceText] = useState<string>(
    formData.originalPrice ? formatBRL(formData.originalPrice) : ""
  );
  const [showDescriptionPreview, setShowDescriptionPreview] = useState(false);

  const getPlaceholderByCategory = (categoryId: string) => {
    const category = Array.isArray(categories) ? categories.find(c => c.id === categoryId)?.name.toLowerCase() || "" : "";

    if (category.includes("bebida") || category.includes("drink")) {
      return "Ex: Coca-Cola 2L";
    }
    if (category.includes("comida") || category.includes("lanche") || category.includes("burger")) {
      return "Ex: X-Burger Clássico";
    }
    if (category.includes("sobremesa") || category.includes("doce")) {
      return "Ex: Pudim de Leite";
    }
    if (category.includes("pizza")) {
      return "Ex: Pizza Margherita";
    }
    return "Ex: Nome do produto";
  };

  const handleTextFormatting = (format: 'bold' | 'italic' | 'list') => {
    const textarea = document.getElementById('description-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.description;
    const selectedText = text.substring(start, end);
    let newText = text;

    switch (format) {
      case 'bold':
        newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
        break;
      case 'italic':
        newText = text.substring(0, start) + `*${selectedText}*` + text.substring(end);
        break;
      case 'list':
        let lineStart = start;
        while (lineStart > 0 && text.charAt(lineStart - 1) !== '\n') {
          lineStart--;
        }
        newText = text.substring(0, lineStart) + "- " + text.substring(lineStart);
        break;
    }

    onFormDataChange({ description: newText });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Informações Básicas
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Produto *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onFormDataChange({ name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder={getPlaceholderByCategory(formData.categoryId)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria *
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) => onFormDataChange({ categoryId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="">Selecione uma categoria</option>
            {Array.isArray(categories) && categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preço *
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={priceText}
            onChange={(e) => {
              const { text, value } = parseAndFormatBRL(e.target.value);
              setPriceText(text);
              onFormDataChange({ price: value });
            }}
            onBlur={() => {
              setPriceText(formData.price ? formatBRL(formData.price) : "");
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="R$ 0,00"
            aria-label="Preço em reais"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Digite apenas números (ex.: 1234 vira R$ 12,34)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preço Original
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={originalPriceText}
            onChange={(e) => {
              const { text, value } = parseAndFormatBRL(e.target.value);
              setOriginalPriceText(text);
              onFormDataChange({ originalPrice: value });
            }}
            onBlur={() => {
              setOriginalPriceText(
                formData.originalPrice ? formatBRL(formData.originalPrice) : ""
              );
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="R$ 0,00"
            aria-label="Preço original em reais"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        
        <div className="flex flex-wrap gap-2 mb-2">
          <button 
            type="button"
            onClick={() => handleTextFormatting('bold')}
            className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50"
            title="Negrito"
          >
            <TextB size={16} weight="bold" />
          </button>
          
          <button 
            type="button"
            onClick={() => handleTextFormatting('italic')}
            className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50"
            title="Itálico"
          >
            <TextItalic size={16} />
          </button>
          
          <button 
            type="button"
            onClick={() => handleTextFormatting('list')}
            className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50"
            title="Lista com marcadores"
          >
            <ListBullets size={16} />
          </button>
          
          <button
            type="button"
            className={`ml-auto inline-flex items-center px-3 py-1 rounded text-sm ${
              showDescriptionPreview 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setShowDescriptionPreview(!showDescriptionPreview)}
          >
            {showDescriptionPreview ? 'Editar' : 'Visualizar'}
          </button>
        </div>
        
        <div className={`${showDescriptionPreview ? 'hidden' : 'block'}`}>
          <textarea
            id="description-textarea"
            value={formData.description}
            onChange={(e) => onFormDataChange({ description: e.target.value })}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Descreva o produto... Use **negrito** para texto em negrito, *itálico* para itálico e - para listas."
          />
        </div>
        
        {showDescriptionPreview && (
          <div className="border border-gray-300 rounded-md p-4 bg-gray-50 min-h-[120px]">
            {formData.description ? (
              <div className="prose prose-sm">
                <ReactMarkdown>{formData.description}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-gray-400 italic">Sem descrição para visualizar.</p>
            )}
          </div>
        )}
        
        <p className="mt-1 text-xs text-gray-500">
          Use **texto** para negrito, *texto* para itálico e - para lista com marcadores.
        </p>
      </div>
    </div>
  );
}
