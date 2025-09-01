export enum WhatsAppMessageType {
  WELCOME = 'welcome',
  ORDER_CONFIRMATION = 'order_confirmation',
  ORDER_READY = 'order_ready',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled',
  CUSTOM = 'custom'
}

export interface WhatsAppMessageTemplate {
  type: WhatsAppMessageType;
  message: string;
  enabled?: boolean;
  variables?: string[];
}

export interface WhatsAppConfig {
  enabled?: boolean;
  phoneNumber?: string;
  businessAccountId?: string;
  accessToken?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  autoSendMessages?: boolean;
  sendOrderNotifications?: boolean;
  sendCustomerMessages?: boolean;
  messageTemplates?: WhatsAppMessageTemplate[];
  messageDelay?: number;
  businessName?: string;
  businessDescription?: string;
  businessAddress?: string;
  businessHours?: string;
  requireCustomerConsent?: boolean;
  consentMessage?: string;
  allowedMessageTypes?: WhatsAppMessageType[];
}

export interface WhatsAppMessage {
  to: string;
  type: WhatsAppMessageType;
  message: string;
  variables?: Record<string, string>;
  templateId?: string;
}

export interface WhatsAppWebhookEvent {
  id: string;
  timestamp: string;
  type: string;
  from: string;
  to: string;
  message?: {
    id: string;
    type: string;
    text?: {
      body: string;
    };
  };
  status?: {
    id: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    timestamp: string;
  };
}

export interface WhatsAppTestResult {
  success: boolean;
  error?: string;
  message?: string;
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  message?: string;
}

export interface WhatsAppConfigResponse {
  success: boolean;
  data?: WhatsAppConfig;
  message?: string;
}

export interface WhatsAppTemplatesResponse {
  success: boolean;
  data?: WhatsAppMessageTemplate[];
  message?: string;
}

// Tipos para formulários
export interface WhatsAppConfigFormData {
  enabled: boolean;
  phoneNumber: string;
  businessAccountId: string;
  accessToken: string;
  webhookUrl: string;
  webhookSecret: string;
  autoSendMessages: boolean;
  sendOrderNotifications: boolean;
  sendCustomerMessages: boolean;
  messageDelay: number;
  businessName: string;
  businessDescription: string;
  businessAddress: string;
  businessHours: string;
  requireCustomerConsent: boolean;
  consentMessage: string;
  allowedMessageTypes: WhatsAppMessageType[];
  messageTemplates: WhatsAppMessageTemplate[];
}

export interface WhatsAppMessageFormData {
  to: string;
  type: WhatsAppMessageType;
  message: string;
  variables: Record<string, string>;
}

// Constantes para templates padrão
export const DEFAULT_WHATSAPP_TEMPLATES: WhatsAppMessageTemplate[] = [
  {
    type: WhatsAppMessageType.WELCOME,
    message: 'Olá! Bem-vindo(a) à {{businessName}}! 🎉\n\nEstamos aqui para atendê-lo(a) da melhor forma possível. Como podemos ajudar você hoje?',
    enabled: true,
    variables: ['businessName'],
  },
  {
    type: WhatsAppMessageType.ORDER_CONFIRMATION,
    message: 'Pedido confirmado! ✅\n\nNúmero do pedido: #{{orderNumber}}\nTotal: R$ {{total}}\n\nSeu pedido está sendo preparado e será entregue em aproximadamente {{estimatedTime}} minutos.\n\nObrigado por escolher a {{businessName}}!',
    enabled: true,
    variables: ['orderNumber', 'total', 'estimatedTime', 'businessName'],
  },
  {
    type: WhatsAppMessageType.ORDER_READY,
    message: 'Seu pedido está pronto! 🍕\n\nPedido #{{orderNumber}} está pronto para retirada/entrega.\n\n{{businessName}}\n{{businessAddress}}',
    enabled: true,
    variables: ['orderNumber', 'businessName', 'businessAddress'],
  },
  {
    type: WhatsAppMessageType.ORDER_DELIVERED,
    message: 'Pedido entregue! 🚚\n\nSeu pedido #{{orderNumber}} foi entregue com sucesso!\n\nEsperamos que tenha gostado! Se precisar de mais alguma coisa, estamos aqui para ajudar.\n\n{{businessName}}',
    enabled: true,
    variables: ['orderNumber', 'businessName'],
  },
  {
    type: WhatsAppMessageType.ORDER_CANCELLED,
    message: 'Pedido cancelado ❌\n\nSeu pedido #{{orderNumber}} foi cancelado.\n\nMotivo: {{reason}}\n\nSe você não solicitou este cancelamento, entre em contato conosco.\n\n{{businessName}}',
    enabled: true,
    variables: ['orderNumber', 'reason', 'businessName'],
  },
];

// Labels para os tipos de mensagem
export const WHATSAPP_MESSAGE_TYPE_LABELS: Record<WhatsAppMessageType, string> = {
  [WhatsAppMessageType.WELCOME]: 'Mensagem de Boas-vindas',
  [WhatsAppMessageType.ORDER_CONFIRMATION]: 'Confirmação de Pedido',
  [WhatsAppMessageType.ORDER_READY]: 'Pedido Pronto',
  [WhatsAppMessageType.ORDER_DELIVERED]: 'Pedido Entregue',
  [WhatsAppMessageType.ORDER_CANCELLED]: 'Pedido Cancelado',
  [WhatsAppMessageType.CUSTOM]: 'Mensagem Personalizada',
};

// Descrições para os tipos de mensagem
export const WHATSAPP_MESSAGE_TYPE_DESCRIPTIONS: Record<WhatsAppMessageType, string> = {
  [WhatsAppMessageType.WELCOME]: 'Enviada quando um novo cliente inicia uma conversa',
  [WhatsAppMessageType.ORDER_CONFIRMATION]: 'Enviada quando um pedido é confirmado',
  [WhatsAppMessageType.ORDER_READY]: 'Enviada quando o pedido está pronto para retirada/entrega',
  [WhatsAppMessageType.ORDER_DELIVERED]: 'Enviada quando o pedido é entregue',
  [WhatsAppMessageType.ORDER_CANCELLED]: 'Enviada quando um pedido é cancelado',
  [WhatsAppMessageType.CUSTOM]: 'Mensagem personalizada para uso específico',
};
