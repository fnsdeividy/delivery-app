import { apiClient } from "@/lib/api-client";
import { OrderStatus } from "@/types/cardapio-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface TimelineStep {
  status: OrderStatus;
  label: string;
  description: string;
  icon: string;
  color: string;
  prerequisites?: OrderStatus[];
  whatsappMessage?: string;
}

interface TimelineEntry {
  id: string;
  orderId: string;
  status: OrderStatus;
  message?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  step: TimelineStep;
}

interface OrderTimeline {
  order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    total: number;
    customer: {
      name: string;
      phone: string;
    };
    store: {
      name: string;
    };
  };
  timeline: TimelineEntry[];
}

interface AdvanceOrderResponse {
  success: boolean;
  message: string;
  newStatus?: OrderStatus;
}

export function useTimelineSteps() {
  return useQuery({
    queryKey: ["timeline", "steps"],
    queryFn: async (): Promise<TimelineStep[]> => {
      const response = await apiClient.get("/timeline/steps");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useOrderTimeline(orderId: string, storeSlug: string) {
  return useQuery({
    queryKey: ["timeline", "order", orderId, storeSlug],
    queryFn: async (): Promise<OrderTimeline> => {
      const response = await apiClient.get(`/timeline/order/${orderId}`, {
        params: { storeSlug },
      });
      return response.data;
    },
    enabled: !!orderId && !!storeSlug,
  });
}

export function useAdvanceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      storeSlug,
    }: {
      orderId: string;
      storeSlug: string;
    }): Promise<AdvanceOrderResponse> => {
      const response = await apiClient.post(
        `/timeline/order/${orderId}/advance`,
        null,
        {
          params: { storeSlug },
        }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({
        queryKey: ["timeline", "order", variables.orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-stats"] });

      // Atualiza o status do pedido no cache
      queryClient.setQueryData(
        ["timeline", "order", variables.orderId, variables.storeSlug],
        (oldData: OrderTimeline | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            order: {
              ...oldData.order,
              status: data.newStatus || oldData.order.status,
            },
          };
        }
      );
    },
  });
}

export function useTimelineStats(
  storeSlug: string,
  startDate?: Date,
  endDate?: Date
) {
  return useQuery({
    queryKey: ["timeline", "stats", storeSlug, startDate, endDate],
    queryFn: async () => {
      const params: Record<string, any> = { storeSlug };
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();

      const response = await apiClient.get("/timeline/stats", { params });
      return response.data;
    },
    enabled: !!storeSlug,
  });
}
