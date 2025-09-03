"use client";

import { Package } from "@phosphor-icons/react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StockMovement {
  id: string;
  type: "ENTRADA" | "SAIDA" | "AJUSTE" | "DEVOLUCAO";
  quantity: number;
  reason?: string;
  reference?: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    image: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface MovementsTableProps {
  movements: StockMovement[];
  isLoading: boolean;
}

export default function MovementsTable({ movements, isLoading }: MovementsTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMovementTypeInfo = (type: string) => {
    switch (type) {
      case "ENTRADA":
        return {
          text: "Entrada",
          color: "text-green-600 bg-green-100",
          icon: TrendingUp,
        };
      case "SAIDA":
        return {
          text: "Saída",
          color: "text-red-600 bg-red-100",
          icon: TrendingDown,
        };
      case "AJUSTE":
        return {
          text: "Ajuste",
          color: "text-blue-600 bg-blue-100",
          icon: Package,
        };
      case "DEVOLUCAO":
        return {
          text: "Devolução",
          color: "text-purple-600 bg-purple-100",
          icon: Package,
        };
      default:
        return {
          text: type,
          color: "text-gray-600 bg-gray-100",
          icon: Package,
        };
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

  if (movements.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma movimentação encontrada
        </h3>
        <p className="text-gray-500">
          As movimentações de estoque aparecerão aqui
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data/Hora
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Produto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantidade
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Motivo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuário
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {movements.map((movement) => {
            const typeInfo = getMovementTypeInfo(movement.type);
            const TypeIcon = typeInfo.icon;

            return (
              <tr key={movement.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(movement.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={movement.product.image || "/placeholder-product.png"}
                      alt={movement.product.name}
                      className="w-8 h-8 rounded-lg object-cover mr-2"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-product.png";
                      }}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {movement.product.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${typeInfo.color}`}
                  >
                    <TypeIcon className="w-3 h-3 mr-1" />
                    {typeInfo.text}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className={`inline-flex items-center px-2 py-1 rounded-md font-medium ${
                    movement.type === "ENTRADA" ? "text-green-700 bg-green-50 border border-green-200" : 
                    movement.type === "SAIDA" ? "text-red-700 bg-red-50 border border-red-200" : 
                    "text-blue-700 bg-blue-50 border border-blue-200"
                  }`}>
                    {movement.type === "ENTRADA" ? "+" : movement.type === "SAIDA" ? "-" : "±"}
                    {movement.quantity} unidades
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="max-w-xs">
                    {movement.reason ? (
                      <div className="bg-gray-50 px-2 py-1 rounded text-xs border border-gray-200">
                        <span className="font-medium text-gray-700" title={movement.reason}>
                          {movement.reason.length > 30 ? `${movement.reason.substring(0, 30)}...` : movement.reason}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-xs">Sem motivo informado</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs font-medium text-blue-600">
                        {movement.user.name ? movement.user.name.charAt(0).toUpperCase() : "U"}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {movement.user.name || "Usuário"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {movement.user.email}
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
