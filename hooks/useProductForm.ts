"use client";

import { useState, useEffect, useMemo } from "react";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useToast } from "@/hooks/useToast";
import { apiClient } from "@/lib/api-client";
import { ProductFormData, Category, UIIngredient, UIAddon, BaseOptions } from "@/types/product-form";
import { Product, ProductAddonDto, ProductIngredientDto } from "@/types/cardapio-api";
import { parseDecimal, sanitizeInteger, formatBRL } from "@/lib/utils/product-form-utils";

interface UseProductFormProps {
  slug: string;
  productId: string;
}

export function useProductForm({ slug, productId }: UseProductFormProps) {
  const { parseAndFormatBRL, formatBRL } = useCurrencyFormatter();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    storeSlug: slug,
    name: "",
    categoryId: "",
    priceStr: "",
    originalPriceStr: "",
    description: "",
    image: undefined,
    active: true,
    initialStockStr: "0",
    minStockStr: "5",
    preparationTime: 0,
  });

  const [baseOptions, setBaseOptions] = useState<BaseOptions>({});
  const [ingredients, setIngredients] = useState<UIIngredient[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [addons, setAddons] = useState<UIAddon[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  // Valores numéricos derivados
  const price = useMemo(
    () => parseDecimal(formData.priceStr),
    [formData.priceStr]
  );
  const originalPrice = useMemo(
    () =>
      formData.originalPriceStr.trim()
        ? parseDecimal(formData.originalPriceStr)
        : undefined,
    [formData.originalPriceStr]
  );
  const initialStock = useMemo(
    () => Number(sanitizeInteger(formData.initialStockStr) || "0"),
    [formData.initialStockStr]
  );
  const minStock = useMemo(
    () => Number(sanitizeInteger(formData.minStockStr) || "0"),
    [formData.minStockStr]
  );

  // Validação do formulário
  const isFormValid = useMemo(() => {
    if (!formData.name.trim() || !formData.categoryId) return false;
    if (price <= 0 || price > 999999.99) return false;
    return true;
  }, [formData.name, formData.categoryId, price]);

  // Carregar dados iniciais
  useEffect(() => {
    loadCategories();
    loadProduct();
  }, [slug, productId]);

  // Carregar produto quando disponível
  useEffect(() => {
    if (product) {
      setFormData({
        storeSlug: slug,
        name: product.name || "",
        categoryId: product.categoryId || "",
        priceStr: product.price ? String(product.price) : "",
        originalPriceStr: product.originalPrice
          ? String(product.originalPrice)
          : "",
        description: product.description || "",
        image: product.image || undefined,
        active: product.active ?? true,
        initialStockStr: String(product.inventory?.quantity ?? 0),
        minStockStr: String(product.inventory?.minStock ?? 5),
        preparationTime: product.preparationTime ?? 0,
      });

      // Carregar ingredientes
      const productIngredients = product.ingredients || [];
      setIngredients(
        productIngredients.map((ing, index) => ({
          id: `existing-${index}`,
          name: ing.name,
          selected: true,
        }))
      );

      // Carregar adicionais
      const productAddons = product.addons || [];
      setAddons(
        productAddons.map((addon, index) => ({
          id: `existing-${index}`,
          name: addon.name,
          price: Number(addon.price),
          priceText: addon.price > 0 ? formatBRL(Number(addon.price)) : "",
        }))
      );

      // Carregar tags
      setTags(product.tags || []);

      // Carregar opções base das tags
      const loadedBaseOptions: BaseOptions = {};
      product.tags?.forEach((tag) => {
        if (tag.startsWith("Pão: ")) {
          loadedBaseOptions.breadType = tag.replace("Pão: ", "");
        } else if (tag.startsWith("Ponto: ")) {
          loadedBaseOptions.doneness = tag.replace("Ponto: ", "");
        } else if (tag.startsWith("Massa: ")) {
          loadedBaseOptions.doughType = tag.replace("Massa: ", "");
        } else if (tag.startsWith("Tamanho: ")) {
          loadedBaseOptions.pizzaSize = tag.replace("Tamanho: ", "");
        } else if (tag.startsWith("Volume: ")) {
          loadedBaseOptions.beverageSize = tag.replace("Volume: ", "");
        }
      });
      setBaseOptions(loadedBaseOptions);
    }
  }, [product]);

  const loadCategories = async () => {
    try {
      const response = await apiClient.get<any>(`/stores/${slug}/categories`);
      const categoriesData = response.data || response;
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error: any) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const loadProduct = async () => {
    try {
      setIsLoadingProduct(true);
      const productData = await apiClient.getProductById(productId, slug);
      setProduct(productData);
    } catch (error: any) {
      console.error("❌ Erro ao carregar produto:", error);
      showToast("Erro ao carregar produto", "error");
    } finally {
      setIsLoadingProduct(false);
    }
  };

  // Funções para gerenciar ingredientes
  const addCustomIngredient = () => {
    if (!newIngredient.trim()) return;
    const newId = `custom-${Date.now()}`;
    setIngredients((prev) => [
      ...prev,
      {
        id: newId,
        name: newIngredient.trim(),
        selected: true,
      },
    ]);
    setNewIngredient("");
  };

  const toggleIngredient = (id: string) => {
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === id ? { ...ing, selected: !ing.selected } : ing
      )
    );
  };

  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  };

  // Funções para gerenciar adicionais
  const addAddonRow = () => {
    const newId = `addon-${Date.now()}`;
    setAddons((prev) => [
      ...prev,
      {
        id: newId,
        name: "",
        price: 0,
        priceText: "",
      },
    ]);
  };

  const updateAddon = (id: string, updates: Partial<UIAddon>) => {
    setAddons((prev) =>
      prev.map((addon) => {
        if (addon.id === id) {
          const updated = { ...addon, ...updates };
          if (updates.priceText !== undefined) {
            const { value } = parseAndFormatBRL(updates.priceText);
            updated.price = value;
          }
          return updated;
        }
        return addon;
      })
    );
  };

  const removeAddon = (id: string) => {
    setAddons((prev) => prev.filter((addon) => addon.id !== id));
  };

  const clearAllAddons = () => {
    setAddons([]);
  };

  // Funções para gerenciar tags
  const addTag = () => {
    if (!newTag.trim()) return;
    setTags((prev) => [...prev, newTag.trim()]);
    setNewTag("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  // Funções para gerenciar opções base
  const setBase = (updates: Partial<BaseOptions>) => {
    setBaseOptions((prev) => ({ ...prev, ...updates }));
  };

  return {
    // Estado
    isLoading,
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

    // Setters
    setFormData,
    setNewIngredient,
    setNewTag,

    // Funções
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
  };
}