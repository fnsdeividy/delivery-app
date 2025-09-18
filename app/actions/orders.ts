"use server";

import { apiClientServer } from "@/lib/api-client-server";
import { OrderStatus, OrderType, PaymentStatus } from "@/types/cardapio-api";
import { revalidatePath } from "next/cache";

export interface CreateOrderActionData {
  storeSlug: string;
  customerName: string;
  customerPhone: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    customizations: {
      removedIngredients: string[];
      addons: Array<{ name: string; price: number; quantity: number }>;
      observations?: string;
    };
  }>;
  total: number;
  deliveryFee: number;
  notes?: string;
}

export interface UpdateOrderActionData {
  orderId: string;
  status: OrderStatus;
  notes?: string;
  storeSlug: string;
}

export async function createOrderAction(data: CreateOrderActionData) {
  try {
    const order = await apiClientServer.createOrder({
      customerId: data.customerPhone, // Usando phone como ID temporário
      storeSlug: data.storeSlug,
      items: data.items,
      type: OrderType.DELIVERY, // Tipo padrão
      deliveryAddress: "", // Endereço será preenchido pelo cliente
      notes: data.notes,
      paymentMethod: "PIX", // Método padrão
      paymentStatus: PaymentStatus.PENDING,
      subtotal: data.total - data.deliveryFee,
      deliveryFee: data.deliveryFee,
      discount: 0,
      total: data.total,
    });

    // Notificar via SSE
    const { notifyNewOrder } = await import("@/lib/sse-notifications");
    notifyNewOrder(data.storeSlug, order);

    // Revalidar cache
    revalidatePath(`/dashboard/${data.storeSlug}/pedidos`);
    revalidatePath(`/dashboard/${data.storeSlug}`);

    return { success: true, order };
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function updateOrderAction(data: UpdateOrderActionData) {
  try {
    // Usar endpoint público de atualização de status com storeSlug para garantir persistência
    const order = await apiClientServer.patch<Order>(
      `/orders/public/${data.orderId}/status?storeSlug=${encodeURIComponent(
        data.storeSlug
      )}`,
      { status: data.status }
    );

    // Notificar via SSE
    const { notifyOrderUpdate } = await import("@/lib/sse-notifications");
    notifyOrderUpdate(order.storeSlug, data.orderId, order);

    // Revalidar cache
    revalidatePath(`/dashboard/${data.storeSlug}/pedidos`);
    revalidatePath(`/dashboard/${data.storeSlug}`);

    return { success: true, order };
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function cancelOrderAction(orderId: string, storeSlug: string) {
  try {
    const order = await apiClientServer.updateOrder(orderId, {
      status: OrderStatus.CANCELLED,
    });

    // Notificar via SSE
    const { notifyOrderCancel } = await import("@/lib/sse-notifications");
    notifyOrderCancel(storeSlug, orderId);

    // Revalidar cache
    revalidatePath(`/dashboard/${storeSlug}/pedidos`);
    revalidatePath(`/dashboard/${storeSlug}`);

    return { success: true, order };
  } catch (error) {
    console.error("Erro ao cancelar pedido:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function getOrdersAction(
  storeSlug: string,
  page: number = 1,
  limit: number = 10
) {
  try {
    const orders = await apiClientServer.getOrders(storeSlug, page, limit);
    return { success: true, orders };
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
