import { apiClient } from "@/lib/api-client";
import { OrderStatus } from "@/types/cardapio-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      apiClient.updateOrder(id, { status }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "stats"] });
    },
  });
}

// Hook para dashboard que funciona com ou sem autenticação
export function useDashboardUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      storeSlug,
    }: {
      id: string;
      status: OrderStatus;
      storeSlug: string;
    }) => apiClient.updateDashboardOrderStatus(id, status, storeSlug),
    onSuccess: (_, { id, storeSlug }) => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders", storeSlug] });
      queryClient.invalidateQueries({ queryKey: ["orders", "stats"] });
    },
  });
}

export function useOrdersByStore(storeSlug: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ["orders", storeSlug, page, limit],
    queryFn: async () => {
      const result = await apiClient.getDashboardOrders(storeSlug, page, limit);
      return result;
    },
    enabled: !!storeSlug,
    refetchInterval: 5000, // Atualizar a cada 5 segundos
    refetchIntervalInBackground: true, // Continuar atualizando mesmo quando a tab não está ativa
  });
}
