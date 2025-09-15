"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PhoneLoginModal } from "../../../../../components/PhoneLoginModal";
import { useCustomerContext } from "../../../../../contexts/CustomerContext";

export default function CustomerLoginPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeSlug = params.storeSlug as string;
  const redirect = searchParams.get("redirect");

  const { login: loginCustomer } = useCustomerContext();
  const [storeConfig, setStoreConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(true);

  // Carrega as configurações da loja via API
  useEffect(() => {
    const fetchStoreConfig = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3001/api/v1/stores/public/${storeSlug}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Loja não encontrada");
        }

        const data = await response.json();

        const config = {
          id: data.store.id,
          name: data.store.name,
          slug: data.store.slug,
          description: data.store.description,
          active: data.store.active,
          approved: data.store.approved || false,
          branding: {
            logo: data.config?.logo || "",
            favicon: data.config?.favicon || "",
            banner: data.config?.banner || "",
            primaryColor: data.config?.branding?.primaryColor || "#f97316",
            secondaryColor: data.config?.branding?.secondaryColor || "#ea580c",
            backgroundColor:
              data.config?.branding?.backgroundColor || "#ffffff",
            textColor: data.config?.branding?.textColor || "#000000",
            accentColor: data.config?.branding?.accentColor || "#f59e0b",
          },
        };

        setStoreConfig(config);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        console.error("Erro ao carregar configurações da loja:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreConfig();
  }, [storeSlug]);

  const handleLoginSuccess = (authData: any) => {
    // Usar os dados do login para criar o cliente
    loginCustomer(authData.phone, authData.name);

    // Redirecionar para a página solicitada ou para a loja
    const redirectTo = redirect || `/store/${storeSlug}`;
    router.push(redirectTo);
  };

  const handleCloseModal = () => {
    // Se fechar o modal, redirecionar para a loja
    router.push(`/store/${storeSlug}`);
  };

  // Exibir carregando enquanto busca as configurações da loja
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Exibir erro se houver problemas ao buscar a loja
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Loja não encontrada
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <PhoneLoginModal
        isOpen={showLoginModal}
        onClose={handleCloseModal}
        onSuccess={handleLoginSuccess}
        storeSlug={storeSlug}
      />
    </div>
  );
}
