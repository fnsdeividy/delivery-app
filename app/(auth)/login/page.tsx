"use client";

import { useCardapioAuth, useFormValidation } from "@/hooks";
import { LoginFormData, loginSchema } from "@/lib/validation/schemas";
import { Eye, EyeSlash, SignIn } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error } = useCardapioAuth();

  // Estado local para travar cliques múltiplos imediatamente
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ID de submissão para evitar corrida de estados entre múltiplos cliques
  const submitIdRef = useRef<null | symbol>(null);

  // Hook de validação
  const {
    errors,
    validateForm,
    handleFieldBlur,
    shouldShowError,
    getFieldError,
    clearErrors,
  } = useFormValidation(loginSchema, formData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Evita reentradas: se já estiver submetendo, sai
    if (isSubmitting) return;

    // Limpar erros anteriores
    clearErrors();

    // Validar formulário
    const validation = await validateForm(formData);
    if (!validation.isValid) {
      return;
    }

    if (!formData.email || !formData.password) return;

    // Marca submissão imediata e gera um id para esta tentativa
    setIsSubmitting(true);
    const thisSubmitId = Symbol("submit");
    submitIdRef.current = thisSubmitId;

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
      // Navegação (se o hook já não fizer)
      // router.push("/dashboard"); // descomente se necessário
    } catch (err) {
      console.error("Erro no login:", err);
    } finally {
      // Só reabilita se ainda for a última submissão ativa
      if (submitIdRef.current === thisSubmitId) {
        setIsSubmitting(false);
        submitIdRef.current = null;
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpar erro do campo quando o usuário começa a digitar
    if (errors[name as keyof LoginFormData]) {
      clearErrors();
    }
  };

  const handleInputBlur = (fieldName: keyof LoginFormData) => {
    handleFieldBlur(fieldName, formData[fieldName]);
  };

  // Estado combinado de carregamento (hook ou local)
  const pending = isLoading || isSubmitting;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Ícone */}
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
            <SignIn className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Título */}
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
          Acesse seu Dashboard
        </h2>
        <p className="mt-2 text-center text-sm text-white/80">
          Faça login para gerenciar sua loja
        </p>
      </div>

      {/* Card de Login */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white rounded-xl shadow-lg py-8 px-6 sm:px-10">
          {/* Mensagem de sucesso */}
          {message && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-green-700 text-sm">
                {decodeURIComponent(message)}
              </p>
            </div>
          )}

          <form
            className="space-y-6"
            onSubmit={handleSubmit}
            aria-busy={pending}
          >
            {/* Desabilita todos os campos enquanto envia */}
            <fieldset disabled={pending} className="space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-800"
                >
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={() => handleInputBlur("email")}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 disabled:opacity-60"
                    placeholder="seu@email.com"
                  />
                  {shouldShowError("email") && (
                    <p className="text-red-500 text-xs mt-1">
                      {getFieldError("email")}
                    </p>
                  )}
                </div>
              </div>

              {/* Senha */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-800"
                >
                  Senha
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={() => handleInputBlur("password")}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 disabled:opacity-60"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:opacity-50"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    disabled={pending}
                  >
                    {showPassword ? (
                      <EyeSlash className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {shouldShowError("password") && (
                    <p className="text-red-500 text-xs mt-1">
                      {getFieldError("password")}
                    </p>
                  )}
                </div>
              </div>

              {/* Erro */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  disabled={pending}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold
                rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed
                shadow-md transition-all"
                >
                  {pending ? "Entrando..." : "Entrar"}
                </button>
              </div>
            </fieldset>

            {/* Links adicionais */}
            <div className="flex items-center justify-between">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-purple-600 hover:text-purple-500 transition-colors"
              >
                Esqueceu a senha?
              </Link>
              <Link
                href="/register/loja"
                className="text-sm font-medium text-purple-600 hover:text-purple-500 transition-colors"
              >
                Criar nova loja
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
