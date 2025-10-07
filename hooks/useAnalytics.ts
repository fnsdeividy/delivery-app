import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export function useAnalytics(
  storeSlug: string,
  period: "daily" | "weekly" | "monthly" = "daily"
) {
  return useQuery({
    queryKey: ["analytics", storeSlug, period],
    queryFn: () => (apiClient as any).getAnalytics(storeSlug, period),
    enabled: !!storeSlug,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useStoreMetrics(storeSlug: string) {
  return useQuery({
    queryKey: ["store-metrics", storeSlug],
    queryFn: () => (apiClient as any).getStoreMetrics(storeSlug),
    enabled: !!storeSlug,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useTopProducts(storeSlug: string, limit: number = 5) {
  return useQuery({
    queryKey: ["top-products", storeSlug, limit],
    queryFn: () => (apiClient as any).getTopProducts(storeSlug, limit),
    enabled: !!storeSlug,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

export function useCustomerMetrics(storeSlug: string) {
  return useQuery({
    queryKey: ["customer-metrics", storeSlug],
    queryFn: () => (apiClient as any).getCustomerMetrics(storeSlug),
    enabled: !!storeSlug,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

export function usePeakHours(storeSlug: string) {
  return useQuery({
    queryKey: ["peak-hours", storeSlug],
    queryFn: () => (apiClient as any).getPeakHours(storeSlug),
    enabled: !!storeSlug,
    staleTime: 15 * 60 * 1000, // 15 minutos
  });
}
