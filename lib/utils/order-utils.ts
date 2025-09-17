import { OrderStatus, PaymentStatus } from "@/types/cardapio-api";
import { PaymentStatusInfo, StatusInfo } from "@/types/order";
import {
  CheckCircle,
  Clock,
  Package,
  Truck,
  XCircle,
} from "@phosphor-icons/react";

export const getStatusInfo = (status: OrderStatus): StatusInfo => {
  const statusMap = {
    [OrderStatus.RECEIVED]: {
      label: "Pendente",
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
    },
    [OrderStatus.CONFIRMED]: {
      label: "Confirmado",
      color: "bg-blue-100 text-blue-800",
      icon: CheckCircle,
    },
    [OrderStatus.PREPARING]: {
      label: "Preparando",
      color: "bg-orange-100 text-orange-800",
      icon: Package,
    },
    [OrderStatus.READY]: {
      label: "Pronto",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
    },
    [OrderStatus.DELIVERING]: {
      label: "Saiu para Entrega",
      color: "bg-purple-100 text-purple-800",
      icon: Truck,
    },
    [OrderStatus.DELIVERED]: {
      label: "Entregue",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
    },
    [OrderStatus.CANCELLED]: {
      label: "Cancelado",
      color: "bg-red-100 text-red-800",
      icon: XCircle,
    },
  };
  return statusMap[status];
};

export const getPaymentStatusInfo = (
  status: PaymentStatus
): PaymentStatusInfo => {
  const statusMap = {
    [PaymentStatus.PENDING]: {
      label: "Pendente",
      color: "bg-yellow-100 text-yellow-800",
    },
    [PaymentStatus.PAID]: {
      label: "Pago",
      color: "bg-green-100 text-green-800",
    },
    [PaymentStatus.FAILED]: {
      label: "Falhou",
      color: "bg-red-100 text-red-800",
    },
    [PaymentStatus.REFUNDED]: {
      label: "Reembolsado",
      color: "bg-gray-100 text-gray-800",
    },
  };
  return statusMap[status];
};

export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue)) return "R$ 0,00";
  return `R$ ${numValue.toFixed(2).replace(".", ",")}`;
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const calculateOrderStats = (orders: any[]): any => {
  return {
    total: orders.length,
    pending: orders.filter((o: any) => o.status === OrderStatus.RECEIVED)
      .length,
    preparing: orders.filter((o: any) => o.status === OrderStatus.PREPARING)
      .length,
    ready: orders.filter((o: any) => o.status === OrderStatus.READY).length,
    delivering: orders.filter((o: any) => o.status === OrderStatus.DELIVERING)
      .length,
    delivered: orders.filter((o: any) => o.status === OrderStatus.DELIVERED)
      .length,
    cancelled: orders.filter((o: any) => o.status === OrderStatus.CANCELLED)
      .length,
  };
};

export const filterOrders = (
  orders: any[],
  searchTerm: string,
  selectedStatus: string,
  selectedPaymentStatus: string
): any[] => {
  return orders.filter((order: any) => {
    const matchesSearch =
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.phone?.includes(searchTerm);

    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;
    const matchesPaymentStatus =
      selectedPaymentStatus === "all" ||
      order.paymentStatus === selectedPaymentStatus;

    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });
};
