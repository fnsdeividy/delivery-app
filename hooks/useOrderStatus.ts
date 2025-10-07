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
    }) => apiClient.updateOrder(id, { status }),
    onSuccess: (_, { id, storeSlug }) => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders", storeSlug] });
      queryClient.invalidateQueries({ queryKey: ["orders", "stats"] });
    },
  });
}

// Hook para confirmar pedido
export function useConfirmOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, storeSlug }: { id: string; storeSlug: string }) =>
      apiClient.updateOrder(id, { status: OrderStatus.CONFIRMED }),
    onSuccess: (_, { id, storeSlug }) => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders", storeSlug] });
      queryClient.invalidateQueries({ queryKey: ["orders", "stats"] });
    },
  });
}

// Hook para cancelar pedido
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      storeSlug,
      reason,
    }: {
      id: string;
      storeSlug: string;
      reason?: string;
    }) => apiClient.updateOrder(id, { status: OrderStatus.CANCELLED }),
    onSuccess: (_, { id, storeSlug }) => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders", storeSlug] });
      queryClient.invalidateQueries({ queryKey: ["orders", "stats"] });
    },
  });
}

export function useOrdersByStore(
  storeSlug: string,
  page = 1,
  limit = 10,
  search?: string,
  status?: string,
  paymentStatus?: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: [
      "orders",
      storeSlug,
      page,
      limit,
      search,
      status,
      paymentStatus,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const result = await apiClient.getOrders(storeSlug, page, limit);
      return result;
    },
    enabled: !!storeSlug,
    refetchInterval: 10000, // Atualizar a cada 10 segundos
    refetchIntervalInBackground: true, // Continuar atualizando mesmo quando a tab não está ativa
    staleTime: 5000, // Considerar dados obsoletos após 5 segundos
  });
}
