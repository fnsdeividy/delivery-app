import { apiClient } from "@/lib/api-client";
import { useEffect, useState } from "react";

export enum WhatsAppConnectionStatus {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  QR_CODE_READY = "qr_code_ready",
  ERROR = "error",
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
  sendWelcomeMessage: boolean;
  sendOrderConfirmation: boolean;
  sendOrderReady: boolean;
  sendOrderDelivered: boolean;
  sendOrderCancelled: boolean;
  lastConnectedAt?: Date;
  lastDisconnectedAt?: Date;
  errorMessage?: string;
}

interface UseWhatsAppSimpleReturn {
  config: WhatsAppSimpleConfig | null;
  loading: boolean;
  error: string | null;
  qrCode: string | null;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendTestMessage: (phoneNumber: string) => Promise<void>;
  updateConfig: (data: Partial<WhatsAppSimpleConfig>) => Promise<void>;
  refreshConfig: () => Promise<void>;
  checkStatus: () => Promise<void>;
}

export function useWhatsAppSimple(storeSlug: string): UseWhatsAppSimpleReturn {
  const [config, setConfig] = useState<WhatsAppSimpleConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const isClient = typeof window !== "undefined";

  // Carregar configuração inicial
  const refreshConfig = async () => {
    if (!isClient || !storeSlug) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<{
        success: boolean;
        data: WhatsAppSimpleConfig;
      }>(`/stores/${storeSlug}/whatsapp-simple/config`);

      if (response?.success) {
        setConfig(response.data);
      } else {
        // Configuração padrão se não existir
        setConfig({
          enabled: false,
          connectionStatus: WhatsAppConnectionStatus.DISCONNECTED,
          autoSendMessages: true,
          sendOrderNotifications: true,
          businessName: "",
          businessAddress: "",
          sendWelcomeMessage: true,
          sendOrderConfirmation: true,
          sendOrderReady: true,
          sendOrderDelivered: true,
          sendOrderCancelled: true,
        });
      }
    } catch (err: any) {
      console.error("Erro ao carregar configurações:", err);
      setError(err.response?.data?.message || "Erro ao carregar configurações");
      // Criar configuração padrão em caso de erro
      setConfig({
        enabled: false,
        connectionStatus: WhatsAppConnectionStatus.DISCONNECTED,
        autoSendMessages: true,
        sendOrderNotifications: true,
        businessName: "",
        businessAddress: "",
        sendWelcomeMessage: true,
        sendOrderConfirmation: true,
        sendOrderReady: true,
        sendOrderDelivered: true,
        sendOrderCancelled: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Conectar WhatsApp
  const connect = async () => {
    if (!isClient || !storeSlug) return;

    try {
      setConnecting(true);
      setError(null);
      setQrCode(null);

      const response = await apiClient.post<{
        success: boolean;
        qrCode?: string;
        message?: string;
      }>(`/stores/${storeSlug}/whatsapp-simple/connect`);

      if (response?.success) {
        setQrCode(response.qrCode || null);
      } else {
        throw new Error(response?.message || "Erro ao gerar QR Code");
      }
    } catch (err: any) {
      console.error("Erro ao conectar WhatsApp:", err);
      setError(err.response?.data?.message || "Erro ao conectar WhatsApp");
      setConnecting(false);
      throw err;
    }
  };

  // Verificar status da conexão
  const checkStatus = async () => {
    if (!isClient || !storeSlug) return;

    try {
      const response = await apiClient.get<{
        success: boolean;
        status: WhatsAppConnectionStatus;
      }>(`/stores/${storeSlug}/whatsapp-simple/status`);

      if (response?.success) {
        const status = response.status;

        if (status === WhatsAppConnectionStatus.CONNECTED) {
          setQrCode(null);
          setConnecting(false);
          await refreshConfig();
        }
      }
    } catch (err) {
      console.error("Erro ao verificar status:", err);
    }
  };

  // Desconectar WhatsApp
  const disconnect = async () => {
    if (!isClient || !storeSlug) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post<{
        success: boolean;
        message?: string;
      }>(`/stores/${storeSlug}/whatsapp-simple/disconnect`);

      if (response?.success) {
        await refreshConfig();
      } else {
        throw new Error(response?.message || "Erro ao desconectar");
      }
    } catch (err: any) {
      console.error("Erro ao desconectar:", err);
      setError(err.response?.data?.message || "Erro ao desconectar");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Enviar mensagem de teste
  const sendTestMessage = async (phoneNumber: string) => {
    if (!isClient || !storeSlug) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post<{
        success: boolean;
        message?: string;
      }>(`/stores/${storeSlug}/whatsapp-simple/send-test`, {
        phoneNumber,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Erro ao enviar mensagem");
      }
    } catch (err: any) {
      console.error("Erro ao enviar mensagem de teste:", err);
      setError(err.response?.data?.message || "Erro ao enviar mensagem");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar configurações
  const updateConfig = async (data: Partial<WhatsAppSimpleConfig>) => {
    if (!isClient || !storeSlug) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.patch<{
        success: boolean;
        message?: string;
      }>(`/stores/${storeSlug}/whatsapp-simple/config`, {
        whatsappSimple: data,
      });

      if (response?.success) {
        setConfig((prev) => (prev ? { ...prev, ...data } : null));
      } else {
        throw new Error(response?.message || "Erro ao atualizar configuração");
      }
    } catch (err: any) {
      console.error("Erro ao atualizar configuração:", err);
      setError(err.response?.data?.message || "Erro ao atualizar configuração");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Carregar configuração ao montar
  useEffect(() => {
    if (isClient && storeSlug) {
      refreshConfig();
    }
  }, [isClient, storeSlug]);

  // Polling para verificar status quando está conectando
  useEffect(() => {
    if (connecting) {
      const interval = setInterval(() => {
        checkStatus();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [connecting]);

  return {
    config,
    loading,
    error,
    qrCode,
    connecting,
    connect,
    disconnect,
    sendTestMessage,
    updateConfig,
    refreshConfig,
    checkStatus,
  };
}

