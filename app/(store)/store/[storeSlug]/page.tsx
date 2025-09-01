"use client";

import {
  Clock,
  House,
  MagnifyingGlass,
  Receipt,
  ShoppingCart,
  Storefront,
  User,
  Image as ImageIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import SearchModal from "../../../../components/SearchModal";
import CartModal from "../../../../components/cart/CartModal";
import OrdersModal from "../../../../components/cart/OrdersModal";
import { Product } from "../../../../types/cardapio-api";
import { useCart } from "../../../../hooks/useCart";

interface PageProps {
  params: {
    storeSlug: string;
  };
}

// Helper para formatar preço
const formatPrice = (price: any): string => {
  if (price === null || price === undefined) return "0,00";

  if (typeof price === "string") {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? "0,00" : numPrice.toFixed(2).replace(".", ",");
  }

  if (typeof price === "number") {
    return price.toFixed(2).replace(".", ",");
  }

  if (price && typeof price === "object" && "toString" in price) {
    const numPrice = parseFloat(price.toString());
    return isNaN(numPrice) ? "0,00" : numPrice.toFixed(2).replace(".", ",");
  }

  return "0,00";
};

async function getStoreConfig(slug: string) {
  try {
    const response = await fetch(
      `http://localhost:3001/api/v1/stores/public/${slug}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("Loja não encontrada");
    }

    const data = await response.json();

    return {
      id: data.store.id,
      name: data.store.name,
      slug: data.store.slug,
      description: data.store.description,
      active: data.store.active,
      approved: data.store.approved || false,
      createdAt: data.store.createdAt,
      updatedAt: data.store.updatedAt,
      config: data.config || {},
      menu: {
        products: data.products || [],
        categories: data.categories || [],
      },
      settings: {
        preparationTime: data.config?.preparationTime || 30,
        orderNotifications: data.config?.orderNotifications !== false,
      },
      delivery: {
        fee: data.config?.deliveryFee || 0,
        freeDeliveryMinimum: data.config?.minimumOrder || 0,
        estimatedTime: data.config?.estimatedDeliveryTime || 30,
        enabled: data.config?.deliveryEnabled !== false,
      },
      payments: {
        pix: data.config?.paymentMethods?.includes("PIX") || false,
        cash: data.config?.paymentMethods?.includes("DINHEIRO") || false,
        card: data.config?.paymentMethods?.includes("CARTÃO") || false,
      },
      promotions: {
        coupons: data.config?.coupons || [],
      },
      branding: {
        logo: data.config?.logo || "",
        favicon: data.config?.favicon || "",
        banner: data.config?.banner || "",
        primaryColor: data.config?.branding?.primaryColor || "#f97316",
        secondaryColor: data.config?.branding?.secondaryColor || "#ea580c",
        backgroundColor: data.config?.branding?.backgroundColor || "#ffffff",
        textColor: data.config?.branding?.textColor || "#000000",
        accentColor: data.config?.branding?.accentColor || "#f59e0b",
      },
      schedule: {
        timezone: "America/Sao_Paulo",
        workingHours: data.config?.businessHours || {},
      },
      business: {
        phone: data.config?.phone || "",
        email: data.config?.email || "",
        address: data.config?.address || "",
      },
      status: data.status || { isOpen: false, reason: "Indisponível" },
    };
  } catch (error) {
    console.error("Erro ao buscar configuração da loja:", error);
    throw error;
  }
}

type StoreData = Awaited<ReturnType<typeof getStoreConfig>>;

export default function StorePage({ params }: PageProps) {
  const { storeSlug: slug } = params;
  const [config, setConfig] = useState<StoreData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);

  useEffect(() => {
    const loadStoreData = async () => {
      try {
        setLoading(true);
        const storeData = await getStoreConfig(slug);
        setConfig(storeData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    loadStoreData();
  }, [slug]);

  const isOpen = config?.status?.isOpen || false;
  const currentMessage = config?.status?.reason || "Loja fechada";

  const status = "unauthenticated";
  const session = null;
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const { cart, addToCart } = useCart();

  const handleSearchClick = () => setIsSearchModalOpen(true);

  const handleProductSelect = (product: Product) => {
    console.log("Produto selecionado:", product.name);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    // Toast de sucesso
    showToast(`${product.name} adicionado ao carrinho!`, 'success');
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-[9999] px-4 py-3 rounded-lg text-white font-medium shadow-lg transform transition-all duration-300 translate-x-full opacity-0 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animação de entrada
    setTimeout(() => {
      toast.classList.remove('translate-x-full', 'opacity-0');
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
      toast.classList.add('translate-x-full', 'opacity-0');
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  const filteredProducts = config?.menu?.products?.filter((p: any) => {
    if (!p.active) return false;
    
    // Filtro por categoria
    if (selectedCategory !== "todos") {
      const category = config?.menu?.categories?.find((c: any) => c.name === selectedCategory);
      if (category && p.categoryId !== category.id) return false;
    }
    
    // Filtro por busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.subtitle?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando loja...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Storefront className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Loja não encontrada
          </h1>
          <p className="text-gray-600 mb-6">
            {error === `Loja '${slug}' não encontrada`
              ? `A loja "${slug}" não foi encontrada ou não está mais disponível.`
              : error === "Loja inativa ou não aprovada"
              ? "Esta loja está temporariamente indisponível."
              : "Ocorreu um erro ao carregar os dados da loja."}
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Voltar ao início
            </Link>
            <Link
              href="/dashboard/gerenciar-lojas"
              className="inline-flex items-center justify-center w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Acessar Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Loja não encontrada
          </h1>
          <p className="text-gray-600 mb-4">
            Esta loja não existe ou está temporariamente indisponível.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  const primary = config?.branding?.primaryColor || "#f97316";

  return (
    <div
      className="min-h-screen flex flex-col bg-white overflow-hidden"
      style={{
        backgroundColor: config.branding?.backgroundColor || "#ffffff",
        color: config?.branding?.textColor || "#000000",
      }}
    >
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {config?.branding?.logo && (
                <img
                  src={config.branding.logo}
                  alt={config.name}
                  className="h-10 w-auto"
                />
              )}
              <h1 className="text-2xl font-bold" style={{ color: primary }}>
                {config.name}
              </h1>
            </div>

            {/* Search Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <button
                onClick={handleSearchClick}
                className="w-full flex items-center pl-12 pr-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:bg-white transition-all text-left relative"
                style={{ ["--tw-ring-color" as any]: primary }}
              >
                <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <span className="text-gray-500">Buscar produtos...</span>
              </button>
            </div>

            {/* Search Mobile */}
            <button
              onClick={handleSearchClick}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              style={{ color: primary }}
              title="Buscar produtos"
            >
              <MagnifyingGlass className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={() => setIsOrdersModalOpen(true)}
                  className="flex items-center space-x-2 hover:opacity-75"
                  style={{ color: primary }}
                  title="Meus Pedidos"
                >
                  <Receipt className="h-5 w-5" />
                  <span>Pedidos</span>
                </button>
                
                <button
                  onClick={() => setIsCartModalOpen(true)}
                  className="flex items-center space-x-2 hover:opacity-75 relative"
                  style={{ color: primary }}
                  title="Carrinho"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Carrinho</span>
                  {cart.itemCount > 0 && (
                    <span 
                      className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center text-xs font-bold text-white rounded-full"
                      style={{ backgroundColor: primary }}
                    >
                      {cart.itemCount > 99 ? '99+' : cart.itemCount}
                    </span>
                  )}
                </button>
              </div>
              
              <button
                className="flex items-center space-x-2 hover:opacity-75"
                style={{ color: primary }}
                title="Fazer Login"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:block">Login</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Banner */}
      {config?.branding?.banner && (
        <div className="relative h-48 md:h-64 overflow-hidden">
          <img
            src={config.branding.banner}
            alt={config.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                {config.name}
              </h2>
              <p className="text-lg">{config.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Categorias */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 py-4 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory("todos")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === "todos"
                  ? "text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              style={{
                backgroundColor: selectedCategory === "todos" ? primary : undefined,
              }}
            >
              <span className="font-medium">Todos</span>
              <span className="text-sm opacity-75">
                (
                {config?.menu?.products?.filter((p: any) => p.active).length ||
                  0}
                )
              </span>
            </button>

            {config?.menu?.categories
              ?.filter((c: any) => c.active)
              .map((category: any) => {
                const count =
                  config?.menu?.products?.filter(
                    (p: any) => p.active && p.categoryId === category.id
                  ).length || 0;
                
                // Não mostrar categoria se tiver 0 produtos
                if (count === 0) return null;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      selectedCategory === category.name
                        ? "text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    style={{
                      backgroundColor: selectedCategory === category.name ? primary : undefined,
                    }}
                  >
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm opacity-75">({count})</span>
                  </button>
                );
              })}
          </div>
        </div>
      </section>

      {/* Lista de Produtos — 1 por linha */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Info de resultados */}
          <div className="mb-6">
            <p className="text-gray-600">
              {filteredProducts.length} produto
              {filteredProducts.length !== 1 ? "s" : ""} encontrado
              {filteredProducts.length !== 1 ? "s" : ""}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <MagnifyingGlass className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-600">
                Tente ajustar os filtros ou buscar por outro termo
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product: any, index: number) => {
                const isSoldOut =
                  product?.stock === 0 ||
                  product?.available === false ||
                  product?.active === false;

                return (
                  <article
                    key={product.id}
                    className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden"
                  >
                    <div className="flex items-stretch gap-4 p-4 sm:p-5">
                      {/* Texto à esquerda */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                          {product.name}
                        </h3>

                        {/* Subdescrição/observações */}
                        {product?.subtitle ? (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {product.subtitle}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {product.description}
                          </p>
                        )}

                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-900">
                            R$ {formatPrice(product.price)}
                          </span>

                          {product?.preparationTime && (
                            <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                              <Clock className="h-4 w-4" />
                              {product.preparationTime}min
                            </span>
                          )}
                        </div>

                        {/* CTA (opcional) */}
                        <div className="mt-3">
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={!isOpen || isSoldOut}
                            className="px-4 py-2 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                            style={{
                              backgroundColor:
                                !isOpen || isSoldOut ? "#9ca3af" : primary,
                            }}
                          >
                            {!isOpen
                              ? "Loja Fechada"
                              : isSoldOut
                              ? "Indisponível"
                              : "+ Adicionar"}
                          </button>
                        </div>
                      </div>

                      {/* Imagem à direita */}
                      <div className="relative shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-gray-100">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className={`w-full h-full object-cover transition-transform duration-300 ${
                              isSoldOut ? "grayscale" : ""
                            }`}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const placeholder = target.nextElementSibling as HTMLElement;
                              if (placeholder) placeholder.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        
                        {/* Placeholder para imagem ausente */}
                        <div 
                          className={`w-full h-full flex items-center justify-center bg-gray-200 ${
                            product.image ? 'hidden' : 'flex'
                          }`}
                          style={{ display: product.image ? 'none' : 'flex' }}
                        >
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>

                        {isSoldOut && (
                          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] sm:text-xs font-semibold px-2 py-1 rounded-md bg-black/70 text-white">
                            Esgotado
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Menu inferior Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
        <div className="flex items-center justify-around py-2">
          <button className="flex flex-col items-center py-2 px-4 min-w-0 flex-1">
            <House className="h-6 w-6 mb-1" style={{ color: primary }} />
            <span className="text-xs font-medium" style={{ color: primary }}>
              Início
            </span>
          </button>

          <button 
            onClick={() => setIsOrdersModalOpen(true)}
            className="flex flex-col items-center py-2 px-4 min-w-0 flex-1"
          >
            <Receipt className="h-6 w-6 mb-1 text-gray-500" />
            <span className="text-xs font-medium text-gray-500">Pedidos</span>
          </button>

          <button 
            onClick={() => setIsCartModalOpen(true)}
            className="flex flex-col items-center py-2 px-4 min-w-0 flex-1 relative"
          >
            <ShoppingCart className="h-6 w-6 mb-1 text-gray-500" />
            <span className="text-xs font-medium text-gray-500">Carrinho</span>
            {cart.itemCount > 0 && (
              <span 
                className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center text-xs font-bold text-white rounded-full"
                style={{ backgroundColor: primary }}
              >
                {cart.itemCount > 99 ? '99+' : cart.itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Espaço para o menu fixo */}
      <div className="h-16 md:hidden" />

      {/* Modals */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        products={config?.menu?.products?.filter((p: any) => p.active) || []}
        onProductSelect={handleProductSelect}
        primaryColor={config?.branding?.primaryColor}
        accentColor={config?.branding?.accentColor}
      />
      
      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        primaryColor={config?.branding?.primaryColor}
        storeSlug={slug}
      />
      
      <OrdersModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
        primaryColor={config?.branding?.primaryColor}
        storeSlug={slug}
      />
    </div>
  );
}
