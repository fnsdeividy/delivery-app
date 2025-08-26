import { useToast } from "@/components/Toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { CreateStoreDto, Store } from "@/types/cardapio-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStoreRedirect } from "./useStoreRedirect";
import { useStores } from "./useStores";

interface CreateStoreHookReturn {
  mutateAsync: (data: CreateStoreDto) => Promise<Store>;
  mutate: (data: CreateStoreDto) => void;
  isLoading: boolean;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  data: Store | undefined;
  reset: () => void;
}

export function useCreateStore(): CreateStoreHookReturn {
  const queryClient = useQueryClient();
  const { redirectAfterStoreCreation } = useStoreRedirect();
  const { isAuthenticated } = useAuthContext();
  const { addToast } = useToast();

  // Só buscar lojas se o usuário estiver autenticado
  const { data: storesData } = useStores(1, 10, isAuthenticated);

  const createStoreMutation = useMutation({
    mutationFn: async (storeData: CreateStoreDto) => {
      try {
        // Verificar se o usuário já tem uma loja (só se estiver autenticado)
        if (isAuthenticated) {
          const userStores = storesData?.data || [];
          if (userStores.length > 0) {
            throw new Error(
              "Você já possui uma loja. Não é possível criar múltiplas lojas."
            );
          }
        }

        const response = await apiClient.createStore(storeData);
        return response;
      } catch (error: any) {
        console.error("❌ Erro ao criar loja:", error);
        throw new Error(error.message || "Erro ao criar loja");
      }
    },
    onSuccess: async (data) => {
      try {
        console.log("🎉 Loja criada com sucesso:", data);

        // Mostrar toast de sucesso e redirecionamento
        addToast(
          "success",
          "Loja Criada com Sucesso! 🎉",
          "Aguarde alguns segundos, você está sendo redirecionado para o dashboard da sua loja. Seja bem-vindo!"
        );

        console.log("✅ Toast adicionado com sucesso");

        // Invalidar queries relacionadas a lojas
        queryClient.invalidateQueries({ queryKey: ["stores"] });
        queryClient.invalidateQueries({ queryKey: ["store", data.slug] });
        queryClient.invalidateQueries({ queryKey: ["user"] });
        queryClient.invalidateQueries({ queryKey: ["user-context"] });
        queryClient.invalidateQueries({ queryKey: ["user-stores"] });

        console.log("✅ Queries invalidadas");

        // Aguardar um momento para o usuário ver o toast
        console.log("⏳ Aguardando 2 segundos antes do redirecionamento...");
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log(
          "🔄 Iniciando redirecionamento para:",
          `/dashboard/${data.slug}`
        );

        // Verificar se o usuário está autenticado antes de redirecionar
        if (isAuthenticated) {
          console.log("✅ Usuário autenticado, redirecionando para dashboard");
          // Redirecionar para o dashboard da nova loja
          await redirectAfterStoreCreation(data);
        } else {
          console.log("⚠️ Usuário não autenticado, redirecionando para login");
          // Se não estiver autenticado, redirecionar para login
          // Mas primeiro, vamos tentar redirecionar diretamente para o dashboard
          // O middleware deve permitir se o token estiver correto
          console.log("🔄 Tentando redirecionamento direto para dashboard...");
          window.location.href = `/dashboard/${data.slug}`;
        }
      } catch (error) {
        console.error("❌ Erro no processamento pós-criação:", error);
        // Fallback: redirecionar diretamente para o dashboard
        console.log("🔄 Fallback: redirecionamento direto para dashboard...");
        window.location.href = `/dashboard/${data.slug}`;
      }
    },
    onError: (error: any) => {
      console.error("❌ Erro na criação da loja:", error);
    },
  });

  // Retornar um objeto com a interface esperada
  return {
    mutateAsync: createStoreMutation.mutateAsync,
    mutate: createStoreMutation.mutate,
    isLoading: createStoreMutation.isPending, // Alias para compatibilidade
    isPending: createStoreMutation.isPending,
    isError: createStoreMutation.isError,
    error: createStoreMutation.error,
    isSuccess: createStoreMutation.isSuccess,
    data: createStoreMutation.data,
    reset: createStoreMutation.reset,
  };
}
