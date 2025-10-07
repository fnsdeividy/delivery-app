"use client";

import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useToast } from "@/hooks/useToast";
import { apiClient } from "@/lib/api-client";
import {
  ProductAddonDto,
  ProductIngredientDto,
  UpdateProductDto,
} from "@/types/cardapio-api";
import {
  BaseOptions,
  ProductFormData,
  UIAddon,
  UIIngredient,
} from "@/types/product-form";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface UseProductSubmitProps {
  slug: string;
  productId: string;
  formData: ProductFormData;
  ingredients: UIIngredient[];
  addons: UIAddon[];
  tags: string[];
  baseOptions: BaseOptions;
  price: number;
  originalPrice: number | undefined;
  initialStock: number;
  minStock: number;
}

export function useProductSubmit({
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
}: UseProductSubmitProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const { formatBRL } = useCurrencyFormatter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // Validações básicas
    if (!formData.name.trim() || !formData.categoryId) {
      showToast("Nome e categoria são obrigatórios", "error");
      return;
    }

    if (price <= 0) {
      showToast("Preço deve ser maior que zero", "error");
      return;
    }

    // Validação de adicionais com preços inválidos
    const invalidAddons = addons.filter((addon) => {
      return addon.name.trim() && addon.price < 0;
    });

    if (invalidAddons.length > 0) {
      showToast("Alguns adicionais têm preços inválidos", "error");
      return;
    }

    // Monta arrays finais
    const normalizedAddons: ProductAddonDto[] = addons
      .map((a) => ({
        name: a.name.trim(),
        price: a.price,
        active: true,
      }))
      .filter((a) => a.name);

    const selectedIngredients = ingredients.filter((i) => i.selected);
    const finalIngredients: ProductIngredientDto[] = selectedIngredients.map(
      (i) => ({
        name: i.name,
        removable: true,
        included: true,
      })
    );

    // Tags auxiliares com base nas opções selecionadas
    const optionTags: string[] = [];
    if (baseOptions.breadType) optionTags.push(`Pão: ${baseOptions.breadType}`);
    if (baseOptions.doneness) optionTags.push(`Ponto: ${baseOptions.doneness}`);
    if (baseOptions.doughType)
      optionTags.push(`Massa: ${baseOptions.doughType}`);
    if (baseOptions.pizzaSize)
      optionTags.push(`Tamanho: ${baseOptions.pizzaSize}`);
    if (baseOptions.beverageSize)
      optionTags.push(`Volume: ${baseOptions.beverageSize}`);

    // Combinar tags existentes com tags de opções
    const allTags = [
      ...tags.filter((tag) => !tag.includes(":")),
      ...optionTags,
    ];

    setIsLoading(true);
    try {
      const dataToSend: UpdateProductDto & { storeSlug: string } = {
        storeSlug: slug,
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        price: price || 0,
        description: formData.description || "",
        image: formData.image || undefined,
        originalPrice: originalPrice,
        active: formData.active,
        ingredients: finalIngredients,
        addons: normalizedAddons,
        tags: allTags,
        initialStock: initialStock >= 0 ? initialStock : 0,
        minStock: minStock >= 0 ? minStock : 0,
        ...(formData.preparationTime > 0 && {
          preparationTime: formData.preparationTime,
        }),
      };

      await apiClient.updateProduct(productId, dataToSend);
      showToast("Produto atualizado com sucesso!", "success");
      setTimeout(() => {
        router.push(`/dashboard/${slug}/produtos`);
      }, 1000);
    } catch (error: any) {
      console.error("❌ Erro ao atualizar produto:", error);
      const apiErrorMessage = error.response?.data?.message;
      const detailedMessage = Array.isArray(apiErrorMessage)
        ? apiErrorMessage.join(", ")
        : apiErrorMessage;
      const errorMessage =
        detailedMessage ||
        error.message ||
        "Erro desconhecido ao atualizar produto";
      showToast(`Erro ao atualizar produto: ${errorMessage}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSubmit,
  };
}
