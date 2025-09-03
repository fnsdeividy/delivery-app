"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import {
  useCardapioAuth,
  useCreateStore,
  useFormValidation,
  useToast,
} from "@/hooks";
import { apiClient } from "@/lib/api-client";
import {
  RegisterLojaFormData,
  ownerSchema,
  storeSchema,
} from "@/lib/validation/schemas";
import { CreateStoreDto, CreateUserDto, UserRole } from "@/types";
import {
  ArrowLeft,
  Eye,
  EyeSlash,
  Storefront,
} from "@phosphor-icons/react/dist/ssr";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Interface para resposta da API ViaCEP
interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export default function RegisterLojaPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { refreshUserData } = useAuthContext();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RegisterLojaFormData>({
    // Dados do proprietário
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    password: "",
    confirmPassword: "",

    // Dados da loja
    storeName: "",
    storeSlug: "",
    description: "",
    category: "",

    // Endereço
    address: "",
    city: "",
    state: "",
    zipCode: "",

    // Configurações iniciais
    deliveryEnabled: true,
    deliveryFee: "5.00",
    minimumOrder: "20.00",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [creationStep, setCreationStep] = useState<
    "idle" | "creating-user" | "creating-store" | "redirecting"
  >("idle");
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  const {
    registerMutation,
    isLoading: isRegistering,
    error: registerError,
  } = useCardapioAuth();
  const { mutateAsync: createStore, isPending: isCreatingStore } =
    useCreateStore();

  const isLoading = isRegistering || isCreatingStore;
  const error = registerError;

  // Função para formatar CEP
  const formatCep = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length <= 5) {
      return numericValue;
    }
    return `${numericValue.slice(0, 5)}-${numericValue.slice(5, 8)}`;
  };

  // Função para consultar CEP na API ViaCEP
  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");

    if (cleanCep.length !== 8) {
      setCepError("CEP deve conter 8 dígitos");
      return;
    }

    setIsLoadingCep(true);
    setCepError(null);

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`
      );
      const data: ViaCepResponse = await response.json();

      if (data.erro) {
        setCepError("CEP não encontrado");
        return;
      }

      // Preencher campos automaticamente
      setFormData((prev) => ({
        ...prev,
        address: data.logradouro
          ? `${data.logradouro}, ${data.bairro}`
          : prev.address,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
      }));

      console.log("✅ Endereço preenchido automaticamente:", {
        address: data.logradouro ? `${data.logradouro}, ${data.bairro}` : "",
        city: data.localidade,
        state: data.uf,
      });
    } catch (error) {
      console.error("❌ Erro ao consultar CEP:", error);
      setCepError("Erro ao consultar CEP. Tente novamente.");
    } finally {
      setIsLoadingCep(false);
    }
  };

  // Hooks de validação para cada step
  const ownerValidation = useFormValidation(ownerSchema, {
    ownerName: formData.ownerName,
    ownerEmail: formData.ownerEmail,
    ownerPhone: formData.ownerPhone,
    password: formData.password,
    confirmPassword: formData.confirmPassword,
  });

  const storeValidation = useFormValidation(storeSchema, {
    storeName: formData.storeName,
    storeSlug: formData.storeSlug,
    description: formData.description,
    category: formData.category,
    address: formData.address,
    city: formData.city,
    state: formData.state,
    zipCode: formData.zipCode,
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      let stringValue = String(value);

      // Aplicar máscara de CEP
      if (name === "zipCode") {
        stringValue = formatCep(stringValue);
        setCepError(null); // Limpar erro quando usuário digitar
      }

      setFormData((prev) => {
        const newData = {
          ...prev,
          [name]: stringValue,
        };

        return newData;
      });

      // Auto-gerar slug quando digitar nome da loja
      if (name === "storeName") {
        const slug = stringValue
          .toLowerCase()
          .replace(/[^\w\s]/gi, "")
          .replace(/\s+/g, "-")
          .replace(/^-+|-+$/g, "");

        setFormData((prev) => ({
          ...prev,
          storeSlug: slug,
        }));
      }

      // Consultar CEP automaticamente quando completo
      if (name === "zipCode") {
        const cleanCep = stringValue.replace(/\D/g, "");
        if (cleanCep.length === 8) {
          fetchAddressByCep(stringValue);
        }
      }
    }
  };

  const handleNextStep = async () => {
    // Validações por step usando Yup
    if (step === 1) {
      const ownerData = {
        ownerName: formData.ownerName,
        ownerEmail: formData.ownerEmail,
        ownerPhone: formData.ownerPhone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      const validation = await ownerValidation.validateForm(ownerData);

      if (!validation.isValid) {
        // Mostrar primeiro erro encontrado
        const firstError = Object.values(validation.errors)[0];
        if (firstError) {
          showToast(firstError, "error");
        }
        return;
      }
    }

    if (step === 2) {
      const storeData = {
        storeName: formData.storeName,
        storeSlug: formData.storeSlug,
        description: formData.description,
        category: formData.category,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
      };

      const validation = await storeValidation.validateForm(storeData);

      if (!validation.isValid) {
        // Mostrar primeiro erro encontrado
        const firstError = Object.values(validation.errors)[0];
        if (firstError) {
          showToast(firstError, "error");
        }
        return;
      }
    }
    
    // Feedback visual de progresso
    showToast(`Etapa ${step} concluída!`, "success");
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    try {
      // Validações completas antes de enviar
      // Validar dados do proprietário
      const ownerData = {
        ownerName: formData.ownerName,
        ownerEmail: formData.ownerEmail,
        ownerPhone: formData.ownerPhone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      const ownerValidationResult = await ownerValidation.validateForm(
        ownerData
      );
      if (!ownerValidationResult.isValid) {
        Object.entries(ownerValidationResult.errors).forEach(
          ([field, error]) => {
            console.error(`❌ Campo ${field}: ${error}`);
          }
        );
        return;
      }

      // Validar dados da loja
      const storeData = {
        storeName: formData.storeName,
        storeSlug: formData.storeSlug,
        description: formData.description,
        category: formData.category,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
      };

      const storeValidationResult = await storeValidation.validateForm(
        storeData
      );
      if (!storeValidationResult.isValid) {
        Object.entries(storeValidationResult.errors).forEach(
          ([field, error]) => {
            console.error(`❌ Campo ${field}: ${error}`);
          }
        );
        return;
      }

      setCreationStep("creating-user");
      // 1. Criar usuário proprietário
      const userData: CreateUserDto = {
        email:
          typeof formData.ownerEmail === "string" ? formData.ownerEmail : "",
        name: typeof formData.ownerName === "string" ? formData.ownerName : "",
        password:
          typeof formData.password === "string" ? formData.password : "",
        role: UserRole.ADMIN,
      };

      const userResponse = await registerMutation.mutateAsync(userData);

      // 2. Aguardar um momento para garantir que o token foi armazenado
      setCreationStep("creating-store");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 3. Criar loja com slug único
      const baseSlug =
        typeof formData.storeSlug === "string" ? formData.storeSlug : "";
      const uniqueSlug = `${baseSlug}-${Date.now()}`;

      const storeCreationData: CreateStoreDto = {
        name: typeof formData.storeName === "string" ? formData.storeName : "",
        slug: uniqueSlug,
        description:
          typeof formData.description === "string" ? formData.description : "",
        config: {
          address: `${
            typeof formData.address === "string" ? formData.address : ""
          }, ${typeof formData.city === "string" ? formData.city : ""} - ${
            typeof formData.state === "string" ? formData.state : ""
          } ${
            typeof formData.zipCode === "string" ||
            typeof formData.zipCode === "number"
              ? formData.zipCode
              : ""
          }`,
          phone:
            typeof formData.ownerPhone === "string" ? formData.ownerPhone : "",
          email:
            typeof formData.ownerEmail === "string" ? formData.ownerEmail : "",
          logo: "",
          banner: "",
          category:
            typeof formData.category === "string" ? formData.category : "",
          deliveryFee:
            typeof formData.deliveryFee === "number"
              ? formData.deliveryFee
              : typeof formData.deliveryFee === "string"
              ? parseFloat(formData.deliveryFee) || 0
              : 0,
          minimumOrder:
            typeof formData.minimumOrder === "number"
              ? formData.minimumOrder
              : typeof formData.minimumOrder === "string"
              ? parseFloat(formData.minimumOrder) || 0
              : 0,
          estimatedDeliveryTime: 30,
          businessHours: {
            monday: { open: true, openTime: "08:00", closeTime: "18:00" },
            tuesday: { open: true, openTime: "08:00", closeTime: "18:00" },
            wednesday: { open: true, openTime: "08:00", closeTime: "18:00" },
            thursday: { open: true, openTime: "08:00", closeTime: "18:00" },
            friday: { open: true, openTime: "08:00", closeTime: "18:00" },
            saturday: { open: true, openTime: "08:00", closeTime: "18:00" },
            sunday: { open: false },
          },
          paymentMethods: ["PIX", "CARTÃO", "DINHEIRO"],
        },
      };

      const storeResponse = await createStore(storeCreationData);

      setCreationStep("redirecting");

      // Invalidar queries para atualizar estado da aplicação
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["stores"] });

      // Atualizar dados do usuário no AuthContext
      await refreshUserData();

      // Mostrar toast de sucesso
      showToast(
        "Loja criada com sucesso! Redirecionando para a página inicial...",
        "success"
      );

      // 4. Definir loja atual de forma otimista para ajudar os guards
      try {
        await apiClient.setCurrentStore({ storeSlug: uniqueSlug });
      } catch (e) {
        // se falhar, seguimos com polling
      }

      // 5. Tela intermediária + polling até ter acesso ao dashboard
      const start = Date.now();
      const timeoutMs = 15000; // 15s
      const intervalMs = 700; // 0.7s

      const canAccessDashboard = async () => {
        try {
          // Se conseguir obter a loja pelo slug autenticado, pressupomos acesso
          await apiClient.getStoreBySlug(uniqueSlug);
          return true;
        } catch (err: any) {
          // 401/403: ainda não propagou permissão; continuar tentando
          // 404: loja pode não estar disponível imediatamente; continuar tentando
          return false;
        }
      };

      // Loop de polling com timeout
      while (Date.now() - start < timeoutMs) {
        const ok = await canAccessDashboard();
        if (ok) {
          // Redirecionar para página inicial com usuário logado
          router.push("/");
          return;
        }
        await new Promise((r) => setTimeout(r, intervalMs));
      }

      // Se expirou, redirecionar para home mesmo assim
      showToast(
        "Loja criada com sucesso! Você já pode acessar sua conta.",
        "success"
      );
      
      // Aguardar um pouco para o toast aparecer e redirecionar
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: any) {
      console.error("❌ Erro durante o processo de registro:", err);
      setCreationStep("idle");

      // Tratamento específico para conflitos de email/usuário
      if (err.message?.includes("User with this email already exists")) {
        showToast(
          "Este email já está cadastrado. Tente fazer login ou use outro email.",
          "error"
        );
        setStep(1); // Voltar para o step do email
        return;
      }

      // Tratamento específico para conflitos de slug de loja
      if (
        err.message?.includes("já existe uma loja com o slug") ||
        err.message?.includes("Já existe uma loja")
      ) {
        showToast("Nome da loja já existe. Tente um nome diferente.", "error");
        setStep(2); // Voltar para o step da loja
        return;
      }

      // Outros erros de conflito
      if (err.message?.includes("já possui uma loja")) {
        showToast("Este usuário já possui uma loja cadastrada.", "error");
        setStep(1); // Voltar para o step do usuário
        return;
      }

      // Erros de validação do backend
      if (err.response?.data?.message) {
        const backendMessage = Array.isArray(err.response.data.message) 
          ? err.response.data.message[0] 
          : err.response.data.message;
        showToast(backendMessage, "error");
        return;
      }

      // Erro genérico
      showToast("Erro ao criar loja. Verifique os dados e tente novamente.", "error");
      console.error("Erro não tratado:", err);
    }
  };

  const categories = [
    "Restaurante",
    "Pizzaria",
    "Hamburgueria",
    "Sorveteria",
    "Cafeteria",
    "Padaria",
    "Açaí",
    "Comida Japonesa",
    "Comida Italiana",
    "Comida Brasileira",
    "Vegetariana/Vegana",
    "Outros",
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Ícone */}
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
            <Storefront className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Título */}
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
          Criar Nova Loja
        </h2>
        <p className="mt-2 text-center text-sm text-white/80">
          Configure sua loja em poucos passos
        </p>

        {/* Progress */}
        <div className="mt-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber
                    ? "bg-white/20 text-white border-2 border-white/30"
                    : "bg-white/10 text-white/60 border-2 border-white/20"
                }`}
              >
                {stepNumber}
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-8 mt-2">
            <span className="text-xs text-white/80">Proprietário</span>
            <span className="text-xs text-white/80">Loja</span>
            <span className="text-xs text-white/80">Confirmação</span>
          </div>
        </div>

        {/* Progresso da Criação */}
        {creationStep !== "idle" && (
          <div className="mt-4">
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm text-white/90">
                  {creationStep === "creating-user" &&
                    "Criando conta de usuário..."}
                  {creationStep === "creating-store" &&
                    "Configurando sua loja..."}
                  {creationStep === "redirecting" && "Finalizando cadastro..."}
                </span>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card de Registro */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white rounded-xl shadow-lg py-8 px-6 sm:px-10">
          {/* Step 1: Dados do Proprietário */}
          {step === 1 && (
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-800">
                  Nome completo *
                </label>
                <input
                  type="text"
                  name="ownerName"
                  required
                  value={
                    typeof formData.ownerName === "string"
                      ? formData.ownerName
                      : ""
                  }
                  onChange={handleInputChange}
                  onBlur={() =>
                    ownerValidation.handleFieldBlur(
                      "ownerName",
                      formData.ownerName
                    )
                  }
                  className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 ${
                    ownerValidation.shouldShowError("ownerName")
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Seu nome completo"
                />
                {ownerValidation.shouldShowError("ownerName") && (
                  <p className="text-red-500 text-xs mt-1">
                    {ownerValidation.getFieldError("ownerName")}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800">
                  Email *
                </label>
                <input
                  type="email"
                  name="ownerEmail"
                  required
                  value={
                    typeof formData.ownerEmail === "string"
                      ? formData.ownerEmail
                      : ""
                  }
                  onChange={handleInputChange}
                  onBlur={() =>
                    ownerValidation.handleFieldBlur(
                      "ownerEmail",
                      formData.ownerEmail
                    )
                  }
                  className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 ${
                    ownerValidation.shouldShowError("ownerEmail")
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="seu@email.com"
                />
                {ownerValidation.shouldShowError("ownerEmail") && (
                  <p className="text-red-500 text-xs mt-1">
                    {ownerValidation.getFieldError("ownerEmail")}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="ownerPhone"
                  value={
                    typeof formData.ownerPhone === "string"
                      ? formData.ownerPhone
                      : ""
                  }
                  onChange={handleInputChange}
                  onBlur={() =>
                    ownerValidation.handleFieldBlur(
                      "ownerPhone",
                      formData.ownerPhone
                    )
                  }
                  className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 ${
                    ownerValidation.shouldShowError("ownerPhone")
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="(11) 99999-9999"
                />
                {ownerValidation.shouldShowError("ownerPhone") && (
                  <p className="text-red-500 text-xs mt-1">
                    {ownerValidation.getFieldError("ownerPhone")}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800">
                  Senha *
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={
                      typeof formData.password === "string"
                        ? formData.password
                        : ""
                    }
                    onChange={handleInputChange}
                    onBlur={() =>
                      ownerValidation.handleFieldBlur(
                        "password",
                        formData.password
                      )
                    }
                    className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 ${
                      ownerValidation.shouldShowError("password")
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlash className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {ownerValidation.shouldShowError("password") && (
                  <p className="text-red-500 text-xs mt-1">
                    {ownerValidation.getFieldError("password")}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800">
                  Confirmar senha *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={
                    typeof formData.confirmPassword === "string"
                      ? formData.confirmPassword
                      : ""
                  }
                  onChange={handleInputChange}
                  onBlur={() =>
                    ownerValidation.handleFieldBlur(
                      "confirmPassword",
                      formData.confirmPassword
                    )
                  }
                  className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 ${
                    ownerValidation.shouldShowError("confirmPassword")
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="••••••••"
                />
                {ownerValidation.shouldShowError("confirmPassword") && (
                  <p className="text-red-500 text-xs mt-1">
                    {ownerValidation.getFieldError("confirmPassword")}
                  </p>
                )}
              </div>
            </form>
          )}

          {/* Step 2: Dados da Loja */}
          {step === 2 && (
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-800">
                  Nome da loja *
                </label>
                <input
                  type="text"
                  name="storeName"
                  required
                  value={
                    typeof formData.storeName === "string"
                      ? formData.storeName
                      : ""
                  }
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  placeholder="Ex: Pizzaria do João"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800">
                  URL da loja *
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    cardap.io/store/
                  </span>
                  <input
                    type="text"
                    name="storeSlug"
                    required
                    value={
                      typeof formData.storeSlug === "string"
                        ? formData.storeSlug
                        : ""
                    }
                    onChange={handleInputChange}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    placeholder="pizzaria-do-joao"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Será gerado automaticamente baseado no nome da loja
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800">
                  Categoria *
                </label>
                <select
                  name="category"
                  required
                  value={
                    typeof formData.category === "string"
                      ? formData.category
                      : ""
                  }
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {!formData.category && (
                  <p className="mt-1 text-xs text-red-500">
                    Categoria é obrigatória
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800">
                  Descrição
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={
                    typeof formData.description === "string"
                      ? formData.description
                      : ""
                  }
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  placeholder="Descreva sua loja..."
                />
              </div>

              {/* Campos de Endereço */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Endereço da Loja
                </h3>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-800">
                    CEP
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="zipCode"
                      value={
                        typeof formData.zipCode === "string" ||
                        typeof formData.zipCode === "number"
                          ? String(formData.zipCode)
                          : ""
                      }
                      onChange={handleInputChange}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 ${
                        cepError
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                    {isLoadingCep && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  {cepError && (
                    <p className="text-red-500 text-xs mt-1">
                      {String(cepError)}
                    </p>
                  )}
                  {!cepError &&
                    !isLoadingCep &&
                    (typeof formData.zipCode === "string" ||
                      typeof formData.zipCode === "number") &&
                    formData.zipCode && (
                      <p className="text-green-600 text-xs mt-1">
                        Digite o CEP completo para preencher o endereço
                        automaticamente
                      </p>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800">
                    Endereço *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={
                      typeof formData.address === "string"
                        ? formData.address
                        : ""
                    }
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    placeholder="Rua, número, bairro"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={
                        typeof formData.city === "string" ? formData.city : ""
                      }
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                      placeholder="Sua cidade"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800">
                      Estado *
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={
                        typeof formData.state === "string" ? formData.state : ""
                      }
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                      placeholder="SP, RJ, MG..."
                      maxLength={2}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Digite apenas a sigla (ex: SP, RJ, MG)
                    </p>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Step 3: Confirmação */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h3 className="text-lg font-medium text-green-800 mb-2">
                  Quase pronto! 🎉
                </h3>
                <p className="text-green-700 text-sm">
                  Revise os dados abaixo e confirme a criação da sua loja.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Proprietário</h4>
                  <p className="text-sm text-gray-600">
                    {typeof formData.ownerName === "string"
                      ? formData.ownerName
                      : ""}
                  </p>
                  <p className="text-sm text-gray-600">
                    {typeof formData.ownerEmail === "string"
                      ? formData.ownerEmail
                      : ""}
                  </p>
                  {formData.ownerPhone ? (
                    <p className="text-sm text-gray-600">
                      {typeof formData.ownerPhone === "string"
                        ? formData.ownerPhone
                        : ""}
                    </p>
                  ) : null}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Loja</h4>
                  <p className="text-sm text-gray-600">
                    {typeof formData.storeName === "string"
                      ? formData.storeName
                      : ""}
                  </p>
                  <p className="text-sm text-gray-500">
                    {typeof formData.storeSlug === "string"
                      ? formData.storeSlug
                      : ""}
                  </p>
                  <p className="text-sm text-gray-600">
                    {typeof formData.category === "string"
                      ? formData.category
                      : ""}
                  </p>
                  {Boolean(formData.description) && (
                    <p className="text-sm text-gray-500 italic">
                      {formData.description ? String(formData.description) : ""}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Endereço</h4>
                  <p className="text-sm text-gray-600">
                    {typeof formData.address === "string"
                      ? formData.address
                      : ""}
                  </p>
                  <p className="text-sm text-gray-600">
                    {typeof formData.city === "string" ? formData.city : ""} -{" "}
                    {typeof formData.state === "string" ? formData.state : ""}
                  </p>
                  <p className="text-sm text-gray-600">
                    {typeof formData.zipCode === "string" ||
                    typeof formData.zipCode === "number"
                      ? String(formData.zipCode)
                      : ""}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Configurações</h4>
                  <p className="text-sm text-gray-600">
                    Entrega:{" "}
                    {formData.deliveryEnabled ? "Ativada" : "Desativada"}
                  </p>
                  {formData.deliveryEnabled && (
                    <>
                      <p className="text-sm text-gray-600">
                        Taxa de entrega: R${" "}
                        {(() => {
                          const fee =
                            typeof formData.deliveryFee === "number"
                              ? formData.deliveryFee
                              : typeof formData.deliveryFee === "string"
                              ? parseFloat(formData.deliveryFee)
                              : 0;
                          return !isNaN(fee) ? fee.toFixed(2) : "0.00";
                        })()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Pedido mínimo: R${" "}
                        {(() => {
                          const minOrder =
                            typeof formData.minimumOrder === "number"
                              ? formData.minimumOrder
                              : typeof formData.minimumOrder === "string"
                              ? parseFloat(formData.minimumOrder)
                              : 0;
                          return !isNaN(minOrder)
                            ? minOrder.toFixed(2)
                            : "0.00";
                        })()}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-medium text-blue-800 mb-2">
                  Próximos passos
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>
                    🏠 Será redirecionado para a página inicial como usuário logado
                  </li>
                  <li>🏪 Poderá acessar o dashboard para configurar produtos</li>
                  <li>🎨 Personalizar cores e logo da loja</li>
                  <li>📱 Configurar horários de funcionamento</li>
                  <li>💳 Configurar métodos de pagamento</li>
                </ul>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex space-x-4">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                disabled={isLoading || creationStep !== "idle"}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50 transition-colors"
              >
                ← Voltar
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={isLoading}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 font-medium disabled:opacity-50 transition-all shadow-md flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Validando...
                  </>
                ) : (
                  `Continuar (${step}/3)`
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || creationStep !== "idle"}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-md hover:from-green-700 hover:to-blue-700 font-medium disabled:opacity-50 transition-all shadow-md"
              >
                {creationStep === "creating-user" && (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Criando usuário...
                  </>
                )}
                {creationStep === "creating-store" && (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Criando loja...
                  </>
                )}
                {creationStep === "redirecting" && (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Finalizando...
                  </>
                )}
                {creationStep === "idle" && (
                  <>
                    {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                    {isLoading ? "Processando..." : "Criar Loja"}
                  </>
                )}
              </button>
            )}
          </div>

          {/* Links */}
          <div className="mt-6 flex items-center justify-between">
            <Link
              href="/login"
              className="text-sm font-medium text-purple-600 hover:text-purple-500 transition-colors"
            >
              Já tenho uma loja
            </Link>
            <Link
              href="/"
              className="flex items-center text-sm text-gray-600 hover:text-gray-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
