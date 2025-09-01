"use client";

import { useState } from 'react';
import { Plus, X } from "@phosphor-icons/react";

interface Classification {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface ProductClassificationsProps {
  formData: {
    classifications?: string[];
    tags?: string[];
    tagColor?: string;
  };
  onFormDataChange: (updates: Partial<ProductClassificationsProps['formData']>) => void;
}

const AVAILABLE_CLASSIFICATIONS: Classification[] = [
  { 
    id: "vegan", 
    name: "Vegano", 
    icon: "🌱", 
    description: "Produto 100% vegano, sem ingredientes de origem animal" 
  },
  { 
    id: "vegetarian", 
    name: "Vegetariano", 
    icon: "🥗", 
    description: "Produto vegetariano, sem carnes mas pode conter ovos e laticínios" 
  },
  { 
    id: "gluten-free", 
    name: "Sem Glúten", 
    icon: "🌾", 
    description: "Produto sem glúten, ideal para celíacos" 
  },
  { 
    id: "lactose-free", 
    name: "Sem Lactose", 
    icon: "🥛", 
    description: "Produto sem lactose ou derivados de leite" 
  },
  { 
    id: "sugar-free", 
    name: "Sem Açúcar", 
    icon: "🚫", 
    description: "Produto sem açúcar adicionado" 
  },
  { 
    id: "organic", 
    name: "Orgânico", 
    icon: "♻️", 
    description: "Produto feito com ingredientes orgânicos" 
  },
  { 
    id: "spicy", 
    name: "Picante", 
    icon: "🌶️", 
    description: "Produto picante" 
  },
  { 
    id: "contains-alcohol", 
    name: "Contém Álcool", 
    icon: "🍸", 
    description: "Produto contém álcool" 
  },
  { 
    id: "contains-nuts", 
    name: "Contém Nozes", 
    icon: "🥜", 
    description: "Produto contém nozes ou castanhas" 
  },
];

const TAG_COLORS = [
  { value: 'blue', label: 'Azul', class: 'bg-blue-100 text-blue-800' },
  { value: 'green', label: 'Verde', class: 'bg-green-100 text-green-800' },
  { value: 'yellow', label: 'Amarelo', class: 'bg-yellow-100 text-yellow-800' },
  { value: 'red', label: 'Vermelho', class: 'bg-red-100 text-red-800' },
  { value: 'purple', label: 'Roxo', class: 'bg-purple-100 text-purple-800' },
  { value: 'pink', label: 'Rosa', class: 'bg-pink-100 text-pink-800' },
  { value: 'indigo', label: 'Índigo', class: 'bg-indigo-100 text-indigo-800' },
  { value: 'gray', label: 'Cinza', class: 'bg-gray-100 text-gray-800' },
];

export function ProductClassifications({ formData, onFormDataChange }: ProductClassificationsProps) {
  const [newTag, setNewTag] = useState<string>("");
  
  const selectedClassifications = formData.classifications || [];
  const tags = formData.tags || [];

  const handleClassificationToggle = (classificationId: string) => {
    const isSelected = selectedClassifications.includes(classificationId);
    
    let updatedClassifications: string[];
    if (isSelected) {
      updatedClassifications = selectedClassifications.filter(id => id !== classificationId);
    } else {
      updatedClassifications = [...selectedClassifications, classificationId];
    }
    
    onFormDataChange({ classifications: updatedClassifications });
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onFormDataChange({ 
        tags: [...tags, newTag.trim()]
      });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onFormDataChange({
      tags: tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Validar classificações incompatíveis
  const getIncompatibleWarnings = () => {
    const warnings = [];
    if (selectedClassifications.includes('vegan') && selectedClassifications.includes('vegetarian')) {
      warnings.push("Produtos veganos já são vegetarianos por definição");
    }
    if (selectedClassifications.includes('vegan') && selectedClassifications.includes('lactose-free')) {
      warnings.push("Produtos veganos já são livres de lactose por definição");
    }
    return warnings;
  };

  const incompatibleWarnings = getIncompatibleWarnings();

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Classificações e Tags
      </h2>

      {/* Classificações Dietéticas */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-900 mb-3">
          Classificações Dietéticas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {AVAILABLE_CLASSIFICATIONS.map((classification) => {
            const isSelected = selectedClassifications.includes(classification.id);
            
            return (
              <div
                key={classification.id}
                onClick={() => handleClassificationToggle(classification.id)}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{classification.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">
                        {classification.name}
                      </span>
                      {isSelected && (
                        <div className="ml-2 w-2 h-2 bg-purple-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {classification.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Avisos de incompatibilidade */}
        {incompatibleWarnings.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  ⚠️ Avisos de Classificação:
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {incompatibleWarnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tags Personalizadas */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-900 mb-3">
          Tags Personalizadas
        </h3>
        
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Digite uma tag personalizada"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center"
          >
            <Plus size={16} className="mr-1" />
            Adicionar
          </button>
        </div>

        {/* Exibir tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  TAG_COLORS.find(c => c.value === formData.tagColor)?.class || 'bg-gray-100 text-gray-800'
                }`}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-current hover:text-red-600"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Cor das Tags */}
      {tags.length > 0 && (
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-3">
            Cor das Tags
          </h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {TAG_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => onFormDataChange({ tagColor: color.value })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.tagColor === color.value
                    ? 'border-purple-500'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                title={color.label}
              >
                <div className={`w-full h-4 rounded ${color.class.split(' ')[0]} ${color.class.split(' ')[1]}`}>
                  <span className="sr-only">{color.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
