import { apiClient } from "@/lib/api-client";
import { Product } from "@/types/cardapio-api";
import { useEffect, useState } from "react";

interface StoreConfig {
  id: string;
  slug: string;
  name: string;
  description?: string;
  config: Record<string, any>;
  active: boolean;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
  // Propriedades adicionais para o dashboard
  menu: {
    products: Product[];
    categories: Array<{
      id: string;
      name: string;
      active: boolean;
    }>;
  };
  settings: {
    preparationTime: number;
    orderNotifications: boolean;
  };
  delivery: {
    fee: number;
    freeDeliveryMinimum: number;
    estimatedTime: number;
    enabled: boolean;
  };
  payments: {
    pix: boolean;
    cash: boolean;
    card: boolean;
  };
  promotions: {
    coupons: Array<{
      id: string;
      name: string;
      active: boolean;
      discount: number;
    }>;
  };
  branding: {
    logo?: string;
    favicon?: string;
    banner?: string;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
  };
  schedule: {
    timezone: string;
    workingHours: {
      [key: string]: {
        open: boolean;
        hours: Array<{
          start: string;
          end: string;
        }>;
      };
    };
  };
  business: {
    phone: string;
    email: string;
    address: string;
  };
  status: {
    isOpen: boolean;
    reason: string;
  };
}

interface UseStoreConfigReturn {
  config: StoreConfig | null;
  loading: boolean;
  error: string | null;
}

export function useStoreConfig(slug: string): UseStoreConfigReturn {
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar se estamos no cliente
  const isClient = typeof window !== "undefined";

  // Se não estamos no cliente, retornar estado inicial
  if (!isClient) {
    return {
      config: null,
      loading: false,
      error: "SSR não suportado",
    };
  }

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    // Timeout de segurança para evitar loading infinito
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 10000);

    const fetchConfig = async (slug: string): Promise<StoreConfig> => {
      try {
        // Buscar dados da loja via endpoint público
        const data = await apiClient.get(`/stores/public/${slug}`);

        // Mapear resposta da API para StoreConfig
        const mappedConfig = {
          id: (data as any).store.id,
          name: (data as any).store.name,
          slug: (data as any).store.slug,
          description: (data as any).store.description,
          active: (data as any).store.active,
          approved: (data as any).store.approved || false,
          createdAt: (data as any).store.createdAt,
          updatedAt: (data as any).store.updatedAt,
          config: (data as any).config || {},
          menu: {
            products: (data as any).products || [],
            categories: (data as any).categories || [],
          },
          settings: {
            preparationTime: (data as any).config?.preparationTime || 30,
            orderNotifications:
              (data as any).config?.orderNotifications !== false,
          },
          delivery: {
            fee: (data as any).config?.deliveryFee || 0,
            freeDeliveryMinimum: (data as any).config?.minimumOrder || 0,
            estimatedTime: (data as any).config?.estimatedDeliveryTime || 30,
            enabled: (data as any).config?.deliveryEnabled !== false,
          },
          payments: {
            pix: (data as any).config?.paymentMethods?.includes("PIX") || false,
            cash:
              (data as any).config?.paymentMethods?.includes("DINHEIRO") ||
              false,
            card:
              (data as any).config?.paymentMethods?.includes("CARTÃO") || false,
          },
          promotions: {
            coupons: (data as any).config?.coupons || [],
          },
          branding: {
            logo: (data as any).config?.logo || "",
            favicon: (data as any).config?.favicon || "",
            banner: (data as any).config?.banner || "",
            primaryColor: (data as any).config?.primaryColor || "#f97316",
            secondaryColor: (data as any).config?.secondaryColor || "#ea580c",
            backgroundColor: (data as any).config?.backgroundColor || "#ffffff",
            textColor: (data as any).config?.textColor || "#000000",
            accentColor: (data as any).config?.accentColor || "#f59e0b",
          },
          schedule: {
            timezone: "America/Sao_Paulo",
            workingHours: (data as any).config?.businessHours || {},
          },
          business: {
            phone: (data as any).config?.phone || "",
            email: (data as any).config?.email || "",
            address: (data as any).config?.address || "",
          },
          status: (data as any).status || {
            isOpen: false,
            reason: "Indisponível",
          },
        };

        return mappedConfig;
      } catch (error: any) {
        console.error("Erro ao buscar dados da loja:", error);
        throw new Error("Erro ao buscar dados da loja");
      }
    };

    const loadConfig = async () => {
      try {
        setLoading(true);
        setError(null);

        const storeConfig = await fetchConfig(slug);

        // Transformar dados da API para o formato esperado
        const transformedConfig: StoreConfig = {
          id: storeConfig.id,
          slug: storeConfig.slug,
          name: storeConfig.name,
          description: storeConfig.description,
          config: storeConfig.config,
          active: storeConfig.active,
          approved: storeConfig.approved,
          createdAt: storeConfig.createdAt,
          updatedAt: storeConfig.updatedAt,
          menu: {
            products: storeConfig.menu?.products || [],
            categories: storeConfig.menu?.categories || [],
          },
          settings: {
            preparationTime: storeConfig.settings?.preparationTime || 30,
            orderNotifications:
              storeConfig.settings?.orderNotifications !== false,
          },
          delivery: {
            fee: storeConfig.delivery?.fee || 0,
            freeDeliveryMinimum: storeConfig.delivery?.freeDeliveryMinimum || 0,
            estimatedTime: storeConfig.delivery?.estimatedTime || 30,
            enabled: storeConfig.delivery?.enabled !== false,
          },
          payments: {
            pix: storeConfig.payments?.pix || false,
            cash: storeConfig.payments?.cash || false,
            card: storeConfig.payments?.card || false,
          },
          promotions: {
            coupons: storeConfig.promotions?.coupons || [],
          },
          branding: {
            logo: storeConfig.branding?.logo || "",
            favicon: storeConfig.branding?.favicon || "",
            banner: storeConfig.branding?.banner || "",
            primaryColor: storeConfig.branding?.primaryColor || "#f97316",
            secondaryColor: storeConfig.branding?.secondaryColor || "#ea580c",
            backgroundColor: storeConfig.branding?.backgroundColor || "#ffffff",
            textColor: storeConfig.branding?.textColor || "#000000",
            accentColor: storeConfig.branding?.accentColor || "#f59e0b",
          },
          schedule: {
            timezone: "America/Sao_Paulo",
            workingHours: storeConfig.schedule?.workingHours || {},
          },
          business: {
            phone: storeConfig.business?.phone || "",
            email: storeConfig.business?.email || "",
            address: storeConfig.business?.address || "",
          },
          status: storeConfig.status,
        };

        setConfig(transformedConfig);
      } catch (err: any) {
        console.error("Erro ao buscar configuração da loja:", err);

        // Mapear mensagens de erro para mensagens mais amigáveis
        let userMessage = "Erro ao carregar dados da loja";

        if (err.message?.includes("Loja não encontrada")) {
          userMessage = "Loja não encontrada";
        } else if (err.message?.includes("Loja inativa")) {
          userMessage = "Loja temporariamente indisponível";
        } else if (err.message?.includes("timeout")) {
          userMessage = "Conexão lenta, tente novamente";
        } else if (err.message?.includes("API indisponível")) {
          userMessage = "Serviço temporariamente indisponível";
        } else if (err.message?.includes("não encontrada")) {
          userMessage = "Loja não encontrada";
        }

        setError(userMessage);
      } finally {
        setLoading(false);
        clearTimeout(timeoutId);
      }
    };

    loadConfig();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [slug]);

  return { config, loading, error };
}

export function useStoreStatus(config: StoreConfig | null) {
  const [isOpen, setIsOpen] = useState(true);
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    if (config) {
      // Simular status da loja
      setIsOpen(config.active && config.approved);
      setCurrentMessage(
        config.approved
          ? "Loja aberta e funcionando normalmente"
          : "Loja aguardando aprovação"
      );
    }
  }, [config]);

  return { isOpen, currentMessage };
}
