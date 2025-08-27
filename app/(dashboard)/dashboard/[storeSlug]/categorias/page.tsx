"use client";

import { CategoryDragDrop } from "@/components/CategoryDragDrop";
import LoadingSpinner from "@/components/LoadingSpinner";
import { CategoryModal } from "@/components/ProductModals";
import { useToast } from "@/components/Toast";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { useCardapioAuth } from "@/hooks/useCardapioAuth";
import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/types/cardapio-api";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function CategoriasPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.storeSlug as string;
  const { isAuthenticated, getCurrentToken } = useCardapioAuth();
  const { handleErrorWithRedirect } = useApiErrorHandler();
  const { success, error: showError } = useToast();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  // Hooks para categorias
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useCategories(slug);
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Estados do formulário
  const [categoryFormData, setCategoryFormData] = useState<CreateCategoryDto>({
    name: "",
    description: "",
    storeSlug: slug,
    active: true,
    order: 0,
    image: "",
  });

  // Garantir que categoriesData seja sempre um array válido
  const safeCategoriesData = useMemo(() => {
    if (!categoriesData) return [];
    if (Array.isArray(categoriesData)) return categoriesData;
    if (categoriesData && typeof categoriesData === "object") {
      const catObj = categoriesData as any;
      if (catObj.data && Array.isArray(catObj.data)) return catObj.data;
      if (catObj.categories && Array.isArray(catObj.categories))
        return catObj.categories;
    }
    return [];
  }, [categoriesData]);

  // Filtrar categorias baseado nos filtros
  const filteredCategories = useMemo(() => {
    let filtered = safeCategoriesData;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (category: Category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (category.description &&
            category.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrar por status ativo/inativo
    if (!showInactive) {
      filtered = filtered.filter((category: Category) => category.active);
    }

    // Ordenar por ordem e nome
    return filtered.sort((a: Category, b: Category) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.name.localeCompare(b.name);
    });
  }, [safeCategoriesData, searchTerm, showInactive]);

  // Verificar autenticação
  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  // Tratar erros
  if (categoriesError) {
    handleErrorWithRedirect(categoriesError);
    return null;
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createCategoryMutation.mutateAsync(categoryFormData);
      success("Categoria criada com sucesso!");
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error: any) {
      showError(error.message || "Erro ao criar categoria");
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingCategory) return;

    try {
      const updateData: UpdateCategoryDto = {
        name: categoryFormData.name,
        description: categoryFormData.description,
        active: categoryFormData.active,
        order: categoryFormData.order,
        image: categoryFormData.image,
      };

      await updateCategoryMutation.mutateAsync({
        id: editingCategory.id,
        categoryData: updateData,
      });

      success("Categoria atualizada com sucesso!");
      setEditingCategory(null);
      resetForm();
    } catch (error: any) {
      showError(error.message || "Erro ao atualizar categoria");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

    try {
      await deleteCategoryMutation.mutateAsync({
        id: categoryId,
        storeSlug: slug,
      });
      success("Categoria excluída com sucesso!");
    } catch (error: any) {
      showError(error.message || "Erro ao excluir categoria");
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || "",
      storeSlug: slug,
      active: category.active,
      order: category.order,
      image: category.image || "",
    });
  };

  const resetForm = () => {
    setCategoryFormData({
      name: "",
      description: "",
      storeSlug: slug,
      active: true,
      order: 0,
      image: "",
    });
  };

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setEditingCategory(null);
    resetForm();
  };

  if (isLoadingCategories) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gerenciar Categorias
          </h1>
          <p className="text-gray-600">
            Organize seus produtos em categorias para melhor experiência do
            cliente
          </p>
        </div>

        {/* Controles */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex space-x-4">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                + Nova Categoria
              </button>
            </div>

            <div className="flex space-x-3">
              <input
                type="text"
                placeholder="Buscar categorias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Mostrar inativas
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Lista de Categorias */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
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
                    Ordem
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
                  filteredCategories.map((category: Category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {category.image && (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="h-10 w-10 rounded-lg object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {category.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {category.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {category.description || "Sem descrição"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {category.order}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                            onClick={() => openEditModal(category)}
                            className="text-blue-600 hover:text-blue-900"
                            disabled={updateCategoryMutation.isPending}
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
                      colSpan={5}
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
        </div>

        {/* Reordenar Categorias */}
        <div className="mt-6">
          <CategoryDragDrop
            categories={filteredCategories}
            onCategoriesChange={(updatedCategories) => {
              // Atualizar a lista local se necessário
              console.log("Categorias reordenadas:", updatedCategories);
            }}
          />
        </div>

        {/* Estatísticas */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total de Categorias
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {safeCategoriesData.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Categorias Ativas
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {safeCategoriesData.filter((c: Category) => c.active).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Categorias Inativas
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {safeCategoriesData.filter((c: Category) => !c.active).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modais */}
        <CategoryModal
          isOpen={isCreateModalOpen}
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
    </div>
  );
}
