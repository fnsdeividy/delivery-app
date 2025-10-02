import { apiClient } from "@/lib/api-client";
import { checkStoreStatus, WorkingHours } from "@/lib/utils/store-status";
import { Product } from "@/types/cardapio-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  const workingHours = cfg?.schedule?.workingHours ?? cfg?.businessHours ?? {};

  // Verificar status da loja usando a nova lógica
  const storeStatus = checkStoreStatus(workingHours as WorkingHours);

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
      workingHours: workingHours,
    },
    business: {
      phone: cfg?.phone ?? "",
      email: cfg?.email ?? "",
      address: cfg?.address ?? "",
    },
    status: {
      isOpen: storeStatus.isOpen,
      reason: storeStatus.message,
    },
    email: cfg?.email ?? "",
    phone: cfg?.phone ?? "",
  };
}

export function useStoreConfig(slug: string): UseStoreConfigReturn {
  const queryClient = useQueryClient();
  const isClient = typeof window !== "undefined";

  // Usar React Query para cache e evitar chamadas duplicadas
  const {
    data: config,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["store-config", slug],
    queryFn: async () => {
      const data = await apiClient.get<PublicStoreApiResponse>(
        `/stores/public/${slug}`
      );
      return mapPublicToStoreConfig(data);
    },
    enabled: !!slug && isClient,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
    retry: (failureCount, error: any) => {
      // Não tentar novamente para erros 4xx
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Mutation para atualizar configuração
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<StoreConfig> | Record<string, any>) => {
      await apiClient.patch(`/stores/${slug}/config`, data);
    },
    onSuccess: () => {
      // Invalidar cache para forçar re-fetch
      queryClient.invalidateQueries({ queryKey: ["store-config", slug] });
    },
  });

  const updateConfig = useCallback(
    async (data: Partial<StoreConfig> | Record<string, any>) => {
      await updateMutation.mutateAsync(data);
    },
    [updateMutation, slug]
  );

  // Mapear erro para mensagem amigável
  const error = useMemo(() => {
    if (!queryError) return null;

    const rawMsg = extractErrorMessage(
      queryError,
      "Erro ao carregar dados da loja"
    );

    if (/404|não encontrada|nao encontrada|loja não encontrada/i.test(rawMsg)) {
      return "Loja não encontrada";
    } else if (/inativa|desativada/i.test(rawMsg)) {
      return "Loja temporariamente indisponível";
    } else if (/timeout|excedido|ECONNABORTED/i.test(rawMsg)) {
      return "Conexão lenta, tente novamente";
    } else if (/Network Error|ERR_NETWORK|fetch/i.test(rawMsg)) {
      return "Erro de conexão. Verifique sua internet.";
    } else if (/indispon[ií]vel|503|Service Unavailable/i.test(rawMsg)) {
      return "Serviço temporariamente indisponível";
    }

    return "Erro ao carregar dados da loja";
  }, [queryError]);

  // SSR: retornar estado neutro
  if (!isClient) {
    return {
      config: null,
      loading: false,
      error: "SSR não suportado",
      updateConfig,
    };
  }

  return { config: config || null, loading, error, updateConfig };
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
