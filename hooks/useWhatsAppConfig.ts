import { apiClient } from "@/lib/api-client";
import {
  WhatsAppConfig,
  WhatsAppConfigResponse,
  WhatsAppTemplatesResponse,
  WhatsAppTestResult,
  WhatsAppSendResult,
  WhatsAppMessage,
  DEFAULT_WHATSAPP_TEMPLATES
} from "@/types/whatsapp";
import { useEffect, useState } from "react";

interface UseWhatsAppConfigReturn {
  config: WhatsAppConfig | null;
  loading: boolean;
  error: string | null;
  updateConfig: (data: Partial<WhatsAppConfig>) => Promise<void>;
  testConnection: (config: WhatsAppConfig) => Promise<WhatsAppTestResult>;
  sendMessage: (message: WhatsAppMessage) => Promise<WhatsAppSendResult>;
  getTemplates: () => Promise<any[]>;
  refreshConfig: () => Promise<void>;
}

export function useWhatsAppConfig(storeSlug: string): UseWhatsAppConfigReturn {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar se estamos no cliente
  const isClient = typeof window !== "undefined";

  const updateConfig = async (data: Partial<WhatsAppConfig>) => {
    if (!isClient || !storeSlug) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.patch(`/stores/${storeSlug}/whatsapp/config`, {
        whatsapp: data,
      });

      if ((response as any).data?.success) {
        // Recarregar configuração após atualização
        await refreshConfig();
      } else {
        throw new Error((response as any).data?.message || 'Erro ao atualizar configurações');
      }
    } catch (error: any) {
      console.error("Erro ao atualizar configurações do WhatsApp:", error);
      setError(error.response?.data?.message || error.message || "Erro ao atualizar configurações");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (testConfig: WhatsAppConfig): Promise<WhatsAppTestResult> => {
    if (!isClient || !storeSlug) {
      return { success: false, error: "Cliente não disponível" };
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post(`/stores/${storeSlug}/whatsapp/test-connection`, {
        whatsapp: testConfig,
      });

      return {
        success: (response as any).data?.success,
        error: (response as any).data?.error,
        message: (response as any).data?.message,
      };
    } catch (error: any) {
      console.error("Erro ao testar conexão WhatsApp:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Erro ao testar conexão",
      };
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: WhatsAppMessage): Promise<WhatsAppSendResult> => {
    if (!isClient || !storeSlug) {
      return { success: false, error: "Cliente não disponível" };
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post(`/stores/${storeSlug}/whatsapp/send-message`, message);

      return {
        success: (response as any).data?.success,
        messageId: (response as any).data?.messageId,
        error: (response as any).data?.error,
        message: (response as any).data?.message,
      };
    } catch (error: any) {
      console.error("Erro ao enviar mensagem WhatsApp:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Erro ao enviar mensagem",
      };
    } finally {
      setLoading(false);
    }
  };

  const getTemplates = async (): Promise<any[]> => {
    if (!isClient || !storeSlug) {
      return DEFAULT_WHATSAPP_TEMPLATES;
    }

    try {
      const response = await apiClient.get(`/stores/${storeSlug}/whatsapp/templates`);

      if ((response as any).data?.success) {
        return (response as any).data?.data || DEFAULT_WHATSAPP_TEMPLATES;
      } else {
        return DEFAULT_WHATSAPP_TEMPLATES;
      }
    } catch (error: any) {
      console.error("Erro ao buscar templates do WhatsApp:", error);
      return DEFAULT_WHATSAPP_TEMPLATES;
    }
  };

  const fetchConfig = async (): Promise<WhatsAppConfig | null> => {
    if (!isClient || !storeSlug) return null;

    try {
      const response = await apiClient.get(`/stores/${storeSlug}/whatsapp/config`);

      if ((response as any).data?.success) {
        return (response as any).data?.data;
      } else {
        throw new Error((response as any).data?.message || 'Erro ao buscar configurações');
      }
    } catch (error: any) {
      console.error("Erro ao buscar configurações do WhatsApp:", error);
      throw new Error("Erro ao buscar configurações do WhatsApp");
    }
  };

  const refreshConfig = async () => {
    if (!isClient || !storeSlug) return;

    try {
      setLoading(true);
      setError(null);

      const whatsappConfig = await fetchConfig();
      setConfig(whatsappConfig);
    } catch (error: any) {
      console.error("Erro ao recarregar configurações do WhatsApp:", error);
      setError(error.message || "Erro ao recarregar configurações");
    } finally {
      setLoading(false);
    }
  };

  // Carregar configurações quando o componente montar ou o slug mudar
  useEffect(() => {
    if (isClient && storeSlug) {
      refreshConfig();
    }
  }, [isClient, storeSlug]);

  return {
    config,
    loading,
    error,
    updateConfig,
    testConnection,
    sendMessage,
    getTemplates,
    refreshConfig,
  };
}
