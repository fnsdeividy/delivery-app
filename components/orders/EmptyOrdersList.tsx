import { Package } from "@phosphor-icons/react";

interface EmptyOrdersListProps {
  hasFilters: boolean;
}

export default function EmptyOrdersList({ hasFilters }: EmptyOrdersListProps) {
  return (
    <div className="text-center py-12 bg-white rounded-lg shadow">
      <Package className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        Nenhum pedido encontrado
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        {hasFilters
          ? "Tente ajustar os filtros de busca."
          : "Ainda não há pedidos registrados."}
      </p>
    </div>
  );
}
