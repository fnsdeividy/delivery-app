"use client";

import { DashboardMetrics } from "@/components/DashboardMetrics";
import { DashboardQuickActions } from "@/components/DashboardQuickActions";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useCardapioAuth, useDashboardMetrics } from "@/hooks";
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
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acesso Negado
          </h1>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar este dashboard.
          </p>
          <Link
            href="/dashboard/gerenciar-lojas"
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Storefront className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Dashboard Geral da Loja
                </h1>
                <p className="text-sm text-gray-600">
                  {storeInfo?.name || `Loja: ${slug}`}
                </p>
                {/* Indicador de dados mock */}
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    📊 Dados de Demonstração
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Logado como: <span className="font-medium">{userRole}</span>
              </span>
              {userStoreSlug && (
                <span className="text-sm text-gray-500">
                  Loja: <span className="font-medium">{userStoreSlug}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                href="/dashboard/gerenciar-lojas"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Dashboard
              </Link>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-sm font-medium text-gray-500">
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Warning className="w-5 h-5 text-yellow-600 mr-2" />
                Alertas de Estoque
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metrics.lowStockProducts > 0 && (
                  <div className="flex items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Warning className="w-6 h-6 text-yellow-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        {metrics.lowStockProducts} produto(s) com estoque baixo
                      </p>
                      <p className="text-xs text-yellow-600">
                        Verifique e reabasteça o estoque
                      </p>
                    </div>
                  </div>
                )}
                {metrics.outOfStockProducts > 0 && (
                  <div className="flex items-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <Warning className="w-6 h-6 text-red-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        {metrics.outOfStockProducts} produto(s) sem estoque
                      </p>
                      <p className="text-xs text-red-600">
                        Produtos indisponíveis para venda
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <Link
                  href={`/dashboard/${slug}/estoque`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Gerenciar Estoque
                </Link>
              </div>
            </div>
          )}

        {/* Configuração da Loja */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Gear className="w-5 h-5 text-gray-600 mr-2" />
            Configuração da Loja
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href={`/dashboard/${slug}/configuracoes`}
              className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <PencilSimple className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Editar Informações
                </p>
                <p className="text-xs text-gray-600">Nome, descrição, slug</p>
              </div>
            </Link>
            <Link
              href={`/dashboard/${slug}/configuracoes/visual`}
              className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <Palette className="w-5 h-5 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Personalização Visual
                </p>
                <p className="text-xs text-gray-600">Cores, logo, banner</p>
              </div>
            </Link>
            <Link
              href={`/dashboard/${slug}/configuracoes/horarios`}
              className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <Calendar className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Horários de Funcionamento
                </p>
                <p className="text-xs text-gray-600">Dias e horários</p>
              </div>
            </Link>
            <Link
              href={`/dashboard/${slug}/configuracoes/pagamento`}
              className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <CreditCard className="w-5 h-5 text-orange-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Métodos de Pagamento
                </p>
                <p className="text-xs text-gray-600">PIX, cartão, dinheiro</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Gestão de Pedidos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ShoppingBag className="w-5 h-5 text-green-600 mr-2" />
            Gestão de Pedidos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href={`/dashboard/${slug}/pedidos?status=novo`}
              className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <Clock className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Novos Pedidos
                </p>
                <p className="text-xs text-blue-600">Aguardando confirmação</p>
              </div>
            </Link>
            <Link
              href={`/dashboard/${slug}/pedidos?status=em_andamento`}
              className="flex items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors"
            >
              <TrendUp className="w-5 h-5 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-yellow-900">
                  Em Andamento
                </p>
                <p className="text-xs text-yellow-600">Preparando pedidos</p>
              </div>
            </Link>
            <Link
              href={`/dashboard/${slug}/pedidos?status=finalizado`}
              className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
            >
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  Finalizados
                </p>
                <p className="text-xs text-green-600">Pedidos entregues</p>
              </div>
            </Link>
            <Link
              href={`/dashboard/${slug}/pedidos?status=cancelado`}
              className="flex items-center p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
            >
              <X className="w-5 h-5 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-red-900">Cancelados</p>
                <p className="text-xs text-red-600">Pedidos cancelados</p>
              </div>
            </Link>
          </div>
          <div className="mt-4">
            <Link
              href={`/dashboard/${slug}/pedidos`}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Todos os Pedidos
            </Link>
          </div>
        </div>

        {/* Usuários e Colaboradores */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 text-blue-600 mr-2" />
            Usuários e Colaboradores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Colaboradores Ativos
                  </p>
                  <p className="text-xs text-gray-600">
                    Usuários com acesso ao painel
                  </p>
                </div>
                <span className="text-lg font-bold text-blue-600">3</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Convites Pendentes
                  </p>
                  <p className="text-xs text-gray-600">Aguardando aceitação</p>
                </div>
                <span className="text-lg font-bold text-yellow-600">1</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Convidar Colaborador
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              <Users className="w-4 h-4 mr-2" />
              Gerenciar Usuários
            </button>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Horário de Funcionamento
                </h3>
                <p className="text-sm text-gray-600">
                  Segunda a Sábado: 8h às 18h
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <CreditCard className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Formas de Pagamento
                </h3>
                <p className="text-sm text-gray-600">PIX, Cartão, Dinheiro</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Truck className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Delivery</h3>
                <p className="text-sm text-gray-600">Entrega em até 40 min</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
