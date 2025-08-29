"use client";

import { Button } from "@/components/ui/button";
import { Package, Plus } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

interface ProductManagementProps {
  storeSlug: string;
}

export function ProductManagement({ storeSlug }: ProductManagementProps) {
  const router = useRouter();

  const handleGoToProducts = () => {
    router.push(`/dashboard/${storeSlug}/produtos`);
  };

  const handleCreateProduct = () => {
    router.push(`/dashboard/${storeSlug}/produtos/novo`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Gerenciamento de Produtos
          </h2>
          <p className="text-gray-600">
            Gerencie os produtos da sua loja
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Package className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Ver Produtos
              </h3>
              <p className="text-gray-600">
                Visualize e edite todos os produtos
              </p>
            </div>
          </div>
          <Button
            onClick={handleGoToProducts}
            className="w-full mt-4 bg-orange-600 hover:bg-orange-700"
          >
            Gerenciar Produtos
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Plus className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Novo Produto
              </h3>
              <p className="text-gray-600">
                Adicione um novo produto à loja
              </p>
            </div>
          </div>
          <Button
            onClick={handleCreateProduct}
            className="w-full mt-4 bg-green-600 hover:bg-green-700"
          >
            Criar Produto
          </Button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Package className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Dica de Produtividade
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Organize seus produtos em categorias para facilitar a navegação dos clientes. 
                Mantenha as descrições claras e as imagens de alta qualidade.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 