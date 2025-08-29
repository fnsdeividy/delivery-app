import {
  Clock,
  MagnifyingGlass,
  Phone,
  ShoppingCart,
  Storefront,
  Truck,
  User,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import PromotionsBanner from "../../../../components/PromotionsBanner";
import { Product } from "../../../../types/cardapio-api";

interface PageProps {
  params: {
    storeSlug: string;
  };
}

// Função helper para formatar preço
const formatPrice = (price: any): string => {
  if (price === null || price === undefined) return "0,00";

  // Se for string, converter para número
  if (typeof price === "string") {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? "0,00" : numPrice.toFixed(2).replace(".", ",");
  }

  // Se for número, usar toFixed e substituir ponto por vírgula
  if (typeof price === "number") {
    return price.toFixed(2).replace(".", ",");
  }

  // Se for objeto Decimal do Prisma, usar toString
  if (price && typeof price === "object" && "toString" in price) {
    const numPrice = parseFloat(price.toString());
    return isNaN(numPrice) ? "0,00" : numPrice.toFixed(2).replace(".", ",");
  }

  return "0,00";
};

async function getStoreConfig(slug: string) {
  try {
    const response = await fetch(
      `http://localhost:3001/api/store-public/${slug}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Loja não encontrada");
    }

    const data = await response.json();

    // Mapear resposta da API para StoreConfig
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
        primaryColor: data.config?.primaryColor || "#f97316",
        secondaryColor: data.config?.secondaryColor || "#ea580c",
        backgroundColor: data.config?.backgroundColor || "#ffffff",
        textColor: data.config?.textColor || "#000000",
        accentColor: data.config?.accentColor || "#f59e0b",
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

export default async function StorePage({ params }: PageProps) {
  const { storeSlug: slug } = params;

  console.log(`🏪 StorePage render - slug: ${slug}, params:`, params);

  let config;
  let error: string | null = null;

  try {
    config = await getStoreConfig(slug);
  } catch (err) {
    error = err instanceof Error ? err.message : "Erro desconhecido";
  }

  // Determinar se a loja está aberta
  const isOpen = config?.status?.isOpen || false;
  const currentMessage = config?.status?.reason || "Loja fechada";

  // Estado estático para demonstração
  const status = "unauthenticated";
  const session = null;
  const searchQuery = "";
  const selectedCategory = "todos";
  const searchResults = null;
  const cartItems: any[] = [];
  const isCartOpen = false;
  const isProfileOpen = false;
  const isLoginOpen = false;

  // Promoções de exemplo (em produção viriam do banco/config)
  const promotions = [
    {
      id: "1",
      title: "🎉 Primeira Compra",
      description: "10% de desconto na primeira compra com cupom PRIMEIRA10",
      type: "discount" as const,
      value: 10,
      validUntil: "2025-12-31",
      active: true,
    },
    {
      id: "2",
      title: "🚚 Entrega Grátis",
      description: "Entrega grátis em pedidos acima de R$ 30,00",
      type: "free_delivery" as const,
      value: 5,
      validUntil: "2025-12-31",
      active: true,
    },
  ];

  // Filtrar produtos - versão simplificada para Server Component
  const filteredProducts =
    config?.menu?.products?.filter((p: any) => p.active) || [];

  const addToCart = (product: Product) => {
    // Função estática para demonstração
    console.log("Produto adicionado ao carrinho:", product.name);
  };

  // Mostrar erro se a loja não for encontrada
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

  // Loading state - removido pois não há mais loading state

  // Error state
  if (error || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Loja não encontrada
          </h1>
          <p className="text-gray-600 mb-4">
            {error ||
              "Esta loja não existe ou está temporariamente indisponível."}
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

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: config?.branding?.backgroundColor || "#ffffff",
        color: config?.branding?.textColor || "#000000",
      }}
    >
      {/* Promotions Banner */}
      <PromotionsBanner promotions={promotions} />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 animate-slide-in-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo e Nome */}
            <div className="flex items-center space-x-4 animate-slide-in-left">
              {config?.branding?.logo && (
                <img
                  src={config.branding.logo}
                  alt={config.name}
                  className="h-10 w-auto hover-scale"
                />
              )}
              <h1
                className="text-2xl font-bold animate-float"
                style={{ color: config?.branding?.primaryColor || "#000" }}
              >
                {config.name}
              </h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8 animate-fade-in animate-delay-200">
              <div className="relative">
                <MagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  defaultValue=""
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:bg-white search-focus transition-all duration-300"
                  style={
                    {
                      "--tw-ring-color":
                        config?.branding?.primaryColor || "#f97316",
                    } as any
                  }
                  readOnly
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4 animate-slide-in-right">
              {/* Login/Profile Button */}
              <button
                className="flex items-center space-x-2 hover:opacity-75 transition-all duration-300 hover-lift"
                style={{ color: config?.branding?.primaryColor || "#f97316" }}
                title="Fazer Login"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:block">Login</span>
              </button>

              {/* Cart Button */}
              <button
                className="flex items-center space-x-2 hover:opacity-75 transition-all duration-300 relative hover-lift"
                style={{ color: config?.branding?.primaryColor || "#f97316" }}
              >
                <ShoppingCart className="h-5 w-5 transition-transform" />
                <span className="hidden sm:block">Carrinho</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Banner */}
      {config?.branding?.banner && (
        <div className="relative h-48 md:h-64 overflow-hidden animate-fade-in">
          <img
            src={config.branding.banner}
            alt={config.name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white animate-scale-in animate-delay-300">
              <h2 className="text-3xl md:text-4xl font-bold mb-2 animate-slide-in-top animate-delay-500">
                {config.name}
              </h2>
              <p className="text-lg animate-slide-in-top animate-delay-700">
                {config.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status da Loja
      {!isOpen && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 text-center animate-slide-in-top animate-shake">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="h-5 w-5 animate-pulse" />
            <span>{currentMessage}</span>
          </div>
        </div>
      )} */}

      {/* Info da Loja */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              {config?.business?.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{config.business.phone}</span>
                </div>
              )}
              {config?.delivery?.enabled && (
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    Entrega: R${" "}
                    {config.delivery.fee?.toFixed(2).replace(".", ",") ||
                      "0,00"}
                    {config.delivery.freeDeliveryMinimum && (
                      <span className="text-green-600">
                        {" "}
                        (Grátis acima de R${" "}
                        {config.delivery.freeDeliveryMinimum
                          .toFixed(2)
                          .replace(".", ",")}
                        )
                      </span>
                    )}
                  </span>
                </div>
              )}
              {config?.delivery?.estimatedTime && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {config.delivery.estimatedTime} min
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <section className="bg-white border-b animate-slide-in-left animate-delay-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 py-4 overflow-x-auto">
            <div className="flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap bg-gray-100 text-gray-700">
              <span className="font-medium">Todos</span>
              <span className="text-sm opacity-75">
                (
                {config?.menu?.products?.filter((p: any) => p.active).length ||
                  0}
                )
              </span>
            </div>

            {config?.menu?.categories
              ?.filter((c: any) => c.active)
              .map((category: any) => {
                const count =
                  config?.menu?.products?.filter(
                    (p: any) => p.active && p.categoryId === category.id
                  ).length || 0;
                return (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap bg-gray-100 text-gray-700"
                  >
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm opacity-75">({count})</span>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Info */}
          <div className="mb-6">
            <p className="text-gray-600">
              {filteredProducts.length} produto
              {filteredProducts.length !== 1 ? "s" : ""} encontrado
              {filteredProducts.length !== 1 ? "s" : ""}
              {selectedCategory !== "todos" &&
                ` em ${
                  config?.menu?.categories?.find(
                    (c: any) => c.id === selectedCategory
                  )?.name
                }`}
              {searchQuery && ` para "${searchQuery}"`}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product: any, index: number) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden card-hover stagger-item"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover transition-transform duration-500 hover:scale-110"
                    />

                    {/* Tags */}
                    <div className="absolute top-3 left-3 flex flex-col space-y-1">
                      {/* Tags removidas - não existem no tipo Product */}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    {/* Name and Rating */}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {product.name}
                      </h3>
                      {product.preparationTime && (
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">
                            {product.preparationTime}min
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Ingredients */}
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {/* Ingredients removidos - não existem no tipo Product */}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          R$ {formatPrice(product.price)}
                        </span>
                        {/* Preço original removido - não existe no tipo Product */}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      disabled={!isOpen}
                      className="w-full px-4 py-2 text-white rounded-lg btn-primary text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      style={{
                        backgroundColor: isOpen
                          ? config?.branding?.primaryColor || "#f97316"
                          : "#9ca3af",
                      }}
                    >
                      {isOpen ? "+ Adicionar ao Carrinho" : "Loja Fechada"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2 animate-slide-in-top">
              {config.name}
            </h3>
            <p className="text-gray-400 mb-4 animate-slide-in-top animate-delay-200">
              {config.description}
            </p>
            <div className="flex justify-center space-x-4 animate-slide-in-top animate-delay-300">
              {/* Social media removido - não existe no tipo business */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
