import { apiClient } from "@/lib/api-client";
import { OrderStatus } from "@/types/cardapio-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface TimelineStep {
  status: OrderStatus;
  label: string;
  description: string;
  icon: string;
  color: string;
  whatsappMessage?: string;
  prerequisites?: OrderStatus[];
}

interface TimelineConfig {
  storeSlug: string;
  status: OrderStatus;
  label: string;
  description: string;
  icon: string;
  color: string;
  whatsappMessage?: string;
  prerequisites: OrderStatus[];
  isActive: boolean;
  order: number;
}

interface OrderTimelineData {
  order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    createdAt: string;
  };
  timeline: Array<{
    id: string;
    status: OrderStatus;
    message: string;
    createdAt: string;
    step: TimelineStep;
  }>;
  events: Array<{
    id: string;
    fromStatus: OrderStatus;
    toStatus: OrderStatus;
    eventType: string;
    success: boolean;
    createdAt: string;
  }>;
}

interface AdvanceOrderResult {
  success: boolean;
  message: string;
  newStatus?: OrderStatus;
}

interface ValidationResult {
  valid: boolean;
  reason?: string;
}

interface NextStepsData {
  currentStatus: OrderStatus;
  nextStatus: OrderStatus | null;
  canAdvance: boolean;
  currentStep: TimelineStep | null;
  nextStep: TimelineStep | null;
}

interface PerformanceMetrics {
  averageStageTimes: Record<string, number>;
  stageCounts: Record<string, number>;
  totalOrders: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

// Hook para obter timeline de um pedido
export function useOrderTimeline(orderId: string, storeSlug: string) {
  return useQuery({
    queryKey: ["order-timeline", orderId, storeSlug],
    queryFn: async (): Promise<OrderTimelineData> => {
      const response = await apiClient.get(
        `/timeline/order/${orderId}?storeSlug=${storeSlug}`
      );
      return response.data;
    },
    enabled: !!orderId && !!storeSlug,
  });
}

// Hook para obter histórico completo de eventos
export function useOrderEventHistory(orderId: string, storeSlug: string) {
  return useQuery({
    queryKey: ["order-event-history", orderId, storeSlug],
    queryFn: async (): Promise<OrderTimelineData> => {
      const response = await apiClient.get(
        `/timeline/order/${orderId}/history?storeSlug=${storeSlug}`
      );
      return response.data;
    },
    enabled: !!orderId && !!storeSlug,
  });
}

// Hook para obter configurações da timeline
export function useTimelineConfig(storeSlug: string) {
  return useQuery({
    queryKey: ["timeline-config", storeSlug],
    queryFn: async (): Promise<TimelineStep[]> => {
      const response = await apiClient.get(
        `/timeline/config?storeSlug=${storeSlug}`
      );
      return response.data;
    },
    enabled: !!storeSlug,
  });
}

// Hook para obter próximas etapas possíveis
export function useNextSteps(orderId: string, storeSlug: string) {
  return useQuery({
    queryKey: ["next-steps", orderId, storeSlug],
    queryFn: async (): Promise<NextStepsData> => {
      const response = await apiClient.get(
        `/timeline/order/${orderId}/next-steps?storeSlug=${storeSlug}`
      );
      return response.data;
    },
    enabled: !!orderId && !!storeSlug,
  });
}

// Hook para obter métricas de performance
export function useTimelinePerformance(storeSlug: string, days: number = 30) {
  return useQuery({
    queryKey: ["timeline-performance", storeSlug, days],
    queryFn: async (): Promise<PerformanceMetrics> => {
      const response = await apiClient.get(
        `/timeline/performance?storeSlug=${storeSlug}&days=${days}`
      );
      return response.data;
    },
    enabled: !!storeSlug,
  });
}

// Hook para avançar pedido
export function useAdvanceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      storeSlug,
    }: {
      orderId: string;
      storeSlug: string;
    }): Promise<AdvanceOrderResult> => {
      const response = await apiClient.post(
        `/timeline/order/${orderId}/advance?storeSlug=${storeSlug}`
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({
        queryKey: ["order-timeline", variables.orderId, variables.storeSlug],
      });
      queryClient.invalidateQueries({
        queryKey: ["next-steps", variables.orderId, variables.storeSlug],
      });
      queryClient.invalidateQueries({
        queryKey: ["orders", variables.storeSlug],
      });

      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: any) => {
      toast.error("Erro ao avançar pedido");
      console.error("Erro ao avançar pedido:", error);
    },
  });
}

// Hook para validar transição
export function useValidateTransition() {
  return useMutation({
    mutationFn: async ({
      orderId,
      targetStatus,
      storeSlug,
    }: {
      orderId: string;
      targetStatus: OrderStatus;
      storeSlug: string;
    }): Promise<ValidationResult> => {
      const response = await apiClient.post(
        `/timeline/validate-transition?orderId=${orderId}&targetStatus=${targetStatus}&storeSlug=${storeSlug}`
      );
      return response.data;
    },
  });
}

// Hook para atualizar configuração da timeline
export function useUpdateTimelineConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      storeSlug,
      status,
      config,
    }: {
      storeSlug: string;
      status: OrderStatus;
      config: Partial<TimelineStep>;
    }): Promise<void> => {
      await apiClient.put(
        `/timeline/config?storeSlug=${storeSlug}&status=${status}`,
        config
      );
    },
    onSuccess: (_, variables) => {
      // Invalidar configurações da timeline
      queryClient.invalidateQueries({
        queryKey: ["timeline-config", variables.storeSlug],
      });

      toast.success("Configuração atualizada com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar configuração");
      console.error("Erro ao atualizar configuração:", error);
    },
  });
}

// Hook para obter estatísticas da timeline
export function useTimelineStats(
  storeSlug: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ["timeline-stats", storeSlug, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({ storeSlug });
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await apiClient.get(`/timeline/stats?${params}`);
      return response.data;
    },
    enabled: !!storeSlug,
  });
}

// Hook para obter todas as etapas disponíveis
export function useTimelineSteps() {
  return useQuery({
    queryKey: ["timeline-steps"],
    queryFn: async (): Promise<TimelineStep[]> => {
      const response = await apiClient.get("/timeline/steps");
      return response.data;
    },
  });
}
