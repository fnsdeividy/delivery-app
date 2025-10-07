export enum WhatsAppConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  QR_CODE_READY = 'qr_code_ready',
  ERROR = 'error',
}

export interface WhatsAppSimpleConfig {
  enabled: boolean;
  phoneNumber?: string;
  connectionStatus: WhatsAppConnectionStatus;
  sessionId?: string;
  autoSendMessages: boolean;
  sendOrderNotifications: boolean;
  businessName?: string;
  businessAddress?: string;

  // Configurações de mensagens
  sendWelcomeMessage: boolean;
  sendOrderConfirmation: boolean;
  sendOrderReady: boolean;
  sendOrderDelivered: boolean;
  sendOrderCancelled: boolean;

  // Templates personalizados
  welcomeMessageTemplate?: string;
  orderConfirmationTemplate?: string;
  orderReadyTemplate?: string;
  orderDeliveredTemplate?: string;
  orderCancelledTemplate?: string;

  // Metadados
  lastConnectedAt?: Date | string;
  lastDisconnectedAt?: Date | string;
  errorMessage?: string;
}

export interface WhatsAppQRCodeResponse {
  success: boolean;
  qrCode?: string; // Base64 do QR Code
  status: WhatsAppConnectionStatus;
  message: string;
  expiresIn?: number; // Tempo em segundos até expirar
}

export interface WhatsAppConnectionResponse {
  success: boolean;
  status: WhatsAppConnectionStatus;
  phoneNumber?: string;
  message: string;
}

export interface WhatsAppTestMessageRequest {
  to: string;
  message?: string;
}

export interface WhatsAppTestMessageResponse {
  success: boolean;
  message: string;
  messageId?: string;
}

// Valores padrão para mensagens
export const DEFAULT_WHATSAPP_SIMPLE_TEMPLATES = {
  welcome:
    'Olá! Bem-vindo(a) à {{businessName}}! 🎉\n\nEstamos aqui para atendê-lo(a) da melhor forma possível.',
  orderConfirmation:
    'Pedido confirmado! ✅\n\nNúmero: #{{orderNumber}}\nTotal: R$ {{total}}\n\nSeu pedido está sendo preparado e será entregue em aproximadamente {{estimatedTime}} minutos.\n\nObrigado por escolher a {{businessName}}!',
  orderReady:
    'Seu pedido está pronto! 🍕\n\nPedido #{{orderNumber}} está pronto para retirada/entrega.\n\n{{businessName}}\n{{businessAddress}}',
  orderDelivered:
    'Pedido entregue! 🚚\n\nSeu pedido #{{orderNumber}} foi entregue com sucesso!\n\nEsperamos que tenha gostado!\n\n{{businessName}}',
  orderCancelled:
    'Pedido cancelado ❌\n\nSeu pedido #{{orderNumber}} foi cancelado.\n\nMotivo: {{reason}}\n\nSe você não solicitou este cancelamento, entre em contato conosco.\n\n{{businessName}}',
};

