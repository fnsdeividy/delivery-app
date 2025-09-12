import { apiClient } from "@/lib/api-client";
import { Product } from "@/types/cardapio-api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface StoreConfig {
  id: string;
  slug: string;
  name: string;
  email?: string;
  phone?: string;
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
  updateConfig: (
    data: Partial<StoreConfig> | Record<string, any>
  ) => Promise<void>;
}

/** Tipos esperados da API pública */
interface PublicStoreApiResponse {
  store: {
    id: string;
    slug: string;
    name: string;
    description?: string;
    active: boolean;
    approved?: boolean;
    createdAt: string;
    updatedAt: string;
  };
  config?: Record<string, any>;
  products?: Product[];
  categories?: Array<{ id: string; name: string; active: boolean }>;
  status?: { isOpen: boolean; reason: string };
}

/** Util: extrai mensagem amigável de erro (sem logs) */
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object") {
    const anyErr = err as any;
    const msg =
      anyErr?.message ||
      anyErr?.data?.message ||
      anyErr?.response?.data?.message ||
      anyErr?.response?.statusText;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  return fallback;
}

/** Mapeia a resposta pública para StoreConfig */
function mapPublicToStoreConfig(data: PublicStoreApiResponse): StoreConfig {
  const cfg = data.config ?? {};
  const branding = cfg.branding ?? cfg.theme ?? {};
  const paymentMethods: string[] = Array.isArray(cfg.paymentMethods)
    ? cfg.paymentMethods
    : [];

  return {
    id: data.store.id,
    slug: data.store.slug,
    name: data.store.name,
    description: data.store.description,
    active: data.store.active,
    approved: data.store.approved ?? false,
    createdAt: data.store.createdAt,
    updatedAt: data.store.updatedAt,
    config: cfg,
    menu: {
      products: data.products ?? [],
      categories: data.categories ?? [],
    },
    settings: {
      preparationTime:
        cfg?.settings?.preparationTime ?? cfg?.preparationTime ?? 30,
      orderNotifications: (cfg?.settings?.orderNotifications ?? true) !== false,
    },
    delivery: {
      fee: cfg?.deliveryFee ?? 0,
      freeDeliveryMinimum: cfg?.minimumOrder ?? 0,
      estimatedTime: cfg?.estimatedDeliveryTime ?? 30,
      enabled: (cfg?.deliveryEnabled ?? true) !== false,
    },
    payments: {
      pix: paymentMethods.includes("PIX"),
      cash: paymentMethods.includes("DINHEIRO"),
      card: paymentMethods.includes("CARTÃO"),
    },
    promotions: {
      coupons: cfg?.coupons ?? [],
    },
    branding: {
      logo: branding?.logo ?? cfg?.logo ?? "",
      favicon: branding?.favicon ?? cfg?.favicon ?? "",
      banner: branding?.banner ?? cfg?.banner ?? "",
      primaryColor: branding?.primaryColor ?? cfg?.primaryColor ?? "#f97316",
      secondaryColor:
        branding?.secondaryColor ?? cfg?.secondaryColor ?? "#ea580c",
      backgroundColor:
        branding?.backgroundColor ?? cfg?.backgroundColor ?? "#ffffff",
      textColor: branding?.textColor ?? cfg?.textColor ?? "#000000",
      accentColor: branding?.accentColor ?? cfg?.accentColor ?? "#f59e0b",
    },
    schedule: {
      timezone: "America/Sao_Paulo",
      workingHours: cfg?.schedule?.workingHours ?? cfg?.businessHours ?? {},
    },
    business: {
      phone: cfg?.phone ?? "",
      email: cfg?.email ?? "",
      address: cfg?.address ?? "",
    },
    status: data.status ?? { isOpen: false, reason: "Indisponível" },
    email: cfg?.email ?? "",
    phone: cfg?.phone ?? "",
  };
}

export function useStoreConfig(slug: string): UseStoreConfigReturn {
  const isClient = typeof window !== "undefined";
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(!!slug && isClient);
  const [error, setError] = useState<string | null>(null);

  // Guardar ref de "montado" para evitar setState após unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const updateConfig = useCallback(
    async (data: Partial<StoreConfig> | Record<string, any>) => {
      // Atualiza via endpoint de config e faz merge parcial no estado local
      await apiClient.patch(`/stores/${slug}/config`, data);
      setConfig((prev) => {
        if (!prev) return prev;
        const next: StoreConfig = { ...prev };

        // merge superficial no nível raiz
        Object.assign(next, data);

        // se vier um bloco "config", mescla com o atual
        if (data && typeof data === "object" && "config" in data) {
          next.config = {
            ...prev.config,
            ...(data as any).config,
          };
        }
        return next;
      });
    },
    [slug]
  );

  // SSR: retornar estado neutro
  if (!isClient) {
    return {
      config: null,
      loading: false,
      error: "SSR não suportado",
      updateConfig,
    };
  }

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError(null);
      setConfig(null);
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const loadConfig = async () => {
      setLoading(true);
      setError(null);
      setConfig(null);

      // Timeout de segurança (15s)
      timeoutId = setTimeout(() => {
        if (!cancelled && mountedRef.current) {
          setLoading(false);
          setError("Tempo limite excedido. Tente recarregar a página.");
        }
      }, 15000);

      try {
        // Busca dados públicos da loja
        const data = await apiClient.get<PublicStoreApiResponse>(
          `/stores/public/${slug}`
        );

        if (cancelled || !mountedRef.current) return;

        const mapped = mapPublicToStoreConfig(data);
        setConfig(mapped);
      } catch (err) {
        if (cancelled || !mountedRef.current) return;

        // Mapeia para mensagem amigável
        const rawMsg = extractErrorMessage(
          err,
          "Erro ao carregar dados da loja"
        );
        let userMessage = "Erro ao carregar dados da loja";

        if (
          /404|não encontrada|nao encontrada|loja não encontrada/i.test(rawMsg)
        ) {
          userMessage = "Loja não encontrada";
        } else if (/inativa|desativada/i.test(rawMsg)) {
          userMessage = "Loja temporariamente indisponível";
        } else if (/timeout|excedido|ECONNABORTED/i.test(rawMsg)) {
          userMessage = "Conexão lenta, tente novamente";
        } else if (/Network Error|ERR_NETWORK|fetch/i.test(rawMsg)) {
          userMessage = "Erro de conexão. Verifique sua internet.";
        } else if (/indispon[ií]vel|503|Service Unavailable/i.test(rawMsg)) {
          userMessage = "Serviço temporariamente indisponível";
        }

        // Pequeno delay para evitar flash de erro
        setTimeout(() => {
          if (!cancelled && mountedRef.current) {
            setError(userMessage);
          }
        }, 200);
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        if (!cancelled && mountedRef.current) setLoading(false);
      }
    };

    loadConfig();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [slug]);

  return { config, loading, error, updateConfig };
}

export function useStoreStatus(config: StoreConfig | null) {
  const { isOpen, message } = useMemo(() => {
    if (!config) {
      return { isOpen: true, message: "" };
    }
    const open = Boolean(config.active && config.approved);
    const msg = config.approved
      ? "Loja aberta e funcionando normalmente"
      : "Loja aguardando aprovação";
    return { isOpen: open, message: msg };
  }, [config]);

  const [currentMessage, setCurrentMessage] = useState(message);
  const [open, setOpen] = useState(isOpen);

  useEffect(() => {
    setOpen(isOpen);
    setCurrentMessage(message);
  }, [isOpen, message]);

  return { isOpen: open, currentMessage };
}
