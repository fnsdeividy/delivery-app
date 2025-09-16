"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import {
  useCardapioAuth,
  useCreateStore,
  useFormValidation,
  useToast,
} from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { ownerSchema, storeSchema } from "@/lib/validation/schemas";
import { CreateStoreDto, CreateUserDto, UserRole } from "@/types";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Componentes
import {
  ActionButtons,
  ConfirmationStep,
  OwnerDataStep,
  RegistrationHeader,
  StoreDataStep,
} from "./components";
import { useRegistrationForm } from "./hooks/useRegistrationForm";

export default function RegisterLojaPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { refreshUserData } = useAuthContext();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [creationStep, setCreationStep] = useState<
    "idle" | "creating-user" | "creating-store" | "redirecting"
  >("idle");

  // Hook personalizado para gerenciar o formulário
  const {
    formData,
    handleInputChange,
    isLoadingCep,
    cepError,
    fetchAddressByCep,
  } = useRegistrationForm();

  const {
    registerMutation,
    isLoading: isRegistering,
    error: registerError,
  } = useCardapioAuth();
  const { mutateAsync: createStore, isPending: isCreatingStore } =
    useCreateStore();

  const isLoading = isRegistering || isCreatingStore;
  const error = registerError;

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
    number: formData.number,
  });

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
      ownerValidation.setIsSubmitted(true);

      if (!validation.isValid) {
        // Mostrar primeiro erro encontrado
        const firstError = Object.values(validation.errors)[0];
        if (firstError) {
          showToast("Revise os campos destacados.", "error");
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
        number: formData.number,
      };

      const validation = await storeValidation.validateForm(storeData);
      storeValidation.setIsSubmitted(true);
      setIsSubmitted(true);

      if (!validation.isValid) {
        // Mostrar primeiro erro encontrado
        const firstError = Object.values(validation.errors)[0];
        if (firstError) {
          showToast("Revise os campos destacados.", "error");
        }
        return;
      }
    }

    // Limpar erros e feedback visual de progresso
    ownerValidation.clearErrors();
    storeValidation.clearErrors();
    setIsSubmitted(false);
    showToast("Informações salvas. Continue para o próximo passo.", "success");
    setStep(step + 1);
  };

  const handlePrevious = () => {
    // Limpar erros ao voltar
    ownerValidation.clearErrors();
    storeValidation.clearErrors();
    setIsSubmitted(false);
    setStep(step - 1);
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
        number: formData.number,
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

      // 3. Criar loja com slug do usuário
      const userSlug =
        typeof formData.storeSlug === "string" ? formData.storeSlug : "";

      const storeCreationData: CreateStoreDto = {
        name: typeof formData.storeName === "string" ? formData.storeName : "",
        slug: userSlug,
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
      if (err.message?.includes("Usuário já existe")) {
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
      showToast(
        "Erro ao criar loja. Verifique os dados e tente novamente.",
        "error"
      );
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
      <RegistrationHeader step={step} creationStep={creationStep} />

      {/* Card de Registro */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white rounded-xl shadow-lg py-8 px-6 sm:px-10">
          {/* Step 1: Dados do Proprietário */}
          {step === 1 && (
            <OwnerDataStep
              formData={formData}
              onInputChange={handleInputChange}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              showConfirmPassword={showConfirmPassword}
              onToggleConfirmPassword={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            />
          )}

          {/* Step 2: Dados da Loja */}
          {step === 2 && (
            <StoreDataStep
              formData={formData}
              onInputChange={handleInputChange}
              categories={categories}
              isLoadingCep={isLoadingCep}
              cepError={cepError}
              onFetchAddress={fetchAddressByCep}
              isSubmitted={isSubmitted}
            />
          )}

          {/* Step 3: Confirmação */}
          {step === 3 && <ConfirmationStep formData={formData} />}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <ActionButtons
            step={step}
            isLoading={isLoading}
            creationStep={creationStep}
            onPrevious={handlePrevious}
            onNext={handleNextStep}
            onSubmit={handleSubmit}
          />

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
