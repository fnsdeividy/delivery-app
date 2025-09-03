"use client";

import { X, Package, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

interface StockActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    image?: string;
  };
  action: "adjust" | "entry" | "exit";
  currentQuantity?: number;
  onConfirm: (quantity: number, reason: string) => Promise<void>;
}

export default function StockActionModal({
  isOpen,
  onClose,
  product,
  action,
  currentQuantity = 0,
  onConfirm,
}: StockActionModalProps) {
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const getActionInfo = () => {
    switch (action) {
      case "adjust":
        return {
          title: "Ajustar Estoque",
          icon: Package,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          placeholder: "Nova quantidade",
          reasonPlaceholder: "Motivo do ajuste",
        };
      case "entry":
        return {
          title: "Entrada de Estoque",
          icon: TrendingUp,
          color: "text-green-600",
          bgColor: "bg-green-50",
          placeholder: "Quantidade a adicionar",
          reasonPlaceholder: "Motivo da entrada",
        };
      case "exit":
        return {
          title: "Saída de Estoque",
          icon: TrendingDown,
          color: "text-red-600",
          bgColor: "bg-red-50",
          placeholder: "Quantidade a remover",
          reasonPlaceholder: "Motivo da saída",
        };
    }
  };

  const actionInfo = getActionInfo();
  const Icon = actionInfo.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quantity || !reason) return;
    
    const numQuantity = Number(quantity);
    if (isNaN(numQuantity) || numQuantity <= 0) return;

    setIsLoading(true);
    try {
      await onConfirm(numQuantity, reason);
      onClose();
      setQuantity("");
      setReason("");
    } catch (error) {
      console.error("Erro ao executar ação:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${actionInfo.bgColor} mr-3`}>
              <Icon className={`w-5 h-5 ${actionInfo.color}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {actionInfo.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <div className="flex items-center mb-4">
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover mr-3"
                />
              )}
              <div>
                <h4 className="font-medium text-gray-900">{product.name}</h4>
                {action !== "adjust" && (
                  <p className="text-sm text-gray-500">
                    Estoque atual: {currentQuantity} unidades
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {actionInfo.placeholder}
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={actionInfo.placeholder}
              min="1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={actionInfo.reasonPlaceholder}
              rows={3}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !quantity || !reason}
              className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${actionInfo.color.replace('text-', 'bg-').replace('-600', '-600')} hover:${actionInfo.color.replace('text-', 'bg-').replace('-600', '-700')}`}
            >
              {isLoading ? "Processando..." : "Confirmar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
