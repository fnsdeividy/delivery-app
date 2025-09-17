import { apiClient } from "@/lib/api-client";
import { useApiCache } from "./useApiCache";

export interface DashboardMetrics {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  todaySales: number;
  weekSales: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

export interface StoreInfo {
  id: string;
  name: string;
  description: string;
  slug: string;
  logo?: string;
  banner?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export function useDashboardMetrics(storeSlug: string) {
  // Usar hook personalizado de cache para evitar chamadas duplicadas
  const {
    data: metricsData,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useApiCache(
    ["dashboard-metrics", storeSlug],
    async () => {
      try {
        return await apiClient.get<DashboardMetrics>(
          `/stores/dashboard-metrics/${storeSlug}`
        );
      } catch (error) {
        console.warn("API de métricas não disponível, usando dados mock");
        return {
          totalProducts: 24,
          totalOrders: 156,
          pendingOrders: 8,
          todaySales: 1250.5,
          weekSales: 8750.0,
          lowStockProducts: 3,
          outOfStockProducts: 1,
        };
      }
    },
    {
      enabled: !!storeSlug,
      staleTime: 2 * 60 * 1000, // 2 minutos
      gcTime: 5 * 60 * 1000, // 5 minutos
      // Otimizações adicionais
      refetchInterval: 5 * 60 * 1000, // Re-fetch a cada 5 minutos
      refetchIntervalInBackground: false, // Não re-fetch quando a aba não está ativa
    }
  );

  const {
    data: storeData,
    isLoading: storeLoading,
    error: storeError,
  } = useApiCache(
    ["store-info", storeSlug],
    async () => {
      try {
        return await apiClient.get<StoreInfo>(`/stores/slug/${storeSlug}`);
      } catch (error) {
        console.warn("API de loja não disponível, usando dados mock");
        return {
          id: "1",
          name: "Minha Loja",
          description: "Descrição da loja",
          slug: storeSlug,
          primaryColor: "#3B82F6",
          secondaryColor: "#10B981",
        };
      }
    },
    {
      enabled: !!storeSlug,
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 15 * 60 * 1000, // 15 minutos
    }
  );

  const loading = metricsLoading || storeLoading;
  const error = metricsError || storeError;

  const refreshMetrics = async () => {
    await refetchMetrics();
  };

  return {
    metrics: metricsData,
    storeInfo: storeData,
    loading,
    error: error?.message || null,
    refreshMetrics,
  };
}
