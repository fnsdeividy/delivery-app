import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  dailySales: number;
  isLoading: boolean;
  error: Error | null;
}

export function useDashboardStats(storeSlug: string): DashboardStats {
  // Buscar estatísticas da loja
  const {
    data: storeStats,
    isLoading: storeStatsLoading,
    error: storeStatsError,
  } = useQuery({
    queryKey: ["store", storeSlug, "stats"],
    queryFn: () => apiClient.getStoreStats(storeSlug),
    enabled: !!storeSlug,
  });

  // Buscar estatísticas de pedidos
  const {
    data: orderStats,
    isLoading: orderStatsLoading,
    error: orderStatsError,
  } = useQuery({
    queryKey: ["orders", storeSlug, "stats"],
    queryFn: () => (apiClient as any).getOrderStats(storeSlug),
    enabled: !!storeSlug,
  });

  // Buscar produtos para contar total
  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ["products", storeSlug, "all"],
    queryFn: async () => {
      // Buscar todos os produtos (sem paginação para contar total)
      const response = await (apiClient as any).getProducts(storeSlug, 1, 1000);
      return response;
    },
    enabled: !!storeSlug,
  });

  // Buscar pedidos para contar pendentes
  const {
    data: orders,
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ["orders", storeSlug, "all"],
    queryFn: async () => {
      // Buscar todos os pedidos (sem paginação para contar total)
      const response = await (apiClient as any).getOrders(storeSlug, 1, 1000);
      return response;
    },
    enabled: !!storeSlug,
  });

  // Calcular estatísticas
  const totalProducts = products?.data?.length || 0;
  const totalOrders = storeStats?.totalOrders || 0;
  const pendingOrders =
    orders?.data?.filter(
      (order: any) =>
        order.status === "RECEIVED" || order.status === "CONFIRMED"
    )?.length || 0;

  // Calcular vendas do dia
  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const dailySales =
    orders?.data
      ?.filter((order: any) => new Date(order.createdAt) >= startOfDay)
      ?.reduce((total: number, order: any) => total + order.total, 0) || 0;

  const isLoading =
    storeStatsLoading || orderStatsLoading || productsLoading || ordersLoading;
  const error =
    storeStatsError || orderStatsError || productsError || ordersError;

  return {
    totalProducts,
    totalOrders,
    pendingOrders,
    dailySales,
    isLoading,
    error,
  };
}
