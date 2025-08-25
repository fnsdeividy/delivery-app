"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { ProtectedProductRoute } from "@/components/ProtectedProductRoute";
import { useToast } from "@/components/Toast";
import { useApiErrorHandler, useCardapioAuth } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { Eye, EyeSlash, Pencil, Plus, Trash } from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
  const { isAuthenticated, getCurrentToken } = useCardapioAuth();
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

  useEffect(() => {
    // Carregar dados assim que a página for autorizada
    loadProducts();
    loadCategories();
  }, [slug]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get<PaginatedResponse<Product>>(
        `/stores/${slug}/products?page=${pagination.page}&limit=${
          pagination.limit
        }&active=${!showInactive}${
          selectedCategory ? `&categoryId=${selectedCategory}` : ""
        }`
      );

      // Garantir que data seja um objeto válido
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

      // Tratar erros sem forçar logout/redirect indevido
      if (error?.status === 403) {
        showError(
          "Acesso Negado",
          "Você não tem permissão para acessar esta loja"
        );
        setProducts([]);
      } else if (error?.status === 401) {
        showError("Sessão Expirada", "Faça login novamente para continuar");
        // Não forçar redirect automático
      } else if (error?.status === 500) {
        showError("Erro do Servidor", "Problema temporário. Tente novamente.");
        setProducts([]);
      } else {
        showError("Erro", "Não foi possível carregar os produtos");
        setProducts([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await apiClient.get<Array<{ id: string; name: string }>>(
        `/stores/${slug}/categories`
      );

      // Garantir que data seja um array válido
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

      // Tratar erros sem forçar logout/redirect indevido
      if (error?.status === 403) {
        showError(
          "Acesso Negado",
          "Você não tem permissão para acessar categorias desta loja"
        );
        setCategories([]);
        setCategoriesError("Acesso negado");
      } else if (error?.status === 401) {
        showError("Sessão Expirada", "Faça login novamente para continuar");
        // Não forçar redirect automático
      } else if (error?.status === 500) {
        showError(
          "Erro do Servidor",
          "Problema temporário ao carregar categorias."
        );
        setCategories([]);
        setCategoriesError("Erro do servidor");
      } else {
        showError("Erro", "Não foi possível carregar as categorias");
        setCategories([]);
        setCategoriesError("Erro desconhecido");
      }
    }
  };

  const searchProducts = async () => {
    if (searchQuery.trim().length < 2) return;

    try {
      const data = await apiClient.get<Product[]>(
        `/stores/${slug}/products/search?q=${encodeURIComponent(
          searchQuery.trim()
        )}${selectedCategory ? `&categoryId=${selectedCategory}` : ""}`
      );

      // Garantir que data seja um array válido
      if (Array.isArray(data)) {
        setProducts(data);
        setPagination((prev) => ({
          ...prev,
          total: data.length,
          totalPages: 1,
        }));
      } else if (data && typeof data === "object") {
        const dataObj = data as any;
        if (dataObj.data && Array.isArray(dataObj.data)) {
          setProducts(dataObj.data);
          setPagination((prev) => ({
            ...prev,
            total: dataObj.data.length,
            totalPages: 1,
          }));
        } else {
          console.warn("Formato inesperado de busca:", data);
          setProducts([]);
          setPagination((prev) => ({ ...prev, total: 0, totalPages: 1 }));
        }
      } else {
        console.warn("Formato inesperado de busca:", data);
        setProducts([]);
        setPagination((prev) => ({ ...prev, total: 0, totalPages: 1 }));
      }
    } catch (error: any) {
      console.error("Erro ao buscar produtos:", error);

      // Tratar erros sem forçar logout/redirect indevido
      if (error?.status === 403) {
        showError(
          "Acesso Negado",
          "Você não tem permissão para buscar produtos nesta loja"
        );
        setProducts([]);
      } else if (error?.status === 401) {
        showError("Sessão Expirada", "Faça login novamente para continuar");
        // Não forçar redirect automático
      } else if (error?.status === 500) {
        showError("Erro do Servidor", "Problema temporário na busca.");
        setProducts([]);
      } else {
        showError("Erro", "Não foi possível buscar produtos");
        setProducts([]);
      }
    }
  };

  const toggleProductStatus = async (
    productId: string,
    currentStatus: boolean
  ) => {
    try {
      await apiClient.patch(
        `/products/${productId}/toggle-status?storeSlug=${slug}`,
        {}
      );

      // Atualizar estado local
      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? { ...product, active: !currentStatus }
            : product
        )
      );

      // Mostrar toast de sucesso
      success(
        "Status Alterado",
        `Produto ${currentStatus ? "desativado" : "ativado"} com sucesso`
      );
    } catch (error: any) {
      console.error("Erro ao alterar status do produto:", error);

      // Tratar erros sem forçar logout/redirect indevido
      if (error?.status === 403) {
        showError(
          "Acesso Negado",
          "Você não tem permissão para alterar produtos nesta loja"
        );
      } else if (error?.status === 401) {
        showError("Sessão Expirada", "Faça login novamente para continuar");
        // Não forçar redirect automático
      } else if (error?.status === 500) {
        showError("Erro do Servidor", "Problema temporário. Tente novamente.");
      } else {
        showError("Erro", "Não foi possível alterar o status do produto");
      }
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      await apiClient.delete(`/products/${productId}?storeSlug=${slug}`);

      // Atualizar estado local
      setProducts((prev) => prev.filter((product) => product.id !== productId));

      // Mostrar toast de sucesso
      success("Produto Excluído", "Produto excluído com sucesso");

      // Recarregar produtos se necessário
      if (products.length === 1 && pagination.page > 1) {
        setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
        loadProducts();
      }
    } catch (error: any) {
      console.error("Erro ao excluir produto:", error);

      // Tratar erros sem forçar logout/redirect indevido
      if (error?.status === 403) {
        showError(
          "Acesso Negado",
          "Você não tem permissão para excluir produtos nesta loja"
        );
      } else if (error?.status === 401) {
        showError("Sessão Expirada", "Faça login novamente para continuar");
        // Não forçar redirect automático
      } else if (error?.status === 500) {
        showError("Erro do Servidor", "Problema temporário. Tente novamente.");
      } else {
        showError("Erro", "Não foi possível excluir o produto");
      }
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPagination((prev) => ({ ...prev, page: 1 }));
    // Recarregar produtos com nova categoria
    setTimeout(() => loadProducts(), 100);
  };

  const handleShowInactiveChange = (show: boolean) => {
    setShowInactive(show);
    setPagination((prev) => ({ ...prev, page: 1 }));
    // Recarregar produtos com novo status
    setTimeout(() => loadProducts(), 100);
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    // Recarregar produtos com nova página
    setTimeout(() => loadProducts(), 100);
  };

  // Se não estiver autenticado, não renderizar nada
  if (!isAuthenticated) {
    return null;
  }

  return (
    <ProtectedProductRoute storeSlug={slug}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
            <p className="text-gray-600">Gerencie os produtos da sua loja</p>
          </div>
          <button
            onClick={() => router.push(`/dashboard/${slug}/produtos/novo`)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Produto
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar Produtos
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nome ou descrição..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={searchProducts}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Buscar
                </button>
              </div>
            </div>

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
                <option value="">Todas</option>
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
                value={showInactive ? "false" : "true"}
                onChange={(e) =>
                  handleShowInactiveChange(e.target.value === "false")
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="true">Ativos</option>
                <option value="false">Inativos</option>
              </select>
            </div>

            {/* Limpar filtros */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                  setShowInactive(false);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Produtos */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estoque
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
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
                              <div className="text-sm text-gray-500">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category?.name || "Sem categoria"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <span>{product.inventory?.quantity || 0}</span>
                          {product.inventory?.minStock && (
                            <span className="text-xs text-gray-400">
                              (mín: {product.inventory.minStock})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              toggleProductStatus(product.id, product.active)
                            }
                            className="text-blue-600 hover:text-blue-900"
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
                            className="text-green-600 hover:text-green-900"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
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
          <div className="flex justify-center">
            <nav className="flex space-x-2">
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pagination.page === page
                      ? "bg-purple-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </ProtectedProductRoute>
  );
}
