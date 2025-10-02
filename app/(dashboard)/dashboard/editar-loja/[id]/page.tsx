"use client";

import { ProductManagement } from "@/components/ProductManagement";
import { StoreDashboard } from "@/components/StoreDashboard";
import { StoreEditForm } from "@/components/StoreEditForm";
import { StoreVisualConfig } from "@/components/StoreVisualConfig";
import { useAuthContext } from "@/contexts/AuthContext";
import { useStore } from "@/hooks";
import { useStoreConfig } from "@/lib/store/useStoreConfig";
import {
  ArrowLeft,
  ChartLine,
  Gear,
  Package,
  Palette,
  Storefront,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type TabType = "dashboard" | "produtos" | "configuracoes" | "visual";

export default function EditarLojaPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthContext();
  const storeId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar dados da loja
  const { data: storeData, isLoading: isLoadingStore } = useStore(storeId);

  // Buscar configuração da loja para obter a logo
  const { config: storeConfig } = useStoreConfig(storeData?.slug || "");

  // Verificar autorização do usuário
  useEffect(() => {
    if (isAuthenticated && user && storeData) {
      // Verificar se o usuário tem permissão global (ADMIN)
      const hasGlobalAccess = user.role === "ADMIN";

      if (hasGlobalAccess) {
        // Usuários com role global podem editar qualquer loja
        setIsAuthorized(true);
      } else {
        // Verificar se o usuário tem permissão específica para esta loja
        const userStore = user.stores?.find(
          (s) => s.storeSlug === storeData.slug
        );

        if (
          userStore &&
          (userStore.role === "OWNER" ||
            userStore.role === "LOJA_ADMIN" ||
            userStore.role === "LOJA_MANAGER")
        ) {
          setIsAuthorized(true);
        } else {
          // Usuário não tem permissão para editar esta loja
          router.push(
            "/dashboard/gerenciar-lojas?error=Sem permissão para editar esta loja"
          );
        }
      }
    }
    setIsLoading(false);
  }, [isAuthenticated, user, storeData, router]);

  const handleSuccess = () => {
    // Redirecionar para o dashboard da loja após edição bem-sucedida
    router.push(
      `/dashboard/gerenciar-lojas?message=Loja atualizada com sucesso!`
    );
  };

  const handleCancel = () => {
    router.push("/dashboard/gerenciar-lojas");
  };

  if (!storeId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ID da Loja Não Encontrado
          </h1>
          <p className="text-gray-600 mb-4">
            Não foi possível identificar qual loja editar.
          </p>
          <Link
            href="/dashboard/gerenciar-lojas"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Gerenciar Lojas
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || isLoadingStore) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Carregando...
          </h1>
          <p className="text-gray-600">
            Verificando permissões e carregando dados da loja
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acesso Negado
          </h1>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para editar esta loja.
          </p>
          <Link
            href="/dashboard/gerenciar-lojas"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Gerenciar Lojas
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: "dashboard" as TabType,
      name: "Dashboard",
      icon: ChartLine,
      description: "Métricas e dados principais da loja",
    },
    {
      id: "produtos" as TabType,
      name: "Produtos",
      icon: Package,
      description: "Gerenciar produtos e categorias",
    },
    {
      id: "configuracoes" as TabType,
      name: "Configurações",
      icon: Gear,
      description: "Informações básicas e operacionais",
    },
    {
      id: "visual" as TabType,
      name: "Identidade Visual",
      icon: Palette,
      description: "Logo, banner e tema da loja",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link
                href="/dashboard/gerenciar-lojas"
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center">
                {storeConfig?.branding?.logo ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                    <img
                      src={storeConfig.branding.logo}
                      alt={storeConfig.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <Storefront className="w-5 h-5 text-purple-600" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {storeConfig?.name || storeData?.name || "Editar Loja"}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Gerencie sua loja de forma completa e eficiente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <Link
              href="/dashboard/gerenciar-lojas"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-purple-600"
            >
              Dashboard
            </Link>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link
                  href="/dashboard/gerenciar-lojas"
                  className="text-sm font-medium text-gray-700 hover:text-orange-600"
                >
                  Gerenciar Lojas
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-sm font-medium text-gray-500">
                  {storeData?.name || "Editar Loja"}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Tab Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {tabs.find((t) => t.id === activeTab)?.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {tabs.find((t) => t.id === activeTab)?.description}
            </p>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "dashboard" && (
              <StoreDashboard storeSlug={storeData?.slug || storeId} />
            )}

            {activeTab === "produtos" && (
              <ProductManagement storeSlug={storeData?.slug || storeId} />
            )}

            {activeTab === "configuracoes" && (
              <StoreEditForm
                storeId={storeId}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
                initialData={storeData}
              />
            )}

            {activeTab === "visual" && (
              <StoreVisualConfig storeSlug={storeData?.slug || storeId} />
            )}
          </div>
        </div>

        {/* Ações Adicionais */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ações Adicionais
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href={`/dashboard/${storeData?.slug || ""}`}
              className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Storefront className="w-4 h-4 mr-2" />
              Ir para Dashboard da Loja
            </Link>

            <Link
              href="/dashboard/gerenciar-lojas"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Gerenciar Lojas
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
