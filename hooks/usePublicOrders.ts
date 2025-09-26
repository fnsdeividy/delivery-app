import { useEffect, useState } from "react";
import { apiClient } from "../lib/api-client";
import { CreateOrderDto, Order } from "../types/cardapio-api";

export function usePublicOrders(storeSlug: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar pedidos da API
  useEffect(() => {
    const loadOrders = async (retryCount = 0) => {
      try {
        setLoading(true);
        const orders = await apiClient.getPublicOrders(storeSlug);
        setOrders(orders);
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error);

        // Retry automático para erros de timeout
        if (
          retryCount < 2 &&
          (error as Error).message?.includes("Tempo limite")
        ) {
          console.log(`🔄 Tentativa ${retryCount + 1}/3 para carregar pedidos`);
          setTimeout(() => loadOrders(retryCount + 1), 2000);
          return;
        }

        // Fallback para localStorage em caso de erro
        try {
          const savedOrders = localStorage.getItem(`orders-${storeSlug}`);
          if (savedOrders) {
            const parsedOrders = JSON.parse(savedOrders);
            setOrders(parsedOrders);
          }
        } catch (localError) {
          console.error(
            "Erro ao carregar pedidos do localStorage:",
            localError
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (storeSlug) {
      loadOrders();
    }
  }, [storeSlug]);

  const createOrder = async (orderData: CreateOrderDto): Promise<Order> => {
    setLoading(true);

    try {
      // Criar pedido via API real
      const newOrder = await apiClient.createPublicOrder(orderData, storeSlug);

      // Atualizar lista local
      setOrders((prevOrders) => [...prevOrders, newOrder]);

      // Salvar backup no localStorage
      const currentOrders = [...orders, newOrder];
      localStorage.setItem(
        `orders-${storeSlug}`,
        JSON.stringify(currentOrders)
      );

      return newOrder;
    } catch (error) {
      console.error("Erro ao criar pedido:", error);

      // Fallback: criar pedido local em caso de erro da API
      const fallbackOrder: Order = {
        id: `order-${Date.now()}`,
        orderNumber: `${new Date()
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, "")}${String(
          Math.floor(Math.random() * 9999)
        ).padStart(4, "0")}`,
        subtotal: orderData.subtotal,
        deliveryFee: orderData.deliveryFee,
        discount: orderData.discount || 0,
        total: orderData.total,
        status: "RECEIVED" as any,
        type: orderData.type,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: "PENDING" as any,
        customerId: orderData.customerId,
        customer: {
          id: orderData.customerId,
          name: "Cliente",
          phone: "",
          storeSlug,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        storeSlug: orderData.storeSlug,
        items: orderData.items.map((item) => ({
          id: `item-${Date.now()}-${Math.random()}`,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          productId: item.productId,
          product: {
            id: item.productId,
            name: item.name,
            price: item.price,
          } as any,
          customizations: item.customizations,
          createdAt: new Date().toISOString(),
        })),
        notes: orderData.notes,
        estimatedDeliveryTime: orderData.estimatedDeliveryTime?.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Salvar no localStorage como fallback
      const currentOrders = [...orders, fallbackOrder];
      setOrders(currentOrders);
      localStorage.setItem(
        `orders-${storeSlug}`,
        JSON.stringify(currentOrders)
      );

      return fallbackOrder;
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = async (retryCount = 0) => {
    try {
      setLoading(true);
      const orders = await apiClient.getPublicOrders(storeSlug);
      setOrders(orders);
    } catch (error) {
      console.error("Erro ao atualizar pedidos:", error);

      // Retry automático para erros de timeout
      if (
        retryCount < 2 &&
        (error as Error).message?.includes("Tempo limite")
      ) {
        console.log(`🔄 Tentativa ${retryCount + 1}/3 para atualizar pedidos`);
        setTimeout(() => refreshOrders(retryCount + 1), 2000);
        return;
      }

      // Fallback para localStorage
      try {
        const savedOrders = localStorage.getItem(`orders-${storeSlug}`);
        if (savedOrders) {
          const parsedOrders = JSON.parse(savedOrders);
          setOrders(parsedOrders);
        }
      } catch (localError) {
        console.error("Erro ao carregar pedidos do localStorage:", localError);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    orders,
    loading,
    createOrder,
    refreshOrders,
  };
}
