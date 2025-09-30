"use client";

import {
  ChartBar,
  Clock,
  Gear,
  Layout,
  List,
  Package,
  Palette,
  SignOut,
  Storefront,
  Truck,
  X,
} from "@phosphor-icons/react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { LoadingContent } from "../../../components/GlobalLoading";
import OptimizedLoadingSpinner from "../../../components/OptimizedLoadingSpinner";
import { ToastContainer } from "../../../components/Toast";
import { useAuthContext } from "../../../contexts/AuthContext";
import {
  NotificationProvider,
  useNotification,
} from "../../../contexts/NotificationContext";
import { useStores } from "../../../hooks";
import { useDashboardRouteLoading } from "../../../hooks/useRouteLoading";
import { useStoreConfig } from "../../../lib/store/useStoreConfig";
import "./dashboard.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
  children?: NavigationItem[];
}

function OrdersBadge() {
  const { orderCounters } = useNotification();
  const pending = orderCounters?.newOrders ?? 0;
  if (!pending || pending <= 0) return null;
  return (
    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
      {pending}
    </span>
  );
}

function DashboardContent({
  children,
  navigation,
  slug,
  config,
  user,
  logout,
  navigateWithLoading,
  isRouteLoading,
  sidebarOpen,
  setSidebarOpen,
  pathname,
}: any) {
  return (
    <div className="dashboard-layout">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Sidebar */}
      <div className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200/60">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {config?.branding?.logo ? (
              <img
                src={config.branding.logo}
                alt={config.name || "Logo"}
                className="h-8 w-auto hover-scale"
              />
            ) : (
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Storefront className="h-5 w-5 text-white" />
              </div>
            )}
            <h2 className="text-lg font-semibold text-gray-900 truncate ml-3">
              {config?.name || slug || "Dashboard"}
            </h2>
          </div>
          {/* Botão de fechar sidebar - só mostra quando sidebar está aberto */}
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.length > 0 ? (
              navigation.map((item: any) => (
                <div key={item.name}>
                  <button
                    onClick={() => navigateWithLoading(item.href)}
                    disabled={isRouteLoading}
                    className={`dashboard-nav-button group flex items-center px-3 py-3 text-sm font-medium w-full text-left ${
                      item.current
                        ? "active"
                        : "text-gray-700 hover:text-gray-900"
                    } ${isRouteLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        item.current
                          ? "text-purple-500"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`}
                    />
                    {item.name}
                    {item.name === "Pedidos" && <OrdersBadge />}
                  </button>

                  {/* Submenu */}
                  {item.children && item.current && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.map((child: any) => (
                        <button
                          key={child.name}
                          onClick={() => navigateWithLoading(child.href)}
                          disabled={isRouteLoading}
                          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors w-full text-left ${
                            child.current
                              ? "bg-purple-50 text-purple-700"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          } ${
                            isRouteLoading
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <child.icon
                            className={`mr-3 h-4 w-4 ${
                              child.current
                                ? "text-purple-500"
                                : "text-gray-400"
                            }`}
                          />
                          {child.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">
                  Navegação não disponível
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Slug: {slug || "não definido"}
                </p>
                <p className="text-xs text-gray-400">
                  Rota especial:{" "}
                  {pathname.includes("gerenciar-lojas") ? "sim" : "não"}
                </p>
              </div>
            )}
          </div>
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/60 bg-gradient-to-t from-gray-50/80 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                <span className="text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name || "Usuário"}
                </p>
                <p className="text-xs text-gray-500 font-medium truncate">
                  {slug && !pathname.includes("gerenciar-lojas") ? (
                    <span className="flex items-center space-x-1">
                      <Storefront className="h-3 w-3" />
                      <span>{slug}</span>
                    </span>
                  ) : user?.role === "SUPER_ADMIN" ? (
                    "Super Administrador"
                  ) : user?.role === "ADMIN" ? (
                    "Administrador"
                  ) : (
                    "Usuário"
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 flex-shrink-0"
              title="Sair"
            >
              <SignOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="dashboard-main-layout">
        {/* Top bar */}
        <div className="dashboard-main-header sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
            >
              <List className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              {/* Breadcrumb */}
              <nav className="breadcrumb">
                <span className="breadcrumb-item">Dashboard</span>
                {pathname.startsWith("/dashboard/gerenciar-lojas") && (
                  <span className="breadcrumb-item">Gerenciar Lojas</span>
                )}
                {slug && !pathname.includes("gerenciar-lojas") && (
                  <span className="breadcrumb-item flex items-center">
                    {config?.branding?.logo && (
                      <img
                        src={config.branding.logo}
                        alt={config?.name || slug}
                        className="w-4 h-4 rounded mr-2 object-cover"
                      />
                    )}
                    {config?.name || slug}
                  </span>
                )}
              </nav>

              {slug && !pathname.includes("gerenciar-lojas") && (
                <a
                  href={`/loja/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Ver Loja
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="dashboard-main-content">
          <div className="dashboard-content-wrapper">
            <LoadingContent className="dashboard-container">
              {children}
            </LoadingContent>
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}

// Auxiliar para detectar 404 de forma resiliente
const isNotFoundError = (err: any) => {
  const code = err?.code ?? err?.status ?? err?.response?.status;
  const msg = (err?.message || "").toString().toLowerCase();
  return (
    Number(code) === 404 ||
    msg.includes("not found") ||
    msg.includes("não encontrada")
  );
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthContext();
  const { navigateWithLoading, isLoading: isRouteLoading } =
    useDashboardRouteLoading();

  // =========================
  // 1) DERIVAÇÃO DE CONTEXTO
  // =========================

  // Normaliza path e fatia partes válidas
  const pathParts = useMemo(
    () => pathname.split("/").filter(Boolean),
    [pathname]
  );

  // path padrão do dashboard: /dashboard[/...]
  const isDashboardRoot = pathname === "/dashboard";

  // Rotas especiais/administrativas onde NÃO carregamos config de loja
  const isSpecialRoute = useMemo(() => {
    if (isDashboardRoot) return true;
    // Ex.: /dashboard/editar-loja/..., /dashboard/gerenciar-lojas, /dashboard/superadmin, etc.
    return (
      pathname.startsWith("/dashboard/editar-loja/") ||
      pathname.startsWith("/dashboard/meus-painel") ||
      pathname.startsWith("/dashboard/gerenciar-lojas") ||
      pathname.startsWith("/dashboard/superadmin")
    );
  }, [pathname, isDashboardRoot]);

  // Slug é a 2ª parte após "dashboard": /dashboard/{slug}/...
  const slug = useMemo(() => {
    if (pathParts[0] !== "dashboard") return "";
    const candidate = pathParts[1] || "";
    if (
      !candidate ||
      [
        "editar-loja",
        "gerenciar-lojas",
        "meus-painel",
        "admin",
        "superadmin",
      ].includes(candidate)
    ) {
      return "";
    }
    if (candidate === "undefined" || candidate === "null") return "";
    return candidate.trim();
  }, [pathParts]);

  // Carregar config SOMENTE quando houver slug e não for rota especial
  const shouldLoadStoreConfig = !!slug && !isSpecialRoute;

  // Sempre chamamos o hook, enviando slug vazio quando não precisa (hook idempotente)
  const { config, loading, error } = useStoreConfig(
    shouldLoadStoreConfig ? slug : ""
  );

  // Buscar lojas (mantém comportamento atual)
  const { data: storesData } = useStores();
  const userStores = storesData?.data || [];

  // ===================================================
  // 2) REGRAS DE LOADING x ERRO (prevenir falso negativo)
  // ===================================================

  // Enquanto estiver carregando a config de loja (quando deveria carregar) -> mostrar spinner
  const isFetchingStore = shouldLoadStoreConfig && loading;

  // Só tratamos "não encontrada" quando for 404 explícito,
  // evitando mostrar mensagem genérica durante transições/latência
  const notFound =
    shouldLoadStoreConfig && slug && error && isNotFoundError(error);

  // Caso especial: não exibir "não encontrada" se ainda estiver carregando ou a rota mudou
  const showNotFound = !isFetchingStore && notFound;

  // Enquanto houver uma condição em que "deveria ter config" mas ainda não temos e não há erro 404,
  // preferimos LOADING para não piscar a mensagem "Verifique se o endereço está correto."
  const awaitingConfigSafely =
    shouldLoadStoreConfig && slug && !config && !error;

  // =========================
  // 3) NAVEGAÇÃO LATERAL
  // =========================

  const storeNavigation: NavigationItem[] =
    slug && !isSpecialRoute
      ? [
          {
            name: "Visão Geral",
            href: `/dashboard/${slug}`,
            icon: Layout,
            current: pathname === `/dashboard/${slug}`,
          },
          {
            name: "Produtos",
            href: `/dashboard/${slug}/produtos`,
            icon: Package,
            current: pathname.startsWith(`/dashboard/${slug}/produtos`),
          },
          {
            name: "Pedidos",
            href: `/dashboard/${slug}/pedidos`,
            icon: List,
            current: pathname.startsWith(`/dashboard/${slug}/pedidos`),
          },
          {
            name: "Analytics",
            href: `/dashboard/${slug}/analytics`,
            icon: ChartBar,
            current: pathname.startsWith(`/dashboard/${slug}/analytics`),
          },
          {
            name: "Configurações",
            href: `/dashboard/${slug}/configuracoes`,
            icon: Gear,
            current: pathname.startsWith(`/dashboard/${slug}/configuracoes`),
            children: [
              {
                name: "Visual",
                href: `/dashboard/${slug}/configuracoes/visual`,
                icon: Palette,
                current: pathname === `/dashboard/${slug}/configuracoes/visual`,
              },
              {
                name: "Entrega",
                href: `/dashboard/${slug}/configuracoes/entrega`,
                icon: Truck,
                current:
                  pathname === `/dashboard/${slug}/configuracoes/entrega`,
              },
              {
                name: "Horários",
                href: `/dashboard/${slug}/configuracoes/horarios`,
                icon: Clock,
                current:
                  pathname === `/dashboard/${slug}/configuracoes/horarios`,
              },
            ],
          },
        ]
      : [];

  const navigation: NavigationItem[] =
    slug && !isSpecialRoute ? storeNavigation : [];

  // =========================
  // 4) AÇÕES
  // =========================

  const handleLogout = async () => {
    try {
      logout();
      router.push("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // =========================
  // 5) RENDER GUARDS
  // =========================

  // PRIORIDADE 1: enquanto busca config (ou esperamos por ela), mostrar LOADING
  if (isFetchingStore || awaitingConfigSafely) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <OptimizedLoadingSpinner
          size="lg"
          text="Carregando configurações da loja..."
        />
      </div>
    );
  }

  // PRIORIDADE 2: erro 404 explícito -> "Loja não encontrada"
  if (showNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Loja não encontrada
          </h1>
          <p className="text-gray-600 mb-4">
            Verifique se o endereço está correto.
          </p>
          <button
            onClick={() => router.push("/dashboard/gerenciar-lojas")}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Voltar para Gerenciar Lojas
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // 6) LAYOUT
  // =========================

  return (
    <NotificationProvider storeSlug={slug}>
      <DashboardContent
        children={children}
        navigation={navigation}
        slug={slug}
        config={config}
        user={user}
        logout={handleLogout}
        navigateWithLoading={navigateWithLoading}
        isRouteLoading={isRouteLoading}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        pathname={pathname}
      />
    </NotificationProvider>
  );
}
