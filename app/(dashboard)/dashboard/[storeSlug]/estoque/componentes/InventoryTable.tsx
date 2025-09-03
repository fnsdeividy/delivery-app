"use client";

import { CheckCircle, Package, Warning } from "@phosphor-icons/react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import StockActionModal from "./StockActionModal";

interface InventoryItem {
  id: string;
  quantity: number;
  minStock: number;
  maxStock?: number;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    active: boolean;
    category: {
      id: string;
      name: string;
    };
  };
}

interface InventoryTableProps {
  inventory: InventoryItem[];
  isLoading: boolean;
  onUpdateInventory: (inventoryId: string, newQuantity: number) => Promise<void>;
  onCreateMovement: (
    productId: string,
    type: "ENTRADA" | "SAIDA",
    quantity: number,
    reason: string
  ) => Promise<void>;
}

export default function InventoryTable({
  inventory,
  isLoading,
  onUpdateInventory,
  onCreateMovement,
}: InventoryTableProps) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    product: any;
    action: "adjust" | "entry" | "exit";
    inventoryId?: string;
    currentQuantity?: number;
  }>({
    isOpen: false,
    product: null,
    action: "adjust",
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity <= 0)
      return {
        text: "Sem estoque",
        color: "text-red-600 bg-red-100",
        icon: Warning,
      };
    if (quantity <= minStock)
      return {
        text: "Estoque baixo",
        color: "text-yellow-600 bg-yellow-100",
        icon: Warning,
      };
    return {
      text: "Em estoque",
      color: "text-green-600 bg-green-100",
      icon: CheckCircle,
    };
  };

  const openModal = (
    product: any,
    action: "adjust" | "entry" | "exit",
    inventoryId?: string,
    currentQuantity?: number
  ) => {
    setModalState({
      isOpen: true,
      product,
      action,
      inventoryId,
      currentQuantity,
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      product: null,
      action: "adjust",
    });
  };

  const handleConfirm = async (quantity: number, reason: string) => {
    if (modalState.action === "adjust" && modalState.inventoryId) {
      await onUpdateInventory(modalState.inventoryId, quantity);
    } else if (modalState.action === "entry" || modalState.action === "exit") {
      const type = modalState.action === "entry" ? "ENTRADA" : "SAIDA";
      await onCreateMovement(modalState.product.id, type, quantity, reason);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (inventory.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum produto encontrado
        </h3>
        <p className="text-gray-500">
          Comece criando produtos para gerenciar o estoque
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estoque Atual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estoque Mínimo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventory.map((item) => {
              const status = getStockStatus(item.quantity, item.minStock);
              const StatusIcon = status.icon;

              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={item.product.image || "/placeholder-product.png"}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-lg object-cover mr-3"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-product.png";
                        }}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.product.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {item.product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {item.product.category?.name || "Sem categoria"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.quantity} unidades
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatPrice(item.product.price)} cada
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.minStock} unidades
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}
                    >
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.text}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                      <button
                        onClick={() =>
                          openModal(
                            item.product,
                            "adjust",
                            item.id,
                            item.quantity
                          )
                        }
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors"
                      >
                        <Package className="w-3 h-3 mr-1.5" />
                        Ajustar
                      </button>
                      <button
                        onClick={() =>
                          openModal(
                            item.product,
                            "entry",
                            undefined,
                            item.quantity
                          )
                        }
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 hover:border-green-300 transition-colors"
                      >
                        <TrendingUp className="w-3 h-3 mr-1.5" />
                        Entrada
                      </button>
                      <button
                        onClick={() =>
                          openModal(
                            item.product,
                            "exit",
                            undefined,
                            item.quantity
                          )
                        }
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors"
                      >
                        <TrendingDown className="w-3 h-3 mr-1.5" />
                        Saída
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <StockActionModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        product={modalState.product}
        action={modalState.action}
        currentQuantity={modalState.currentQuantity}
        onConfirm={handleConfirm}
      />
    </>
  );
}
