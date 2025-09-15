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

export function useOrdersByStore(storeSlug: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ["orders", storeSlug, page, limit],
    queryFn: () => apiClient.getOrders(storeSlug, page, limit),
    enabled: !!storeSlug,
    refetchInterval: 5000, // Atualizar a cada 5 segundos
    refetchIntervalInBackground: true, // Continuar atualizando mesmo quando a tab não está ativa
  });
}
