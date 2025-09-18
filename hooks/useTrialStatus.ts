import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

interface TrialStatus {
  isTrialActive: boolean;
  isTrialExpired: boolean;
  trialDaysRemaining: number;
  trialEndsAt: string | null;
}

export function useTrialStatus() {
  return useQuery({
    queryKey: ["trial-status"],
    queryFn: async (): Promise<TrialStatus> => {
      try {
        const response = await apiClient.get<TrialStatus>("/auth/trial-status");
        return response;
      } catch (error: any) {
        // Se não estiver autenticado ou não for ADMIN, retornar status vazio
        if (error.status === 401 || error.status === 403) {
          return {
            isTrialActive: false,
            isTrialExpired: false,
            trialDaysRemaining: 0,
            trialEndsAt: null,
          };
        }
        throw error;
      }
    },
    // Revalidar a cada 5 minutos
    staleTime: 5 * 60 * 1000,
    // Manter em cache por 10 minutos
    gcTime: 10 * 60 * 1000,
    // Não executar se não estiver no cliente ou se o usuário não estiver autenticado
    enabled: typeof window !== 'undefined' && apiClient.isAuthenticated(),
  });
}
