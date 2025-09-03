"use client";

import { ProtectedProductRoute } from "@/components/ProtectedProductRoute";
import { ProductBasicInfo } from "@/components/products/ProductBasicInfo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { apiClient } from "@/lib/api-client";
import { CreateProductDto } from "@/types/cardapio-api";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
}

export default function NovoProdutoPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.storeSlug as string;
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    storeSlug: slug,
    name: "",
    categoryId: "",
    price: 0,
    description: "",
    image: undefined as string | undefined,
    originalPrice: 0,
    active: true,
    initialStock: 0,
    minStock: 5,
  });

  // Carregar categorias
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await apiClient.getCategories(slug);
        setCategories(response);
      } catch (error: any) {
        console.error("Erro ao carregar categorias:", error);
        showToast("Erro ao carregar categorias", "error");
      }
    };

    if (isAuthenticated && slug) {
      loadCategories();
    }
  }, [isAuthenticated, slug, showToast]);

  // Função para lidar com mudanças no formulário
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Função para limpar o formulário
  const clearForm = () => {
    setFormData({
      storeSlug: slug,
      name: "",
      categoryId: "",
      price: 0,
      description: "",
      image: undefined as string | undefined,
      originalPrice: 0,
      active: true,
      initialStock: 0,
      minStock: 5,
    });
  };

  // Função para submeter o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Evitar múltiplos envios
    if (isLoading) {
      return;
    }

    if (!formData.name || !formData.categoryId) {
      showToast("Nome e categoria são obrigatórios", "error");
      return;
    }

    setIsLoading(true);

    try {
      // Preparar dados para envio
      const productData: CreateProductDto = {
        storeSlug: slug,
        name: formData.name,
        categoryId: formData.categoryId,
        price: Number(formData.price) || 0,
        description: formData.description || "",
        image: formData.image || undefined,
        originalPrice: Number(formData.originalPrice) || undefined,
        active: formData.active,
        ingredients: [],
        addons: [],
        tags: [],
        initialStock: Number(formData.initialStock) || 0,
        minStock: Number(formData.minStock) || 5,
      };

      await apiClient.createProduct(productData);
      showToast("Produto criado com sucesso!", "success");
      
      // Limpar formulário após sucesso
      clearForm();
      
      // Aguardar um pouco antes de redirecionar para mostrar o toast
      setTimeout(() => {
        router.push(`/dashboard/${slug}/produtos`);
      }, 1500);
    } catch (error: any) {
      console.error("Erro ao criar produto:", error);
      const errorMessage =
        error.response?.data?.message ||
        (Array.isArray(error.response?.data?.message)
          ? error.response.data.message.join(", ")
          : "Erro ao criar produto");
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedProductRoute storeSlug={slug}>
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
          <h1 className="text-2xl font-bold">Novo Produto</h1>
        </div>

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <ProductBasicInfo
                formData={{
                  name: formData.name,
                  categoryId: formData.categoryId,
                  price: formData.price,
                  originalPrice: formData.originalPrice,
                  description: formData.description,
                }}
                categories={categories}
                onFormDataChange={(updates) => {
                  setFormData((prev) => ({
                    ...prev,
                    ...updates,
                  }));
                }}
              />

              {/* URL da Imagem */}
              <div className="space-y-2 mt-6">
                <label htmlFor="image" className="text-sm font-medium">
                  URL da Imagem
                </label>
                <input
                  id="image"
                  type="url"
                  value={formData.image || ""}
                  onChange={(e) =>
                    handleInputChange("image", e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              {/* Gerenciamento de Estoque */}
              <div className="space-y-4 mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900">Controle de Estoque</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="initialStock" className="text-sm font-medium text-gray-700">
                      Estoque Inicial
                    </label>
                    <input
                      id="initialStock"
                      type="number"
                      min="0"
                      value={formData.initialStock}
                      onChange={(e) =>
                        handleInputChange("initialStock", Number(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500">
                      Quantidade inicial em estoque
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="minStock" className="text-sm font-medium text-gray-700">
                      Estoque Mínimo
                    </label>
                    <input
                      id="minStock"
                      type="number"
                      min="0"
                      value={formData.minStock}
                      onChange={(e) =>
                        handleInputChange("minStock", Number(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="5"
                    />
                    <p className="text-xs text-gray-500">
                      Alerta quando estoque atingir este valor
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Ativo */}
              <div className="flex items-center space-x-2 mt-4">
                <input
                  id="active"
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) =>
                    handleInputChange("active", e.target.checked)
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
                  onClick={clearForm}
                  disabled={isLoading}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Limpar Formulário
                </Button>
                
                <div className="flex gap-4">
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
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isLoading ? "Salvando..." : "Salvar Produto"}
                </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedProductRoute>
  );
}
