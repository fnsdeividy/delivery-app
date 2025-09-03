"use client";

import { DashboardMetrics } from "@/components/DashboardMetrics";
import { DashboardQuickActions } from "@/components/DashboardQuickActions";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useCardapioAuth, useDashboardMetrics } from "@/hooks";
import { useStoreConfig } from "@/lib/store/useStoreConfig";
import {
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
  Gear,
  Package,
  Palette,
  PencilSimple,
  Plus,
  ShoppingBag,
  Storefront,
  TrendUp,
  Truck,
  Users,
  Warning,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
          router.push("/login");
          return;
        }

        // Obter token e decodificar
        const token = getCurrentToken();
        if (!token) {
          router.push("/login");
          return;
        }

        // Decodificar token JWT
        const payload = JSON.parse(atob(token.split(".")[1]));

        setUserRole(payload.role);
        setUserStoreSlug(payload.storeSlug);

        // Verificar permissões
        if (payload.role === "SUPER_ADMIN") {
          setHasAccess(true);
        } else if (payload.role === "ADMIN") {
          // ADMIN pode acessar apenas sua própria loja
          if (payload.storeSlug === slug) {
            setHasAccess(true);
          } else if (payload.storeSlug === null) {
            router.push("/dashboard/gerenciar-lojas");
            return;
          } else {
            router.push("/unauthorized");
            return;
          }
        } else {
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
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm md:text-base"
          >
            Voltar para Gerenciar Lojas
          </Link>
        </div>
      </div>
    );
  }

  // Remover verificação de erro para permitir dados mock
  // if (metricsError) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //       <div className="text-center">
  //         <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
  //           <span className="text-2xl">⚠️</span>
  //         </div>
  //         <h1 className="text-2xl font-bold text-gray-900 mb-2">
  //           Erro ao Carregar Dashboard
  //         </h1>
  //         <p className="text-gray-600 mb-4">{metricsError}</p>
  //         <button
  //           onClick={() => window.location.reload()}
  //           className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  //         >
  //           Tentar Novamente
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 sm:py-3 md:py-4 lg:py-6 gap-1.5 sm:gap-2 md:gap-4">
            <div className="flex items-center">
              {storeConfig?.branding?.logo ? (
                <div className="w-7 sm:w-8 md:w-10 h-7 sm:h-8 md:h-10 rounded-lg overflow-hidden mr-2 sm:mr-3 flex-shrink-0">
                  <img
                    src={storeConfig.branding.logo}
                    alt={storeConfig.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-7 sm:w-8 md:w-10 h-7 sm:h-8 md:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                  <Storefront className="w-3.5 sm:w-4 md:w-5 h-3.5 sm:h-4 md:h-5 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                  Dashboard Geral da Loja
                </h1>
                <p className="text-xs md:text-sm text-gray-600">
                  {storeConfig?.name || storeInfo?.name || `Loja: ${slug}`}
                </p>
                {/* Indicador de dados mock */}
                <div className="mt-1">
                  <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-yellow-100 text-yellow-800">
                    📊 Dados de Demonstração
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 md:space-x-4 text-[10px] sm:text-xs md:text-sm text-gray-500">
              <span>
                Logado como: <span className="font-medium">{userRole}</span>
              </span>
              {userStoreSlug && (
                <span>
                  Loja: <span className="font-medium">{userStoreSlug}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10">
        {/* Breadcrumb */}
        <nav className="flex mb-3 sm:mb-4 md:mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-0.5 sm:space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <Link
                href="/dashboard/gerenciar-lojas"
                className="inline-flex items-center text-xs sm:text-xs md:text-sm font-medium text-gray-700 hover:text-blue-600"
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
        <DashboardQuickActions storeSlug={slug} />

        {/* Métricas Rápidas */}
        {metrics && <DashboardMetrics metrics={metrics} storeSlug={slug} />}

        {/* Alertas de Estoque */}
        {metrics &&
          (metrics.lowStockProducts > 0 || metrics.outOfStockProducts > 0) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
              <h2 className="text-base md:text-lg font-medium text-gray-900 mb-3 md:mb-4 flex items-center">
                <Warning className="w-3.5 sm:w-4 md:w-5 h-3.5 sm:h-4 md:h-5 text-yellow-600 mr-1.5 sm:mr-2" />
                Alertas de Estoque
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                {metrics.lowStockProducts > 0 && (
                  <div className="flex items-center p-2 sm:p-3 md:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Warning className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-yellow-600 mr-1.5 sm:mr-2 md:mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-xs md:text-sm font-medium text-yellow-800">
                        {metrics.lowStockProducts} produto(s) com estoque baixo
                      </p>
                      <p className="text-xs text-yellow-600">
                        Verifique e reabasteça o estoque
                      </p>
                    </div>
                  </div>
                )}
                {metrics.outOfStockProducts > 0 && (
                  <div className="flex items-center p-2 sm:p-3 md:p-4 bg-red-50 rounded-lg border border-red-200">
                    <Warning className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-red-600 mr-1.5 sm:mr-2 md:mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-xs md:text-sm font-medium text-red-800">
                        {metrics.outOfStockProducts} produto(s) sem estoque
                      </p>
                      <p className="text-xs text-red-600">
                        Produtos indisponíveis para venda
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-3 md:mt-4">
                <Link
                  href={`/dashboard/${slug}/estoque`}
                  className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm md:text-base"
                >
                  <Package className="w-3.5 sm:w-4 h-3.5 sm:h-4 mr-1.5 sm:mr-2" />
                  Gerenciar Estoque
                </Link>
              </div>
            </div>
          )}

        {/* Configuração da Loja */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-base md:text-lg font-medium text-gray-900 mb-3 md:mb-4 flex items-center">
            <Gear className="w-3.5 sm:w-4 md:w-5 h-3.5 sm:h-4 md:h-5 text-gray-600 mr-1.5 sm:mr-2" />
            Configuração da Loja
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
            <Link
              href={`/dashboard/${slug}/configuracoes`}
              className="flex items-center p-1.5 sm:p-2 md:p-3 lg:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <PencilSimple className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-blue-600 mr-1 sm:mr-1.5 md:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-900">
                  Editar Info
                </p>
                <p className="text-[10px] sm:text-xs text-gray-600">Nome, descrição</p>
              </div>
            </Link>
            <Link
              href={`/dashboard/${slug}/configuracoes/visual`}
              className="flex items-center p-1.5 sm:p-2 md:p-3 lg:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <Palette className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-purple-600 mr-1 sm:mr-2 md:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-900">
                  Personalização Visual
                </p>
                <p className="text-xs text-gray-600">Cores, logo, banner</p>
              </div>
            </Link>
            <Link
              href={`/dashboard/${slug}/configuracoes/horarios`}
              className="flex items-center p-1.5 sm:p-2 md:p-3 lg:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <Calendar className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-600 mr-1 sm:mr-2 md:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-900">
                  Horários de Funcionamento
                </p>
                <p className="text-xs text-gray-600">Dias e horários</p>
              </div>
            </Link>
            <Link
              href={`/dashboard/${slug}/configuracoes/pagamento`}
              className="flex items-center p-1.5 sm:p-2 md:p-3 lg:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <CreditCard className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-orange-600 mr-1 sm:mr-2 md:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-900">
                  Métodos de Pagamento
                </p>
                <p className="text-xs text-gray-600">PIX, cartão, dinheiro</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Gestão de Pedidos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-base md:text-lg font-medium text-gray-900 mb-3 md:mb-4 flex items-center">
            <ShoppingBag className="w-3.5 sm:w-4 md:w-5 h-3.5 sm:h-4 md:h-5 text-green-600 mr-1.5 sm:mr-2" />
            Gestão de Pedidos
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
            <Link
              href={`/dashboard/${slug}/pedidos?status=novo`}
              className="flex items-center p-1.5 sm:p-2 md:p-3 lg:p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <Clock className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-blue-600 mr-1 sm:mr-2 md:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium text-blue-900">
                  Novos Pedidos
                </p>
                <p className="text-xs text-blue-600">Aguardando confirmação</p>
              </div>
            </Link>
            <Link
              href={`/dashboard/${slug}/pedidos?status=em_andamento`}
              className="flex items-center p-1.5 sm:p-2 md:p-3 lg:p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors"
            >
              <TrendUp className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-yellow-600 mr-1 sm:mr-2 md:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium text-yellow-900">
                  Em Andamento
                </p>
                <p className="text-xs text-yellow-600">Preparando pedidos</p>
              </div>
            </Link>
            <Link
              href={`/dashboard/${slug}/pedidos?status=finalizado`}
              className="flex items-center p-1.5 sm:p-2 md:p-3 lg:p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
            >
              <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-600 mr-1 sm:mr-2 md:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium text-green-900">
                  Finalizados
                </p>
                <p className="text-xs text-green-600">Pedidos entregues</p>
              </div>
            </Link>
            <Link
              href={`/dashboard/${slug}/pedidos?status=cancelado`}
              className="flex items-center p-1.5 sm:p-2 md:p-3 lg:p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
            >
              <X className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-red-600 mr-1 sm:mr-2 md:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium text-red-900">
                  Cancelados
                </p>
                <p className="text-xs text-red-600">Pedidos cancelados</p>
              </div>
            </Link>
          </div>
          <div className="mt-3 md:mt-4">
            <Link
              href={`/dashboard/${slug}/pedidos`}
              className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs sm:text-sm md:text-base"
            >
              <Eye className="w-3.5 sm:w-4 h-3.5 sm:h-4 mr-1.5 sm:mr-2" />
              Ver Todos os Pedidos
            </Link>
          </div>
        </div>

        {/* Usuários e Colaboradores */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-base md:text-lg font-medium text-gray-900 mb-3 md:mb-4 flex items-center">
            <Users className="w-3.5 sm:w-4 md:w-5 h-3.5 sm:h-4 md:h-5 text-blue-600 mr-1.5 sm:mr-2" />
            Usuários e Colaboradores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            <div className="p-1.5 sm:p-2 md:p-3 lg:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-900">
                    Colaboradores Ativos
                  </p>
                  <p className="text-xs text-gray-600">
                    Usuários com acesso ao painel
                  </p>
                </div>
                <span className="text-base md:text-lg font-bold text-blue-600">
                  3
                </span>
              </div>
            </div>
            <div className="p-1.5 sm:p-2 md:p-3 lg:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-900">
                    Clientes Cadastrados
                  </p>
                  <p className="text-xs text-gray-600">Aguardando aceitação</p>
                </div>
                <span className="text-base md:text-lg font-bold text-yellow-600">
                  1
                </span>
              </div>
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 md:mt-3 lg:mt-4 flex flex-col sm:flex-row space-y-1.5 sm:space-y-0 sm:space-x-2 md:space-x-3">
            <button className="inline-flex items-center justify-center px-1.5 sm:px-2 md:px-3 lg:px-4 py-1 sm:py-1.5 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-[10px] sm:text-xs md:text-sm">
              <Plus className="w-3.5 sm:w-4 h-3.5 sm:h-4 mr-1.5 sm:mr-2" />
              Convidar Colaborador
            </button>
            <button className="inline-flex items-center justify-center px-1.5 sm:px-2 md:px-3 lg:px-4 py-1 sm:py-1.5 md:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-[10px] sm:text-xs md:text-sm">
              <Users className="w-3.5 sm:w-4 h-3.5 sm:h-4 mr-1.5 sm:mr-2" />
              Gerenciar Usuários
            </button>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-2.5 md:p-3 lg:p-4">
            <div className="flex items-center">
              <Clock className="w-3.5 sm:w-4 md:w-5 lg:w-6 h-3.5 sm:h-4 md:h-5 lg:h-6 text-yellow-600 flex-shrink-0" />
              <div className="ml-1.5 sm:ml-2 md:ml-3 lg:ml-4 min-w-0">
                <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900">
                  Horário de Funcionamento
                </h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Segunda a Sábado: 8h às 18h
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-2.5 md:p-3 lg:p-4">
            <div className="flex items-center">
              <CreditCard className="w-3.5 sm:w-4 md:w-5 lg:w-6 h-3.5 sm:h-4 md:h-5 lg:h-6 text-green-600 flex-shrink-0" />
              <div className="ml-1.5 sm:ml-2 md:ml-3 lg:ml-4 min-w-0">
                <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900">
                  Formas de Pagamento
                </h3>
                <p className="text-xs md:text-sm text-gray-600">
                  PIX, Cartão, Dinheiro
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-2.5 md:p-3 lg:p-4">
            <div className="flex items-center">
              <Truck className="w-3.5 sm:w-4 md:w-5 lg:w-6 h-3.5 sm:h-4 md:h-5 lg:h-6 text-blue-600 flex-shrink-0" />
              <div className="ml-1.5 sm:ml-2 md:ml-3 lg:ml-4 min-w-0">
                <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900">
                  Delivery
                </h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Entrega em até 40 min
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
