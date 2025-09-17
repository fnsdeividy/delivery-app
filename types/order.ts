export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface OrderItemCustomizations {
  removedIngredients: string[];
  addons: Array<{ name: string; price: number; quantity: number }>;
  observations?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  notes?: string;
  customizations?: OrderItemCustomizations;
}

export interface Order {
  id: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  deliveryType: "delivery" | "pickup" | "table";
  total: number;
  subtotal: number;
  deliveryFee: number;
  createdAt: string;
  customer: OrderCustomer;
  items: OrderItem[];
  deliveryAddress?: string;
  notes?: string;
}

export interface OrderStats {
  total: number;
  pending: number;
  preparing: number;
  ready: number;
  delivering: number;
  delivered: number;
  cancelled: number;
}

export interface StatusInfo {
  label: string;
  color: string;
  icon: any;
}

export interface PaymentStatusInfo {
  label: string;
  color: string;
}
