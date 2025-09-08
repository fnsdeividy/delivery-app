"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useToast } from "@/hooks/useToast";
import { apiClient } from "@/lib/api-client";
import { Clock, DollarSign, Loader2, MapPin, Save, Truck } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

interface DeliveryConfig {
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: number;
  freeDeliveryThreshold?: number;
  deliveryZones?: Array<{
    name: string;
    fee: number;
    minOrder: number;
    estimatedTime: number;
  }>;
}

/* ============================
 * Utilitários de input
 * ============================ */
const onlyDigitsCommaDot = (v: string) => v.replace(/[^\d.,]/g, "");
const normalizeToDot = (v: string) => v.replace(/\./g, "").replace(",", ".");
const toFixedSafe = (n: number, d = 2) =>
  Number.isFinite(n) ? n.toFixed(d) : (0).toFixed(d);

/* ============================
 * Validação com Zod
 * ============================ */
const MSG = {
  required: "Campo obrigatório",
  nonNegative: "Valor deve ser zero ou positivo",
  minOne: "Tempo estimado deve ser pelo menos 1 minuto",
  freeGtMin: "Entrega grátis deve ser maior que o pedido mínimo",
  onlyNumber: "Informe apenas números",
};

const formSchema = z
  .object({
    deliveryFeeStr: z
      .string()
      .min(1, MSG.required)
      .transform((s) => Number(normalizeToDot(onlyDigitsCommaDot(s || "0"))))
      .refine((n) => n >= 0, MSG.nonNegative),
    minimumOrderStr: z
      .string()
      .min(1, MSG.required)
      .transform((s) => Number(normalizeToDot(onlyDigitsCommaDot(s || "0"))))
      .refine((n) => n >= 0, MSG.nonNegative),
    estimatedTimeStr: z
      .string()
      .min(1, MSG.required)
      .refine((s) => /^\d+$/.test(s), { message: MSG.onlyNumber })
      .transform((s) => parseInt(s, 10))
      .refine((n) => n >= 1, MSG.minOne),
    enableFreeDelivery: z.boolean(),
    freeDeliveryStr: z
      .string()
      .optional()
      .transform((s) =>
        s ? Number(normalizeToDot(onlyDigitsCommaDot(s))) : undefined
      ),
  })
  .superRefine((data, ctx) => {
    if (data.enableFreeDelivery) {
      if (
        data.freeDeliveryStr === undefined ||
        Number.isNaN(data.freeDeliveryStr)
      ) {
        ctx.addIssue({
          path: ["freeDeliveryStr"],
          code: z.ZodIssueCode.custom,
          message: MSG.required,
        });
      } else if (data.freeDeliveryStr <= data.minimumOrderStr) {
        ctx.addIssue({
          path: ["freeDeliveryStr"],
          code: z.ZodIssueCode.custom,
          message: MSG.freeGtMin,
        });
      }
    }
  });

type FormErrors = Partial<Record<keyof z.input<typeof formSchema>, string>>;

export default function DeliveryConfigPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuthContext();
  const { formatBRL } = useCurrencyFormatter();

  const slug = params.storeSlug as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<DeliveryConfig>({
    deliveryFee: 5.0,
    minimumOrder: 20.0,
    estimatedDeliveryTime: 30,
    freeDeliveryThreshold: 50.0,
    deliveryZones: [],
  });

  // Campos (strings -> UX de digitação)
  const [deliveryFeeStr, setDeliveryFeeStr] = useState("5,00");
  const [minimumOrderStr, setMinimumOrderStr] = useState("20,00");
  const [estimatedTimeStr, setEstimatedTimeStr] = useState("30");
  const [freeDeliveryStr, setFreeDeliveryStr] = useState("50,00");
  const [enableFreeDelivery, setEnableFreeDelivery] = useState(false);

  // Erros inline
  const [errors, setErrors] = useState<FormErrors>({});

  // Derivados numéricos
  const deliveryFee = useMemo(
    () => Number(normalizeToDot(onlyDigitsCommaDot(deliveryFeeStr))) || 0,
    [deliveryFeeStr]
  );
  const minimumOrder = useMemo(
    () => Number(normalizeToDot(onlyDigitsCommaDot(minimumOrderStr))) || 0,
    [minimumOrderStr]
  );
  const estimatedTime = useMemo(
    () => parseInt(estimatedTimeStr || "0", 10) || 0,
    [estimatedTimeStr]
  );
  const freeDeliveryThreshold = useMemo(
    () =>
      enableFreeDelivery
        ? Number(normalizeToDot(onlyDigitsCommaDot(freeDeliveryStr))) || 0
        : undefined,
    [enableFreeDelivery, freeDeliveryStr]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    loadStoreConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, router, slug]);

  const loadStoreConfig = async () => {
    setIsLoading(true);
    try {
      const store = await apiClient.getStoreBySlug(slug);
      if (store?.config) {
        const storeConfig = store.config;
        setConfig({
          deliveryFee: storeConfig.deliveryFee ?? 5.0,
          minimumOrder: storeConfig.minimumOrder ?? 20.0,
          estimatedDeliveryTime: storeConfig.estimatedDeliveryTime ?? 30,
          freeDeliveryThreshold: storeConfig.freeDeliveryThreshold ?? 50.0,
          deliveryZones: storeConfig.deliveryZones ?? [],
        });

        setDeliveryFeeStr(
          toFixedSafe(storeConfig.deliveryFee ?? 5.0).replace(".", ",")
        );
        setMinimumOrderStr(
          toFixedSafe(storeConfig.minimumOrder ?? 20.0).replace(".", ",")
        );
        setEstimatedTimeStr(String(storeConfig.estimatedDeliveryTime ?? 30));
        setFreeDeliveryStr(
          toFixedSafe(storeConfig.freeDeliveryThreshold ?? 50.0).replace(
            ".",
            ","
          )
        );
        setEnableFreeDelivery(!!storeConfig.freeDeliveryThreshold);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      showToast("Erro ao carregar configurações da loja", "error");
    } finally {
      setIsLoading(false);
    }
  };

  /* ============================
   * Handlers com UX
   * ============================ */
  const handleCurrencyInput = (
    value: string,
    setter: (v: string) => void,
    field: keyof FormErrors
  ) => {
    setter(onlyDigitsCommaDot(value));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleTimeInput = (
    value: string,
    setter: (v: string) => void,
    field: keyof FormErrors
  ) => {
    setter(value.replace(/[^\d]/g, ""));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const parsed = formSchema.safeParse({
      deliveryFeeStr,
      minimumOrderStr,
      estimatedTimeStr,
      enableFreeDelivery,
      freeDeliveryStr,
    });

    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path?.[0] as keyof FormErrors;
        if (path) fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      showToast("Revise os campos destacados.", "error");
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const updatedConfig: DeliveryConfig = {
        ...config,
        deliveryFee,
        minimumOrder,
        estimatedDeliveryTime: estimatedTime,
        freeDeliveryThreshold: enableFreeDelivery
          ? freeDeliveryThreshold
          : undefined,
      };

      await apiClient.updateStoreConfig(slug, updatedConfig);
      showToast("Configurações de entrega salvas com sucesso!", "success");
      await loadStoreConfig();
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      showToast("Erro ao salvar configurações de entrega", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] px-4">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Container centralizado e responsivo */}
      <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header responsivo */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
              <span className="text-purple-700">Configurações</span> de Entrega
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Defina taxas, pedido mínimo e tempo estimado de entrega
            </p>
          </div>

          {/* Botão desktop/tablet */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="hidden md:inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 focus-visible:ring-2 focus-visible:ring-purple-500 w-fit text-white"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>

        <div className="mt-6 grid gap-6">
          {/* Configurações Básicas */}
          <Card className="border-purple-100">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl text-purple-700">
                <Truck className="h-5 w-5 shrink-0" />
                <span className="truncate">Configurações Básicas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 sm:space-y-6">
              {/* Grid adaptável */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Taxa de Entrega */}
                <div className="space-y-2">
                  <Label
                    htmlFor="deliveryFee"
                    className="flex items-center gap-2"
                  >
                    <DollarSign className="h-4 w-4 text-purple-600" />
                    Taxa de Entrega
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2 rounded-md bg-purple-50 text-purple-700 text-xs sm:text-sm border border-purple-100">
                      R$
                    </span>
                    <Input
                      id="deliveryFee"
                      inputMode="decimal"
                      value={deliveryFeeStr}
                      onChange={(e) =>
                        handleCurrencyInput(
                          e.target.value,
                          setDeliveryFeeStr,
                          "deliveryFeeStr"
                        )
                      }
                      placeholder="0,00"
                      className={`text-right focus-visible:ring-purple-500 ${
                        errors.deliveryFeeStr ? "border-red-500" : ""
                      }`}
                      aria-invalid={!!errors.deliveryFeeStr}
                    />
                  </div>
                  {errors.deliveryFeeStr ? (
                    <p className="text-xs text-red-600">
                      {errors.deliveryFeeStr}
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500">
                      Valor cobrado por entrega —{" "}
                      <span className="font-medium">
                        {formatBRL(deliveryFee)}
                      </span>
                    </p>
                  )}
                </div>

                {/* Pedido Mínimo */}
                <div className="space-y-2">
                  <Label
                    htmlFor="minimumOrder"
                    className="flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4 text-purple-600" />
                    Pedido Mínimo
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2 rounded-md bg-purple-50 text-purple-700 text-xs sm:text-sm border border-purple-100">
                      R$
                    </span>
                    <Input
                      id="minimumOrder"
                      inputMode="decimal"
                      value={minimumOrderStr}
                      onChange={(e) =>
                        handleCurrencyInput(
                          e.target.value,
                          setMinimumOrderStr,
                          "minimumOrderStr"
                        )
                      }
                      placeholder="0,00"
                      className={`text-right focus-visible:ring-purple-500 ${
                        errors.minimumOrderStr ? "border-red-500" : ""
                      }`}
                      aria-invalid={!!errors.minimumOrderStr}
                    />
                  </div>
                  {errors.minimumOrderStr ? (
                    <p className="text-xs text-red-600">
                      {errors.minimumOrderStr}
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500">
                      Valor mínimo para realizar pedido —{" "}
                      <span className="font-medium">
                        {formatBRL(minimumOrder)}
                      </span>
                    </p>
                  )}
                </div>

                {/* Tempo Estimado - ocupa 2 colunas em telas maiores para melhor largura */}
                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="estimatedTime"
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4 text-purple-600" />
                    Tempo Estimado (minutos)
                  </Label>
                  <Input
                    id="estimatedTime"
                    inputMode="numeric"
                    value={estimatedTimeStr}
                    onChange={(e) =>
                      handleTimeInput(
                        e.target.value,
                        setEstimatedTimeStr,
                        "estimatedTimeStr"
                      )
                    }
                    placeholder="30"
                    min={1}
                    className={`focus-visible:ring-purple-500 ${
                      errors.estimatedTimeStr ? "border-red-500" : ""
                    }`}
                    aria-invalid={!!errors.estimatedTimeStr}
                  />
                  {errors.estimatedTimeStr ? (
                    <p className="text-xs text-red-600">
                      {errors.estimatedTimeStr}
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500">
                      Tempo médio de preparo e entrega
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Entrega Grátis */}
          <Card className="border-purple-100">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg lg:text-xl text-purple-700">
                Entrega Grátis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch
                  id="enableFreeDelivery"
                  checked={enableFreeDelivery}
                  onCheckedChange={(checked) => {
                    setEnableFreeDelivery(checked);
                    setErrors((prev) => ({
                      ...prev,
                      freeDeliveryStr: undefined,
                    }));
                  }}
                  className="data-[state=checked]:bg-purple-600"
                />
                <Label htmlFor="enableFreeDelivery" className="select-none">
                  Oferecer entrega grátis
                </Label>
              </div>

              {enableFreeDelivery && (
                <div className="space-y-2 max-w-[520px]">
                  <Label htmlFor="freeDeliveryThreshold">
                    Valor para entrega grátis
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2 rounded-md bg-purple-50 text-purple-700 text-xs sm:text-sm border border-purple-100">
                      R$
                    </span>
                    <Input
                      id="freeDeliveryThreshold"
                      inputMode="decimal"
                      value={freeDeliveryStr}
                      onChange={(e) =>
                        handleCurrencyInput(
                          e.target.value,
                          setFreeDeliveryStr,
                          "freeDeliveryStr"
                        )
                      }
                      placeholder="0,00"
                      className={`text-right focus-visible:ring-purple-500 ${
                        errors.freeDeliveryStr ? "border-red-500" : ""
                      }`}
                      aria-invalid={!!errors.freeDeliveryStr}
                    />
                  </div>
                  {errors.freeDeliveryStr ? (
                    <p className="text-xs text-red-600">
                      {errors.freeDeliveryStr}
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500">
                      Pedidos a partir de{" "}
                      <span className="font-medium text-green-700">
                        {formatBRL(freeDeliveryThreshold ?? 0)}
                      </span>{" "}
                      terão entrega grátis
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumo */}
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg lg:text-xl">
                Resumo das Configurações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-600">Taxa de entrega:</span>
                  <span className="font-medium">{formatBRL(deliveryFee)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-600">Pedido mínimo:</span>
                  <span className="font-medium">{formatBRL(minimumOrder)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-600">Tempo estimado:</span>
                  <span className="font-medium">{estimatedTime} minutos</span>
                </div>
                {enableFreeDelivery && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600">
                      Entrega grátis a partir de:
                    </span>
                    <span className="font-medium text-green-700">
                      {formatBRL(freeDeliveryThreshold ?? 0)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action bar fixa no mobile (some em md+) */}
      <div className="md:hidden sticky bottom-0 inset-x-0 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 p-3">
        <div className="mx-auto max-w-[1100px] px-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-11 bg-purple-600 hover:bg-purple-700 focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            {isSaving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Save className="h-4 w-4" /> Salvar
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
