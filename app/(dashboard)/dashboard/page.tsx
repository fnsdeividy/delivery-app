"use client";

import { useCardapioAuth } from "@/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardAdmin() {
  const router = useRouter();
  const { isAuthenticated, getCurrentToken } = useCardapioAuth();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Se não estiver autenticado, enviar para login
        if (!isAuthenticated()) {
          router.push("/login");
          return;
        }

        const token = getCurrentToken();
        if (!token) {
          router.push("/login");
          return;
        }

        // Decodificar token JWT
        const payload = JSON.parse(atob(token.split(".")[1]));

        // ADMIN com loja definida -> dashboard da loja
        if (payload.role === "ADMIN" && payload.storeSlug) {
          router.push(`/dashboard/${payload.storeSlug}`);
          return;
        }

        // ADMIN sem loja -> buscar lojas do usuário e redirecionar para a primeira
        if (payload.role === "ADMIN" && !payload.storeSlug) {
          // Tentar buscar lojas do usuário via API
          try {
            const response = await fetch("/api/v1/stores", {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

            if (response.ok) {
              const storesData = await response.json();
              const userStores = storesData.data || [];

              if (userStores.length > 0) {
                // Redirecionar para o dashboard da primeira loja
                router.push(`/dashboard/${userStores[0].slug}`);
                return;
              }
            }
          } catch (error) {
            console.warn("Erro ao buscar lojas do usuário:", error);
          }

          // Se não conseguir buscar lojas ou não tiver lojas, mostrar mensagem
          router.push("/dashboard/gerenciar-lojas");
          return;
        }

        // Outros perfis não têm dashboard
        router.push("/");
      } catch {
        router.push("/login");
      }
    };

    handleRedirect();
  }, [router, isAuthenticated, getCurrentToken]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Redirecionando...
        </h1>
        <p className="text-gray-600">
          Aguarde, você será redirecionado para o dashboard admin.
        </p>
      </div>
    </div>
  );
}
