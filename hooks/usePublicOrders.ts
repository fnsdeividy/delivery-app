import { useState, useEffect } from 'react';
import { Order, CreateOrderDto } from '../types/cardapio-api';

export function usePublicOrders(storeSlug: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar pedidos do localStorage (simulando API para clientes não autenticados)
  useEffect(() => {
    const loadOrders = () => {
      try {
        const savedOrders = localStorage.getItem(`orders-${storeSlug}`);
        if (savedOrders) {
          const parsedOrders = JSON.parse(savedOrders);
          setOrders(parsedOrders);
        }
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
      }
    };

    loadOrders();
  }, [storeSlug]);

  const createOrder = async (orderData: CreateOrderDto): Promise<Order> => {
    setLoading(true);
    
    try {
      // Simular criação de pedido (para clientes não autenticados)
      const newOrder: Order = {
        id: `order-${Date.now()}`,
        orderNumber: `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
        subtotal: orderData.subtotal,
        deliveryFee: orderData.deliveryFee,
        discount: orderData.discount || 0,
        total: orderData.total,
        status: 'RECEIVED' as any,
        type: orderData.type,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: 'PENDING' as any,
        customerId: orderData.customerId,
        customer: {
          id: orderData.customerId,
          name: 'Cliente',
          phone: '',
          storeSlug,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        storeSlug: orderData.storeSlug,
        items: orderData.items.map(item => ({
          id: `item-${Date.now()}-${Math.random()}`,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          productId: item.productId,
          product: {
            id: item.productId,
            name: item.name,
            price: item.price
          } as any,
          customizations: item.customizations,
          createdAt: new Date().toISOString()
        })),
        notes: orderData.notes,
        estimatedDeliveryTime: orderData.estimatedDeliveryTime?.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Salvar no localStorage
      const currentOrders = [...orders, newOrder];
      setOrders(currentOrders);
      localStorage.setItem(`orders-${storeSlug}`, JSON.stringify(currentOrders));

      return newOrder;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = () => {
    try {
      const savedOrders = localStorage.getItem(`orders-${storeSlug}`);
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        setOrders(parsedOrders);
      }
    } catch (error) {
      console.error('Erro ao atualizar pedidos:', error);
    }
  };

  return {
    orders,
    loading,
    createOrder,
    refreshOrders
  };
}
