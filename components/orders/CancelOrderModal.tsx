"use client";

import { Warning, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  orderNumber?: string;
}

export default function CancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
  orderNumber,
}: CancelOrderModalProps) {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsLoading(true);
    try {
      await onConfirm(reason.trim());
      setReason("");
      onClose();
    } catch (error) {
      console.error("Erro ao cancelar pedido:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  if (!isOpen || !isMounted) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Warning className="h-6 w-6 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Cancelar Pedido
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              {orderNumber ? `Pedido #${orderNumber}` : "Este pedido"} será
              cancelado.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Por favor, informe o motivo do cancelamento:
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo do Cancelamento *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Produto indisponível, cliente solicitou cancelamento, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none text-black"
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!reason.trim() || isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Cancelando..." : "Confirmar Cancelamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Renderizar o modal usando portal para garantir que apareça no nível mais alto
  return createPortal(modalContent, document.body);
}
