export enum IfoodIntegrationType {
  FULL_INTEGRATION = 'full_integration',
  ORDER_SYNC_ONLY = 'order_sync_only',
  MENU_SYNC_ONLY = 'menu_sync_only',
  DISABLED = 'disabled'
}

export enum IfoodOrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED'
}

export interface IfoodMenuConfig {
  autoSync?: boolean;
  syncInterval?: number;
  syncPrices?: boolean;
  syncAvailability?: boolean;
  syncCategories?: boolean;
  excludedCategories?: string[];
  excludedProducts?: string[];
}

export interface IfoodOrderConfig {
  autoAccept?: boolean;
  autoConfirm?: boolean;
  maxPreparationTime?: number;
  maxDeliveryTime?: number;
  syncOrderStatus?: boolean;
  sendNotifications?: boolean;
  acceptedPaymentMethods?: string[];
  minimumOrderValue?: number;
  deliveryFee?: number;
}

export interface IfoodConfig {
  integrationType?: IfoodIntegrationType;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  merchantId?: string;
  storeId?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  sandboxMode?: boolean;
  menu?: IfoodMenuConfig;
  orders?: IfoodOrderConfig;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  cnpj?: string;
  operatingHours?: string;
  active?: boolean;
  lastSync?: string;
  syncStatus?: string;
}

export interface IfoodProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  preparationTime: number;
  imageUrl?: string;
}

export interface IfoodOrder {
  id: string;
  number: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    notes?: string;
  }>;
  total: number;
  deliveryFee: number;
  status: IfoodOrderStatus;
  paymentMethod: string;
  estimatedDeliveryTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface IfoodWebhookEvent {
  id: string;
  type: string;
  timestamp: string;
  data: any;
}

export interface IfoodTestResult {
  success: boolean;
  error?: string;
  message?: string;
}

export interface IfoodSyncResult {
  success: boolean;
  synced: number;
  error?: string;
  message?: string;
}

export interface IfoodConfigResponse {
  success: boolean;
  data?: IfoodConfig;
  message?: string;
}

export interface IfoodStatusResponse {
  success: boolean;
  data?: {
    active: boolean;
    lastSync: string | null;
    syncStatus: string;
    integrationType: IfoodIntegrationType;
  };
  message?: string;
}

// Tipos para formulários
export interface IfoodConfigFormData {
  integrationType: IfoodIntegrationType;
  clientId: string;
  clientSecret: string;
  merchantId: string;
  storeId: string;
  webhookUrl: string;
  webhookSecret: string;
  sandboxMode: boolean;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  cnpj: string;
  operatingHours: string;
  active: boolean;
  menu: IfoodMenuConfig;
  orders: IfoodOrderConfig;
}

// Constantes para tipos de integração
export const IFOOD_INTEGRATION_TYPE_LABELS: Record<IfoodIntegrationType, string> = {
  [IfoodIntegrationType.FULL_INTEGRATION]: 'Integração Completa',
  [IfoodIntegrationType.ORDER_SYNC_ONLY]: 'Sincronização de Pedidos',
  [IfoodIntegrationType.MENU_SYNC_ONLY]: 'Sincronização de Menu',
  [IfoodIntegrationType.DISABLED]: 'Desabilitado',
};

export const IFOOD_INTEGRATION_TYPE_DESCRIPTIONS: Record<IfoodIntegrationType, string> = {
  [IfoodIntegrationType.FULL_INTEGRATION]: 'Sincroniza menu e pedidos automaticamente',
  [IfoodIntegrationType.ORDER_SYNC_ONLY]: 'Apenas sincroniza pedidos recebidos',
  [IfoodIntegrationType.MENU_SYNC_ONLY]: 'Apenas sincroniza produtos do menu',
  [IfoodIntegrationType.DISABLED]: 'Integração desabilitada',
};

// Configurações padrão
export const DEFAULT_IFOOD_MENU_CONFIG: IfoodMenuConfig = {
  autoSync: true,
  syncInterval: 30,
  syncPrices: true,
  syncAvailability: true,
  syncCategories: true,
  excludedCategories: [],
  excludedProducts: [],
};

export const DEFAULT_IFOOD_ORDER_CONFIG: IfoodOrderConfig = {
  autoAccept: false,
  autoConfirm: false,
  maxPreparationTime: 45,
  maxDeliveryTime: 60,
  syncOrderStatus: true,
  sendNotifications: true,
  acceptedPaymentMethods: ['CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'CASH'],
  minimumOrderValue: 0,
  deliveryFee: 0,
};

export const DEFAULT_IFOOD_CONFIG: IfoodConfig = {
  integrationType: IfoodIntegrationType.DISABLED,
  clientId: '',
  clientSecret: '',
  merchantId: '',
  storeId: '',
  webhookUrl: '',
  webhookSecret: '',
  sandboxMode: true,
  businessName: '',
  businessAddress: '',
  businessPhone: '',
  businessEmail: '',
  cnpj: '',
  operatingHours: '',
  active: false,
  lastSync: '',
  syncStatus: 'not_configured',
  menu: DEFAULT_IFOOD_MENU_CONFIG,
  orders: DEFAULT_IFOOD_ORDER_CONFIG,
};
