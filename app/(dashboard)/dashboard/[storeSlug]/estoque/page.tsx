"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { useCardapioAuth } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { Package, Plus } from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// Componentes modulares
import InventoryStatsCards from "./componentes/InventoryStatsCards";
import InventoryTable from "./componentes/InventoryTable";
import MovementsTable from "./componentes/MovementsTable";
import SearchAndFilters from "./componentes/SearchAndFilters";
import { useToast } from "./componentes/Toast";

interface InventoryItem {
  id: string;
  quantity: number;
  minStock: number;
  maxStock?: number;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    active: boolean;
    category: {
      id: string;
      name: string;
    };
  };
}

interface InventorySummary {
  totalProducts: number;
  totalStock: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  reservedStock: number;
  availableStock: number;
}

interface StockMovement {
  id: string;
  type: "ENTRADA" | "SAIDA" | "AJUSTE" | "DEVOLUCAO";
  quantity: number;
  reason?: string;
  reference?: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    image: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function EstoquePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.storeSlug as string;
  const { isAuthenticated, getCurrentToken } = useCardapioAuth();
  const { showToast, ToastContainer } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [activeTab, setActiveTab] = useState<"inventory" | "movements">(
    "inventory"
  );

  // Memoizar função de carregamento do resumo do inventário
  const loadInventorySummary = useCallback(
    async (retryCount = 0) => {
      try {
        const data = await apiClient.get<InventorySummary>(
          `/inventory/store/${slug}/summary`
        );
        setSummary(data);
      } catch (error) {
        console.error("❌ Erro ao carregar resumo do estoque:", error);

        // Retry automático para erros de timeout
        if (retryCount < 2 && error.message?.includes("Tempo limite")) {
          console.log(
            `🔄 Tentativa ${retryCount + 1}/3 para carregar resumo do estoque`
          );
          setTimeout(() => loadInventorySummary(retryCount + 1), 2000);
          return;
        }

        showToast("Erro ao carregar resumo do estoque", "error");
      }
    },
    [slug, showToast]
  );

  // Memoizar função de carregamento do inventário
  const loadInventory = useCallback(
    async (retryCount = 0) => {
      setDataLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          lowStock: showLowStock.toString(),
        });

        if (searchQuery.trim()) {
          queryParams.append("search", searchQuery.trim());
        }

        const url = `/inventory/store/${slug}?${queryParams.toString()}`;

        const data = await apiClient.get<PaginatedResponse<InventoryItem>>(url);

        setInventory(data.data);
        setPagination(data.pagination);
      } catch (error) {
        console.error("❌ Erro ao carregar inventário:", error);

        // Retry automático para erros de timeout
        if (retryCount < 2 && error.message?.includes("Tempo limite")) {
          console.log(
            `🔄 Tentativa ${retryCount + 1}/3 para carregar inventário`
          );
          setTimeout(() => loadInventory(retryCount + 1), 2000);
          return;
        }

        showToast("Erro ao carregar inventário", "error");
      } finally {
        setDataLoading(false);
      }
    },
    [
      slug,
      showToast,
      pagination.page,
      pagination.limit,
      showLowStock,
      searchQuery,
    ]
  );

  // Memoizar função de carregamento das movimentações
  const loadMovements = useCallback(
    async (retryCount = 0) => {
      setDataLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        });

        if (selectedType) {
          queryParams.append("type", selectedType);
        }

        if (searchQuery.trim()) {
          queryParams.append("search", searchQuery.trim());
        }

        const data = await apiClient.get<PaginatedResponse<StockMovement>>(
          `/inventory/store/${slug}/movements?${queryParams.toString()}`
        );
        setMovements(data.data);
        setPagination(data.pagination);
      } catch (error) {
        console.error("Erro ao carregar movimentações:", error);

        // Retry automático para erros de timeout
        if (retryCount < 2 && error.message?.includes("Tempo limite")) {
          console.log(
            `🔄 Tentativa ${retryCount + 1}/3 para carregar movimentações`
          );
          setTimeout(() => loadMovements(retryCount + 1), 2000);
          return;
        }

        showToast("Erro ao carregar movimentações", "error");
      } finally {
        setDataLoading(false);
      }
    },
    [
      slug,
      showToast,
      pagination.page,
      pagination.limit,
      selectedType,
      searchQuery,
    ]
  );

  // Memoizar função de carregamento inicial
  const loadInitialData = useCallback(async () => {
    await Promise.all([
      loadInventorySummary(),
      loadInventory(),
      loadMovements(),
    ]);
  }, [loadInventorySummary, loadInventory, loadMovements]);

  // UseEffect simplificado para evitar loops infinitos
  useEffect(() => {
    const checkAuth = async () => {
      try {
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

        const hasAccess =
          payload.role === "SUPER_ADMIN" ||
          (payload.role === "ADMIN" && payload.storeSlug === slug);

        if (hasAccess) {
          await loadInitialData();
        } else {
          router.push("/unauthorized");
        }
      } catch (error) {
        console.error("❌ Erro na verificação de autenticação:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    // Só verificar autenticação quando o componente montar ou o slug mudar
    if (slug) {
      checkAuth();
    }
  }, [slug]); // Apenas slug como dependência

  // UseEffect para reagir a mudanças na paginação, busca, filtros
  useEffect(() => {
    if (isLoading) return; // Não executar se ainda estiver carregando inicialmente

    if (activeTab === "inventory") {
      loadInventory();
    } else {
      loadMovements();
    }
  }, [
    pagination.page,
    searchQuery,
    showLowStock,
    selectedType,
    activeTab,
    isLoading,
    loadInventory,
    loadMovements,
  ]);

  // Memoizar função de busca
  const handleSearch = useCallback(() => {
    if (activeTab === "inventory") {
      loadInventory();
    } else {
      loadMovements();
    }
  }, [activeTab, loadInventory, loadMovements]);

  // Memoizar função de atualização de inventário
  const updateInventory = useCallback(
    async (inventoryId: string, newQuantity: number) => {
      try {
        await apiClient.patch(`/inventory/${inventoryId}?storeSlug=${slug}`, {
          quantity: newQuantity,
        });

        // Atualizar estado local
        setInventory((prev) =>
          prev.map((item) =>
            item.id === inventoryId ? { ...item, quantity: newQuantity } : item
          )
        );
        loadInventorySummary(); // Recarregar resumo
        showToast("Estoque atualizado com sucesso", "success");
      } catch (error) {
        console.error("Erro ao atualizar inventário:", error);
        showToast("Erro ao atualizar estoque", "error");
      }
    },
    [slug, loadInventorySummary, showToast]
  );

  // Memoizar função de criação de movimentação
  const createStockMovement = useCallback(
    async (
      productId: string,
      type: "ENTRADA" | "SAIDA",
      quantity: number,
      reason: string
    ) => {
      try {
        await apiClient.post(`/inventory/movements?storeSlug=${slug}`, {
          productId,
          type,
          quantity,
          reason,
        });

        loadInventory(); // Recarregar inventário
        loadMovements(); // Recarregar movimentações
        loadInventorySummary(); // Recarregar resumo
        showToast(
          `${type === "ENTRADA" ? "Entrada" : "Saída"} de estoque registrada`,
          "success"
        );
      } catch (error) {
        console.error("Erro ao criar movimentação:", error);
        showToast("Erro ao registrar movimentação", "error");
      }
    },
    [slug, loadInventory, loadMovements, loadInventorySummary, showToast]
  );

  // Memoizar função de mudança de aba
  const handleTabChange = useCallback(
    (tab: "inventory" | "movements") => {
      setActiveTab(tab);
      setPagination((prev) => ({ ...prev, page: 1 }));
      if (tab === "inventory") {
        loadInventory();
      } else {
        loadMovements();
      }
    },
    [loadInventory, loadMovements]
  );

  // Memoizar função de mudança de página
  const handlePageChange = useCallback(
    (newPage: number) => {
      setPagination((prev) => ({ ...prev, page: newPage }));
      if (activeTab === "inventory") {
        loadInventory();
      } else {
        loadMovements();
      }
    },
    [activeTab, loadInventory, loadMovements]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-6 gap-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gerenciar Estoque
                </h1>
                <p className="text-sm text-gray-600">Loja: {slug}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => router.push(`/dashboard/${slug}/produtos`)}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
              >
                <Package className="w-5 h-5 mr-2" />
                Ver Produtos
              </button>
              <button
                onClick={() => router.push(`/dashboard/${slug}/produtos/novo`)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Novo Produto
              </button>
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
              <button
                onClick={() => router.push(`/dashboard/${slug}`)}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Dashboard
              </button>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-sm font-medium text-gray-500">
                  Estoque
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Resumo do Estoque */}
        {summary && <InventoryStatsCards summary={summary} />}

        {/* Filtros e Busca */}
        <SearchAndFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
          activeTab={activeTab}
          showLowStock={showLowStock}
          onLowStockChange={setShowLowStock}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          onFilter={handleSearch}
          isLoading={dataLoading}
        />

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => handleTabChange("inventory")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "inventory"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Inventário
              </button>
              <button
                onClick={() => handleTabChange("movements")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "movements"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Movimentações
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Conteúdo das Tabs */}
            {activeTab === "inventory" && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Inventário ({pagination.total} produtos)
                </h3>
                <InventoryTable
                  inventory={inventory}
                  isLoading={dataLoading}
                  onUpdateInventory={updateInventory}
                  onCreateMovement={createStockMovement}
                />
              </div>
            )}

            {activeTab === "movements" && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Movimentações ({pagination.total} registros)
                </h3>
                <MovementsTable movements={movements} isLoading={dataLoading} />
              </div>
            )}
          </div>
        </div>

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center">
            <nav className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>

              <span className="px-4 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700">
                Página {pagination.page} de {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próxima
              </button>
            </nav>
          </div>
        )}
      </main>
    </div>
  );
}
