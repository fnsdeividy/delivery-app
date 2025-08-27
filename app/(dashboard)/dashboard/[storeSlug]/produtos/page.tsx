"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { ProtectedProductRoute } from "@/components/ProtectedProductRoute";
import { useToast } from "@/components/Toast";
import { useApiErrorHandler, useCardapioAuth } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import {
  ArrowsClockwise,
  Eye,
  EyeSlash,
  Funnel,
  FunnelSimple,
  MagnifyingGlass,
  Pencil,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

interface Product {
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
  inventory: {
    quantity: number;
    minStock: number;
  };
  _count: {
    orderItems: number;
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

export default function ProdutosPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.storeSlug as string;
  const { isAuthenticated } = useCardapioAuth();
  const { handleErrorWithRedirect } = useApiErrorHandler();
  const { success, error: showError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showInactive, setShowInactive] = useState(false);
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Garantir que categories seja sempre um array válido
  const safeCategories = useMemo(() => {
    if (!categories) return [];
    if (Array.isArray(categories)) return categories;
    if (categories && typeof categories === "object") {
      const catObj = categories as any;
      if (catObj.data && Array.isArray(catObj.data)) return catObj.data;
      if (catObj.categories && Array.isArray(catObj.categories))
        return catObj.categories;
    }
    console.warn("Formato inesperado de categorias:", categories);
    return [];
  }, [categories]);

  // Função para carregar produtos
  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get<PaginatedResponse<Product>>(
        `/stores/${slug}/products?page=${pagination.page}&limit=${
          pagination.limit
        }&active=${!showInactive}${
          selectedCategory ? `&categoryId=${selectedCategory}` : ""
        }${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`
      );

      if (data && data.data && Array.isArray(data.data)) {
        setProducts(data.data);
        setPagination(
          data.pagination || {
            page: 1,
            limit: 10,
            total: data.data.length,
            totalPages: 1,
          }
        );
      } else if (Array.isArray(data)) {
        setProducts(data);
        setPagination({
          page: 1,
          limit: 10,
          total: data.length,
          totalPages: 1,
        });
      } else {
        console.warn("Formato inesperado de produtos:", data);
        setProducts([]);
        setPagination({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        });
      }
    } catch (error: any) {
      console.error("Erro ao carregar produtos:", error);
      handleErrorWithRedirect(error, "Erro ao carregar produtos");
      setProducts([]);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [
    slug,
    pagination.page,
    pagination.limit,
    showInactive,
    selectedCategory,
    searchQuery,
    handleErrorWithRedirect,
  ]);

  // Carregar categorias
  const loadCategories = useCallback(async () => {
    try {
      const data = await apiClient.get<Array<{ id: string; name: string }>>(
        `/stores/${slug}/categories`
      );

      if (Array.isArray(data)) {
        setCategories(data);
        setCategoriesError(null);
      } else if (data && typeof data === "object") {
        const dataObj = data as any;
        if (dataObj.data && Array.isArray(dataObj.data)) {
          setCategories(dataObj.data);
          setCategoriesError(null);
        } else if (dataObj.categories && Array.isArray(dataObj.categories)) {
          setCategories(dataObj.categories);
          setCategoriesError(null);
        } else {
          console.warn("Formato inesperado de categorias:", data);
          setCategories([]);
          setCategoriesError("Formato de dados inesperado");
        }
      } else {
        console.warn("Formato inesperado de categorias:", data);
        setCategories([]);
        setCategoriesError("Formato de dados inesperado");
      }
    } catch (error: any) {
      console.error("Erro ao carregar categorias:", error);
      handleErrorWithRedirect(error, "Erro ao carregar categorias");
      setCategories([]);
      setCategoriesError("Erro ao carregar categorias");
    }
  }, [slug, handleErrorWithRedirect]);

  // Efeito para carregar dados
  useEffect(() => {
    if (isAuthenticated()) {
      loadProducts();
      loadCategories();
    }
  }, [isAuthenticated, loadProducts, loadCategories]);

  // Buscar produtos
  const searchProducts = useCallback(async () => {
    if (searchQuery.trim().length < 2 && searchQuery.trim() !== "") return;

    setIsSearching(true);
    setPagination((prev) => ({ ...prev, page: 1 }));
    await loadProducts();
  }, [searchQuery, loadProducts]);

  // Alternar status do produto
  const toggleProductStatus = async (
    productId: string,
    currentStatus: boolean
  ) => {
    try {
      await apiClient.patch(
        `/products/${productId}/toggle-status?storeSlug=${slug}`,
        {}
      );

      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? { ...product, active: !currentStatus }
            : product
        )
      );

      success(
        "Status Alterado",
        `Produto ${currentStatus ? "desativado" : "ativado"} com sucesso`
      );
    } catch (error: any) {
      console.error("Erro ao alterar status do produto:", error);
      handleErrorWithRedirect(error, "Erro ao alterar status do produto");
    }
  };

  // Excluir produto
  const deleteProduct = async (productId: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      await apiClient.delete(`/products/${productId}?storeSlug=${slug}`);

      setProducts((prev) => prev.filter((product) => product.id !== productId));
      success("Produto Excluído", "Produto excluído com sucesso");

      if (products.length === 1 && pagination.page > 1) {
        setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
        loadProducts();
      }
    } catch (error: any) {
      console.error("Erro ao excluir produto:", error);
      handleErrorWithRedirect(error, "Erro ao excluir produto");
    }
  };

  // Manipulador de mudança de categoria
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Manipulador de mudança de status
  const handleShowInactiveChange = (show: boolean) => {
    setShowInactive(show);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Manipulador de mudança de página
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Limpar filtros
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setShowInactive(false);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Efeito para recarregar produtos quando os filtros mudam
  useEffect(() => {
    if (isAuthenticated()) {
      const timeoutId = setTimeout(() => {
        loadProducts();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [
    pagination.page,
    selectedCategory,
    showInactive,
    isAuthenticated,
    loadProducts,
  ]);

  // Se não estiver autenticado, não renderizar nada
  if (!isAuthenticated()) {
    return null;
  }

  return (
    <ProtectedProductRoute storeSlug={slug}>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
            <p className="text-gray-600">Gerencie os produtos da sua loja</p>
          </div>
          <button
            onClick={() => router.push(`/dashboard/${slug}/produtos/novo`)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Plus size={20} />
            Novo Produto
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <div className="flex flex-col gap-4">
            {/* Barra de busca e botão de filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlass size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar produtos por nome ou descrição..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchProducts()}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={searchProducts}
                  disabled={isSearching}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSearching ? (
                    <ArrowsClockwise className="animate-spin" size={16} />
                  ) : (
                    <MagnifyingGlass size={16} />
                  )}
                  Buscar
                </button>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center gap-2 md:hidden"
                >
                  {showFilters ? (
                    <FunnelSimple size={16} />
                  ) : (
                    <Funnel size={16} />
                  )}
                  Filtros
                </button>
              </div>
            </div>

            {/* Filtros expandíveis (sempre visíveis em desktop, expandíveis em mobile) */}
            <div
              className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${
                showFilters ? "block" : "hidden md:grid"
              }`}
            >
              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Todas as categorias</option>
                  {safeCategories.map(
                    (category: { id: string; name: string }) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    )
                  )}
                </select>
                {categoriesError && (
                  <p className="text-xs text-red-500 mt-1">{categoriesError}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={showInactive ? "inactive" : "active"}
                  onChange={(e) =>
                    handleShowInactiveChange(e.target.value === "inactive")
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                </select>
              </div>

              {/* Limpar filtros */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <ArrowsClockwise size={16} />
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Produtos */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedCategory || showInactive
                ? "Tente ajustar os filtros de busca"
                : "Comece adicionando seu primeiro produto"}
            </p>
            {!searchQuery && !selectedCategory && !showInactive && (
              <button
                onClick={() => router.push(`/dashboard/${slug}/produtos/novo`)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
              >
                Adicionar Primeiro Produto
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Categoria
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preço
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Estoque
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.image && (
                            <img
                              className="h-10 w-10 rounded-full object-cover mr-3"
                              src={product.image}
                              alt={product.name}
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            {product.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                        {product.category?.name || "Sem categoria"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {product.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        <div className="flex items-center space-x-2">
                          <span>{product.inventory?.quantity || 0}</span>
                          {product.inventory?.minStock && (
                            <span className="text-xs text-gray-400">
                              (mín: {product.inventory.minStock})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              toggleProductStatus(product.id, product.active)
                            }
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title={product.active ? "Desativar" : "Ativar"}
                          >
                            {product.active ? (
                              <EyeSlash size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              router.push(
                                `/dashboard/${slug}/produtos/${product.id}/editar`
                              )
                            }
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Excluir"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Paginação */}
        {!isLoading && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <nav className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        pagination.page === pageNum
                          ? "bg-purple-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </nav>
          </div>
        )}
      </div>
    </ProtectedProductRoute>
  );
}
