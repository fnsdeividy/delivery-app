import { apiClient } from "@/lib/api-client";
import { CreateOrderDto, Order, UpdateOrderDto } from "@/types/cardapio-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useOrders(storeSlug: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ["orders", storeSlug, page, limit],
    queryFn: () => (apiClient as any).getOrders(storeSlug, page, limit),
    enabled: !!storeSlug,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => (apiClient as any).getOrderById(id),
    enabled: !!id,
  });
}

export function useOrderStats(storeSlug: string) {
  return useQuery({
    queryKey: ["orders", storeSlug, "stats"],
    queryFn: () => (apiClient as any).getOrderStats(storeSlug),
    enabled: !!storeSlug,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: CreateOrderDto) =>
      (apiClient as any).createOrder(orderData),
    onSuccess: (_, orderData) => {
      queryClient.invalidateQueries({
        queryKey: ["orders", orderData.storeSlug],
      });
      queryClient.invalidateQueries({
        queryKey: ["orders", orderData.storeSlug, "stats"],
      });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      orderData,
    }: {
      id: string;
      orderData: UpdateOrderDto;
    }) => (apiClient as any).updateOrder(id, orderData),
    onSuccess: (_, { id, orderData }) => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      // Invalidar listas de pedidos e stats
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "stats"] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => (apiClient as any).cancelOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "stats"] });
    },
  });
}

// Hook para pedidos por status
export function useOrdersByStatus(storeSlug: string, status: string) {
  return useQuery({
    queryKey: ["orders", storeSlug, "status", status],
    queryFn: async () => {
      const response = await (apiClient as any).getOrders(storeSlug, 1, 100);
      return {
        ...response,
        data: response.data.filter((order: Order) => order.status === status),
      };
    },
    enabled: !!storeSlug && !!status,
  });
}

// Hook para pedidos pendentes
export function usePendingOrders(storeSlug: string) {
  return useOrdersByStatus(storeSlug, "RECEIVED");
}

// Hook para pedidos em preparo
export function usePreparingOrders(storeSlug: string) {
  return useOrdersByStatus(storeSlug, "PREPARING");
}

// Hook para pedidos prontos
export function useReadyOrders(storeSlug: string) {
  return useOrdersByStatus(storeSlug, "READY");
}

// Hook para pedidos em entrega
export function useDeliveringOrders(storeSlug: string) {
  return useOrdersByStatus(storeSlug, "DELIVERING");
}

// Hook para pedidos entregues
export function useDeliveredOrders(storeSlug: string) {
  return useOrdersByStatus(storeSlug, "DELIVERED");
}

// Hook para pedidos cancelados
export function useCancelledOrders(storeSlug: string) {
  return useOrdersByStatus(storeSlug, "CANCELLED");
}

// Hook para pedidos por tipo
export function useOrdersByType(storeSlug: string, type: string) {
  return useQuery({
    queryKey: ["orders", storeSlug, "type", type],
    queryFn: async () => {
      const response = await (apiClient as any).getOrders(storeSlug, 1, 100);
      return {
        ...response,
        data: response.data.filter((order: Order) => order.type === type),
      };
    },
    enabled: !!storeSlug && !!type,
  });
}

// Hook para pedidos de entrega
export function useDeliveryOrders(storeSlug: string) {
  return useOrdersByType(storeSlug, "DELIVERY");
}

// Hook para pedidos de retirada
export function usePickupOrders(storeSlug: string) {
  return useOrdersByType(storeSlug, "PICKUP");
}

// Hook para pedidos por período (hoje, semana, mês)
export function useOrdersByPeriod(
  storeSlug: string,
  period: "today" | "week" | "month"
) {
  return useQuery({
    queryKey: ["orders", storeSlug, "period", period],
    queryFn: async () => {
      const response = await (apiClient as any).getOrders(storeSlug, 1, 100);
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case "today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case "week":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 7
          );
          break;
        case "month":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
          );
          break;
        default:
          startDate = new Date(0);
      }

      return {
        ...response,
        data: response.data.filter(
          (order: Order) => new Date(order.createdAt) >= startDate
        ),
      };
    },
    enabled: !!storeSlug && !!period,
  });
}
