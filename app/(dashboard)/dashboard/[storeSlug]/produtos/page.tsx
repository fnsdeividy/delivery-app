"use client";

import { ProtectedProductRoute } from "@/components/ProtectedProductRoute";
import { useToast } from "@/components/Toast";
import { DataCardList } from "@/components/ui/DataCardList";
import { DataTable } from "@/components/ui/DataTable";
import { FilterPanel } from "@/components/ui/FilterPanel";
import { SearchBar } from "@/components/ui/SearchBar";
import { useApiErrorHandler, useCardapioAuth } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { EyeSlash, Pencil, Plus, Trash } from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number | string;
  image?: string | null;
  active: boolean;
  category?: {
    id: string;
    name: string;
  } | null;
  inventory?: {
    quantity: number;
    minStock?: number | null;
  } | null;
  _count?: {
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

type CategoryDTO =
  | Array<{ id: string; name: string }>
  | {
      data?: Array<{ id: string; name: string }>;
      categories?: Array<{ id: string; name: string }>;
    };

export default function ProdutosPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.storeSlug as string;

  const { isAuthenticated } = useCardapioAuth();
  const { handleErrorWithRedirect } = useApiErrorHandler();
  const { success } = useToast();

  /** guards */
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /** ui states */
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  /** data states */
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  /** filters */
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showInactive, setShowInactive] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  /** categories */
  const [categories, setCategories] = useState<CategoryDTO>([]);
  const safeCategories = useMemo(() => {
    if (!categories) return [];
    if (Array.isArray(categories)) return categories;
    if (typeof categories === "object" && categories !== null) {
      const maybe = categories as any;
      if (maybe.data && Array.isArray(maybe.data)) return maybe.data;
      if (maybe.categories && Array.isArray(maybe.categories))
        return maybe.categories;
    }
    console.warn("Formato inesperado de categorias:", categories);
    return [];
  }, [categories]);

  /** query params memo (evita reconstrução de strings em cada render) */
  const baseQuery = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(pagination.page));
    p.set("limit", String(pagination.limit));
    p.set("active", String(!showInactive));
    if (selectedCategory) p.set("categoryId", selectedCategory);
    return p;
  }, [pagination.page, pagination.limit, selectedCategory, showInactive]);

  /** Busca de categorias */
  useEffect(() => {
    if (!isAuthenticated()) return;
    let abort = false;

    (async () => {
      try {
        const data = await apiClient.get<CategoryDTO>(
          `/stores/${slug}/categories`
        );
        if (abort || !mountedRef.current) return;
        if (data) setCategories(data);
      } catch (err) {
        console.error("Erro ao carregar categorias:", err);
        // Mantém silencioso; filtro continua funcionando mesmo sem categorias
      }
    })();

    return () => {
      abort = true;
    };
  }, [slug, isAuthenticated]);

  /** Função interna para aplicar dados recebidos no estado */
  const applyProductResponse = useCallback(
    (resp: PaginatedResponse<Product>) => {
      setProducts(resp.data ?? []);
      setPagination((prev) => ({
        ...prev,
        total: resp.pagination?.total ?? 0,
        totalPages: resp.pagination?.totalPages ?? 0,
      }));
    },
    []
  );

  /** Carregar produtos (lista padrão) */
  const loadProducts = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      try {
        const endpoint = `/stores/${slug}/products?${baseQuery.toString()}`;
        const data = await apiClient.get<PaginatedResponse<Product>>(endpoint, {
          signal,
        } as any);
        if (!mountedRef.current || signal?.aborted) return;
        if (data?.data) applyProductResponse(data);
      } catch (error: any) {
        if (error?.name === "AbortError") return;
        console.error("Erro ao carregar produtos:", error);
        handleErrorWithRedirect(error, "Erro ao carregar produtos");
      } finally {
        if (mountedRef.current) setIsLoading(false);
      }
    },
    [slug, baseQuery, applyProductResponse, handleErrorWithRedirect]
  );

  /** Buscar produtos (search) */
  const searchProducts = useCallback(
    async (signal?: AbortSignal) => {
      if (!searchQuery.trim()) {
        return loadProducts(signal);
      }
      setIsSearching(true);
      try {
        const p = new URLSearchParams(baseQuery.toString());
        p.set("q", searchQuery.trim());
        const endpoint = `/stores/${slug}/products/search?${p.toString()}`;
        const data = await apiClient.get<PaginatedResponse<Product>>(endpoint, {
          signal,
        } as any);
        if (!mountedRef.current || signal?.aborted) return;
        if (data?.data) applyProductResponse(data);
      } catch (error: any) {
        if (error?.name === "AbortError") return;
        console.error("Erro na busca de produtos:", error);
        handleErrorWithRedirect(error, "Erro na busca de produtos");
      } finally {
        if (mountedRef.current) setIsSearching(false);
      }
    },
    [
      slug,
      searchQuery,
      baseQuery,
      applyProductResponse,
      handleErrorWithRedirect,
      loadProducts,
    ]
  );

  /** Carregamento inicial */
  useEffect(() => {
    if (!isAuthenticated()) return;
    const controller = new AbortController();
    loadProducts(controller.signal);
    return () => controller.abort();
  }, [isAuthenticated, loadProducts]);

  /** Recarregar ao alterar filtros (exceto searchQuery, que tem debounce próprio) */
  useEffect(() => {
    if (!isAuthenticated()) return;
    const controller = new AbortController();
    // quando filtros mudam, incluindo paginação, recarrega modo atual (busca ou lista)
    const runner = searchQuery.trim() ? searchProducts : loadProducts;
    runner(controller.signal);
    return () => controller.abort();
  }, [
    isAuthenticated,
    selectedCategory,
    showInactive,
    pagination.page,
    pagination.limit,
    searchQuery,
    loadProducts,
    searchProducts,
  ]);

  /** Debounce para searchQuery + reset da página para 1 ao digitar */
  useEffect(() => {
    if (!isAuthenticated()) return;
    const controller = new AbortController();

    // ao mudar o texto de busca, volta para a página 1
    setPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));

    const t = setTimeout(
      () => {
        searchProducts(controller.signal);
      },
      searchQuery.trim() ? 350 : 0
    );

    return () => {
      controller.abort();
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  /** Alternar status do produto */
  const toggleProductStatus = async (
    productId: string,
    currentStatus: boolean
  ) => {
    try {
      await apiClient.patch(
        `/products/${productId}/toggle-status?storeSlug=${slug}`,
        {}
      );
      if (!mountedRef.current) return;

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, active: !currentStatus } : p
        )
      );

      success(
        "Status alterado",
        `Produto ${currentStatus ? "desativado" : "ativado"} com sucesso`
      );
    } catch (error: any) {
      console.error("Erro ao alterar status do produto:", error);
      handleErrorWithRedirect(error, "Erro ao alterar status do produto");
    }
  };

  /** Excluir produto */
  const deleteProduct = async (productId: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      await apiClient.delete(`/products/${productId}?storeSlug=${slug}`);
      if (!mountedRef.current) return;

      const removedLastOfPage = products.length === 1 && pagination.page > 1;

      startTransition(() => {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        if (removedLastOfPage) {
          setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
        } else {
          // revalida a listagem da página atual
          loadProducts();
        }
      });

      success("Produto excluído", "Produto excluído com sucesso");
    } catch (error: any) {
      console.error("Erro ao excluir produto:", error);
      handleErrorWithRedirect(error, "Erro ao excluir produto");
    }
  };

  /** Handlers de filtro/paginação */
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleShowInactiveChange = (show: boolean) => {
    setShowInactive(show);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setShowInactive(false);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  /** Formatter de preço */
  const formatPrice = (price: any): string => {
    if (price === null || price === undefined) return "0,00";
    const toNum = (v: any) => {
      if (typeof v === "number") return v;
      if (typeof v === "string") return parseFloat(v);
      if (v && typeof v === "object" && "toString" in v)
        return parseFloat(v.toString());
      return NaN;
    };
    const n = toNum(price);
    return isNaN(n) ? "0,00" : n.toFixed(2);
  };

  if (!isAuthenticated()) return null;

  return (
    <ProtectedProductRoute storeSlug={slug}>
      <div className="space-y-3 sm:space-y-4 md:space-y-6 p-2 sm:p-3 md:p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 md:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
              Produtos
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 truncate">
              Gerencie os produtos da sua loja
            </p>
          </div>
          <button
            onClick={() => router.push(`/dashboard/${slug}/produtos/novo`)}
            className="bg-purple-600 text-white px-3 md:px-4 py-2 md:py-2.5 rounded-lg hover:bg-purple-700 flex items-center gap-2 w-full sm:w-auto justify-center text-sm md:text-base transition-colors duration-200"
          >
            <Plus size={16} className="md:w-5 md:h-5 flex-shrink-0" />
            <span className="truncate">Novo Produto</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-2 sm:p-3 md:p-4 lg:p-6">
          <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
            {/* Barra de busca - sempre visível */}
            <div className="w-full">
              <SearchBar
                placeholder="Buscar produtos por nome ou descrição..."
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={() => searchProducts()}
                isLoading={isSearching}
                className="w-full"
              />
            </div>

            {/* Filtros com toggle para mobile */}
            <FilterPanel
              categories={safeCategories.map(
                (c: { id: string; name: string }) => ({
                  value: c.id,
                  label: c.name,
                })
              )}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              showInactive={showInactive}
              onShowInactiveChange={handleShowInactiveChange}
              onClearFilters={clearFilters}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters((s) => !s)}
              isMobile={true}
            />
          </div>
        </div>

        {/* Lista de Produtos */}
        <div className="space-y-3 sm:space-y-4">
          {/* Desktop - oculto em mobile */}
          <div className="hidden lg:block">
            <DataTable
              data={products}
              columns={[
                {
                  key: "product",
                  header: "Produto",
                  render: (product: Product) => (
                    <div className="flex items-center min-w-0">
                      {!!product.image && (
                        <img
                          className="h-10 w-10 rounded-lg object-cover mr-3 flex-shrink-0"
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </div>
                        {product.description && (
                          <div className="text-sm text-gray-500 truncate">
                            {product.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "category",
                  header: "Categoria",
                  render: (product: Product) => (
                    <div className="text-sm text-gray-500 truncate max-w-32">
                      {product.category?.name ?? "Sem categoria"}
                    </div>
                  ),
                },
                {
                  key: "price",
                  header: "Preço",
                  render: (product: Product) => (
                    <div className="text-sm font-medium text-gray-900 text-right">
                      R$ {formatPrice(product.price)}
                    </div>
                  ),
                },
                {
                  key: "inventory",
                  header: "Estoque",
                  render: (product: Product) => (
                    <div className="text-sm text-gray-900 text-right">
                      {product.inventory?.quantity ?? 0}
                      {product.inventory?.minStock ? (
                        <span className="text-xs text-gray-400 ml-1">
                          (mín: {product.inventory.minStock})
                        </span>
                      ) : null}
                    </div>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (product: Product) => (
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.active ? "Ativo" : "Inativo"}
                    </span>
                  ),
                },
              ]}
              actions={[
                {
                  key: "toggleStatus",
                  label: "Alternar Status",
                  onClick: (product: Product) =>
                    toggleProductStatus(product.id, product.active),
                  icon: <EyeSlash size={16} />,
                  className:
                    "text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50",
                  title: (product: Product) =>
                    product.active ? "Desativar" : "Ativar",
                },
                {
                  key: "edit",
                  label: "Editar",
                  onClick: (product: Product) =>
                    router.push(
                      `/dashboard/${slug}/produtos/${product.id}/editar`
                    ),
                  icon: <Pencil size={16} />,
                  className:
                    "text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50",
                  title: () => "Editar",
                },
                {
                  key: "delete",
                  label: "Excluir",
                  onClick: (product: Product) => deleteProduct(product.id),
                  icon: <Trash size={16} />,
                  className:
                    "text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50",
                  title: () => "Excluir",
                },
              ]}
              emptyMessage={
                searchQuery || selectedCategory || showInactive
                  ? "Tente ajustar os filtros de busca"
                  : "Nenhum produto cadastrado"
              }
              emptyMessageSubtitle={
                !searchQuery && !selectedCategory && !showInactive
                  ? "Comece adicionando seu primeiro produto"
                  : undefined
              }
              isLoading={isLoading}
            />
          </div>

          {/* Tablet - visível apenas em tablets */}
          <div className="hidden md:block lg:hidden">
            <DataTable
              data={products}
              columns={[
                {
                  key: "product",
                  header: "Produto",
                  render: (product: Product) => (
                    <div className="flex items-center min-w-0">
                      {!!product.image && (
                        <img
                          className="h-8 w-8 rounded-lg object-cover mr-2 flex-shrink-0"
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </div>
                        {product.description && (
                          <div className="text-xs text-gray-500 truncate">
                            {product.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "category",
                  header: "Categoria",
                  render: (product: Product) => (
                    <div className="text-xs text-gray-500 truncate max-w-24">
                      {product.category?.name ?? "Sem categoria"}
                    </div>
                  ),
                },
                {
                  key: "price",
                  header: "Preço",
                  render: (product: Product) => (
                    <div className="text-sm font-medium text-gray-900 text-right">
                      R$ {formatPrice(product.price)}
                    </div>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (product: Product) => (
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.active ? "A" : "I"}
                    </span>
                  ),
                },
              ]}
              actions={[
                {
                  key: "toggleStatus",
                  label: "Alternar Status",
                  onClick: (product: Product) =>
                    toggleProductStatus(product.id, product.active),
                  icon: <EyeSlash size={14} />,
                  className:
                    "text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50",
                  title: (product: Product) =>
                    product.active ? "Desativar" : "Ativar",
                },
                {
                  key: "edit",
                  label: "Editar",
                  onClick: (product: Product) =>
                    router.push(
                      `/dashboard/${slug}/produtos/${product.id}/editar`
                    ),
                  icon: <Pencil size={14} />,
                  className:
                    "text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50",
                  title: () => "Editar",
                },
                {
                  key: "delete",
                  label: "Excluir",
                  onClick: (product: Product) => deleteProduct(product.id),
                  icon: <Trash size={14} />,
                  className:
                    "text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50",
                  title: () => "Excluir",
                },
              ]}
              emptyMessage={
                searchQuery || selectedCategory || showInactive
                  ? "Tente ajustar os filtros de busca"
                  : "Nenhum produto cadastrado"
              }
              emptyMessageSubtitle={
                !searchQuery && !selectedCategory && !showInactive
                  ? "Comece adicionando seu primeiro produto"
                  : undefined
              }
              isLoading={isLoading}
            />
          </div>

          {/* Mobile - visível apenas em mobile */}
          <DataCardList
            data={products}
            cardRenderer={{
              key: "product",
              render: (product: Product) => (
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 min-w-0 flex-1">
                      {!!product.image && (
                        <img
                          className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ml-2 ${
                        product.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div>
                      <span className="font-medium text-gray-700">
                        Categoria:
                      </span>
                      <span className="ml-1 truncate block">
                        {product.category?.name ?? "Sem categoria"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-700">Preço:</span>
                      <span className="ml-1 font-semibold text-gray-900">
                        R$ {formatPrice(product.price)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Estoque:{" "}
                      <span className="font-medium text-gray-700">
                        {product.inventory?.quantity ?? 0}
                      </span>
                      {product.inventory?.minStock ? (
                        <span className="text-gray-400 ml-1">
                          (mín: {product.inventory.minStock})
                        </span>
                      ) : null}
                    </span>
                  </div>
                </div>
              ),
            }}
            actions={[
              {
                key: "toggleStatus",
                label: "Alternar Status",
                onClick: (product: Product) =>
                  toggleProductStatus(product.id, product.active),
                icon: <EyeSlash size={16} />,
                className:
                  "text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50",
                title: (product: Product) =>
                  product.active ? "Desativar" : "Ativar",
              },
              {
                key: "edit",
                label: "Editar",
                onClick: (product: Product) =>
                  router.push(
                    `/dashboard/${slug}/produtos/${product.id}/editar`
                  ),
                icon: <Pencil size={16} />,
                className:
                  "text-green-600 hover:text-green-900 p-2 rounded hover:bg-green-50",
                title: () => "Editar",
              },
              {
                key: "delete",
                label: "Excluir",
                onClick: (product: Product) => deleteProduct(product.id),
                icon: <Trash size={16} />,
                className:
                  "text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50",
                title: () => "Excluir",
              },
            ]}
            emptyMessage={
              searchQuery || selectedCategory || showInactive
                ? "Tente ajustar os filtros de busca"
                : "Nenhum produto cadastrado"
            }
            emptyMessageSubtitle={
              !searchQuery && !selectedCategory && !showInactive
                ? "Comece adicionando seu primeiro produto"
                : undefined
            }
            isLoading={isLoading}
          />
        </div>

        {/* Paginação */}
        {!isLoading && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-4 md:mt-6">
            <nav className="flex flex-wrap justify-center gap-1 md:gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 transition-colors duration-200"
              >
                Anterior
              </button>

              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  let pageNum: number;
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
                      className={`px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium border transition-colors duration-200 ${
                        pagination.page === pageNum
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
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
                className="px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 transition-colors duration-200"
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
