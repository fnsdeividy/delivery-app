import { formatCurrency } from "@/lib/utils/order-utils";
import { PaymentStatus } from "@/types/cardapio-api";
import { OrderStats as OrderStatsType } from "@/types/order";
import { Clock, CurrencyDollar, Package, Truck } from "@phosphor-icons/react";

interface OrderStatsProps {
  stats: OrderStatsType;
  orders: any[];
}

export default function OrderStats({ stats, orders }: OrderStatsProps) {
  const totalRevenue = orders
    .filter((o: any) => o.paymentStatus === PaymentStatus.PAID)
    .reduce((sum: number, o: any) => sum + o.total, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center">
          <Package className="h-8 w-8 text-purple-500" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center">
          <Clock className="h-8 w-8 text-yellow-500" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Pendentes</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.pending + stats.preparing}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center">
          <Truck className="h-8 w-8 text-purple-500" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Entregando</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.delivering}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center">
          <CurrencyDollar className="h-8 w-8 text-purple-500" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Receita</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
