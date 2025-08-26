"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { useCardapioAuth } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import {
  CheckCircle,
  Package,
  Plus,
  TrendUp,
  Warning,
} from "@phosphor-icons/react";
import { Filter, Search, TrendingDown, TrendingUp } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

  const [isLoading, setIsLoading] = useState(true);
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

        if (
          payload.role === "SUPER_ADMIN" ||
          (payload.role === "ADMIN" && payload.storeSlug === slug)
        ) {
          loadInventorySummary();
          loadInventory();
          loadMovements();
        } else {
          router.push("/unauthorized");
        }
      } catch (error) {
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [slug, isAuthenticated, getCurrentToken, router]);

  const loadInventorySummary = async () => {
    try {
      const data = await apiClient.get<InventorySummary>(
        `/inventory/store/${slug}/summary`
      );
      setSummary(data);
    } catch (error) {
      console.error("Erro ao carregar resumo do estoque:", error);
    }
  };

  const loadInventory = async () => {
    try {
      const data = await apiClient.get<PaginatedResponse<InventoryItem>>(
        `/inventory/store/${slug}?page=${pagination.page}&limit=${pagination.limit}&lowStock=${showLowStock}`
      );
      setInventory(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Erro ao carregar inventário:", error);
    }
  };

  const loadMovements = async () => {
    try {
      const data = await apiClient.get<PaginatedResponse<StockMovement>>(
        `/inventory/store/${slug}/movements?page=${pagination.page}&limit=${
          pagination.limit
        }${selectedType ? `&type=${selectedType}` : ""}`
      );
      setMovements(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Erro ao carregar movimentações:", error);
    }
  };

  const searchInventory = async () => {
    if (searchQuery.trim().length < 2) return;

    try {
      // Implementar busca no inventário
      console.log("Busca implementada:", searchQuery);
    } catch (error) {
      console.error("Erro ao buscar no inventário:", error);
    }
  };

  const updateInventory = async (inventoryId: string, newQuantity: number) => {
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
    } catch (error) {
      console.error("Erro ao atualizar inventário:", error);
    }
  };

  const createStockMovement = async (
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
    } catch (error) {
      console.error("Erro ao criar movimentação:", error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity <= 0)
      return {
        text: "Sem estoque",
        color: "text-red-600 bg-red-100",
        icon: Warning,
      };
    if (quantity <= minStock)
      return {
        text: "Estoque baixo",
        color: "text-yellow-600 bg-yellow-100",
        icon: Warning,
      };
    return {
      text: "Em estoque",
      color: "text-green-600 bg-green-100",
      icon: CheckCircle,
    };
  };

  const getMovementTypeInfo = (type: string) => {
    switch (type) {
      case "ENTRADA":
        return {
          text: "Entrada",
          color: "text-green-600 bg-green-100",
          icon: TrendingUp,
        };
      case "SAIDA":
        return {
          text: "Saída",
          color: "text-red-600 bg-red-100",
          icon: TrendingDown,
        };
      case "AJUSTE":
        return {
          text: "Ajuste",
          color: "text-blue-600 bg-blue-100",
          icon: Package,
        };
      case "DEVOLUCAO":
        return {
          text: "Devolução",
          color: "text-purple-600 bg-purple-100",
          icon: Package,
        };
      default:
        return {
          text: type,
          color: "text-gray-600 bg-gray-100",
          icon: Package,
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gerenciar Estoque
                </h1>
                <p className="text-sm text-gray-600">Loja: {slug}</p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/dashboard/${slug}/produtos/novo`)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Produto
            </button>
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
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-green-600"
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
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total de Produtos
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.totalProducts}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total em Estoque
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.totalStock}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <Warning className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Estoque Baixo
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.lowStockProducts}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <Warning className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Sem Estoque
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.outOfStockProducts}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <TrendUp className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Reservado</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.reservedStock}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Disponível
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.availableStock}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("inventory")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "inventory"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Inventário
              </button>
              <button
                onClick={() => setActiveTab("movements")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "movements"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Movimentações
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Busca */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && searchInventory()}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Filtros específicos por tab */}
              {activeTab === "inventory" && (
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showLowStock}
                      onChange={(e) => setShowLowStock(e.target.checked)}
                      className="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">
                      Apenas estoque baixo
                    </span>
                  </label>
                </div>
              )}

              {activeTab === "movements" && (
                <div>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Todos os tipos</option>
                    <option value="ENTRADA">Entrada</option>
                    <option value="SAIDA">Saída</option>
                    <option value="AJUSTE">Ajuste</option>
                    <option value="DEVOLUCAO">Devolução</option>
                  </select>
                </div>
              )}

              {/* Botão de ação */}
              <div>
                <button
                  onClick={
                    activeTab === "inventory" ? loadInventory : loadMovements
                  }
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrar
                </button>
              </div>
            </div>

            {/* Conteúdo das Tabs */}
            {activeTab === "inventory" && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Inventário ({pagination.total})
                </h3>

                {inventory.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum produto encontrado
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {showLowStock
                        ? "Nenhum produto com estoque baixo"
                        : "Comece criando produtos"}
                    </p>
                    {!showLowStock && (
                      <button
                        onClick={() =>
                          router.push(`/dashboard/${slug}/produtos/novo`)
                        }
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Criar Primeiro Produto
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Produto
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Categoria
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estoque Atual
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estoque Mínimo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {inventory.map((item) => {
                          const status = getStockStatus(
                            item.quantity,
                            item.minStock
                          );
                          const StatusIcon = status.icon;

                          return (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="w-12 h-12 rounded-lg object-cover mr-3"
                                  />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {item.product.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {item.product.description}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.product.category?.name || "Sem categoria"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {item.quantity} unidades
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatPrice(item.product.price)} cada
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.minStock} unidades
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div
                                  className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}
                                >
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {status.text}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={() => {
                                      const newQuantity = prompt(
                                        `Nova quantidade para ${item.product.name}:`,
                                        item.quantity.toString()
                                      );
                                      if (
                                        newQuantity &&
                                        !isNaN(Number(newQuantity))
                                      ) {
                                        updateInventory(
                                          item.id,
                                          Number(newQuantity)
                                        );
                                      }
                                    }}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="Ajustar estoque"
                                  >
                                    <Package className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const quantity = prompt(
                                        `Quantidade para entrada de ${item.product.name}:`
                                      );
                                      const reason =
                                        prompt("Motivo da entrada:");
                                      if (
                                        quantity &&
                                        reason &&
                                        !isNaN(Number(quantity))
                                      ) {
                                        createStockMovement(
                                          item.product.id,
                                          "ENTRADA",
                                          Number(quantity),
                                          reason
                                        );
                                      }
                                    }}
                                    className="text-green-600 hover:text-green-900"
                                    title="Entrada de estoque"
                                  >
                                    <TrendingUp className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const quantity = prompt(
                                        `Quantidade para saída de ${item.product.name}:`
                                      );
                                      const reason = prompt("Motivo da saída:");
                                      if (
                                        quantity &&
                                        reason &&
                                        !isNaN(Number(quantity))
                                      ) {
                                        createStockMovement(
                                          item.product.id,
                                          "SAIDA",
                                          Number(quantity),
                                          reason
                                        );
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-900"
                                    title="Saída de estoque"
                                  >
                                    <TrendingDown className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "movements" && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Movimentações ({pagination.total})
                </h3>

                {movements.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma movimentação encontrada
                    </h3>
                    <p className="text-gray-500 mb-4">
                      As movimentações de estoque aparecerão aqui
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data/Hora
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Produto
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantidade
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Motivo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Usuário
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {movements.map((movement) => {
                          const typeInfo = getMovementTypeInfo(movement.type);
                          const TypeIcon = typeInfo.icon;

                          return (
                            <tr key={movement.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(movement.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <img
                                    src={movement.product.image}
                                    alt={movement.product.name}
                                    className="w-8 h-8 rounded-lg object-cover mr-2"
                                  />
                                  <span className="text-sm font-medium text-gray-900">
                                    {movement.product.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div
                                  className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${typeInfo.color}`}
                                >
                                  <TypeIcon className="w-3 h-3 mr-1" />
                                  {typeInfo.text}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {movement.quantity} unidades
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {movement.reason || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {movement.user.name || movement.user.email}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="inline-flex rounded-md shadow">
              <button
                onClick={() => {
                  if (pagination.page > 1) {
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
                    activeTab === "inventory"
                      ? loadInventory()
                      : loadMovements();
                  }
                }}
                disabled={pagination.page === 1}
                className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              <span className="px-3 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700">
                Página {pagination.page} de {pagination.totalPages}
              </span>

              <button
                onClick={() => {
                  if (pagination.page < pagination.totalPages) {
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
                    activeTab === "inventory"
                      ? loadInventory()
                      : loadMovements();
                  }
                }}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
