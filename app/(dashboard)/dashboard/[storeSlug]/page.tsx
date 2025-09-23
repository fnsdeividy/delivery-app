"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { useCardapioAuth, useDashboardMetrics } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { useStoreConfig } from "@/lib/store/useStoreConfig";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";

// Lazy loading dos componentes pesados
const DashboardMetrics = React.lazy(() =>
  import("@/components/DashboardMetrics").then((m) => ({
    default: m.DashboardMetrics,
  }))
);
const DashboardQuickActions = React.lazy(() =>
  import("@/components/DashboardQuickActions").then((m) => ({
    default: m.DashboardQuickActions,
  }))
);

// Componentes locais com lazy loading
const AdditionalInfoSection = React.lazy(() =>
  import("./components/AdditionalInfoSection").then((m) => ({
    default: m.AdditionalInfoSection,
  }))
);
const OrderManagementSection = React.lazy(() =>
  import("./components/OrderManagementSection").then((m) => ({
    default: m.OrderManagementSection,
  }))
);
const StockAlertsSection = React.lazy(() =>
  import("./components/StockAlertsSection").then((m) => ({
    default: m.StockAlertsSection,
  }))
);
const StoreConfigSection = React.lazy(() =>
  import("./components/StoreConfigSection").then((m) => ({
    default: m.StoreConfigSection,
  }))
);

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.storeSlug as string;
  const { isAuthenticated, getCurrentToken } = useCardapioAuth();
  const {
    metrics,
    storeInfo,
    loading: metricsLoading,
    error: metricsError,
  } = useDashboardMetrics(slug);

  const { config: storeConfig } = useStoreConfig(slug);

  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userStoreSlug, setUserStoreSlug] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar se está autenticado
        if (!isAuthenticated()) {
          console.log("❌ Usuário não autenticado, redirecionando para login");
          router.push("/login");
          return;
        }

        // Obter token e decodificar
        const token = getCurrentToken();
        if (!token) {
          console.log("❌ Token não encontrado, redirecionando para login");
          router.push("/login");
          return;
        }

        // Decodificar token JWT
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("✅ Token decodificado:", {
          role: payload.role,
          storeSlug: payload.storeSlug,
        });

        setUserRole(payload.role);
        setUserStoreSlug(payload.storeSlug);

        // Verificar permissões - ADMIN (logista) tem acesso total
        if (payload.role === "ADMIN") {
          // ADMIN deve acessar a loja atual. Caso o token ainda não traga o storeSlug
          // recém-definido, forçamos a definição da loja atual e liberamos o acesso.
          if (payload.storeSlug === slug) {
            console.log("✅ ADMIN com storeSlug correto");
            setHasAccess(true);
          } else {
            try {
              console.log("🔄 Definindo loja atual para:", slug);
              await apiClient.setCurrentStore({ storeSlug: slug });
              setHasAccess(true);
            } catch (e) {
              console.error("❌ Erro ao definir loja atual:", e);
              // fallback: enviar para gerenciar lojas
              router.push("/dashboard/gerenciar-lojas");
              return;
            }
          }
        } else {
          console.log("❌ Role não autorizado:", payload.role);
          router.push("/unauthorized");
          return;
        }
      } catch (error) {
        console.error("❌ Erro na verificação de autorização:", error);
        router.push("/login");
        return;
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [slug, isAuthenticated, getCurrentToken, router]);

  if (isLoading || metricsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            Acesso Negado
          </h1>
          <p className="text-sm md:text-base text-gray-600 mb-4">
            Você não tem permissão para acessar este dashboard.
          </p>
          <Link
            href="/dashboard/gerenciar-lojas"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm md:text-base"
          >
            Voltar para Gerenciar Lojas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10">
        {/* Breadcrumb */}
        <nav className="flex mb-3 sm:mb-4 md:mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-0.5 sm:space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <Link
                href="/dashboard/gerenciar-lojas"
                className="inline-flex items-center text-xs sm:text-xs md:text-sm font-medium text-gray-700 hover:text-purple-600"
              >
                Dashboard
              </Link>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-1 sm:mx-1.5 md:mx-2 text-gray-400">/</span>
                <span className="text-xs sm:text-xs md:text-sm font-medium text-gray-500">
                  {slug}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Ações Rápidas */}
        <Suspense fallback={<LoadingSpinner />}>
          <DashboardQuickActions storeSlug={slug} />
        </Suspense>

        {/* Métricas Rápidas */}
        {metrics && (
          <Suspense fallback={<LoadingSpinner />}>
            <DashboardMetrics metrics={metrics} storeSlug={slug} />
          </Suspense>
        )}

        {/* Alertas de Estoque */}
        {metrics && (
          <Suspense fallback={<LoadingSpinner />}>
            <StockAlertsSection metrics={metrics} storeSlug={slug} />
          </Suspense>
        )}

        {/* Configuração da Loja */}
        <Suspense fallback={<LoadingSpinner />}>
          <StoreConfigSection storeSlug={slug} />
        </Suspense>

        {/* Gestão de Pedidos */}
        <Suspense fallback={<LoadingSpinner />}>
          <OrderManagementSection storeSlug={slug} />
        </Suspense>

        {/* Informações Adicionais */}
        <Suspense fallback={<LoadingSpinner />}>
          <AdditionalInfoSection storeSlug={slug} />
        </Suspense>
      </main>
    </div>
  );
}
