"use client";

import {
  useCategories,
  useCreateCategory,
  useCreateProduct,
  useDeleteCategory,
  useDeleteProduct,
  useProducts,
  useUpdateCategory,
  useUpdateProduct,
} from "@/hooks";
import {
  Category,
  CreateCategoryDto,
  CreateProductDto,
  Product,
  UpdateCategoryDto,
  UpdateProductDto,
} from "@/types/cardapio-api";
import { useMemo, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { CategoryModal, ProductModal } from "./ProductModals";

interface ProductManagementProps {
  storeSlug: string;
}

export function ProductManagement({ storeSlug }: ProductManagementProps) {
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] =
    useState(false);
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] =
    useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"products" | "categories">(
    "products"
  );

  // Hooks para produtos
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useProducts(storeSlug, currentPage, 10);
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  // Hooks para categorias
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useCategories(storeSlug);
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Estados do formulário de produto
  const [productFormData, setProductFormData] = useState<CreateProductDto>({
    name: "",
    description: "",
    price: 0,
    originalPrice: 0,
    categoryId: "",
    storeSlug: storeSlug,
    image: "",
    active: true,
    ingredients: [],
    addons: [],
    nutritionalInfo: {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sodium: 0,
    },
    tags: [],
    tagColor: "#3B82F6",
  });

  // Estados do formulário de categoria
  const [categoryFormData, setCategoryFormData] = useState<CreateCategoryDto>({
    name: "",
    description: "",
    storeSlug: storeSlug,
    active: true,
    order: 0,
    image: "",
  });

  // Garantir que categoriesData seja sempre um array válido
  const safeCategoriesData = useMemo(() => {
    if (!categoriesData) return [];
    if (Array.isArray(categoriesData)) return categoriesData;
    if (categoriesData.data && Array.isArray(categoriesData.data))
      return categoriesData.data;
    if (categoriesData.categories && Array.isArray(categoriesData.categories))
      return categoriesData.categories;
    console.warn("Formato inesperado de categorias:", categoriesData);
    return [];
  }, [categoriesData]);

  // Garantir que productsData seja sempre um objeto válido
  const safeProductsData = useMemo(() => {
    if (!productsData)
      return {
        data: [],
        pagination: { totalPages: 0, currentPage: 1, totalItems: 0 },
      };
    if (productsData.data && Array.isArray(productsData.data))
      return productsData;
    if (Array.isArray(productsData))
      return {
        data: productsData,
        pagination: {
          totalPages: 1,
          currentPage: 1,
          totalItems: productsData.length,
        },
      };
    console.warn("Formato inesperado de produtos:", productsData);
    return {
      data: [],
      pagination: { totalPages: 0, currentPage: 1, totalItems: 0 },
    };
  }, [productsData]);

  // Filtrar produtos com dados seguros
  const filteredProducts = useMemo(() => {
    return safeProductsData.data.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || product.categoryId === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [safeProductsData.data, searchTerm, selectedCategory]);

  // Filtrar categorias com dados seguros
  const filteredCategories = useMemo(() => {
    return safeCategoriesData.filter(
      (category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [safeCategoriesData, searchTerm]);

  // Tratar erros sem forçar logout/redirect
  const handleApiError = (error: any, operation: string) => {
    console.error(`Erro na operação ${operation}:`, error);

    // Não forçar logout em erros específicos
    if (error?.status === 403) {
      console.warn(
        "Acesso negado (403) - usuário pode não ter permissão para esta operação"
      );
      return;
    }

    if (error?.status === 500) {
      console.warn("Erro interno do servidor (500) - problema temporário");
      return;
    }

    // Para outros erros, apenas logar
    console.warn(
      `Erro ${error?.status || "desconhecido"} na operação ${operation}`
    );
  };

  // Funções de produtos
  const handleCreateProduct = async (productData: CreateProductDto) => {
    try {
      await createProductMutation.mutateAsync(productData);
      setIsCreateProductModalOpen(false);
      setProductFormData({
        name: "",
        description: "",
        price: 0,
        originalPrice: 0,
        categoryId: "",
        storeSlug: storeSlug,
        image: "",
        active: true,
        ingredients: [],
        addons: [],
        nutritionalInfo: {
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          fiber: 0,
          sodium: 0,
        },
        tags: [],
        tagColor: "#3B82F6",
      });
    } catch (error) {
      handleApiError(error, "criar produto");
    }
  };

  const handleUpdateProduct = async (productData: UpdateProductDto) => {
    if (!editingProduct) return;

    try {
      await updateProductMutation.mutateAsync({
        id: editingProduct.id,
        productData,
      });
      setEditingProduct(null);
    } catch (error) {
      handleApiError(error, "atualizar produto");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      await deleteProductMutation.mutateAsync({ id: productId, storeSlug });
    } catch (error) {
      handleApiError(error, "excluir produto");
    }
  };

  // Funções de categorias
  const handleCreateCategory = async (categoryData: CreateCategoryDto) => {
    try {
      await createCategoryMutation.mutateAsync(categoryData);
      setIsCreateCategoryModalOpen(false);
      setCategoryFormData({
        name: "",
        description: "",
        storeSlug: storeSlug,
        active: true,
        order: 0,
        image: "",
      });
    } catch (error) {
      handleApiError(error, "criar categoria");
    }
  };

  const handleUpdateCategory = async (categoryData: UpdateCategoryDto) => {
    if (!editingCategory) return;

    try {
      await updateCategoryMutation.mutateAsync({
        id: editingCategory.id,
        categoryData,
      });
      setEditingCategory(null);
    } catch (error) {
      handleApiError(error, "atualizar categoria");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

    try {
      await deleteCategoryMutation.mutateAsync({ id: categoryId, storeSlug });
    } catch (error) {
      handleApiError(error, "excluir categoria");
    }
  };

  // Funções auxiliares
  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      categoryId: product.categoryId || "",
      storeSlug: product.storeSlug,
      image: product.image || "",
      active: product.active,
      ingredients: product.ingredients || [],
      addons: product.addons || [],
      nutritionalInfo: product.nutritionalInfo || {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
        sodium: 0,
      },
      tags: product.tags || [],
      tagColor: product.tagColor || "#3B82F6",
    });
  };

  const openEditCategoryModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || "",
      storeSlug: category.storeSlug,
      active: category.active,
      order: category.order,
      image: category.image || "",
    });
  };

  const closeModals = () => {
    setIsCreateProductModalOpen(false);
    setIsCreateCategoryModalOpen(false);
    setEditingProduct(null);
    setEditingCategory(null);
  };

  // Estados de loading
  const isLoading = isLoadingProducts || isLoadingCategories;
  const hasError = productsError || categoriesError;

  // Renderizar loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  // Renderizar erro (sem forçar logout)
  if (hasError) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Problema ao carregar dados
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                {productsError && "Erro ao carregar produtos. "}
                {categoriesError && "Erro ao carregar categorias. "}
                Tente recarregar a página ou verificar sua conexão.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gerenciamento de Produtos
          </h1>
          <p className="text-gray-600">
            Gerencie produtos e categorias da sua loja
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setIsCreateCategoryModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Nova Categoria
          </button>
          <button
            onClick={() => setIsCreateProductModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Novo Produto
          </button>
        </div>
      </div>

      {/* Controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex space-x-4">
          <button
            onClick={() => setViewMode("products")}
            className={`px-4 py-2 rounded-md ${
              viewMode === "products"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Produtos ({safeProductsData.data.length})
          </button>
          <button
            onClick={() => setViewMode("categories")}
            className={`px-4 py-2 rounded-md ${
              viewMode === "categories"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Categorias ({safeCategoriesData.length})
          </button>
        </div>

        <div className="flex space-x-3">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {viewMode === "products" && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas as categorias</option>
              {safeCategoriesData.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Lista de Produtos */}
      {viewMode === "products" && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <li key={product.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {product.image && (
                        <img
                          className="h-12 w-12 rounded-lg object-cover mr-4"
                          src={product.image}
                          alt={product.name}
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {product.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          Categoria:{" "}
                          {safeCategoriesData.find(
                            (c) => c.id === product.categoryId
                          )?.name || "Sem categoria"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-semibold text-gray-900">
                        R$ {product.price.toFixed(2)}
                      </span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.active ? "Ativo" : "Inativo"}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditProductModal(product)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={deleteProductMutation.isPending}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-6 py-8 text-center text-gray-500">
                {searchTerm || selectedCategory !== "all"
                  ? "Nenhum produto encontrado com os filtros aplicados"
                  : "Nenhum produto cadastrado ainda"}
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Lista de Categorias */}
      {viewMode === "categories" && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
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
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {category.image && (
                          <img
                            className="h-10 w-10 rounded-full object-cover mr-3"
                            src={category.image}
                            alt={category.name}
                          />
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.description || "Sem descrição"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {category.active ? "Ativa" : "Inativa"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditCategoryModal(category)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={deleteCategoryMutation.isPending}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {searchTerm
                      ? "Nenhuma categoria encontrada com os filtros aplicados"
                      : "Nenhuma categoria cadastrada ainda"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginação para produtos */}
      {viewMode === "products" &&
        safeProductsData.pagination.totalPages > 1 && (
          <div className="flex justify-center">
            <nav className="flex space-x-2">
              {Array.from(
                { length: safeProductsData.pagination.totalPages },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
            </nav>
          </div>
        )}

      {/* Modais */}
      <ProductModal
        isOpen={isCreateProductModalOpen}
        onClose={closeModals}
        onSubmit={handleCreateProduct}
        formData={productFormData}
        setFormData={setProductFormData}
        isEditing={false}
        isLoading={createProductMutation.isPending}
        categories={safeCategoriesData}
      />

      <ProductModal
        isOpen={!!editingProduct}
        onClose={closeModals}
        onSubmit={handleUpdateProduct}
        formData={productFormData}
        setFormData={setProductFormData}
        isEditing={true}
        isLoading={updateProductMutation.isPending}
        categories={safeCategoriesData}
      />

      <CategoryModal
        isOpen={isCreateCategoryModalOpen}
        onClose={closeModals}
        onSubmit={handleCreateCategory}
        formData={categoryFormData}
        setFormData={setCategoryFormData}
        isEditing={false}
        isLoading={createCategoryMutation.isPending}
      />

      <CategoryModal
        isOpen={!!editingCategory}
        onClose={closeModals}
        onSubmit={handleUpdateCategory}
        formData={categoryFormData}
        setFormData={setCategoryFormData}
        isEditing={true}
        isLoading={updateCategoryMutation.isPending}
      />
    </div>
  );
}
