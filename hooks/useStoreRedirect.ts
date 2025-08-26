import { apiClient } from "@/lib/api-client";
import { Store, User } from "@/types/cardapio-api";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * Hook para gerenciar redirecionamentos inteligentes após operações de loja
 */
export function useStoreRedirect() {
  const router = useRouter();

  /**
   * Redireciona o usuário após criação de loja
   * @param createdStore - Loja recém criada
   */
  const redirectAfterStoreCreation = useCallback(
    async (createdStore: Store) => {
      try {
        console.log(
          "🔄 useStoreRedirect: Iniciando redirecionamento para loja:",
          createdStore.slug
        );

        // Definir a nova loja como atual
        console.log("🔄 Tentando definir loja como atual...");
        await apiClient.updateStoreContext(createdStore.slug);
        console.log("✅ Loja definida como atual com sucesso");

        // Redirecionar para o dashboard da nova loja
        const targetUrl = `/dashboard/${createdStore.slug}`;
        console.log("🔄 Redirecionando para:", targetUrl);
        router.push(targetUrl);
      } catch (error) {
        console.error("❌ Erro ao definir loja atual após criação:", error);
        // Fallback: redirecionar mesmo sem definir como atual
        const targetUrl = `/dashboard/${createdStore.slug}`;
        console.log("🔄 Fallback: redirecionando para:", targetUrl);
        router.push(targetUrl);
      }
    },
    [router]
  );

  /**
   * Redireciona o usuário baseado no contexto atual de lojas
   * @param user - Dados do usuário atual
   */
  const redirectBasedOnUserStores = useCallback(
    async (user?: User) => {
      try {
        if (!user || !user.stores || user.stores.length === 0) {
          // Usuário não possui lojas - redirecionar para criar loja
          router.push("/register/loja");
          return;
        }

        if (user.stores.length === 1) {
          // Usuário possui apenas uma loja - redirecionar diretamente
          const store = user.stores[0];
          await apiClient.updateStoreContext(store.storeSlug);
          router.push(`/dashboard/${store.storeSlug}`);
          return;
        }

        // Usuário possui múltiplas lojas
        if (user.currentStoreSlug) {
          // Se já tem uma loja selecionada, ir para o dashboard dela
          router.push(`/dashboard/${user.currentStoreSlug}`);
        } else {
          // Se não tem loja selecionada, ir para gerenciar lojas
          router.push("/dashboard/gerenciar-lojas");
        }
      } catch (error) {
        console.error(
          "❌ Erro ao redirecionar baseado em lojas do usuário:",
          error
        );
        // Fallback: redirecionar para dashboard geral
        router.push("/dashboard");
      }
    },
    [router]
  );

  /**
   * Redireciona para a loja especificada
   * @param storeSlug - Slug da loja
   */
  const redirectToStore = useCallback(
    async (storeSlug: string) => {
      try {
        await apiClient.updateStoreContext(storeSlug);
        router.push(`/dashboard/${storeSlug}`);
      } catch (error) {
        console.error("❌ Erro ao redirecionar para loja:", error);
        // Tentar redirecionar mesmo com erro
        router.push(`/dashboard/${storeSlug}`);
      }
    },
    [router]
  );

  /**
   * Redireciona para o dashboard apropriado baseado no role do usuário
   * @param userRole - Role do usuário
   * @param storeSlug - Slug da loja (opcional)
   */
  const redirectToDashboard = useCallback(
    async (userRole: string, storeSlug?: string) => {
      try {
        switch (userRole) {
          case "SUPER_ADMIN":
            router.push("/admin");
            break;

          case "CLIENTE":
            router.push("/");
            break;

          case "ADMIN":
          case "LOJA_ADMIN":
          case "OWNER":
            if (storeSlug) {
              await redirectToStore(storeSlug);
            } else {
              await redirectBasedOnUserStores();
            }
            break;

          default:
            // Para outros roles, tentar redirecionar baseado nas lojas
            await redirectBasedOnUserStores();
            break;
        }
      } catch (error) {
        console.error("❌ Erro no redirecionamento do dashboard:", error);
        router.push("/dashboard");
      }
    },
    [router, redirectToStore, redirectBasedOnUserStores]
  );

  /**
   * Redireciona após login com base no contexto do usuário
   * @param user - Dados do usuário que fez login
   */
  const redirectAfterLogin = useCallback(
    async (user: User) => {
      await redirectToDashboard(user.role, user.currentStoreSlug);
    },
    [redirectToDashboard]
  );

  return {
    redirectAfterStoreCreation,
    redirectBasedOnUserStores,
    redirectToStore,
    redirectToDashboard,
    redirectAfterLogin,
  };
}
