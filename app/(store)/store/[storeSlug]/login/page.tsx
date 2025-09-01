"use client";

import {
  Eye,
  EyeSlash,
  SignIn,
  UserPlus,
  WhatsappLogo,
} from "@phosphor-icons/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuthContext } from "../../../../../contexts/AuthContext";
import { useStoreConfig } from "../../../../../lib/store/useStoreConfig";

declare module "react" {
  interface CSSProperties {
    "--focus-ring-color"?: string;
  }
}

interface CustomerLoginData {
  phone: string;
  password: string;
}

interface CustomerRegisterData {
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  name?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function CustomerLoginPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeSlug = params.storeSlug as string;
  const redirect = searchParams.get("redirect");

  const { login, register, isLoading } = useAuthContext();
  const [storeConfig, setStoreConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isLogin, setIsLogin] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const [loginData, setLoginData] = useState<CustomerLoginData>({
    phone: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState<CustomerRegisterData>({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Cores fallback no tema "rocha" (tons terrosos)
  const rockColors = {
    primary: "#8B7E6B", // Marrom acinzentado
    secondary: "#A9A18C", // Bege acinzentado
    accent: "#5D5348", // Marrom escuro
    light: "#D1CBBB", // Bege claro
    dark: "#3E3A32", // Marrom quase preto
  };

  // Carrega as configurações da loja via API
  useEffect(() => {
    const fetchStoreConfig = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3001/api/v1/stores/public/${storeSlug}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Loja não encontrada");
        }

        const data = await response.json();

        const config = {
          id: data.store.id,
          name: data.store.name,
          slug: data.store.slug,
          description: data.store.description,
          active: data.store.active,
          approved: data.store.approved || false,
          branding: {
            logo: data.config?.logo || "",
            favicon: data.config?.favicon || "",
            banner: data.config?.banner || "",
            primaryColor: data.config?.branding?.primaryColor || "#f97316",
            secondaryColor: data.config?.branding?.secondaryColor || "#ea580c",
            backgroundColor: data.config?.branding?.backgroundColor || "#ffffff",
            textColor: data.config?.branding?.textColor || "#000000",
            accentColor: data.config?.branding?.accentColor || "#f59e0b",
          },
        };

        setStoreConfig(config);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        console.error("Erro ao carregar configurações da loja:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreConfig();
  }, [storeSlug]);

  const formatPhoneNumber = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Aplica máscara (11) 99999-9999
    if (numbers.length >= 11) {
      return numbers
        .slice(0, 11)
        .replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (numbers.length > 7) {
      return numbers.replace(/(\d{2})(\d{1,5})(\d{1,4})/, "($1) $2-$3");
    } else if (numbers.length > 2) {
      return numbers.replace(/(\d{2})(\d{0,5})/, "($1) $2");
    }

    return numbers;
  };

  const validatePhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, "");
    return numbers.length === 11;
  };

  const validateLoginForm = () => {
    const newErrors: ValidationErrors = {};

    if (!loginData.phone) {
      newErrors.phone = "Número de WhatsApp é obrigatório";
    } else if (!validatePhone(loginData.phone)) {
      newErrors.phone =
        "Por favor, insira um número de WhatsApp válido com DDD";
    }

    if (!loginData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (loginData.password.length < 6) {
      newErrors.password = "A senha deve ter pelo menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = () => {
    const newErrors: ValidationErrors = {};

    if (!registerData.name.trim()) {
      newErrors.name = "Nome completo é obrigatório";
    } else if (registerData.name.trim().length < 3) {
      newErrors.name = "O nome deve ter pelo menos 3 caracteres";
    }

    if (!registerData.phone) {
      newErrors.phone = "Número de WhatsApp é obrigatório";
    } else if (!validatePhone(registerData.phone)) {
      newErrors.phone =
        "Por favor, insira um número de WhatsApp válido com DDD";
    }

    if (!registerData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (registerData.password.length < 6) {
      newErrors.password = "A senha deve ter pelo menos 6 caracteres";
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(registerData.password)) {
      newErrors.password = "A senha deve conter letras e números";
    }

    if (!registerData.confirmPassword) {
      newErrors.confirmPassword = "Confirmação de senha é obrigatória";
    } else if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneChange = (value: string, isLoginForm: boolean = true) => {
    const formatted = formatPhoneNumber(value);

    if (isLoginForm) {
      setLoginData((prev) => ({ ...prev, phone: formatted }));
      if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
    } else {
      setRegisterData((prev) => ({ ...prev, phone: formatted }));
      if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateLoginForm()) return;

    try {
      // Converter telefone para email temporário para usar o sistema existente
      const phoneNumbers = loginData.phone.replace(/\D/g, "");
      const tempEmail = `${phoneNumbers}@whatsapp.temp`;

      await login(tempEmail, loginData.password, storeSlug);

      // Redirecionar para a página solicitada ou para a loja
      const redirectTo = redirect || `/store/${storeSlug}`;
      router.push(redirectTo);
    } catch (err: any) {
      setErrors({
        general:
          err.message || "Erro ao fazer login. Verifique suas credenciais.",
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRegisterForm()) return;

    try {
      // Converter telefone para email temporário para usar o sistema existente
      const phoneNumbers = registerData.phone.replace(/\D/g, "");
      const tempEmail = `${phoneNumbers}@whatsapp.temp`;

      await register({
        name: registerData.name,
        email: tempEmail,
        phone: registerData.phone,
        password: registerData.password,
        role: "CUSTOMER",
        storeSlug: storeSlug,
      });

      // Redirecionar para a página solicitada ou para a loja
      const redirectTo = redirect || `/store/${storeSlug}`;
      router.push(redirectTo);
    } catch (err: any) {
      setErrors({
        general: err.message || "Erro ao criar conta. Tente novamente.",
      });
    }
  };

  const clearError = (field: keyof ValidationErrors) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const inputStyles: React.CSSProperties = {
    outline: "2px solid var(--focus-ring-color)",
    outlineOffset: "2px",
  };

  // Usar as cores da loja ou o tema rocha como fallback
  const primaryColor = storeConfig?.branding?.primaryColor || rockColors.primary;
  const secondaryColor = storeConfig?.branding?.secondaryColor || rockColors.secondary;
  const accentColor = storeConfig?.branding?.accentColor || rockColors.accent;
  const backgroundColor = storeConfig?.branding?.backgroundColor || "#ffffff";
  const textColor = storeConfig?.branding?.textColor || "#000000";
  const storeName = storeConfig?.name || "Loja";

  // Exibir carregando enquanto busca as configurações da loja
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Exibir erro se houver problemas ao buscar a loja
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loja não encontrada</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8"
      style={{ 
        backgroundColor: backgroundColor,
        color: textColor
      }}>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo da Loja */}
        <div className="flex justify-center mb-6">
          {storeConfig?.branding?.logo ? (
            <img
              src={storeConfig.branding.logo}
              alt={storeName}
              className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {storeName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Título */}
        <h2 className="text-center text-3xl font-bold text-stone-800">
          {isLogin ? "Entrar" : "Criar Conta"}
        </h2>
        <p className="mt-2 text-center text-sm text-stone-600">
          {isLogin
            ? `Acesse sua conta em ${storeName}`
            : `Crie sua conta em ${storeName}`}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-stone-200">
          {/* Toggle Login/Registro */}
          <div className="flex mb-6 rounded-lg overflow-hidden border border-stone-300 shadow-sm">
            <button
              onClick={() => {
                setIsLogin(true);
                setErrors({});
              }}
              className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-1 ${
                isLogin
                  ? "text-white"
                  : "text-stone-600 bg-stone-100 hover:bg-stone-200"
              } transition-colors`}
              style={{
                backgroundColor: isLogin ? primaryColor : undefined,
              }}
            >
              <SignIn size={16} />
              Entrar
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setErrors({});
              }}
              className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-1 ${
                !isLogin
                  ? "text-white"
                  : "text-stone-600 bg-stone-100 hover:bg-stone-200"
              } transition-colors`}
              style={{
                backgroundColor: !isLogin ? primaryColor : undefined,
              }}
            >
              <UserPlus size={16} />
              Criar Conta
            </button>
          </div>

          {/* Formulário de Login */}
          {isLogin ? (
            <form className="space-y-5" onSubmit={handleLogin}>
              {/* WhatsApp */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-stone-700 mb-1"
                >
                  Número do WhatsApp
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <WhatsappLogo className="h-5 w-5 text-green-500" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={loginData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value, true)}
                    onFocus={() => clearError("phone")}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg placeholder-stone-400 focus:outline-none transition-colors ${
                      errors.phone
                        ? "border-rose-500"
                        : "border-stone-300 focus:border-stone-500"
                    }`}
                    style={{
                      "--focus-ring-color": primaryColor,
                      ...inputStyles,
                    }}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-rose-600">{errors.phone}</p>
                )}
              </div>

              {/* Senha */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-stone-700 mb-1"
                >
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginData.password}
                    onChange={(e) => {
                      setLoginData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }));
                      clearError("password");
                    }}
                    className={`block w-full px-3 py-2.5 pr-10 border rounded-lg placeholder-stone-400 focus:outline-none transition-colors ${
                      errors.password
                        ? "border-rose-500"
                        : "border-stone-300 focus:border-stone-500"
                    }`}
                    style={{
                      "--focus-ring-color": primaryColor,
                      ...inputStyles,
                    }}
                    placeholder="Digite sua senha"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                  >
                    {showLoginPassword ? (
                      <EyeSlash className="h-5 w-5 text-stone-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-stone-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-rose-600">
                    {errors.password}
                  </p>
                )}
              </div>

              {errors.general && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                  <p className="text-rose-700 text-sm">{errors.general}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors hover:shadow-md"
                  style={{
                    backgroundColor: primaryColor,
                    "--focus-ring-color": primaryColor,
                  }}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </button>
              </div>
            </form>
          ) : (
            /* Formulário de Registro */
            <form className="space-y-5" onSubmit={handleRegister}>
              {/* Nome */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-stone-700 mb-1"
                >
                  Nome Completo
                </label>
                <div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={registerData.name}
                    onChange={(e) => {
                      setRegisterData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }));
                      clearError("name");
                    }}
                    className={`block w-full px-3 py-2.5 border rounded-lg placeholder-stone-400 focus:outline-none transition-colors ${
                      errors.name
                        ? "border-rose-500"
                        : "border-stone-300 focus:border-stone-500"
                    }`}
                    style={{
                      "--focus-ring-color": primaryColor,
                      ...inputStyles,
                    }}
                    placeholder="Seu nome completo"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-rose-600">{errors.name}</p>
                )}
              </div>

              {/* WhatsApp */}
              <div>
                <label
                  htmlFor="register-phone"
                  className="block text-sm font-medium text-stone-700 mb-1"
                >
                  Número do WhatsApp
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <WhatsappLogo className="h-5 w-5 text-green-500" />
                  </div>
                  <input
                    id="register-phone"
                    name="phone"
                    type="tel"
                    required
                    value={registerData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value, false)}
                    onFocus={() => clearError("phone")}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg placeholder-stone-400 focus:outline-none transition-colors ${
                      errors.phone
                        ? "border-rose-500"
                        : "border-stone-300 focus:border-stone-500"
                    }`}
                    style={{
                      "--focus-ring-color": primaryColor,
                      ...inputStyles,
                    }}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-rose-600">{errors.phone}</p>
                )}
              </div>

              {/* Senha */}
              <div>
                <label
                  htmlFor="register-password"
                  className="block text-sm font-medium text-stone-700 mb-1"
                >
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    name="password"
                    type={showRegisterPassword ? "text" : "password"}
                    required
                    value={registerData.password}
                    onChange={(e) => {
                      setRegisterData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }));
                      clearError("password");
                    }}
                    className={`block w-full px-3 py-2.5 pr-10 border rounded-lg placeholder-stone-400 focus:outline-none transition-colors ${
                      errors.password
                        ? "border-rose-500"
                        : "border-stone-300 focus:border-stone-500"
                    }`}
                    style={{
                      "--focus-ring-color": primaryColor,
                      ...inputStyles,
                    }}
                    placeholder="Mínimo 6 caracteres com letras e números"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() =>
                      setShowRegisterPassword(!showRegisterPassword)
                    }
                  >
                    {showRegisterPassword ? (
                      <EyeSlash className="h-5 w-5 text-stone-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-stone-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-rose-600">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirmar Senha */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-stone-700 mb-1"
                >
                  Confirmar Senha
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={registerData.confirmPassword}
                    onChange={(e) => {
                      setRegisterData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }));
                      clearError("confirmPassword");
                    }}
                    className={`block w-full px-3 py-2.5 pr-10 border rounded-lg placeholder-stone-400 focus:outline-none transition-colors ${
                      errors.confirmPassword
                        ? "border-rose-500"
                        : "border-stone-300 focus:border-stone-500"
                    }`}
                    style={{
                      "--focus-ring-color": primaryColor,
                      ...inputStyles,
                    }}
                    placeholder="Confirme sua senha"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlash className="h-5 w-5 text-stone-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-stone-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-rose-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {errors.general && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                  <p className="text-rose-700 text-sm">{errors.general}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors hover:shadow-md"
                  style={{
                    backgroundColor: primaryColor,
                    "--focus-ring-color": primaryColor,
                  }}
                >
                  {isLoading ? "Criando conta..." : "Criar Conta"}
                </button>
              </div>
            </form>
          )}

          {/* Link para voltar */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push(`/store/${storeSlug}`)}
              className="text-sm text-stone-600 hover:text-stone-800 transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Voltar para a loja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
