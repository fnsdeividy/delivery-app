"use client";

import { useState } from "react";
import { PhoneLoginModal } from "@/components/PhoneLoginModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Dados de exemplo de lojas com diferentes temas
const storeThemes = [
  {
    slug: "loja-azul",
    name: "Loja Azul",
    theme: {
      primaryColor: "#3b82f6",
      secondaryColor: "#1d4ed8",
      backgroundColor: "#ffffff",
      textColor: "#1f2937",
      accentColor: "#60a5fa",
    },
  },
  {
    slug: "loja-verde",
    name: "Loja Verde",
    theme: {
      primaryColor: "#10b981",
      secondaryColor: "#059669",
      backgroundColor: "#ffffff",
      textColor: "#1f2937",
      accentColor: "#34d399",
    },
  },
  {
    slug: "loja-roxo",
    name: "Loja Roxo",
    theme: {
      primaryColor: "#8b5cf6",
      secondaryColor: "#7c3aed",
      backgroundColor: "#ffffff",
      textColor: "#1f2937",
      accentColor: "#a78bfa",
    },
  },
  {
    slug: "loja-escura",
    name: "Loja Escura",
    theme: {
      primaryColor: "#f59e0b",
      secondaryColor: "#d97706",
      backgroundColor: "#1f2937",
      textColor: "#ffffff",
      accentColor: "#fbbf24",
    },
  },
];

export function StoreThemeDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string | undefined>();

  const handleOpenModal = (storeSlug: string) => {
    setSelectedStore(storeSlug);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStore(undefined);
  };

  const handleLoginSuccess = (authData: any) => {
    console.log("Login realizado com sucesso:", authData);
    // Aqui você pode implementar a lógica de redirecionamento ou outras ações
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8" data-testid="theme-demo">
        <h1 className="text-3xl font-bold text-center mb-4">
          Demonstração de Temas de Loja
        </h1>
        <p className="text-center text-gray-600">
          Clique nos botões abaixo para ver como o modal de login se adapta ao tema de cada loja
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {storeThemes.map((store) => (
          <Card key={store.slug} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: store.theme.primaryColor }}
                />
                {store.name}
              </CardTitle>
              <CardDescription>
                Tema personalizado com cores da loja
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Primária:</span>
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: store.theme.primaryColor }}
                  />
                  <span className="text-xs text-gray-500">
                    {store.theme.primaryColor}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Secundária:</span>
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: store.theme.secondaryColor }}
                  />
                  <span className="text-xs text-gray-500">
                    {store.theme.secondaryColor}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Fundo:</span>
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: store.theme.backgroundColor }}
                  />
                  <span className="text-xs text-gray-500">
                    {store.theme.backgroundColor}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => handleOpenModal(store.slug)}
                className="w-full"
                data-theme={store.slug}
                style={{
                  backgroundColor: store.theme.primaryColor,
                  color: store.theme.backgroundColor,
                }}
              >
                Testar Login
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <PhoneLoginModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleLoginSuccess}
        storeSlug={selectedStore}
      />
    </div>
  );
}