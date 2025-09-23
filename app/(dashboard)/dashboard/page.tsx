"use client";

import { useCardapioAuth } from "@/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardAdmin() {
  const router = useRouter();
  const { isAuthenticated, getCurrentToken } = useCardapioAuth();

  useEffect(() => {
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

      // ADMIN (logista) com loja definida -> dashboard da loja
      if (payload.role === "ADMIN" && payload.storeSlug) {
        router.push(`/dashboard/${payload.storeSlug}`);
        return;
      }

      // ADMIN sem loja -> gerenciar lojas
      if (payload.role === "ADMIN" && !payload.storeSlug) {
        router.push("/dashboard/gerenciar-lojas");
        return;
      }

      // Outros perfis não têm dashboard
      router.push("/");
    } catch {
      router.push("/login");
    }
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
