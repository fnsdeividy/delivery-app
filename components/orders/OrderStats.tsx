import { formatCurrency } from "@/lib/utils/order-utils";
import { OrderStatus, PaymentStatus } from "@/types/cardapio-api";
import { OrderStats as OrderStatsType } from "@/types/order";
import {
  CheckCircle,
  Clock,
  CurrencyDollar,
  Package,
  TrendUp,
  Truck,
  XCircle,
} from "@phosphor-icons/react";

interface OrderStatsProps {
  stats: OrderStatsType;
  orders: any[];
}

export default function OrderStats({ stats, orders }: OrderStatsProps) {
  const totalRevenue = orders
    .filter((o: any) => o.paymentStatus === PaymentStatus.PAID)
    .reduce((sum: number, o: any) => sum + o.total, 0);

  const pendingOrders = orders.filter(
    (o: any) => o.status === OrderStatus.RECEIVED
  ).length;
  const confirmedOrders = orders.filter(
    (o: any) => o.status === OrderStatus.CONFIRMED
  ).length;
  const preparingOrders = orders.filter(
    (o: any) => o.status === OrderStatus.PREPARING
  ).length;
  const readyOrders = orders.filter(
    (o: any) => o.status === OrderStatus.READY
  ).length;
  const deliveringOrders = orders.filter(
    (o: any) => o.status === OrderStatus.DELIVERING
  ).length;
  const deliveredOrders = orders.filter(
    (o: any) => o.status === OrderStatus.DELIVERED
  ).length;
  const cancelledOrders = orders.filter(
    (o: any) => o.status === OrderStatus.CANCELLED
  ).length;

  return (
    <div className="space-y-4 mb-6">
      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                Total de Pedidos
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">
                {pendingOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <TrendUp className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Em Andamento</p>
              <p className="text-2xl font-bold text-gray-900">
                {confirmedOrders + preparingOrders + readyOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center">
            <CurrencyDollar className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas Detalhadas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <div className="ml-2">
              <p className="text-xs font-medium text-blue-900">Confirmados</p>
              <p className="text-lg font-bold text-blue-900">
                {confirmedOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-orange-600" />
            <div className="ml-2">
              <p className="text-xs font-medium text-orange-900">Preparando</p>
              <p className="text-lg font-bold text-orange-900">
                {preparingOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="ml-2">
              <p className="text-xs font-medium text-green-900">Prontos</p>
              <p className="text-lg font-bold text-green-900">{readyOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <Truck className="h-5 w-5 text-purple-600" />
            <div className="ml-2">
              <p className="text-xs font-medium text-purple-900">Entregando</p>
              <p className="text-lg font-bold text-purple-900">
                {deliveringOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <div className="ml-2">
              <p className="text-xs font-medium text-emerald-900">Entregues</p>
              <p className="text-lg font-bold text-emerald-900">
                {deliveredOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-600" />
            <div className="ml-2">
              <p className="text-xs font-medium text-red-900">Cancelados</p>
              <p className="text-lg font-bold text-red-900">
                {cancelledOrders}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
