import { useAuthContext } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { CreateUserDto, LoginDto } from "@/types/cardapio-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export function useCardapioAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();
  const {
    login: contextLogin,
    register: contextRegister,
    logout: contextLogout,
  } = useAuthContext();

  // Mutation para login
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginDto) => {
      setIsLoading(true);
      setError(null);

      try {
        // Usar o AuthContext para fazer login
        const response = await contextLogin(
          credentials.email,
          credentials.password
        );

        console.log("✅ Login realizado com sucesso:", {
          user: response.user,
          hasToken: !!response.access_token,
          tokenLength: response.access_token?.length || 0,
        });

        return response;
      } catch (err: any) {
        // Melhorar tratamento de erros para evitar refresh da página
        let errorMessage = "Erro desconhecido durante o login";

        if (err.response?.status === 401) {
          errorMessage = "Email ou senha incorretos";
        } else if (err.response?.status === 400) {
          errorMessage = "Dados de login inválidos";
        } else if (err.response?.status === 500) {
          errorMessage = "Erro interno do servidor. Tente novamente.";
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: async (data, variables) => {
      // Invalidar queries para atualizar estado da aplicação
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["stores"] });

      // Redirecionar baseado no role do usuário
      if (data.user.role === "SUPER_ADMIN") {
        router.push("/admin");
        return;
      } else if (data.user.role === "CLIENTE") {
        router.push("/");
        return;
      } else if (data.user.role === "ADMIN") {
        // Para ADMIN, redirecionar para o Dashboard Geral da Loja
        if (data.user.storeSlug) {
          // Se o usuário já tem uma loja associada, redirecionar para o dashboard da loja
          router.push(`/dashboard/${data.user.storeSlug}`);
        } else {
          // Se não tem loja associada, redirecionar para gerenciar lojas
          router.push("/dashboard/gerenciar-lojas");
        }
        return;
      }
    },
    onError: (err: any) => {
      console.error("Erro no login:", err);

      // Garantir que o erro seja exibido corretamente
      if (err.message) {
        setError(err.message);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Erro desconhecido durante o login");
      }

      // Não fazer redirecionamento automático em caso de erro
      // O usuário deve ver o erro e tentar novamente
    },
  });

  // Mutation para registro
  const registerMutation = useMutation({
    mutationFn: async (userData: CreateUserDto) => {
      setIsLoading(true);
      setError(null);

      try {
        // Usar o AuthContext para fazer registro
        const response = await contextRegister(userData);

        return response;
      } catch (err: any) {
        const errorMessage =
          err.message || "Erro desconhecido durante o registro";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (data, variables) => {
      // Invalidar queries para atualizar estado da aplicação
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["stores"] });

      // Não fazer login automático pois o registro já retorna o token
      // O token já foi armazenado pelo apiClient.register()
      // Importante: não redirecionar aqui para não interferir no fluxo de criação de loja
    },
    onError: (err: any) => {
      setError(err.message);
    },
  });

  // Função para logout
  const logout = useCallback(() => {
    contextLogout();
    queryClient.clear();
    router.push("/login");
  }, [contextLogout, queryClient, router]);

  // Função para limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Função para verificar se está autenticado - estabilizada com useCallback
  const isAuthenticated = useCallback(() => {
    try {
      const result = apiClient.isAuthenticated();
      return result;
    } catch (error) {
      console.error("❌ Erro ao verificar autenticação:", error);
      return false;
    }
  }, []);

  // Função para obter token atual - estabilizada com useCallback
  const getCurrentToken = useCallback(() => {
    return apiClient.getCurrentToken();
  }, []);

  return {
    // Estados
    isLoading,
    error,

    // Ações
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    clearError,

    // Utilitários
    isAuthenticated,
    getCurrentToken,

    // Mutations para uso direto
    loginMutation,
    registerMutation,
  };
}
