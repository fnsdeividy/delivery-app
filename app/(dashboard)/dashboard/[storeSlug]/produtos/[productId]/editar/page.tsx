"use client";

import { ProtectedProductRoute } from "@/components/ProtectedProductRoute";
import { ProductAddonsSection } from "@/components/products/ProductAddonsSection";
import { ProductBasicInfo } from "@/components/products/ProductBasicInfo";
import { ProductCategoryOptions } from "@/components/products/ProductCategoryOptions";
import { ProductIngredientsSection } from "@/components/products/ProductIngredientsSection";
import { ProductPricingSection } from "@/components/products/ProductPricingSection";
import { ProductStockSection } from "@/components/products/ProductStockSection";
import { ProductTagsSection } from "@/components/products/ProductTagsSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductForm } from "@/hooks/useProductForm";
import { useProductSubmit } from "@/hooks/useProductSubmit";
import { ProductFormData } from "@/types/product-form";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function EditarProdutoPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.storeSlug as string;
  const productId = params.productId as string;

  const {
    isLoading: isLoadingForm,
    isLoadingProduct,
    categories,
    product,
    formData,
    baseOptions,
    ingredients,
    newIngredient,
    addons,
    tags,
    newTag,
    price,
    originalPrice,
    initialStock,
    minStock,
    isFormValid,
    setFormData,
    setNewIngredient,
    setNewTag,
    addCustomIngredient,
    toggleIngredient,
    removeIngredient,
    addAddonRow,
    updateAddon,
    removeAddon,
    clearAllAddons,
    addTag,
    removeTag,
    setBase,
  } = useProductForm({ slug, productId });

  const { isLoading: isSubmitting, handleSubmit } = useProductSubmit({
    slug,
    productId,
    formData,
    ingredients,
    addons,
    tags,
    baseOptions,
    price,
    originalPrice,
    initialStock,
    minStock,
  });

  const isLoading = isLoadingForm || isSubmitting;

  const updateFormData = (updates: Partial<ProductFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  if (isLoadingProduct) {
    return (
      <ProtectedProductRoute storeSlug={slug} requiredAction="write">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando produto...</p>
            </div>
          </div>
        </div>
      </ProtectedProductRoute>
    );
  }

  if (!product) {
    return (
      <ProtectedProductRoute storeSlug={slug} requiredAction="write">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-6">
            <h3 className="text-sm font-medium text-red-800">
              Produto não encontrado
            </h3>
            <p className="mt-2 text-sm text-red-700">
              O produto que você está tentando editar não foi encontrado.
            </p>
            <button
              onClick={() => router.push(`/dashboard/${slug}/produtos`)}
              className="mt-4 bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
            >
              Voltar para Produtos
            </button>
          </div>
        </div>
      </ProtectedProductRoute>
    );
  }

  return (
    <ProtectedProductRoute storeSlug={slug} requiredAction="write">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/${slug}/produtos`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Editar Produto: {product.name}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Básicas */}
              <ProductBasicInfo
                formData={{
                  name: formData.name,
                  categoryId: formData.categoryId,
                  price: price,
                  originalPrice: originalPrice ?? 0,
                  description: formData.description,
                  image: formData.image,
                }}
                categories={categories}
                storeSlug={slug}
                onFormDataChange={(updates) => {
                  if (typeof updates.name === "string")
                    updateFormData({ name: updates.name });
                  if (typeof updates.categoryId === "string")
                    updateFormData({ categoryId: updates.categoryId });
                  if (typeof updates.description === "string")
                    updateFormData({ description: updates.description });
                  if (typeof updates.image === "string")
                    updateFormData({ image: updates.image });
                }}
              />

              {/* Campos de Preço */}
              <ProductPricingSection
                formData={formData}
                onFormDataChange={updateFormData}
                price={price}
                originalPrice={originalPrice}
              />

              {/* URL da Imagem */}
              <div className="space-y-2 mt-6">
                <label htmlFor="image" className="text-sm font-medium">
                  URL da Imagem
                </label>
                <input
                  id="image"
                  type="text"
                  inputMode="url"
                  pattern="https?://.*"
                  value={formData.image ?? ""}
                  onChange={(e) =>
                    updateFormData({
                      image: e.target.value || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
                <p className="text-xs text-gray-500">
                  Aceita apenas URLs iniciando com http:// ou https://
                </p>
              </div>

              {/* Opções por Categoria */}
              <ProductCategoryOptions
                categoryId={formData.categoryId}
                categories={categories}
                baseOptions={baseOptions}
                onBaseOptionsChange={setBase}
              />

              {/* Ingredientes */}
              <ProductIngredientsSection
                ingredients={ingredients}
                newIngredient={newIngredient}
                onNewIngredientChange={setNewIngredient}
                onAddCustomIngredient={addCustomIngredient}
                onToggleIngredient={toggleIngredient}
                onRemoveIngredient={removeIngredient}
              />

              {/* Adicionais */}
              <ProductAddonsSection
                addons={addons}
                onAddAddonRow={addAddonRow}
                onUpdateAddon={updateAddon}
                onRemoveAddon={removeAddon}
                onClearAllAddons={clearAllAddons}
              />

              {/* Controle de Estoque */}
              <ProductStockSection
                formData={formData}
                onFormDataChange={updateFormData}
              />

              {/* Tags */}
              <ProductTagsSection
                tags={tags}
                newTag={newTag}
                onNewTagChange={setNewTag}
                onAddTag={addTag}
                onRemoveTag={removeTag}
              />

              {/* Status Ativo */}
              <div className="flex items-center space-x-2 mt-2">
                <input
                  id="active"
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) =>
                    updateFormData({
                      active: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="text-sm font-medium">
                  Produto ativo
                </label>
              </div>

              {/* Botões */}
              <div className="flex justify-between gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/dashboard/${slug}/produtos`)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  className={`flex items-center gap-2 transition-colors ${
                    isFormValid && !isLoading
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-gray-400 cursor-not-allowed text-gray-200"
                  }`}
                  title={
                    !isFormValid
                      ? "Preencha todos os campos obrigatórios"
                      : "Salvar alterações"
                  }
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedProductRoute>
  );
}
