import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import {
  IfoodConfig,
  IfoodConfigFormData,
  IfoodTestResult,
  IfoodSyncResult,
  IfoodStatusResponse,
  DEFAULT_IFOOD_CONFIG,
} from '@/types/ifood';

interface UseIfoodConfigReturn {
  config: IfoodConfig | null;
  isLoading: boolean;
  error: string | null;
  message: { type: 'success' | 'error'; text: string } | null;
  updateConfig: (storeSlug: string, config: IfoodConfigFormData) => Promise<boolean>;
  testConnection: (storeSlug: string, config: IfoodConfig) => Promise<IfoodTestResult>;
  syncProducts: (storeSlug: string) => Promise<IfoodSyncResult>;
  syncOrders: (storeSlug: string) => Promise<IfoodSyncResult>;
  getStatus: (storeSlug: string) => Promise<IfoodStatusResponse | null>;
  refreshConfig: (storeSlug: string) => Promise<void>;
  setMessage: (message: { type: 'success' | 'error'; text: string } | null) => void;
  clearError: () => void;
}

export function useIfoodConfig(): UseIfoodConfigReturn {
  const [config, setConfig] = useState<IfoodConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const updateConfig = useCallback(async (
    storeSlug: string,
    configData: IfoodConfigFormData
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.patch(`/stores/${storeSlug}/ifood/config`, {
        ifood: configData,
      });

      if ((response as any).data?.success) {
        setConfig((response as any).data?.data?.config?.ifood || configData);
        setMessage({ type: 'success', text: 'Configurações do iFood atualizadas com sucesso!' });
        return true;
      } else {
        throw new Error((response as any).data?.message || 'Erro ao atualizar configurações');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro desconhecido';
      setError(errorMessage);
      setMessage({ type: 'error', text: `Erro ao atualizar configurações: ${errorMessage}` });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testConnection = useCallback(async (
    storeSlug: string,
    testConfig: IfoodConfig
  ): Promise<IfoodTestResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(`/stores/${storeSlug}/ifood/test-connection`, {
        ifood: testConfig,
      });

      if ((response as any).data?.success) {
        return {
          success: true,
          message: 'Conexão testada com sucesso!',
        };
      } else {
        return {
          success: false,
          error: (response as any).data?.message || 'Erro desconhecido',
        };
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro desconhecido';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncProducts = useCallback(async (storeSlug: string): Promise<IfoodSyncResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(`/stores/${storeSlug}/ifood/sync-products`);

      if ((response as any).data?.success) {
        const result = (response as any).data;
        setMessage({
          type: 'success',
          text: `Sincronização concluída: ${result.synced} produtos sincronizados`
        });
        return result;
      } else {
        throw new Error((response as any).data?.message || 'Erro ao sincronizar produtos');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro desconhecido';
      setError(errorMessage);
      setMessage({ type: 'error', text: `Erro na sincronização: ${errorMessage}` });
      return {
        success: false,
        synced: 0,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncOrders = useCallback(async (storeSlug: string): Promise<IfoodSyncResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(`/stores/${storeSlug}/ifood/sync-orders`);

      if ((response as any).data?.success) {
        const result = (response as any).data;
        setMessage({
          type: 'success',
          text: `Sincronização concluída: ${result.synced} pedidos sincronizados`
        });
        return result;
      } else {
        throw new Error((response as any).data?.message || 'Erro ao sincronizar pedidos');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro desconhecido';
      setError(errorMessage);
      setMessage({ type: 'error', text: `Erro na sincronização: ${errorMessage}` });
      return {
        success: false,
        synced: 0,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStatus = useCallback(async (storeSlug: string): Promise<IfoodStatusResponse | null> => {
    try {
      const response = await apiClient.get(`/stores/${storeSlug}/ifood/status`);

      if ((response as any).data?.success) {
        return (response as any).data;
      }
      return null;
    } catch (err: any) {
      console.error('Erro ao buscar status:', err);
      return null;
    }
  }, []);

  const fetchConfig = useCallback(async (storeSlug: string): Promise<void> => {
    try {
      const response = await apiClient.get(`/stores/${storeSlug}/ifood/config`);

      if ((response as any).data?.success) {
        const fetchedConfig = (response as any).data?.data;
        if (fetchedConfig) {
          setConfig(fetchedConfig);
        } else {
          setConfig(DEFAULT_IFOOD_CONFIG);
        }
      } else {
        setConfig(DEFAULT_IFOOD_CONFIG);
      }
    } catch (err: any) {
      console.error('Erro ao buscar configurações:', err);
      setConfig(DEFAULT_IFOOD_CONFIG);
    }
  }, []);

  const refreshConfig = useCallback(async (storeSlug: string): Promise<void> => {
    await fetchConfig(storeSlug);
  }, [fetchConfig]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    config,
    isLoading,
    error,
    message,
    updateConfig,
    testConnection,
    syncProducts,
    syncOrders,
    getStatus,
    refreshConfig,
    setMessage,
    clearError,
  };
}
