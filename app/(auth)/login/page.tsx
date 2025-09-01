"use client";

import { useCardapioAuth, useFormValidation } from "@/hooks";
import { loginSchema, LoginFormData } from "@/lib/validation/schemas";
import { Eye, EyeSlash, SignIn } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Head from "next/head";
import Script from "next/script";
import { getBackendUrl } from "@/lib/config/environment";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const backendUrl = getBackendUrl() || "http://localhost:3001";
  const loginCssUrl = `${backendUrl}/static/css/login.css`;

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error } = useCardapioAuth();
  
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
    
    // Limpar erros anteriores
    clearErrors();
    
    // Validar formulário
    const validation = await validateForm(formData);
    if (!validation.isValid) {
      return;
    }

    if (!formData.email || !formData.password) return;

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
    } catch (err) {
      console.error("Erro no login:", err);
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

  useEffect(() => {
    // Adicionar o CSS do backend dinamicamente
    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.href = loginCssUrl;
    linkElement.id = "backend-login-css";
    document.head.appendChild(linkElement);

    return () => {
      // Remover o CSS quando o componente for desmontado
      const existingLink = document.getElementById("backend-login-css");
      if (existingLink) {
        document.head.removeChild(existingLink);
      }
    };
  }, [loginCssUrl]);

  return (
    <>
      <Head>
        <title>Login - Cardapio Digital</title>
        <meta name="description" content="Faça login para acessar seu dashboard" />
      </Head>

      <div className="login-container">
        <div className="login-header">
          {/* Ícone */}
          <div className="login-icon-wrapper">
            <SignIn className="w-7 h-7 text-white" />
          </div>

          {/* Título */}
          <h2 className="login-title">
            Acesse seu Dashboard
          </h2>
          <p className="login-subtitle">
            Faça login para gerenciar sua loja
          </p>
        </div>

        {/* Card de Login */}
        <div className="login-card">
          {/* Mensagem de sucesso */}
          {message && (
            <div className="success-message mb-6">
              <p>{decodeURIComponent(message)}</p>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label
                htmlFor="email"
                className="form-label"
              >
                Email
              </label>
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={() => handleInputBlur("email")}
                  className="form-input"
                  placeholder="seu@email.com"
                />
                {shouldShowError("email") && (
                  <p className="input-error">{getFieldError("email")}</p>
                )}
              </div>
            </div>

            {/* Senha */}
            <div className="form-group">
              <label
                htmlFor="password"
                className="form-label"
              >
                Senha
              </label>
              <div className="password-input-container">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={() => handleInputBlur("password")}
                  className="form-input"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlash className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                {shouldShowError("password") && (
                  <p className="input-error">{getFieldError("password")}</p>
                )}
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="submit-button"
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </button>
            </div>

            {/* Links adicionais */}
            <div className="links-container">
              <Link
                href="/forgot-password"
                className="link"
              >
                Esqueceu a senha?
              </Link>
              <Link
                href="/register/loja"
                className="link"
              >
                Criar nova loja
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
