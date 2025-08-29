import { DashboardMetrics as DashboardMetricsType } from "@/hooks/useDashboardMetrics";
import {
  Clock,
  CurrencyDollar,
  Package,
  ShoppingBag,
  TrendUp,
} from "@phosphor-icons/react";
import Link from "next/link";

interface DashboardMetricsProps {
  metrics: DashboardMetricsType;
  storeSlug: string;
}

// Função helper para formatar preço
const formatPrice = (price: any): string => {
  if (price === null || price === undefined) return "0.00";

  // Se for string, converter para número
  if (typeof price === "string") {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  }

  // Se for número, usar toFixed
  if (typeof price === "number") {
    return price.toFixed(2);
  }

  // Se for objeto Decimal do Prisma, usar toString
  if (price && typeof price === "object" && "toString" in price) {
    const numPrice = parseFloat(price.toString());
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  }

  return "0.00";
};

export function DashboardMetrics({
  metrics,
  storeSlug,
}: DashboardMetricsProps) {
  const metricCards = [
    {
      icon: Package,
      label: "Total de Produtos",
      value: metrics.totalProducts,
      color: "text-blue-600",
      href: `/dashboard/${storeSlug}/produtos`,
    },
    {
      icon: ShoppingBag,
      label: "Total de Pedidos",
      value: metrics.totalOrders,
      color: "text-green-600",
      href: `/dashboard/${storeSlug}/pedidos`,
    },
    {
      icon: Clock,
      label: "Pedidos Pendentes",
      value: metrics.pendingOrders,
      color: "text-yellow-600",
      href: `/dashboard/${storeSlug}/pedidos`,
    },
    {
      icon: CurrencyDollar,
      label: "Vendas do Dia",
      value: `R$ ${formatPrice(metrics.todaySales)}`,
      color: "text-purple-600",
      href: `/dashboard/${storeSlug}/analytics`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <Icon className={`w-8 h-8 ${card.color}`} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
            <Link
              href={card.href}
              className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              Ver todos <TrendUp className="w-4 h-4 ml-1" />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
