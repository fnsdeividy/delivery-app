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
  ArrowDownRight,
  ArrowUpRight,
  ChartBar,
  Clock,
  CurrencyDollar,
  Eye,
  Package,
  Plus,
  Pulse,
  ShoppingCart,
  Star,
  TrendUp,
  Users,
} from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function AnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");

  // Usar contexto de autenticação
  const { isAuthenticated, user } = useAuthContext();

  // Hooks da API real
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useAnalytics(
    isAuthenticated ? slug : "",
    timeRange === "7d" ? "daily" : timeRange === "30d" ? "weekly" : "monthly"
  );

  const {
    data: orderStats,
    isLoading: orderStatsLoading,
    error: orderStatsError,
  } = useStoreMetrics(isAuthenticated ? slug : "");

  const {
    data: topProductsData,
    isLoading: topProductsLoading,
    error: topProductsError,
  } = useTopProducts(isAuthenticated ? slug : "", 5);

  const {
    data: customerMetrics,
    isLoading: customerMetricsLoading,
    error: customerMetricsError,
  } = useCustomerMetrics(isAuthenticated ? slug : "");

  const {
    data: peakHoursData,
    isLoading: peakHoursLoading,
    error: peakHoursError,
  } = usePeakHours(isAuthenticated ? slug : "");

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
    router.push(`/dashboard/${slug}/produtos/novo`);
  };

  // Função para navegar para produtos
  const handleViewProducts = () => {
    router.push(`/dashboard/${slug}/produtos`);
  };

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
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <ChartBar className="h-6 w-6 text-orange-500" />
              <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
            </div>

            {/* Ações rápidas */}
            <div className="flex items-center space-x-3">
              {/* Filtro de período */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Período:</span>
                <select
                  value={timeRange}
                  onChange={(e) =>
                    setTimeRange(e.target.value as "7d" | "30d" | "90d")
                  }
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="7d">Últimos 7 dias</option>
                  <option value="30d">Últimos 30 dias</option>
                  <option value="90d">Últimos 90 dias</option>
                </select>
              </div>

              {/* Botão para adicionar produto */}
              <button
                onClick={handleAddProduct}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </button>

              {/* Botão para ver produtos */}
              <button
                onClick={handleViewProducts}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <Package className="h-4 w-4 mr-2" />
                Ver Produtos
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status da Integração */}
        {!isLoading && (
          <div className="mb-6">
            {!isAuthenticated ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Autenticação Necessária
                    </h3>
                    <p className="mt-1 text-sm text-blue-700">
                      Faça login para acessar os dados de analytics da sua loja.
                    </p>
                  </div>
                </div>
              </div>
            ) : hasErrors ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Erro ao Carregar Dados
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        Ocorreu um erro ao carregar dados da API. Verifique sua
                        conexão e tente novamente.
                      </p>
                      <div className="mt-2">
                        <p className="font-medium">Erros detectados:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {analyticsError && (
                            <li>Analytics: {analyticsError.message}</li>
                          )}
                          {orderStatsError && (
                            <li>Métricas: {orderStatsError.message}</li>
                          )}
                          {topProductsError && (
                            <li>Produtos: {topProductsError.message}</li>
                          )}
                          {customerMetricsError && (
                            <li>Clientes: {customerMetricsError.message}</li>
                          )}
                          {peakHoursError && (
                            <li>Horários: {peakHoursError.message}</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : hasData ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Dados da API
                    </h3>
                    <p className="mt-1 text-sm text-green-700">
                      A página está exibindo dados reais da API da sua loja.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-800">
                      Nenhum Dado Disponível
                    </h3>
                    <p className="mt-1 text-sm text-gray-700">
                      Não há dados disponíveis para exibir no momento.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total de Pedidos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total de Pedidos
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(metrics.totalOrders)}
                </p>
                <div className="flex items-center mt-2">
                  {metrics.ordersGrowth > 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      metrics.ordersGrowth > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {Math.abs(metrics.ordersGrowth)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    vs período anterior
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Receita Total */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Receita Total
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(metrics.totalRevenue)}
                </p>
                <div className="flex items-center mt-2">
                  {metrics.revenueGrowth > 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      metrics.revenueGrowth > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {Math.abs(metrics.revenueGrowth)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    vs período anterior
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CurrencyDollar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Clientes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(metrics.totalCustomers)}
                </p>
                <div className="flex items-center mt-2">
                  {metrics.customersGrowth > 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      metrics.customersGrowth > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {Math.abs(metrics.customersGrowth)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    vs período anterior
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Ticket Médio */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Ticket Médio
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(metrics.averageOrderValue)}
                </p>
                <p className="text-sm text-gray-500 mt-2">Por pedido</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos e Análises */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Vendas por Período */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vendas por Período
            </h3>
            <div className="space-y-4">
              {metrics.salesByPeriod.length > 0 ? (
                metrics.salesByPeriod.map((period, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-gray-600">
                      {period.period}
                    </span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        {period.orders} pedidos
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(period.revenue)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Nenhum dado de vendas disponível
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status dos Pedidos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Status dos Pedidos
            </h3>
            <div className="space-y-4">
              {metrics.orderStatus.length > 0 ? (
                metrics.orderStatus.map((status, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          status.status === "Entregue"
                            ? "bg-green-500"
                            : status.status === "Em Preparo"
                            ? "bg-yellow-500"
                            : status.status === "Aguardando"
                            ? "bg-blue-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <span className="text-sm font-medium text-gray-600">
                        {status.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {status.count}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({status.percentage}%)
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum pedido encontrado</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Produtos Mais Vendidos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Produtos Mais Vendidos
            </h3>
            <button
              onClick={handleAddProduct}
              className="inline-flex items-center px-3 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Produto
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Produto
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                    Quantidade
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                    Receita
                  </th>
                </tr>
              </thead>
              <tbody>
                {metrics.topProducts.length > 0 ? (
                  metrics.topProducts.map((product: any, index: number) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <Package className="h-5 w-5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm text-gray-900">
                          {product.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(product.revenue)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500">
                      <div className="text-center">
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 mb-2">
                          Nenhum produto vendido encontrado
                        </p>
                        <button
                          onClick={handleAddProduct}
                          className="inline-flex items-center px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors duration-200"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Primeiro Produto
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Métricas Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tempo Médio de Preparo */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tempo de Preparo
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {metrics.averagePreparationTime} min
                </p>
              </div>
            </div>
          </div>

          {/* Tempo Médio de Entrega */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center space-x-3">
              <Pulse className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tempo de Entrega
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {metrics.averageDeliveryTime} min
                </p>
              </div>
            </div>
          </div>

          {/* Avaliação Média */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center space-x-3">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avaliação Média
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {metrics.averageRating}/5.0
                </p>
              </div>
            </div>
          </div>

          {/* Total de Avaliações */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center space-x-3">
              <Eye className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avaliações</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatNumber(metrics.totalReviews)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Horários de Pico */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8 hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Horários de Pico
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {metrics.peakHours.length > 0 ? (
              metrics.peakHours.map((hour: any, index: number) => (
                <div key={index} className="text-center">
                  <div className="bg-orange-100 rounded-lg p-3 hover:bg-orange-200 transition-colors duration-200">
                    <p className="text-sm font-medium text-gray-900">
                      {hour.hour}
                    </p>
                    <p className="text-lg font-bold text-orange-600">
                      {hour.orders}
                    </p>
                    <p className="text-xs text-gray-500">pedidos</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">
                  Nenhum dado de horários de pico disponível
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
