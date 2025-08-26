"use client";

import { useCategories, useProducts } from "@/hooks";
import { ArrowUp, Clock, Gear, Package } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

interface StoreDashboardProps {
  storeSlug: string;
}

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  activeCategories: number;
  estimatedRevenue: number;
  averagePreparationTime: number;
}

export function StoreDashboard({ storeSlug }: StoreDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalCategories: 0,
    activeCategories: 0,
    estimatedRevenue: 0,
    averagePreparationTime: 0,
  });

  // Buscar dados da loja
  const { data: productsData, isLoading: isLoadingProducts } = useProducts(
    storeSlug,
    1,
    1000
  );
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useCategories(storeSlug);

  // Calcular estatísticas
  useEffect(() => {
    if (productsData && categoriesData) {
      const activeProducts = productsData.data.filter((p) => p.active).length;
      const activeCategories = categoriesData.filter((c) => c.active).length;
      const estimatedRevenue = productsData.data.reduce(
        (sum, p) => sum + p.price * 0.1,
        0
      ); // Estimativa de 10% de vendas
      const avgPrepTime =
        productsData.data.reduce(
          (sum, p) => sum + (p.preparationTime || 15),
          0
        ) / productsData.data.length;

      setStats({
        totalProducts: productsData.data.length,
        activeProducts,
        totalCategories: categoriesData.length,
        activeCategories,
        estimatedRevenue,
        averagePreparationTime: Math.round(avgPrepTime),
      });
    }
  }, [productsData, categoriesData]);

  if (isLoadingProducts || isLoadingCategories) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Carregando dashboard...</span>
      </div>
    );
  }

  const metricCards = [
    {
      title: "Total de Produtos",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-blue-500",
      description: `${stats.activeProducts} ativos`,
    },
    {
      title: "Categorias",
      value: stats.totalCategories,
      icon: Package,
      color: "bg-green-500",
      description: `${stats.activeCategories} ativas`,
    },
    {
      title: "Receita Estimada",
      value: `R$ ${stats.estimatedRevenue.toFixed(2)}`,
      icon: ArrowUp,
      color: "bg-orange-500",
      description: "Baseado em preços dos produtos",
    },
    {
      title: "Tempo Médio de Preparo",
      value: `${stats.averagePreparationTime} min`,
      icon: Clock,
      color: "bg-purple-500",
      description: "Média dos produtos",
    },
  ];

  const recentProducts = productsData?.data.slice(0, 5) || [];
  const recentCategories = categoriesData?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${metric.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.value}
                  </p>
                  <p className="text-xs text-gray-500">{metric.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráficos e Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos por Categoria */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Produtos por Categoria
          </h3>
          {categoriesData && categoriesData.length > 0 ? (
            <div className="space-y-3">
              {categoriesData.map((category) => {
                const productCount =
                  productsData?.data.filter((p) => p.categoryId === category.id)
                    .length || 0;
                const percentage =
                  stats.totalProducts > 0
                    ? (productCount / stats.totalProducts) * 100
                    : 0;

                return (
                  <div
                    key={category.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {category.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 w-8 text-right">
                        {productCount}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nenhuma categoria encontrada
            </p>
          )}
        </div>

        {/* Status dos Produtos */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Status dos Produtos
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Produtos Ativos
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{
                      width: `${
                        stats.totalProducts > 0
                          ? (stats.activeProducts / stats.totalProducts) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats.activeProducts}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Produtos Inativos
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full"
                    style={{
                      width: `${
                        stats.totalProducts > 0
                          ? ((stats.totalProducts - stats.activeProducts) /
                              stats.totalProducts) *
                            100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats.totalProducts - stats.activeProducts}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Produtos Recentes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Produtos Recentes
        </h3>
        {recentProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.image && (
                          <img
                            className="h-10 w-10 rounded-full object-cover mr-3"
                            src={product.image}
                            alt={product.name}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            Nenhum produto encontrado
          </p>
        )}
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            <Package className="w-5 h-5 mr-2" />
            Adicionar Produto
          </button>

          <button className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Package className="w-5 h-5 mr-2" />
            Nova Categoria
          </button>

          <button className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Gear className="w-5 h-5 mr-2" />
            Configurações
          </button>
        </div>
      </div>
    </div>
  );
}
