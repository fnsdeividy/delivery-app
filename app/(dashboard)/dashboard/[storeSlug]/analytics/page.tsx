"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import {
  useAnalytics,
  useCustomerMetrics,
  usePeakHours,
  useStoreMetrics,
  useTopProducts,
} from "@/hooks";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  AnalyticsHeader,
  MetricsCards,
  OrderStatusChart,
  ProductsTable,
  SalesChart,
  StatusIndicator,
  TopProductsChart,
} from "./components";

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const storeSlug = params.storeSlug as string;
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");

  // Usar contexto de autenticação
  const { isAuthenticated, user } = useAuthContext();

  // Hooks da API real
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useAnalytics(
    isAuthenticated ? storeSlug : "",
    timeRange === "7d" ? "daily" : timeRange === "30d" ? "weekly" : "monthly"
  );

  const {
    data: orderStats,
    isLoading: orderStatsLoading,
    error: orderStatsError,
  } = useStoreMetrics(isAuthenticated ? storeSlug : "");

  const {
    data: topProductsData,
    isLoading: topProductsLoading,
    error: topProductsError,
  } = useTopProducts(isAuthenticated ? storeSlug : "", 5);

  const {
    data: customerMetrics,
    isLoading: customerMetricsLoading,
    error: customerMetricsError,
  } = useCustomerMetrics(isAuthenticated ? storeSlug : "");

  const {
    data: peakHoursData,
    isLoading: peakHoursLoading,
    error: peakHoursError,
  } = usePeakHours(isAuthenticated ? storeSlug : "");

  // Usar dados da API
  const finalAnalyticsData = analyticsData;
  const finalOrderStats = orderStats;
  const finalTopProductsData = topProductsData;
  const finalCustomerMetrics = customerMetrics;
  const finalPeakHoursData = peakHoursData;

  // Função para traduzir status dos pedidos
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      RECEIVED: "Recebido",
      CONFIRMED: "Confirmado",
      PREPARING: "Em Preparo",
      READY: "Pronto",
      DELIVERING: "Em Entrega",
      DELIVERED: "Entregue",
      CANCELLED: "Cancelado",
    };
    return statusMap[status] || status;
  };

  const isLoading =
    analyticsLoading ||
    orderStatsLoading ||
    topProductsLoading ||
    customerMetricsLoading ||
    peakHoursLoading;

  // Calcular métricas baseadas nos dados da API
  const metrics = {
    totalOrders: orderStats?.totalOrders || 0,
    totalRevenue: orderStats?.totalRevenue || 0,
    totalCustomers: customerMetrics?.customerMetrics?.newCustomers || 0,
    averageOrderValue:
      (orderStats?.totalOrders || 0) > 0
        ? (orderStats?.totalRevenue || 0) / (orderStats?.totalOrders || 0)
        : 0,

    ordersGrowth: 0, // Será calculado com dados históricos
    revenueGrowth: 0, // Será calculado com dados históricos
    customersGrowth: 0, // Será calculado com dados históricos

    salesByPeriod:
      finalAnalyticsData?.revenue?.daily?.map(
        (revenue: number, index: number) => ({
          period:
            timeRange === "7d"
              ? ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][index] ||
                `Dia ${index + 1}`
              : `Dia ${index + 1}`,
          orders: finalAnalyticsData.orders?.daily?.[index] || 0,
          revenue: revenue || 0,
        })
      ) || [],

    topProducts:
      finalTopProductsData?.topProducts?.map((product: any) => ({
        name: product.productName,
        quantity: product.quantity,
        revenue: product.revenue,
      })) || [],

    peakHours: finalPeakHoursData || [],

    orderStatus: orderStats?.ordersByStatus
      ? Object.entries(orderStats.ordersByStatus).map(
          ([status, count]: [string, any]) => ({
            status: getStatusLabel(status),
            count,
            percentage:
              orderStats.totalOrders > 0
                ? (count / orderStats.totalOrders) * 100
                : 0,
          })
        )
      : [],

    averagePreparationTime: 0, // Será implementado quando a API suportar
    averageDeliveryTime: 0, // Será implementado quando a API suportar

    averageRating: 0, // Será implementado quando a API suportar
    totalReviews: 0, // Será implementado quando a API suportar
  };

  // Função para navegar para adicionar produto
  const handleAddProduct = () => {
    router.push(`/dashboard/${storeSlug}/produtos/novo`);
  };

  // Função para navegar para produtos
  const handleViewProducts = () => {
    router.push(`/dashboard/${storeSlug}/produtos`);
  };

  // Configurações dos gráficos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Dados para gráfico de vendas por período
  const salesChartData = {
    labels: metrics.salesByPeriod.map((period) => period.period),
    datasets: [
      {
        label: "Receita (R$)",
        data: metrics.salesByPeriod.map((period) => period.revenue),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
      },
      {
        label: "Pedidos",
        data: metrics.salesByPeriod.map((period) => period.orders),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        yAxisID: "y1",
      },
    ],
  };

  // Dados para gráfico de status dos pedidos
  const statusChartData = {
    labels: metrics.orderStatus.map((status) => status.status),
    datasets: [
      {
        data: metrics.orderStatus.map((status) => status.count),
        backgroundColor: [
          "#10b981", // Verde para entregue
          "#f59e0b", // Amarelo para em preparo
          "#3b82f6", // Azul para aguardando
          "#ef4444", // Vermelho para cancelado
          "#8b5cf6", // Roxo para outros
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  // Dados para gráfico de produtos mais vendidos
  const productsChartData = {
    labels: metrics.topProducts
      .slice(0, 5)
      .map(
        (product: { productName: string; quantity: number }) =>
          product.productName
      ),
    datasets: [
      {
        label: "Quantidade Vendida",
        data: metrics.topProducts
          .slice(0, 5)
          .map(
            (product: { productName: string; quantity: number }) =>
              product.quantity
          ),
        backgroundColor: "rgba(147, 51, 234, 0.8)",
        borderColor: "rgb(147, 51, 234)",
        borderWidth: 1,
      },
    ],
  };

  const salesChartOptionsWithDualAxis = {
    ...chartOptions,
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        beginAtZero: true,
        title: {
          display: true,
          text: "Receita (R$)",
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        beginAtZero: true,
        title: {
          display: true,
          text: "Número de Pedidos",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // Verificar se há erros em qualquer hook
  const hasErrors =
    analyticsError ||
    orderStatsError ||
    topProductsError ||
    customerMetricsError ||
    peakHoursError;

  // Verificar se há dados em pelo menos um hook
  const hasData =
    analyticsData ||
    orderStats ||
    topProductsData ||
    customerMetrics ||
    peakHoursData;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  if (hasErrors && !isLoading && !hasData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Erro ao carregar dados de analytics</p>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">Detalhes dos erros:</p>
            <ul className="text-xs text-red-500 mt-2 space-y-1">
              {analyticsError && <li>Analytics: {analyticsError.message}</li>}
              {orderStatsError && (
                <li>Order Stats: {orderStatsError.message}</li>
              )}
              {topProductsError && (
                <li>Top Products: {topProductsError.message}</li>
              )}
              {customerMetricsError && (
                <li>Customer Metrics: {customerMetricsError.message}</li>
              )}
              {peakHoursError && <li>Peak Hours: {peakHoursError.message}</li>}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("pt-BR").format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AnalyticsHeader
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Métricas Principais */}
        <MetricsCards
          metrics={metrics}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
        />

        {/* Gráficos e Análises */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de Vendas por Período */}
          <SalesChart salesByPeriod={metrics.salesByPeriod} />

          {/* Gráfico de Status dos Pedidos */}
          <OrderStatusChart orderStatus={metrics.orderStatus} />
        </div>

        {/* Gráfico de Produtos Mais Vendidos */}
        <TopProductsChart
          topProducts={metrics.topProducts}
        />

        {/* Tabela Detalhada de Produtos */}
        <ProductsTable
          topProducts={metrics.topProducts}
          formatCurrency={formatCurrency}
        />
      </div>
    </div>
  );
}
