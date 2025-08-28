"use client";

import { useCardapioAuth, useCreateStore, useFormValidation } from "@/hooks";
import {
  ownerSchema,
  RegisterLojaFormData,
  storeSchema,
} from "@/lib/validation/schemas";
import { CreateStoreDto, CreateUserDto, UserRole } from "@/types/cardapio-api";
import {
  ArrowLeft,
  Eye,
  EyeSlash,
  Storefront,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterLojaPage() {
  const router = useRouter();
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
  });

  // Debug: verificar estado dos hooks de validação
  console.log("🔍 Estado dos hooks de validação:");
  console.log("🔍 ownerValidation:", ownerValidation);
  console.log("🔍 storeValidation:", storeValidation);
  console.log("🔍 formData atual:", formData);

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
      const stringValue = String(value);
      setFormData((prev) => {
        const newData = {
          ...prev,
          [name]: stringValue,
        };

        console.log("🔍 handleInputChange:", { name, value, newData });
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
    }
  };

  const handleNextStep = async () => {
    console.log("🔍 handleNextStep chamado - step:", step);
    console.log("🔍 formData atual:", formData);

    // Validações por step usando Yup
    if (step === 1) {
      console.log("🔍 Validando step 1 (proprietário)");
      const ownerData = {
        ownerName: formData.ownerName,
        ownerEmail: formData.ownerEmail,
        ownerPhone: formData.ownerPhone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      console.log("🔍 Dados do proprietário:", ownerData);
      const validation = await ownerValidation.validateForm(ownerData);
      console.log("🔍 Resultado validação proprietário:", validation);

      if (!validation.isValid) {
        console.log("❌ Validação do proprietário falhou");
        return;
      }
    }

    if (step === 2) {
      console.log("🔍 Validando step 2 (loja)");
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

      console.log("🔍 Dados da loja:", storeData);
      const validation = await storeValidation.validateForm(storeData);
      console.log("🔍 Resultado validação loja:", validation);

      if (!validation.isValid) {
        console.log("❌ Validação da loja falhou");
        return;
      }
    }

    console.log("✅ Validação passou, avançando para step:", step + 1);
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    try {
      // Validações completas antes de enviar
      console.log("🔍 Validando dados antes do envio...");

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
        console.error(
          "❌ Validação do proprietário falhou:",
          ownerValidationResult.errors
        );
        // Mostrar erros específicos
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
        console.error(
          "❌ Validação da loja falhou:",
          storeValidationResult.errors
        );
        // Mostrar erros específicos
        Object.entries(storeValidationResult.errors).forEach(
          ([field, error]) => {
            console.error(`❌ Campo ${field}: ${error}`);
          }
        );
        return;
      }

      setCreationStep("creating-user");
      console.log("🚀 Iniciando processo de criação da loja...");

      // 1. Criar usuário proprietário
      const userData: CreateUserDto = {
        email: String(formData.ownerEmail),
        name: String(formData.ownerName),
        password: String(formData.password),
        role: UserRole.ADMIN,
      };

      console.log("👤 Criando usuário proprietário...");
      const userResponse = await registerMutation.mutateAsync(userData);
      console.log("✅ Usuário criado com sucesso:", userResponse);

      // 2. Aguardar um momento para garantir que o token foi armazenado
      setCreationStep("creating-store");
      console.log("⏳ Aguardando token ser armazenado...");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 3. Criar loja
      const storeCreationData: CreateStoreDto = {
        name: String(formData.storeName),
        slug: String(formData.storeSlug),
        description: String(formData.description || ""),
        config: {
          address: `${String(formData.address)}, ${String(
            formData.city
          )} - ${String(formData.state)} ${String(formData.zipCode || "")}`,
          phone: String(formData.ownerPhone || ""),
          email: String(formData.ownerEmail),
          logo: "",
          banner: "",
          category: String(formData.category),
          deliveryFee: parseFloat(String(formData.deliveryFee)),
          minimumOrder: parseFloat(String(formData.minimumOrder)),
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

      console.log("🏪 Criando loja...");
      const storeResponse = await createStore(storeCreationData);
      console.log("✅ Loja criada com sucesso:", storeResponse);

      // 4. O redirecionamento será feito automaticamente pelo hook useCreateStore
      // O hook já está configurado para redirecionar para /dashboard/${storeSlug}
      setCreationStep("redirecting");
      console.log("🎯 Aguardando redirecionamento automático...");
    } catch (err: any) {
      // Em caso de erro, mostrar erro mas não redirecionar automaticamente
      console.error("❌ Erro durante o processo de registro:", err);
      setCreationStep("idle");

      // Se for erro de criação de loja, o hook já tratou
      // Se for erro de registro de usuário, mostrar mensagem apropriada
      if (err.message?.includes("já possui uma loja")) {
        // Erro já tratado pelo hook
        return;
      }

      // Outros erros podem ser mostrados aqui se necessário
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
                  {creationStep === "redirecting" && "Preparando dashboard..."}
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
                  value={String(formData.ownerName)}
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
                  value={String(formData.ownerEmail)}
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
                  value={String(formData.ownerPhone)}
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
                    value={String(formData.password)}
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
                  value={String(formData.confirmPassword)}
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
                  value={String(formData.storeName)}
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
                    value={String(formData.storeSlug)}
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
                  value={String(formData.category)}
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
                  value={String(formData.description || "")}
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

                <div>
                  <label className="block text-sm font-medium text-gray-800">
                    Endereço *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={String(formData.address)}
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
                      value={String(formData.city)}
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
                      value={String(formData.state)}
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

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-800">
                    CEP
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={String(formData.zipCode || "")}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    placeholder="00000-000"
                  />
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
                    {String(formData.ownerName)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {String(formData.ownerEmail)}
                  </p>
                  {formData.ownerPhone && (
                    <p className="text-sm text-gray-600">
                      {String(formData.ownerPhone)}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Loja</h4>
                  <p className="text-sm text-gray-600">
                    {String(formData.storeName)}
                  </p>
                  <p className="text-sm text-gray-500">
                    cardap.io/store/{String(formData.storeSlug)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {String(formData.category)}
                  </p>
                  {formData.description && (
                    <p className="text-sm text-gray-500 italic">
                      {String(formData.description)}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Endereço</h4>
                  <p className="text-sm text-gray-600">
                    {String(formData.address)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {String(formData.city)}, {String(formData.state)}
                  </p>
                  {formData.zipCode && (
                    <p className="text-sm text-gray-600">
                      CEP: {String(formData.zipCode)}
                    </p>
                  )}
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
                        Taxa de entrega: R$ {String(formData.deliveryFee)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Pedido mínimo: R$ {String(formData.minimumOrder)}
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
                    🏪 Poderá acessar o dashboard para configurar produtos
                  </li>
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
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Voltar
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 font-medium transition-all shadow-md"
                style={{ cursor: "pointer" }}
              >
                Próximo (Step {step})
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || creationStep !== "idle"}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-md hover:from-green-700 hover:to-blue-700 font-medium disabled:opacity-50 transition-all shadow-md"
              >
                {creationStep === "creating-user" && "Criando usuário..."}
                {creationStep === "creating-store" && "Criando loja..."}
                {creationStep === "redirecting" && "Redirecionando..."}
                {creationStep === "idle" &&
                  (isLoading ? "Criando..." : "Criar Loja")}
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
