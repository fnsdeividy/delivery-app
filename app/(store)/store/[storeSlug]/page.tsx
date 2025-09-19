"use client";

import {
  Clock,
  House,
  Image as ImageIcon,
  MagnifyingGlass,
  Receipt,
  ShoppingCart,
  Storefront,
  User,
} from "@phosphor-icons/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import CartModal from "../../../../components/cart/CartModal";
import OrdersModal from "../../../../components/cart/OrdersModal";
import { PhoneLoginModal } from "../../../../components/PhoneLoginModal";
import {
  ProductCustomization,
  ProductCustomizationModal,
} from "../../../../components/products/ProductCustomizationModal";
import SearchModal from "../../../../components/SearchModal";
import { useCustomerContext } from "../../../../contexts/CustomerContext";
import { useCart } from "../../../../hooks/useCart";
import { useStoreConfig } from "../../../../lib/store/useStoreConfig";
import "../../../../styles/header-responsive.css";
import { Product } from "../../../../types/cardapio-api";

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

// Helper para normalizar URLs de imagem
const normalizeImageUrl = (url: string): string => {
  if (!url) return url;

  // se já for relativa, mantém
  if (url.startsWith("/")) return url;

  // normaliza hosts locais comuns para usar o proxy do Next
  const hostsLocais = [
    "http://localhost:3001",
    "https://localhost:3001",
    "http://127.0.0.1:3001",
    "https://127.0.0.1:3001",
  ];

  for (const host of hostsLocais) {
    if (url.startsWith(host + "/")) {
      return url.replace(host, "");
    }
  }

  return url;
};

// Tipo para dados da loja
interface StoreData {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
  config: any;
  menu: {
    products: any[];
    categories: any[];
  };
  settings: {
    preparationTime: number;
    orderNotifications: boolean;
  };
  delivery: {
    fee: number;
    freeDeliveryMinimum: number;
    estimatedTime: number;
    enabled: boolean;
  };
  payments: {
    pix: boolean;
    cash: boolean;
    card: boolean;
  };
  promotions: {
    coupons: any[];
  };
  branding: {
    logo: string;
    favicon: string;
    banner: string;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    accentColor: string;
  };
  schedule: {
    timezone: string;
    workingHours: any;
  };
  business: {
    phone: string;
    email: string;
    address: string;
  };
  status: {
    isOpen: boolean;
    reason: string;
  };
}

function StorePageContent({ params }: PageProps) {
  const { storeSlug: slug } = params;
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isPhoneLoginModalOpen, setIsPhoneLoginModalOpen] = useState(false);
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] =
    useState(false);
  const [selectedProductForCustomization, setSelectedProductForCustomization] =
    useState<Product | null>(null);

  const { customer, isLoggedIn, login: loginCustomer } = useCustomerContext();
  const { config, loading, error } = useStoreConfig(slug);

  const isOpen = config?.status?.isOpen || false;

  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const { cart, addToCart } = useCart();

  const handleSearchClick = () => setIsSearchModalOpen(true);

  const handleProductSelect = (_product: Product) => {
    // ação futura (navegar para detalhes, etc.)
  };

  const handleAddToCart = (product: Product) => {
    // Verificar se o produto tem ingredientes ou addons para personalizar
    const hasCustomizations =
      (product.ingredients && product.ingredients.length > 0) ||
      (product.addons && product.addons.length > 0);

    if (hasCustomizations) {
      // Abrir modal de personalização
      setSelectedProductForCustomization(product);
      setIsCustomizationModalOpen(true);
    } else {
      // Adicionar diretamente ao carrinho
      addToCart(product, 1);
      showToast(`${product.name} adicionado ao carrinho!`, "success");
    }
  };

  const handleCustomizedAddToCart = (
    product: Product,
    quantity: number,
    customizations: ProductCustomization
  ) => {
    // Adicionar produto personalizado ao carrinho
    addToCart(product, quantity, customizations);
    showToast(`${product.name} adicionado ao carrinho!`, "success");
  };

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-[9999] px-4 py-3 rounded-lg text-white font-medium shadow-lg transform transition-all duration-300 translate-x-full opacity-0 ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    }`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove("translate-x-full", "opacity-0");
    }, 100);

    setTimeout(() => {
      toast.classList.add("translate-x-full", "opacity-0");
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  const filteredProducts =
    config?.menu?.products?.filter((p: any) => {
      if (!p.active) return false;

      // Filtro por categoria
      if (selectedCategory !== "todos") {
        const category = config?.menu?.categories?.find(
          (c: any) => c.name === selectedCategory
        );
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
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
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
            Ocorreu um erro ao carregar os dados da loja.
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
            <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
              {config?.branding?.logo && (
                <img
                  src={normalizeImageUrl(config.branding.logo)}
                  alt={`Logo ${config.name}`}
                  className="h-8 sm:h-10 lg:h-12 w-auto object-contain"
                />
              )}
              <h1
                className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold truncate"
                style={{ color: primary }}
              >
                {config?.slug || config?.name}
              </h1>
            </div>

            {/* Search Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-6 lg:mx-8">
              <button
                onClick={handleSearchClick}
                className="w-full flex items-center pl-12 pr-4 py-3 lg:py-4 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:bg-white transition-all text-left relative"
                style={{ ["--tw-ring-color" as any]: primary }}
              >
                <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 lg:h-6 lg:w-6" />
                <span className="text-gray-500 text-sm lg:text-base">
                  Buscar produtos...
                </span>
              </button>
            </div>

            {/* Search Mobile */}
            <button
              onClick={handleSearchClick}
              className="md:hidden p-2 sm:p-3 hover:bg-gray-100 rounded-lg transition-colors"
              style={{ color: primary }}
              title="Buscar produtos"
            >
              <MagnifyingGlass className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <div className="flex items-center space-x-3 lg:space-x-4">
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
                <button
                  onClick={() => setIsOrdersModalOpen(true)}
                  className="flex items-center space-x-2 hover:opacity-75 transition-opacity"
                  style={{ color: primary }}
                  title="Meus Pedidos"
                >
                  <Receipt className="h-5 w-5 lg:h-6 lg:w-6" />
                  <span className="text-sm lg:text-base font-medium">
                    Pedidos
                  </span>
                </button>

                <button
                  data-testid="cart-button"
                  onClick={() => setIsCartModalOpen(true)}
                  className="flex items-center space-x-2 hover:opacity-75 relative transition-opacity"
                  style={{ color: primary }}
                  title="Carrinho"
                >
                  <ShoppingCart className="h-5 w-5 lg:h-6 lg:w-6" />
                  <span className="text-sm lg:text-base font-medium">
                    Carrinho
                  </span>
                  {cart.itemCount > 0 && (
                    <span
                      data-testid="cart-count"
                      className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center text-xs font-bold text-white rounded-full"
                      style={{ backgroundColor: primary }}
                    >
                      {cart.itemCount > 99 ? "99+" : cart.itemCount}
                    </span>
                  )}
                </button>
              </div>

              {isLoggedIn && customer ? (
                <div
                  className="flex items-center space-x-1 sm:space-x-2"
                  style={{ color: primary }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Olá, ${customer.name || customer.phone}`}
                  title={`Olá, ${customer.name || customer.phone}`}
                >
                  <User className="h-5 w-5 lg:h-6 lg:w-6 flex-shrink-0" />
                  <span
                    className="user-badge__name--truncated text-xs sm:text-sm lg:text-base font-medium"
                    title={customer.name || customer.phone}
                    aria-hidden="false"
                  >
                    Olá, {customer.name || customer.phone}
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => setIsPhoneLoginModalOpen(true)}
                  className="flex items-center space-x-1 sm:space-x-2 hover:opacity-75 transition-opacity"
                  style={{ color: primary }}
                  aria-label="Fazer Login"
                  title="Fazer Login"
                >
                  <User className="h-5 w-5 lg:h-6 lg:w-6 flex-shrink-0" />
                  <span className="text-xs sm:text-sm lg:text-base font-medium">
                    Entrar
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Categorias */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div
            className="flex items-center gap-2 sm:gap-3 lg:gap-4 py-3 sm:py-4 lg:py-5 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              scrollSnapType: "x mandatory",
            }}
          >
            <button
              onClick={() => setSelectedCategory("todos")}
              className={`flex items-center space-x-1.5 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 rounded-lg whitespace-nowrap transition-all duration-300 flex-shrink-0 scroll-snap-align-start ${
                selectedCategory === "todos"
                  ? "text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
              }`}
              style={{
                backgroundColor:
                  selectedCategory === "todos" ? primary : undefined,
              }}
            >
              <span className="font-medium text-sm sm:text-base">Todos</span>
              <span className="text-xs sm:text-sm opacity-75">
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

                if (count === 0) return null;

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`flex items-center space-x-1.5 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 rounded-lg whitespace-nowrap transition-all duration-300 flex-shrink-0 scroll-snap-align-start ${
                      selectedCategory === category.name
                        ? "text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                    }`}
                    style={{
                      backgroundColor:
                        selectedCategory === category.name
                          ? primary
                          : undefined,
                    }}
                  >
                    <span className="font-medium text-sm sm:text-base">
                      {category.name}
                    </span>
                    <span className="text-xs sm:text-sm opacity-75">
                      ({count})
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      </section>

      {/* Banner */}
      {config?.branding?.banner && (
        <div className="relative h-32 sm:h-40 md:h-48 lg:h-56 xl:h-64 overflow-hidden">
          <img
            src={normalizeImageUrl(config.branding.banner)}
            alt={config.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40 flex items-center justify-center p-4">
            <div className="text-center text-white max-w-4xl">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-1 sm:mb-2 lg:mb-3">
                {config.name}
              </h2>
              {!!config.description && (
                <p className="text-xs sm:text-sm md:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
                  {config.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lista de Produtos */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          {/* Info de resultados */}
          <div className="mb-6 sm:mb-8">
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
              {filteredProducts.length} produto
              {filteredProducts.length !== 1 ? "s" : ""} encontrado
              {filteredProducts.length !== 1 ? "s" : ""}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 sm:py-16 lg:py-20">
              <div className="text-gray-400 mb-6">
                <MagnifyingGlass className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-medium text-gray-900 mb-3 sm:mb-4">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-md mx-auto">
                Tente ajustar os filtros ou buscar por outro termo
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              {filteredProducts.map((product: any) => {
                const isSoldOut =
                  product?.stock === 0 ||
                  product?.available === false ||
                  product?.active === false;

                return (
                  <article
                    key={product.id}
                    data-testid="product-card"
                    className="bg-white rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full min-h-[240px] sm:min-h-[280px] lg:min-h-[320px]"
                  >
                    {/* Imagem no topo - altura fixa e aspect ratio consistente */}
                    <div className="relative w-full h-28 sm:h-32 lg:h-36 bg-gray-100 flex-shrink-0">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className={`w-full h-full object-cover transition-transform duration-300 ${
                            isSoldOut ? "grayscale" : ""
                          }`}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const placeholder =
                              target.nextElementSibling as HTMLElement;
                            if (placeholder) placeholder.style.display = "flex";
                          }}
                        />
                      ) : null}

                      {/* Placeholder para imagem ausente */}
                      <div
                        className={`w-full h-full flex items-center justify-center bg-gray-200 ${
                          product.image ? "hidden" : "flex"
                        }`}
                        style={{ display: product.image ? "none" : "flex" }}
                      >
                        <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-gray-400" />
                      </div>

                      {isSoldOut && (
                        <span className="absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-md bg-black/70 text-white">
                          Esgotado
                        </span>
                      )}
                    </div>

                    {/* Conteúdo - flex-grow para ocupar espaço restante */}
                    <div className="p-2 sm:p-3 lg:p-4 flex flex-col flex-grow">
                      {/* Título com altura fixa */}
                      <h3
                        data-testid="product-name"
                        className="text-xs sm:text-sm lg:text-base font-semibold text-gray-900 line-clamp-2 h-8 sm:h-10 lg:h-12 flex items-start leading-tight"
                      >
                        {product.name}
                      </h3>

                      {/* Descrição com altura fixa */}
                      <div className="h-6 sm:h-8 lg:h-10 mt-1 mb-2">
                        {(product?.subtitle || product?.description) && (
                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-tight">
                            {product?.subtitle || product?.description}
                          </p>
                        )}
                      </div>

                      {/* Seção inferior - preço e botão */}
                      <div className="mt-auto flex flex-col gap-1.5 sm:gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">
                            R$ {formatPrice(product.price)}
                          </span>

                          {product?.preparationTime && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                              <Clock className="h-3 w-3" />
                              {product.preparationTime}min
                            </span>
                          )}
                        </div>

                        <button
                          data-testid="add-to-cart"
                          onClick={() => handleAddToCart(product)}
                          disabled={!isOpen || isSoldOut}
                          className="w-full px-2 py-2 sm:py-2.5 lg:py-3 text-white rounded-md text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all duration-300 hover:scale-105 flex items-center justify-center min-h-[36px]"
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
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Menu inferior Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-xl z-[60] md:hidden backdrop-blur-sm bg-white/95">
        <div className="flex items-center justify-around px-1 py-1 safe-area-inset-bottom">
          <button className="flex flex-col items-center py-2 px-1 min-w-0 flex-1 transition-colors hover:bg-gray-50 rounded-lg">
            <House className="h-5 w-5 mb-1" style={{ color: primary }} />
            <span
              className="text-xs font-medium leading-none"
              style={{ color: primary }}
            >
              Início
            </span>
          </button>

          <button
            onClick={() => setIsOrdersModalOpen(true)}
            className="flex flex-col items-center py-2 px-1 min-w-0 flex-1 transition-colors hover:bg-gray-50 rounded-lg"
          >
            <Receipt className="h-5 w-5 mb-1 text-gray-500" />
            <span className="text-xs font-medium text-gray-500 leading-none">
              Pedidos
            </span>
          </button>

          <button
            data-testid="cart-button"
            onClick={() => setIsCartModalOpen(true)}
            className="flex flex-col items-center py-2 px-1 min-w-0 flex-1 relative transition-colors hover:bg-gray-50 rounded-lg"
          >
            <ShoppingCart className="h-5 w-5 mb-1 text-gray-500" />
            <span className="text-xs font-medium text-gray-500 leading-none">
              Carrinho
            </span>
            {cart.itemCount > 0 && (
              <span
                data-testid="cart-count"
                className="absolute -top-1 -right-1 min-w-[18px] h-4.5 flex items-center justify-center text-xs font-bold text-white rounded-full shadow-lg"
                style={{ backgroundColor: primary }}
              >
                {cart.itemCount > 99 ? "99+" : cart.itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Espaço para o menu fixo */}
      <div className="h-20 md:hidden safe-area-inset-bottom" />

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

      <PhoneLoginModal
        isOpen={isPhoneLoginModalOpen}
        onClose={() => setIsPhoneLoginModalOpen(false)}
        onSuccess={(authData) => {
          if (authData) {
            loginCustomer(authData.phone, authData.name);
            showToast(
              `Bem-vindo, ${authData.name || authData.phone}!`,
              "success"
            );
          }
          setIsPhoneLoginModalOpen(false);
        }}
        storeSlug={slug}
      />

      <ProductCustomizationModal
        product={selectedProductForCustomization}
        isOpen={isCustomizationModalOpen}
        onClose={() => {
          setIsCustomizationModalOpen(false);
          setSelectedProductForCustomization(null);
        }}
        onAddToCart={handleCustomizedAddToCart}
        primaryColor={config?.branding?.primaryColor}
      />
    </div>
  );
}

// Export usando dynamic para evitar problemas de hidratação
const StorePage = dynamic(() => Promise.resolve(StorePageContent), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando loja...</p>
      </div>
    </div>
  ),
});

export default StorePage;
