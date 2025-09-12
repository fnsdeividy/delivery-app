"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthContext } from "@/contexts/AuthContext";
import { useStoreConfig } from "@/lib/store/useStoreConfig";
import {
  ArrowLeft,
  Building,
  CheckCircle,
  ClockClockwise,
  Envelope,
  Eye,
  EyeSlash,
  FloppyDisk,
  Info,
  Link as LinkIcon,
  Phone,
  XCircle,
} from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

interface StoreBasicInfo {
  name: string;
  email: string;
  phone: string;
  currentPassword?: string;
  password?: string;
  confirmPassword?: string;
  slug: string;
}

type ToastType = "success" | "error" | "info";

export default function ConfiguracoesBasicasPage() {
  const params = useParams();
  const router = useRouter();
  const storeSlug = params?.storeSlug as string;

  const { config, loading, updateConfig } = useStoreConfig(storeSlug);
  const { logout } = useAuthContext();

  const initialDataRef = useRef<StoreBasicInfo | null>(null);
  const [formData, setFormData] = useState<StoreBasicInfo>({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
    slug: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [slugError, setSlugError] = useState("");
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  // Estado de erros por campo para validação inline
  const [errors, setErrors] = useState<
    Record<keyof StoreBasicInfo, string | undefined>
  >({
    name: undefined,
    email: undefined,
    phone: undefined,
    currentPassword: undefined,
    password: undefined,
    confirmPassword: undefined,
    slug: undefined,
  });

  // ------- Helpers de validação -------
  const isValidEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidPhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, "");
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  };

  const isValidPassword = (password: string): boolean => {
    if (!password) return true; // vazio = não alterar
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return (
      minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    );
  };

  const passwordsMatch = (
    password: string,
    confirmPassword: string
  ): boolean => {
    if (!password && !confirmPassword) return true;
    return password === confirmPassword;
  };

  const isValidSlug = (slug: string): boolean => /^[a-z0-9-]{3,}$/.test(slug);

  const validateAll = (data: StoreBasicInfo) => {
    const newErrors: Record<keyof StoreBasicInfo, string | undefined> = {
      name: !data.name.trim() ? "Nome da loja é obrigatório" : undefined,
      email:
        data.email && !isValidEmail(data.email) ? "Email inválido" : undefined,
      phone:
        data.phone && !isValidPhone(data.phone)
          ? "Telefone inválido"
          : undefined,
      currentPassword:
        data.password && !data.currentPassword
          ? "Senha atual é obrigatória para alterar a senha"
          : undefined,
      password:
        data.password && !isValidPassword(data.password)
          ? "Mín. 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 especial"
          : undefined,
      confirmPassword:
        data.password &&
        !passwordsMatch(data.password, data.confirmPassword || "")
          ? "As senhas não coincidem"
          : undefined,
      slug: !data.slug.trim()
        ? "Slug é obrigatório"
        : !isValidSlug(data.slug)
        ? "Use apenas minúsculas, números e hífens (mín. 3)"
        : undefined,
    };
    setErrors(newErrors);
    return newErrors;
  };

  // ------- Toast simples -------
  const showToast = (message: string, type: ToastType = "success") => {
    const toastEl = document.createElement("div");
    toastEl.className = `fixed top-4 right-4 z-[1000] px-4 py-2 rounded-md text-white shadow-lg transition-opacity duration-300 ${
      type === "success"
        ? "bg-green-600"
        : type === "error"
        ? "bg-red-600"
        : "bg-slate-700"
    }`;
    toastEl.textContent = message;
    document.body.appendChild(toastEl);
    setTimeout(() => {
      toastEl.style.opacity = "0";
      setTimeout(() => document.body.removeChild(toastEl), 300);
    }, 2800);
  };

  // ------- Carrega dados iniciais -------
  useEffect(() => {
    if (config) {
      const initialData = {
        name: config.name || "",
        email: config.email || "",
        phone: config.phone || "",
        currentPassword: "",
        password: "",
        confirmPassword: "",
        slug: config.slug || "",
      };
      setFormData(initialData);
      initialDataRef.current = initialData;
      setHasChanges(false);
      setErrors({
        name: undefined,
        email: undefined,
        phone: undefined,
        currentPassword: undefined,
        password: undefined,
        confirmPassword: undefined,
        slug: undefined,
      });
      setSlugError("");
      setSlugAvailable(null);
    }
  }, [config]);

  // ------- Detecta alterações -------
  useEffect(() => {
    if (!initialDataRef.current) return;
    const base = initialDataRef.current;
    const changed =
      formData.name !== base.name ||
      formData.email !== base.email ||
      formData.phone !== base.phone ||
      (!!formData.password && formData.password.trim() !== "") ||
      (!!formData.confirmPassword && formData.confirmPassword.trim() !== "") ||
      formData.slug !== base.slug;
    setHasChanges(changed);
  }, [formData]);

  // ------- Guardar saída sem salvar -------
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasChanges]);

  // ------- Input handlers -------
  const handleInputChange = (field: keyof StoreBasicInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // validação pontual
    if (field === "name" && !value.trim()) {
      setErrors((e) => ({ ...e, name: "Nome da loja é obrigatório" }));
    } else if (field === "email") {
      setErrors((e) => ({
        ...e,
        email: value && !isValidEmail(value) ? "Email inválido" : undefined,
      }));
    } else if (field === "phone") {
      setErrors((e) => ({
        ...e,
        phone: value && !isValidPhone(value) ? "Telefone inválido" : undefined,
      }));
    } else if (field === "currentPassword") {
      setErrors((e) => ({
        ...e,
        currentPassword:
          formData.password && !value
            ? "Senha atual é obrigatória para alterar a senha"
            : undefined,
      }));
    } else if (field === "password") {
      setErrors((e) => ({
        ...e,
        password:
          value && !isValidPassword(value)
            ? "Mín. 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 especial"
            : undefined,
        confirmPassword:
          formData.confirmPassword &&
          !passwordsMatch(value, formData.confirmPassword)
            ? "As senhas não coincidem"
            : undefined,
      }));
    } else if (field === "confirmPassword") {
      setErrors((e) => ({
        ...e,
        confirmPassword:
          value && !passwordsMatch(formData.password || "", value)
            ? "As senhas não coincidem"
            : undefined,
      }));
    } else if (field === "slug") {
      // Limpa erro de slug se o valor está válido
      if (!value.trim()) {
        setErrors((e) => ({ ...e, slug: "Slug é obrigatório" }));
      } else if (!isValidSlug(value)) {
        setErrors((e) => ({
          ...e,
          slug: "Use apenas minúsculas, números e hífens (mín. 3)",
        }));
      } else {
        setErrors((e) => ({ ...e, slug: undefined }));
      }
    }
  };

  // ------- Máscara telefone com robustez (digitação/colar) -------
  const formatPhone = (value: string): string => {
    const clean = value.replace(/\D/g, "").slice(0, 11);
    if (clean.length <= 10) {
      return clean.replace(/(\d{0,2})(\d{0,4})(\d{0,4})/, (_, a, b, c) =>
        [a && `(${a}`, a && ") ", b, c && `-${c}`].filter(Boolean).join("")
      );
    }
    return clean.replace(/(\d{0,2})(\d{0,5})(\d{0,4})/, (_, a, b, c) =>
      [a && `(${a}`, a && ") ", b, c && `-${c}`].filter(Boolean).join("")
    );
  };

  const handlePhoneChange = (raw: string) => {
    const formatted = formatPhone(raw);
    handleInputChange("phone", formatted);
  };

  // ------- Checagem de slug (debounced) -------
  const debouncedSlug = useDebounce(formData.slug, 500);
  useEffect(() => {
    const check = async () => {
      // Se não há slug ou está vazio, limpa estados
      if (!debouncedSlug || debouncedSlug.trim() === "") {
        setSlugError("");
        setIsCheckingSlug(false);
        setSlugAvailable(null);
        return;
      }

      // Validação de formato primeiro
      if (!isValidSlug(debouncedSlug)) {
        setSlugError("Use apenas minúsculas, números e hífens (mín. 3)");
        setSlugAvailable(false);
        setIsCheckingSlug(false);
        return;
      }

      // Se é o mesmo slug atual da loja, marca como disponível sem verificar API
      if (debouncedSlug === config?.slug) {
        setSlugError("");
        setIsCheckingSlug(false);
        setSlugAvailable(true);
        return;
      }

      // Verificar se há token antes de fazer a requisição
      const token =
        localStorage.getItem("cardapio_token") || localStorage.getItem("token");
      if (!token) {
        console.warn("⚠️ Token não encontrado, pulando verificação de slug");
        setSlugError("");
        setIsCheckingSlug(false);
        setSlugAvailable(null);
        return;
      }

      // Inicia verificação no backend
      setIsCheckingSlug(true);
      setSlugError("");
      setSlugAvailable(null);

      try {
        const baseURL =
          process.env.NEXT_PUBLIC_CARDAPIO_API_URL ||
          "http://localhost:3001/api/v1";
        const url = `${baseURL}/stores/${debouncedSlug}/check-availability`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.warn("🔒 Token expirado, pulando verificação de slug");
            setSlugError("");
            setIsCheckingSlug(false);
            setSlugAvailable(null);
            return;
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData?.message || `Erro ${response.status}`);
        }

        const data = await response.json();
        if (data.available) {
          setSlugError("");
          setSlugAvailable(true);
        } else {
          setSlugError(
            data.message || "Esse endereço já está em uso, escolha outro."
          );
          setSlugAvailable(false);
        }
      } catch (err) {
        console.error("Erro ao verificar slug:", err);
        // Em caso de erro de rede ou outros, não bloquear o formulário
        if (err instanceof Error && err.message.includes("fetch")) {
          console.warn("⚠️ Erro de rede, pulando verificação de slug");
          setSlugError("");
          setSlugAvailable(null);
        } else {
          setSlugError("Erro ao verificar disponibilidade do slug");
          setSlugAvailable(null);
        }
      } finally {
        setIsCheckingSlug(false);
      }
    };

    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSlug, config?.slug]);

  // ------- Submit -------
  const firstErrorRef = useRef<HTMLDivElement | null>(null);

  const scrollToFirstError = () => {
    firstErrorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentErrors = validateAll(formData);
    const hasAnyError =
      Object.values(currentErrors).some(Boolean) || !!slugError;
    if (hasAnyError) {
      showToast("Corrija os campos destacados.", "error");
      scrollToFirstError();
      return;
    }

    setIsSubmitting(true);
    const originalSlug = storeSlug;
    const newSlug = formData.slug.trim();
    const slugChanged = originalSlug !== newSlug;
    const passwordChanged =
      formData.password && formData.password.trim() !== "";

    try {
      const updateData: Record<string, string> = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        slug: newSlug,
      };
      if (passwordChanged) {
        updateData.password = formData.password?.trim() || "";
        updateData.currentPassword = formData.currentPassword?.trim() || "";
      }

      await updateConfig(updateData);

      // Atualiza baseline para o guard
      initialDataRef.current = {
        ...formData,
        password: "",
        currentPassword: "",
        confirmPassword: "",
      };
      setFormData((prev) => ({
        ...prev,
        password: "",
        currentPassword: "",
        confirmPassword: "",
      }));
      setHasChanges(false);

      // Se a senha foi alterada, fazer logout obrigatório por segurança
      if (passwordChanged) {
        showToast(
          "Senha alterada com sucesso! Você será deslogado por segurança.",
          "success"
        );

        setTimeout(() => {
          logout();
          router.push("/login");
        }, 2500);
        return;
      }

      showToast("Informações básicas atualizadas com sucesso!", "success");

      // Se o slug foi alterado, redirecionar para nova URL após um delay
      if (slugChanged) {
        setTimeout(() => {
          router.push(`/dashboard/${newSlug}/configuracoes/basicas`);
        }, 1500);
      }
    } catch (error) {
      console.error("Erro ao atualizar informações básicas:", error);

      // Extrair mensagem de erro específica
      let errorMessage = "Erro ao salvar. Tente novamente.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------- Reset para valores iniciais -------
  const handleReset = () => {
    if (!initialDataRef.current) return;
    setFormData({
      ...initialDataRef.current,
      password: "",
      confirmPassword: "",
    });
    setErrors({
      name: undefined,
      email: undefined,
      phone: undefined,
      currentPassword: undefined,
      password: undefined,
      confirmPassword: undefined,
      slug: undefined,
    });
    setSlugError("");
    setSlugAvailable(null);
    showToast("Alterações desfeitas.", "info");
  };

  // Desabilita o submit se houver erros conhecidos ou checagem de slug rolando
  const canSubmit = useMemo(() => {
    const anyInlineError = Object.values(errors).some(Boolean);

    // Se o slug é o mesmo da loja atual, não bloqueia o submit
    const isCurrentSlug = formData.slug === config?.slug;
    const hasBlockingSlug =
      !isCurrentSlug &&
      (Boolean(slugError) ||
        isCheckingSlug === true ||
        slugAvailable === false);

    return hasChanges && !isSubmitting && !anyInlineError && !hasBlockingSlug;
  }, [
    errors,
    hasChanges,
    isSubmitting,
    slugError,
    isCheckingSlug,
    slugAvailable,
    formData.slug,
    config?.slug,
  ]);

  // Loading state melhorado
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
          <p className="mt-4 text-center text-gray-600">
            Carregando configurações...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  router.push(`/dashboard/${storeSlug}/configuracoes`)
                }
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </Button>
              <span aria-hidden className="h-6 w-px bg-gray-300" />
              <Building className="h-6 w-6 text-orange-500" />
              <h1 className="text-xl font-semibold text-gray-900">
                Informações Básicas
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {hasChanges && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-orange-700">
                    Alterações não salvas
                  </span>
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="ml-2"
                disabled={!hasChanges || isSubmitting}
                title="Desfazer alterações"
              >
                <ClockClockwise className="h-4 w-4 mr-2" />
                Resetar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Região de mensagens para acessibilidade */}
        <div aria-live="polite" className="sr-only" />

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-orange-500" />
                <span>Informações da Loja</span>
              </CardTitle>
              <CardDescription>
                Configure as informações básicas que serão exibidas para os
                clientes.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Nome da Loja */}
              <Field
                id="name"
                label="Nome da Loja *"
                helper="Este nome será exibido no topo da sua loja e nos pedidos."
                error={errors.name}
                onFirstErrorRef={firstErrorRef}
              >
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Digite o nome da sua loja"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  }`}
                  required
                />
              </Field>

              {/* Slug */}
              <Field
                id="slug"
                label={
                  <span className="inline-flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Slug *
                    <Tooltip text="Endereço usado para acessar sua loja online" />
                  </span>
                }
                error={errors.slug || slugError}
                onFirstErrorRef={!errors.name ? firstErrorRef : undefined}
                helper="Apenas letras minúsculas, números e hífens. Ex: minha-loja"
                suffix={
                  <SlugStatus
                    isChecking={isCheckingSlug}
                    available={slugAvailable}
                    hasError={Boolean(errors.slug || slugError)}
                  />
                }
              >
                <input
                  id="slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => {
                    const value = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "");
                    handleInputChange("slug", value);
                  }}
                  placeholder="minha-loja"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.slug || slugError
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  required
                />
              </Field>

              {/* Email (desabilitado) */}
              <Field
                id="email"
                label={
                  <span className="inline-flex items-center gap-2">
                    <Envelope className="h-4 w-4" />
                    Email de Contato
                  </span>
                }
                helperNode={
                  <p className="text-xs text-amber-700 flex items-center gap-1">
                    <Info className="h-3 w-3" />O e-mail não pode ser alterado
                    nesta etapa. Fale com o suporte para modificações.
                  </p>
                }
              >
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </Field>

              {/* Telefone */}
              <Field
                id="phone"
                label={
                  <span className="inline-flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </span>
                }
                helper="Número de telefone para contato direto com os clientes."
                error={errors.phone}
              >
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onPaste={(e) => {
                    e.preventDefault();
                    const text = (
                      e.clipboardData || (window as any).clipboardData
                    ).getData("text");
                    handlePhoneChange(text);
                  }}
                  placeholder="(00) 00000-0000"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.phone ? "border-red-300" : "border-gray-300"
                  }`}
                  maxLength={16}
                  inputMode="numeric"
                />
              </Field>
            </CardContent>
          </Card>

          {/* Card de Alteração de Senha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-orange-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>Alterar Senha</span>
              </CardTitle>
              <CardDescription>
                Para alterar sua senha, preencha os campos abaixo. Deixe em
                branco se não deseja alterar.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Senha Atual */}
              <Field
                id="currentPassword"
                label="Senha Atual *"
                helper="Digite sua senha atual para confirmar a alteração."
                error={errors.currentPassword}
              >
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={formData.currentPassword || ""}
                    onChange={(e) =>
                      handleInputChange("currentPassword", e.target.value)
                    }
                    placeholder="Digite sua senha atual"
                    className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                      errors.currentPassword
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={
                      showCurrentPassword
                        ? "Ocultar senha atual"
                        : "Mostrar senha atual"
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeSlash className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nova Senha */}
                <Field
                  id="newPassword"
                  label="Nova Senha *"
                  helper="Mínimo 8 caracteres com maiúscula, minúscula, número e especial."
                  error={errors.password}
                >
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.password || ""}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder="Digite a nova senha"
                      className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                        errors.password
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={
                        showPassword
                          ? "Ocultar nova senha"
                          : "Mostrar nova senha"
                      }
                    >
                      {showPassword ? (
                        <EyeSlash className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </Field>

                {/* Confirmar Nova Senha */}
                <Field
                  id="confirmPassword"
                  label="Confirmar Nova Senha *"
                  helper="Digite novamente a nova senha para confirmar."
                  error={errors.confirmPassword}
                >
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword || ""}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      placeholder="Confirme a nova senha"
                      className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                        errors.confirmPassword
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={
                        showPassword
                          ? "Ocultar confirmação"
                          : "Mostrar confirmação"
                      }
                    >
                      {showPassword ? (
                        <EyeSlash className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </Field>
              </div>

              {/* Indicador de Força da Senha */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">
                    Força da senha:
                  </div>
                  <PasswordStrengthIndicator password={formData.password} />
                </div>
              )}

              {/* Dicas de Segurança */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  💡 Dicas para uma senha segura:
                </h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Use pelo menos 8 caracteres</li>
                  <li>• Inclua letras maiúsculas e minúsculas</li>
                  <li>• Adicione números e símbolos especiais</li>
                  <li>• Evite informações pessoais óbvias</li>
                  <li>• Não reutilize senhas de outras contas</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(`/dashboard/${storeSlug}/configuracoes`)
              }
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={!canSubmit}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Salvando...
                </>
              ) : (
                <>
                  <FloppyDisk className="h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Dicas */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            💡 Dicas Importantes
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              • <strong>Nome da Loja:</strong> claro e memorável.
            </p>
            <p>
              • <strong>Email:</strong> mantenha um endereço profissional.
            </p>
            <p>
              • <strong>Telefone:</strong> sempre atualizado para contato
              rápido.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Componentes utilitários locais ---------------------- */

function Tooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <Info className="h-4 w-4 text-gray-400 cursor-help" />
      <span className="pointer-events-none absolute left-0 bottom-6 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
        {text}
      </span>
    </span>
  );
}

function SlugStatus({
  isChecking,
  available,
  hasError,
}: {
  isChecking: boolean;
  available: boolean | null;
  hasError: boolean;
}) {
  if (hasError) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
        <XCircle className="h-3 w-3" />
        Inválido
      </span>
    );
  }
  if (isChecking) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
        <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-slate-700" />
        Checando...
      </span>
    );
  }
  if (available === true) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
        <CheckCircle className="h-3 w-3" />
        Disponível
      </span>
    );
  }
  if (available === false) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
        <XCircle className="h-3 w-3" />
        Em uso
      </span>
    );
  }
  return null;
}

function Field({
  id,
  label,
  helper,
  helperNode,
  error,
  children,
  suffix,
  onFirstErrorRef,
}: {
  id: string;
  label: React.ReactNode;
  helper?: string;
  helperNode?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
  suffix?: React.ReactNode;
  onFirstErrorRef?: React.MutableRefObject<HTMLDivElement | null>;
}) {
  // guarda o primeiro campo com erro para rolar até ele
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (error && onFirstErrorRef && !onFirstErrorRef.current) {
      onFirstErrorRef.current = containerRef.current;
    }
  }, [error, onFirstErrorRef]);

  return (
    <div ref={containerRef} className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-700 flex items-center gap-2"
      >
        {label}
        {suffix && <span className="ml-2">{suffix}</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : helper ? (
        <p className="text-xs text-gray-500">{helper}</p>
      ) : helperNode ? (
        helperNode
      ) : null}
    </div>
  );
}

/* ---------------------- Componente de Força da Senha ---------------------- */
function PasswordStrengthIndicator({ password }: { password: string }) {
  const getStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    Object.values(checks).forEach((check) => {
      if (check) score++;
    });

    return { score, checks };
  };

  const { score, checks } = getStrength(password);

  const getStrengthInfo = (score: number) => {
    if (score <= 2)
      return { label: "Fraca", color: "bg-red-500", textColor: "text-red-700" };
    if (score <= 3)
      return {
        label: "Média",
        color: "bg-yellow-500",
        textColor: "text-yellow-700",
      };
    if (score <= 4)
      return { label: "Boa", color: "bg-blue-500", textColor: "text-blue-700" };
    return {
      label: "Forte",
      color: "bg-green-500",
      textColor: "text-green-700",
    };
  };

  const strength = getStrengthInfo(score);

  return (
    <div className="space-y-3">
      {/* Barra de progresso */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
        <span className={`text-sm font-medium ${strength.textColor}`}>
          {strength.label}
        </span>
      </div>

      {/* Checklist de requisitos */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div
          className={`flex items-center gap-1 ${
            checks.length ? "text-green-600" : "text-gray-400"
          }`}
        >
          {checks.length ? "✓" : "○"} 8+ caracteres
        </div>
        <div
          className={`flex items-center gap-1 ${
            checks.lowercase ? "text-green-600" : "text-gray-400"
          }`}
        >
          {checks.lowercase ? "✓" : "○"} Minúsculas
        </div>
        <div
          className={`flex items-center gap-1 ${
            checks.uppercase ? "text-green-600" : "text-gray-400"
          }`}
        >
          {checks.uppercase ? "✓" : "○"} Maiúsculas
        </div>
        <div
          className={`flex items-center gap-1 ${
            checks.numbers ? "text-green-600" : "text-gray-400"
          }`}
        >
          {checks.numbers ? "✓" : "○"} Números
        </div>
        <div
          className={`flex items-center gap-1 col-span-2 ${
            checks.special ? "text-green-600" : "text-gray-400"
          }`}
        >
          {checks.special ? "✓" : "○"} Caracteres especiais (!@#$%^&*)
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Hook de debounce ---------------------- */
function useDebounce<T>(value: T, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
