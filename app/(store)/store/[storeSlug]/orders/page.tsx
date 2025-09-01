"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FunnelSimple, MagnifyingGlass } from "@phosphor-icons/react";
import { usePublicOrders } from "../../../../../hooks/usePublicOrders";
import { useCart } from "../../../../../hooks/useCart";
import { useAuthContext } from "../../../../../contexts/AuthContext";
import { useStoreConfig } from "../../../../../lib/store/useStoreConfig";
import OrderCard from "../../../../../components/cart/OrderCard";
import { Order, OrderStatus } from "../../../../../types/cardapio-api";

type StatusFilter = "all" | "in_progress" | "finished" | "cancelled";

const statusFilterMap: Record<StatusFilter, string> = {
  all: "Todos",
  in_progress: "Em andamento", 
  finished: "Finalizados",
  cancelled: "Cancelados"
};

const getOrdersByStatus = (orders: Order[], filter: StatusFilter): Order[] => {
  switch (filter) {
    case "in_progress":
      return orders.filter(order => [
        OrderStatus.RECEIVED,
        OrderStatus.CONFIRMED,
        OrderStatus.PREPARING,
        OrderStatus.READY,
        OrderStatus.DELIVERING
      ].includes(order.status));
    case "finished":
      return orders.filter(order => order.status === OrderStatus.DELIVERED);
    case "cancelled":
      return orders.filter(order => order.status === OrderStatus.CANCELLED);
    default:
      return orders;
  }
};

export default function OrdersPage() {
  const params = useParams();
  const router = useRouter();
  const storeSlug = params.storeSlug as string;
  
  const { orders, loading, refreshOrders } = usePublicOrders(storeSlug);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuthContext();
  const { config: storeConfig } = useStoreConfig(storeSlug);
  
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    refreshOrders();
  }, []);

  const filteredOrders = getOrdersByStatus(orders, statusFilter).filter(order => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(query) ||
      order.items.some(item => item.name.toLowerCase().includes(query))
    );
  });

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleRepeatOrder = (order: Order) => {
    // Adicionar todos os itens do pedido ao carrinho
    order.items.forEach(item => {
      // Buscar produto completo seria ideal, mas por ora usamos os dados do item
      const product = {
        id: item.productId,
        name: item.name,
        price: item.price,
        description: "",
        categoryId: "",
        image: "",
        active: true,
        storeSlug: storeSlug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ingredients: [],
        addons: [],
        tags: [],
        tagColor: null
      } as any; // Type assertion para evitar problemas de tipagem
      
      addToCart(product, item.quantity);
    });

    // Mostrar toast de sucesso
    showToast("Itens adicionados ao carrinho!", "success");
    
    // Redirecionar para a página da loja
    router.push(`/store/${storeSlug}`);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Redirecionar para login
      router.push(`/login?redirect=/store/${storeSlug}/checkout`);
      return;
    }
    
    // Prosseguir para checkout
    router.push(`/store/${storeSlug}/checkout`);
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 transform translate-x-full`;
    toast.style.backgroundColor = type === "success" ? "#10b981" : "#ef4444";
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.transform = "translate-x-0";
    }, 100);
    
    setTimeout(() => {
      toast.style.transform = "translate-x-full";
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  const primaryColor = storeConfig?.branding?.primaryColor || "#f97316";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold">Meus Pedidos</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Filtros e Busca */}
        <div className="space-y-4 mb-6">
          {/* Filtros por Status */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Object.entries(statusFilterMap).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key as StatusFilter)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  statusFilter === key
                    ? "text-white"
                    : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                }`}
                style={{
                  backgroundColor: statusFilter === key ? primaryColor : undefined
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Busca */}
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número do pedido ou produto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Lista de Pedidos */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-orange-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FunnelSimple className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "Nenhum pedido encontrado" : "Nenhum pedido nesta categoria"}
            </h3>
            <p className="text-gray-600">
              {searchQuery 
                ? "Tente ajustar sua busca ou filtros" 
                : "Seus pedidos aparecerão aqui após serem realizados"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                primaryColor={primaryColor}
                onViewDetails={handleViewDetails}
                onRepeatOrder={handleRepeatOrder}
              />
            ))}
          </div>
        )}

        {/* Contador de Resultados */}
        {filteredOrders.length > 0 && (
          <div className="text-center mt-6 text-sm text-gray-600">
            {filteredOrders.length} pedido(s) encontrado(s)
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Pedido */}
      {showOrderDetails && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={showOrderDetails}
          onClose={() => setShowOrderDetails(false)}
          primaryColor={primaryColor}
        />
      )}
    </div>
  );
}

// Modal de Detalhes do Pedido (componente simples por enquanto)
function OrderDetailsModal({ 
  order, 
  isOpen, 
  onClose, 
  primaryColor 
}: { 
  order: Order; 
  isOpen: boolean; 
  onClose: () => void; 
  primaryColor: string; 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Detalhes do Pedido</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Informações do Pedido</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Número:</strong> #{order.orderNumber}</p>
                  <p><strong>Data:</strong> {new Date(order.createdAt).toLocaleString('pt-BR')}</p>
                  <p><strong>Status:</strong> {order.status}</p>
                  <p><strong>Tipo:</strong> {order.type}</p>
                  <p><strong>Pagamento:</strong> {order.paymentMethod}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Itens do Pedido</h3>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">Qtd: {item.quantity}</p>
                      </div>
                      <p className="font-medium">R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-lg" style={{ color: primaryColor }}>
                    R$ {order.total.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>

              {order.notes && (
                <div>
                  <h3 className="font-medium mb-2">Observações</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
