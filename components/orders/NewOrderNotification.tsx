import { formatCurrency } from "@/lib/utils/order-utils";
import { Order } from "@/types/cardapio-api";
import { Bell, X } from "lucide-react";
import { useEffect, useState } from "react";

interface NewOrderNotificationProps {
  newOrder?: Order | null;
  onClose: () => void;
}

export function NewOrderNotification({
  newOrder,
  onClose,
}: NewOrderNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (newOrder) {
      setIsVisible(true);

      // Auto-hide após 5 segundos
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [newOrder]);

  if (!isVisible || !newOrder) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5 duration-300">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Bell className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Novo Pedido!</p>
              <p className="text-sm text-gray-600 truncate">
                {newOrder.customer?.name || "Cliente"} -{" "}
                {newOrder.items?.length || 0} item(s)
              </p>
              <p className="text-xs text-gray-500">
                {formatCurrency(newOrder.total || 0)}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              onClose();
            }}
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
