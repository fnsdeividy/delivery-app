"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import {
  useDashboardStats,
  useOrders,
  useOrderStats,
  useStore,
  useStores,
  useStoreStats,
} from "@/hooks";
import { OrderStatus, UserRole } from "@/types/cardapio-api";
import { memo, useCallback, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { OrderManagement } from "./OrderManagement";
import { StoreManagement } from "./StoreManagement";
import { UserManagement } from "./UserManagement";

interface DashboardProps {
  storeSlug?: string;
}

const DashboardComponent = ({ storeSlug }: DashboardProps) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthContext();
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "stores" | "products" | "orders" | "analytics"
  >("overview");

  // Memoizar a função de mudança de tab
  const handleTabChange = useCallback((tab: typeof activeTab) => {
    setActiveTab(tab);
  }, []);

  // Hooks para dados
  const { data: stores, isLoading: storesLoading } = useStores();
  const { data: store, isLoading: storeLoading } = useStore(storeSlug || "");
  const { data: storeStats, isLoading: statsLoading } = useStoreStats(
    storeSlug || ""
  );
  const { data: orders, isLoading: ordersLoading } = useOrders(storeSlug || "");
  const { data: orderStats, isLoading: orderStatsLoading } = useOrderStats(
    storeSlug || ""
  );

  // Hook para estatísticas da dashboard
  const dashboardStats = useDashboardStats(storeSlug || "");

  // Estados de loading
  const isLoading =
    authLoading ||
    storesLoading ||
    storeLoading ||
    statsLoading ||
    ordersLoading ||
    orderStatsLoading ||
    dashboardStats.isLoading;

  // Se não estiver autenticado, mostrar mensagem
  if (!isAuthenticated && !authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acesso Negado
          </h1>
          <p className="text-gray-600">
            Você precisa estar logado para acessar o dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Se estiver carregando, mostrar spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Determinar tipo de dashboard baseado no role do usuário
  const isStoreOwner =
    user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER;
  const isEmployee = user?.role === UserRole.EMPLOYEE;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isSuperAdmin
                  ? "Dashboard Super Admin"
                  : isStoreOwner
                  ? `Dashboard - ${store?.name || "Loja"}`
                  : "Dashboard"}
              </h1>
              <p className="text-gray-600">
                Bem-vindo, {user?.name} ({user?.role})
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {storeSlug ? `Loja: ${storeSlug}` : "Todas as Lojas"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              "overview",
              "users",
              "stores",
              "products",
              "orders",
              "analytics",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab === "overview" && "Visão Geral"}
                {tab === "users" && "Usuários"}
                {tab === "stores" && "Lojas"}
                {tab === "products" && "Produtos"}
                {tab === "orders" && "Pedidos"}
                {tab === "analytics" && "Analytics"}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardStats.isLoading ? (
                // Loading state para os cards
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg shadow p-6 animate-pulse"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-md"></div>
                        <div className="ml-4 flex-1">
                          <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                          <div className="h-8 bg-gray-300 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : dashboardStats.error ? (
                // Error state para os cards
                <div className="col-span-4 bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Erro ao carregar estatísticas
                      </h3>
                      <p className="text-sm text-red-700 mt-1">
                        {dashboardStats.error.message ||
                          "Não foi possível carregar as estatísticas da dashboard."}
                      </p>
                      <button
                        onClick={() => window.location.reload()}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Total de Produtos */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">
                          Total de Produtos
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {dashboardStats.totalProducts}
                        </p>
                        <button
                          onClick={() => setActiveTab("products")}
                          className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                        >
                          Ver todos
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Total de Pedidos */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">
                          Total de Pedidos
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {dashboardStats.totalOrders}
                        </p>
                        <button
                          onClick={() => setActiveTab("orders")}
                          className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                        >
                          Ver todos
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pedidos Pendentes */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">
                          Pedidos Pendentes
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {dashboardStats.pendingOrders}
                        </p>
                        <button
                          onClick={() => setActiveTab("orders")}
                          className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                        >
                          Ver todos
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Vendas do Dia */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">
                          Vendas do Dia
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                          R$ {dashboardStats.dailySales.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Recent Orders */}
            {orders && orders.data.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Pedidos Recentes
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pedido
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.data.slice(0, 5).map((order: any) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{order.orderNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.customer.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                order.status === OrderStatus.DELIVERED
                                  ? "bg-green-100 text-green-800"
                                  : order.status === OrderStatus.CANCELLED
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            R$ {order.total.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString(
                              "pt-BR"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Gerenciamento de Usuários
              </h3>
            </div>
            <div className="p-6">
              {isSuperAdmin ? (
                <UserManagement />
              ) : (
                <UserManagement storeSlug={storeSlug} />
              )}
            </div>
          </div>
        )}

        {activeTab === "stores" && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Gerenciamento de Lojas
              </h3>
            </div>
            <div className="p-6">
              {isSuperAdmin ? (
                <StoreManagement />
              ) : (
                <p className="text-gray-500">
                  Apenas super administradores podem gerenciar lojas.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Gerenciamento de Pedidos
              </h3>
            </div>
            <div className="p-6">
              {storeSlug ? (
                <OrderManagement storeSlug={storeSlug} />
              ) : (
                <p className="text-gray-500">
                  Selecione uma loja para gerenciar pedidos.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Gerenciamento de Produtos
              </h3>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-500">
                Gráficos e análises serão implementados aqui.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Memoizar o componente Dashboard para evitar re-renders desnecessários
export const Dashboard = memo(DashboardComponent);
