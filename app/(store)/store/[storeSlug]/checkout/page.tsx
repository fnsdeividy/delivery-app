"use client";

import {
  ArrowLeft,
  Clock,
  CreditCard,
  MapPin,
  User,
  WarningCircle,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthContext } from "../../../../../contexts/AuthContext";
import { useCart } from "../../../../../hooks/useCart";
import { usePublicOrders } from "../../../../../hooks/usePublicOrders";
import { apiClient } from "../../../../../lib/api-client";
import {
  CreateOrderDto,
  OrderItemDto,
  OrderType,
} from "../../../../../types/cardapio-api";

interface CheckoutPageProps {
  params: {
    storeSlug: string;
  };
}

interface FormErrors {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  postalCode?: string;
  deliveryAddress?: string;
  deliveryNumber?: string;
  deliveryNeighborhood?: string;
  deliveryCity?: string;
}

const formatPrice = (price: any): string => {
  if (price === null || price === undefined) return "0,00";
  if (typeof price === "string") {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? "0,00" : numPrice.toFixed(2).replace(".", ",");
  }
  if (typeof price === "number") {
    return price.toFixed(2).replace(".", ",");
  }
  return "0,00";
};

// Função para aplicar máscara de telefone
const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, "");

  if (numbers.length <= 11) {
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(
        6
      )}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
        7,
        11
      )}`;
    }
  }

  return value;
};

// Função para formatar CEP
const formatPostalCode = (value: string): string => {
  const numbers = value.replace(/\D/g, "");

  if (numbers.length <= 8) {
    if (numbers.length <= 5) {
      return numbers;
    } else {
      return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
    }
  }

  return numbers.slice(0, 8);
};

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const { storeSlug } = params;
  const { cart, clearCart } = useCart();
  const { createOrder } = usePublicOrders(storeSlug);
  const { isAuthenticated, user } = useAuthContext();
  const router = useRouter();

  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Dados do formulário
  const [formData, setFormData] = useState({
    customerName: user?.name || "",
    customerPhone: "",
    customerEmail: user?.email || "",
    postalCode: "",
    deliveryAddress: "",
    deliveryNumber: "",
    deliveryNeighborhood: "",
    deliveryCity: "",
    deliveryReference: "",
    paymentMethod: "PIX" as const,
    orderType: OrderType.DELIVERY as OrderType,
    observations: "",
  });

  // Estado para controlar o carregamento da busca de CEP
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  // Função para buscar endereço por CEP
  const fetchAddressByCep = async (cep: string) => {
    // Remove caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      return;
    }

    setIsLoadingCep(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          deliveryAddress: `${data.logradouro}`,
          deliveryNeighborhood: data.bairro || prev.deliveryNeighborhood,
          deliveryCity: data.localidade || prev.deliveryCity
        }));

        // Limpa o erro de CEP se existir
        if (formErrors.postalCode) {
          setFormErrors(prev => ({ ...prev, postalCode: undefined }));
        }

        showToast('Endereço encontrado!', 'success');
      } else {
        setFormErrors(prev => ({
          ...prev,
          postalCode: 'CEP não encontrado'
        }));
        showToast('CEP não encontrado', 'error');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      showToast('Erro ao buscar o CEP', 'error');
      setFormErrors(prev => ({
        ...prev,
        postalCode: 'Erro ao buscar o CEP'
      }));
    } finally {
      setIsLoadingCep(false);
    }
  };

  useEffect(() => {
    // Redirecionar se carrinho vazio
    if (cart.items.length === 0) {
      router.push(`/store/${storeSlug}`);
      return;
    }

    // Carregar configurações da loja
    const loadStoreConfig = async () => {
      try {
        const response = await apiClient.getPublicStore(storeSlug);
        setConfig(response);
      } catch (error) {
        console.error("Erro ao carregar configurações da loja:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoreConfig();
  }, [storeSlug, cart.items.length, router]);

  // Validar formulário
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.customerName.trim()) {
      errors.customerName = "Nome é obrigatório";
    }

    if (!formData.customerPhone.trim()) {
      errors.customerPhone = "Telefone é obrigatório";
    } else if (formData.customerPhone.replace(/\D/g, "").length < 10) {
      errors.customerPhone = "Telefone inválido";
    }

    if (
      formData.customerEmail &&
      !/\S+@\S+\.\S+/.test(formData.customerEmail)
    ) {
      errors.customerEmail = "Email inválido";
    }

    if (formData.orderType === OrderType.DELIVERY) {
      if (!formData.postalCode.trim() || formData.postalCode.replace(/\D/g, "").length !== 8) {
        errors.postalCode = "CEP inválido";
      }

      if (!formData.deliveryAddress.trim()) {
        errors.deliveryAddress = "Endereço é obrigatório";
      }

      if (!formData.deliveryNumber.trim()) {
        errors.deliveryNumber = "Número é obrigatório";
      }

      if (!formData.deliveryNeighborhood.trim()) {
        errors.deliveryNeighborhood = "Bairro é obrigatório";
      }

      if (!formData.deliveryCity.trim()) {
        errors.deliveryCity = "Cidade é obrigatória";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    // Remover toasts existentes
    const existingToasts = document.querySelectorAll(".custom-toast");
    existingToasts.forEach((toast) => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    });

    const toast = document.createElement("div");
    toast.className = `custom-toast fixed top-4 right-4 z-[9999] px-4 py-3 rounded-lg text-white font-medium shadow-lg transform transition-all duration-300 translate-x-full opacity-0 ${type === "success" ? "bg-green-500" : "bg-red-500"
      }`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Trigger reflow
    toast.offsetHeight;

    requestAnimationFrame(() => {
      toast.classList.remove("translate-x-full", "opacity-0");
      toast.classList.add("translate-x-0", "opacity-100");
    });

    setTimeout(() => {
      toast.classList.remove("translate-x-0", "opacity-100");
      toast.classList.add("translate-x-full", "opacity-0");
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push(
        `/store/${storeSlug}/login?redirect=${encodeURIComponent(
          `/store/${storeSlug}/checkout`
        )}`
      );
      return;
    }

    // Validar formulário
    if (!validateForm()) {
      showToast(
        "Por favor, preencha os campos obrigatórios corretamente",
        "error"
      );
      // Scroll para o primeiro erro
      const firstErrorField = Object.keys(formErrors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          // Focar no campo com erro
          const input = element.querySelector("input");
          if (input) {
            input.focus();
          }
        }
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const deliveryFee = formData.orderType === OrderType.DELIVERY ? 5.0 : 0;

      const orderData: CreateOrderDto = {
        customerId: user?.id || "guest-" + Date.now(),
        storeSlug,
        type: formData.orderType,
        deliveryFee,
        discount: 0,
        subtotal: cart.total,
        total: cart.total + deliveryFee,
        paymentMethod: formData.paymentMethod,
        notes: `Nome: ${formData.customerName}\nTelefone: ${formData.customerPhone
          }${formData.customerEmail ? `\nEmail: ${formData.customerEmail}` : ""}${formData.orderType === OrderType.DELIVERY
            ? `\nCEP: ${formData.postalCode}\nEndereço: ${formData.deliveryAddress}, ${formData.deliveryNumber}, ${formData.deliveryNeighborhood
            }, ${formData.deliveryCity}${formData.deliveryReference
              ? `\nReferência: ${formData.deliveryReference}`
              : ""
            }`
            : ""
          }${formData.observations ? `\nObservações: ${formData.observations}` : ""
          }`,
        items: cart.items.map(
          (item): OrderItemDto => ({
            productId: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
            customizations: {
              removedIngredients: [],
              addons: [],
              observations: item.notes || "",
            },
          })
        ),
      };

      const order = await createOrder(orderData);

      showToast("Pedido realizado com sucesso!", "success");
      clearCart();

      // Redirecionar para página de confirmação ou pedidos
      setTimeout(() => {
        router.push(`/store/${storeSlug}?orderSuccess=true`);
      }, 1000);
    } catch (error: any) {
      console.error("Erro ao finalizar pedido:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erro ao finalizar pedido";
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deliveryFee = formData.orderType === OrderType.DELIVERY ? 5.0 : 0;
  const total = cart.total + deliveryFee;

  // Cores do branding da loja
  const brandingColors = {
    primary: config?.config?.branding?.primaryColor || "#f97316",
    secondary: config?.config?.branding?.secondaryColor || "#ea580c",
    accent: config?.config?.branding?.accentColor || "#fb923c",
    background: config?.config?.branding?.backgroundColor || "#fef3c7",
    text: config?.config?.branding?.textColor || "#1f2937",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
            style={{ borderBottomColor: brandingColors.primary }}
          ></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Carrinho vazio
          </h2>
          <p className="text-gray-600 mb-4">Adicione produtos para continuar</p>
          <button
            onClick={() => router.push(`/store/${storeSlug}`)}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all"
            style={{ backgroundColor: brandingColors.primary }}
          >
            Voltar à loja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-10">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Finalizar Pedido
              </h1>
              <p className="text-sm text-gray-600 font-medium">
                {config?.store?.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Resumo do Pedido */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8 hover:shadow-xl transition-all duration-300">
            <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: brandingColors.primary }}
              ></div>
              Resumo do Pedido
            </h2>
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex-1 pr-4">
                    <span className="font-semibold text-gray-900 text-black">
                      {item.quantity}x {item.product.name}
                    </span>
                    {item.notes && (
                      <p className="text-sm text-gray-600 mt-1 italic">
                        Obs: {item.notes}
                      </p>
                    )}
                  </div>
                  <span
                    className="font-bold text-lg"
                    style={{ color: brandingColors.primary }}
                  >
                    R$ {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-semibold">
                    R$ {formatPrice(cart.total)}
                  </span>
                </div>
                {formData.orderType === OrderType.DELIVERY && (
                  <div className="flex justify-between text-gray-700">
                    <span className="font-medium">Taxa de entrega</span>
                    <span className="font-semibold">
                      R$ {formatPrice(deliveryFee)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold border-t border-gray-300 pt-3 bg-gray-50 -mx-3 px-3 py-2 rounded-lg">
                  <span className="text-gray-900">Total</span>
                  <span
                    className="text-2xl"
                    style={{ color: brandingColors.primary }}
                  >
                    R$ {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tipo de Pedido */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8 hover:shadow-xl transition-all duration-300">
            <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
              <Clock
                className="h-6 w-6"
                style={{ color: brandingColors.primary }}
              />
              Tipo de Pedido
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="orderType"
                  value={OrderType.DELIVERY}
                  checked={formData.orderType === OrderType.DELIVERY}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      orderType: e.target.value as OrderType,
                    }))
                  }
                  className="sr-only"
                />
                <div
                  className={`p-6 border-2 rounded-xl text-center transition-all duration-300 hover:scale-105 ${formData.orderType === OrderType.DELIVERY
                      ? "shadow-lg transform scale-105"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                  style={{
                    borderColor:
                      formData.orderType === OrderType.DELIVERY
                        ? brandingColors.primary
                        : undefined,
                    backgroundColor:
                      formData.orderType === OrderType.DELIVERY
                        ? brandingColors.background
                        : undefined,
                  }}
                >
                  <MapPin
                    className="h-8 w-8 mx-auto mb-3"
                    style={{
                      color:
                        formData.orderType === OrderType.DELIVERY
                          ? brandingColors.primary
                          : "#6b7280",
                    }}
                  />
                  <span className="font-bold text-lg text-gray-900">
                    Entrega
                  </span>
                  <p className="text-sm text-gray-600 mt-1 font-medium">
                    R$ {formatPrice(deliveryFee)}
                  </p>
                </div>
              </label>

              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="orderType"
                  value={OrderType.PICKUP}
                  checked={formData.orderType === OrderType.PICKUP}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      orderType: e.target.value as OrderType,
                    }))
                  }
                  className="sr-only"
                />
                <div
                  className={`p-6 border-2 rounded-xl text-center transition-all duration-300 hover:scale-105 ${formData.orderType === OrderType.PICKUP
                      ? "shadow-lg transform scale-105"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                  style={{
                    borderColor:
                      formData.orderType === OrderType.PICKUP
                        ? brandingColors.primary
                        : undefined,
                    backgroundColor:
                      formData.orderType === OrderType.PICKUP
                        ? brandingColors.background
                        : undefined,
                  }}
                >
                  <Clock
                    className="h-8 w-8 mx-auto mb-3"
                    style={{
                      color:
                        formData.orderType === OrderType.PICKUP
                          ? brandingColors.primary
                          : "#6b7280",
                    }}
                  />
                  <span className="font-bold text-lg text-gray-900">
                    Retirada
                  </span>
                  <p className="text-sm text-gray-600 mt-1 font-medium">
                    Grátis
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8 hover:shadow-xl transition-all duration-300">
            <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
              <User
                className="h-6 w-6"
                style={{ color: brandingColors.primary }}
              />
              Seus Dados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div id="customerName">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Nome completo *
                </label>
                <input
                  data-testid="customer-name"
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customerName: e.target.value,
                    }))
                  }
                  onBlur={() => validateForm()}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 text-black ${formErrors.customerName
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400 focus:bg-white"
                    }`}
                  style={
                    {
                      "--tw-ring-color": brandingColors.primary + "80",
                    } as React.CSSProperties
                  }
                  placeholder="Seu nome completo"
                />
                {formErrors.customerName && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <WarningCircle size={14} />
                    {formErrors.customerName}
                  </p>
                )}
              </div>

              <div id="customerPhone">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  WhatsApp *
                </label>
                <input
                  data-testid="customer-phone"
                  type="tel"
                  required
                  value={formData.customerPhone}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      customerPhone: formatted,
                    }));
                  }}
                  onBlur={() => validateForm()}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 text-black ${formErrors.customerPhone
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400 focus:bg-white"
                    }`}
                  style={
                    {
                      "--tw-ring-color": brandingColors.primary + "80",
                    } as React.CSSProperties
                  }
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                />
                {formErrors.customerPhone && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <WarningCircle size={14} />
                    {formErrors.customerPhone}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2" id="customerEmail">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Email
                </label>
                <input
                  data-testid="customer-email"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customerEmail: e.target.value,
                    }))
                  }
                  onBlur={() => validateForm()}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 text-black ${formErrors.customerEmail
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400 focus:bg-white"
                  }`}
                style={
                  {
                    "--tw-ring-color": brandingColors.primary + "80",
                  } as React.CSSProperties
                }
                placeholder="seu@email.com"
                />
                {formErrors.customerEmail && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <WarningCircle size={14} />
                    {formErrors.customerEmail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Endereço de Entrega (apenas para delivery) */}
          {formData.orderType === OrderType.DELIVERY && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8 hover:shadow-xl transition-all duration-300">
              <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                <MapPin
                  className="h-6 w-6"
                  style={{ color: brandingColors.primary }}
                />
                Endereço de Entrega
              </h2>
              <div className="space-y-6">
                {/* Campo de CEP com busca automática */}
                <div id="postalCode">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    CEP *
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        required
                        value={formData.postalCode}
                        onChange={(e) => {
                          const formatted = formatPostalCode(e.target.value);
                          setFormData((prev) => ({
                            ...prev,
                            postalCode: formatted,
                          }));
                        }}
                        onBlur={(e) => {
                          validateForm();
                          if (e.target.value.replace(/\D/g, "").length === 8) {
                            fetchAddressByCep(e.target.value);
                          }
                        }}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 text-black ${formErrors.postalCode
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 hover:border-gray-400 focus:bg-white"
                          }`}
                        style={{
                          "--tw-ring-color": brandingColors.primary + "80",
                        } as React.CSSProperties}
                        placeholder="00000-000"
                        maxLength={9}
                      />
                      {formErrors.postalCode && (
                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                          <WarningCircle size={14} />
                          {formErrors.postalCode}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fetchAddressByCep(formData.postalCode)}
                      disabled={isLoadingCep || formData.postalCode.replace(/\D/g, "").length !== 8}
                      className="px-4 py-3 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      style={{ backgroundColor: brandingColors.primary }}
                    >
                      {isLoadingCep ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        "Buscar"
                      )}
                    </button>
                  </div>
                </div>

                <div id="deliveryAddress">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Endereço (Logradouro) *
                  </label>
                  <input
                    data-testid="customer-address"
                    type="text"
                    required
                    value={formData.deliveryAddress}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deliveryAddress: e.target.value,
                      }))
                    }
                    onBlur={() => validateForm()}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 text-black ${formErrors.deliveryAddress
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400 focus:bg-white"
                    }`}
                  style={
                    {
                      "--tw-ring-color": brandingColors.primary + "80",
                    } as React.CSSProperties
                  }
                  placeholder="Rua, Avenida..."
                  />
                  {formErrors.deliveryAddress && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <WarningCircle size={14} />
                      {formErrors.deliveryAddress}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div id="deliveryNumber">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Número *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.deliveryNumber}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          deliveryNumber: e.target.value,
                        }))
                      }
                      onBlur={() => validateForm()}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 text-black ${formErrors.deliveryNumber
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-gray-400 focus:bg-white"
                        }`}
                      style={
                        {
                          "--tw-ring-color": brandingColors.primary + "80",
                        } as React.CSSProperties
                      }
                      placeholder="123"
                    />
                    {formErrors.deliveryNumber && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <WarningCircle size={14} />
                        {formErrors.deliveryNumber}
                      </p>
                    )}
                  </div>
                  <div id="deliveryNeighborhood">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Bairro *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.deliveryNeighborhood}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          deliveryNeighborhood: e.target.value,
                        }))
                      }
                      onBlur={() => validateForm()}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 text-black ${formErrors.deliveryNeighborhood
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-gray-400 focus:bg-white"
                        }`}
                      style={
                        {
                          "--tw-ring-color": brandingColors.primary + "80",
                        } as React.CSSProperties
                      }
                      placeholder="Nome do bairro"
                    />
                    {formErrors.deliveryNeighborhood && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <WarningCircle size={14} />
                        {formErrors.deliveryNeighborhood}
                      </p>
                    )}
                  </div>

                  <div id="deliveryCity">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.deliveryCity}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          deliveryCity: e.target.value,
                        }))
                      }
                      onBlur={() => validateForm()}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 text-black ${formErrors.deliveryCity
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-gray-400 focus:bg-white"
                        }`}
                      style={
                        {
                          "--tw-ring-color": brandingColors.primary + "80",
                        } as React.CSSProperties
                      }
                      placeholder="Nome da cidade"
                    />
                    {formErrors.deliveryCity && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <WarningCircle size={14} />
                        {formErrors.deliveryCity}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Ponto de referência
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryReference}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deliveryReference: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 text-black hover:border-gray-400 focus:bg-white"
                    style={
                      {
                        "--tw-ring-color": brandingColors.primary + "80",
                      } as React.CSSProperties
                    }
                    placeholder="Ex: Próximo ao mercado"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Forma de Pagamento */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8 hover:shadow-xl transition-all duration-300">
            <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
              <CreditCard
                className="h-6 w-6"
                style={{ color: brandingColors.primary }}
              />
              Forma de Pagamento
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {["PIX", "DINHEIRO", "CARTAO"].map((method) => (
                <label key={method} className="cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={formData.paymentMethod === method}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentMethod: e.target.value as any,
                      }))
                    }
                    className="sr-only"
                  />
                  <div
                    className={`p-4 border-2 rounded-xl text-center transition-all duration-300 hover:scale-105 ${formData.paymentMethod === method
                        ? "shadow-lg transform scale-105"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                      }`}
                    style={{
                      borderColor:
                        formData.paymentMethod === method
                          ? brandingColors.primary
                          : undefined,
                      backgroundColor:
                        formData.paymentMethod === method
                          ? brandingColors.background
                          : undefined,
                    }}
                  >
                    <span className="font-bold text-black text-gray-900">
                      {method === "PIX"
                        ? "PIX"
                        : method === "DINHEIRO"
                          ? "Dinheiro"
                          : "Cartão"}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8 hover:shadow-xl transition-all duration-300">
            <h2 className="text-xl font-bold mb-6 text-gray-900">
              Observações
            </h2>
            <textarea
              value={formData.observations}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  observations: e.target.value,
                }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 text-black hover:border-gray-400 focus:bg-white resize-none"
              style={
                {
                  "--tw-ring-color": brandingColors.primary + "80",
                } as React.CSSProperties
              }
              placeholder="Alguma observação especial sobre seu pedido?"
              rows={4}
            />
          </div>

          {/* Botão Finalizar */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8 hover:shadow-xl transition-all duration-300">
            <button
              type="submit"
              disabled={isSubmitting || !isAuthenticated}
              className="w-full py-4 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100"
              style={{
                backgroundColor: brandingColors.primary,
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Finalizando pedido...
                </>
              ) : !isAuthenticated ? (
                "Faça login para continuar"
              ) : (
                `Finalizar Pedido - R$ ${formatPrice(total)}`
              )}
            </button>

            {!isAuthenticated && (
              <p className="text-center text-sm text-gray-600 mt-4">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/store/${storeSlug}/login?redirect=${encodeURIComponent(
                        `/store/${storeSlug}/checkout`
                      )}`
                    )
                  }
                  className="hover:underline transition-colors font-semibold"
                  style={{ color: brandingColors.primary }}
                >
                  Clique aqui para fazer login
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
