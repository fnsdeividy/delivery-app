"use client";

import { useStoreConfig } from "@/lib/store/useStoreConfig";
import {
  Bell,
  CheckCircle,
  Clock,
  CreditCard,
  DeviceMobile,
  FileText,
  Gear,
  Globe,
  Lightning,
  Palette,
  Shield,
  Storefront,
  Truck,
  Users,
  WarningCircle,
} from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ConfigSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  status: "completed" | "pending" | "optional";
  badge?: string;
}

interface StoreStatus {
  isConfigured: boolean;
  hasVisualConfig: boolean;
  hasScheduleConfig: boolean;
  hasPaymentConfig: boolean;
  hasDeliveryConfig: boolean;
  hasNotificationConfig: boolean;
  hasSecurityConfig: boolean;
}

export default function ConfiguracoesPage() {
  const params = useParams();
  const router = useRouter();

  // Capturar o storeSlug corretamente
  const storeSlug = params?.storeSlug as string;

  // Validar se o storeSlug existe
  if (!storeSlug || storeSlug === "undefined") {
    console.error("❌ StoreSlug inválido:", storeSlug);
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <WarningCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Erro de Configuração
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>Identificador da loja não encontrado ou inválido.</p>
              <p className="mt-2">StoreSlug: {storeSlug || "não definido"}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-red-100 text-red-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-200"
              >
                Voltar ao Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { config, loading } = useStoreConfig(storeSlug);
  const [storeStatus, setStoreStatus] = useState<StoreStatus>({
    isConfigured: false,
    hasVisualConfig: false,
    hasScheduleConfig: false,
    hasPaymentConfig: false,
    hasDeliveryConfig: false,
    hasNotificationConfig: false,
    hasSecurityConfig: false,
  });

  // Verificar status das configurações
  useEffect(() => {
    if (config) {
      setStoreStatus({
        isConfigured: true,
        hasVisualConfig: !!config.branding?.primaryColor,
        hasScheduleConfig: !!config.schedule?.workingHours,
        hasPaymentConfig: !!(
          config.payments?.pix ||
          config.payments?.cash ||
          config.payments?.card
        ),
        hasDeliveryConfig: !!config.delivery?.enabled,
        hasNotificationConfig: !!config.settings?.orderNotifications,
        hasSecurityConfig: false, // Implementar quando necessário
      });
    }
  }, [config]);

  const configSections: ConfigSection[] = [
    {
      id: "visual",
      title: "Aparência Visual",
      description:
        "Personalize cores, logo, banner e identidade visual da sua loja",
      icon: Palette,
      href: `/dashboard/${storeSlug}/configuracoes/visual`,
      status: storeStatus.hasVisualConfig ? "completed" : "pending",
      badge: storeStatus.hasVisualConfig ? "Configurado" : "Obrigatório",
    },
    {
      id: "horarios",
      title: "Horários de Funcionamento",
      description:
        "Configure dias e horários de funcionamento, tempo de preparo",
      icon: Clock,
      href: `/dashboard/${storeSlug}/configuracoes/horarios`,
      status: storeStatus.hasScheduleConfig ? "completed" : "pending",
      badge: storeStatus.hasScheduleConfig ? "Configurado" : "Obrigatório",
    },
    {
      id: "pagamento",
      title: "Métodos de Pagamento",
      description: "Configure formas de pagamento aceitas e taxas",
      icon: CreditCard,
      href: `/dashboard/${storeSlug}/configuracoes/pagamento`,
      status: storeStatus.hasPaymentConfig ? "completed" : "optional",
      badge: storeStatus.hasPaymentConfig ? "Configurado" : "Opcional",
    },
    {
      id: "entrega",
      title: "Configurações de Entrega",
      description: "Configure zonas de entrega, taxas e tempo de entrega",
      icon: Truck,
      href: `/dashboard/${storeSlug}/configuracoes/entrega`,
      status: storeStatus.hasDeliveryConfig ? "completed" : "optional",
      badge: storeStatus.hasDeliveryConfig ? "Configurado" : "Opcional",
    },
    {
      id: "notificacoes",
      title: "Notificações",
      description: "Configure alertas de pedidos, emails e notificações push",
      icon: Bell,
      href: `/dashboard/${storeSlug}/configuracoes/notificacoes`,
      status: storeStatus.hasNotificationConfig ? "completed" : "optional",
      badge: storeStatus.hasNotificationConfig ? "Configurado" : "Opcional",
    },
    {
      id: "seguranca",
      title: "Segurança e Privacidade",
      description: "Configurações de segurança, privacidade e conformidade",
      icon: Shield,
      href: `/dashboard/${storeSlug}/configuracoes/seguranca`,
      status: storeStatus.hasSecurityConfig ? "completed" : "optional",
      badge: storeStatus.hasSecurityConfig ? "Configurado" : "Opcional",
    },
    {
      id: "integracao",
      title: "Integrações",
      description: "Conecte com iFood, WhatsApp, Google Business e outros",
      icon: Lightning,
      href: `/dashboard/${storeSlug}/configuracoes/integracao`,
      status: "optional",
      badge: "Em breve",
    },
    {
      id: "equipe",
      title: "Gerenciar Equipe",
      description: "Adicione funcionários, gerentes e configure permissões",
      icon: Users,
      href: `/dashboard/${storeSlug}/configuracoes/equipe`,
      status: "optional",
      badge: "Em breve",
    },
    {
      id: "relatorios",
      title: "Relatórios e Exportação",
      description: "Configure relatórios automáticos e exportação de dados",
      icon: FileText,
      href: `/dashboard/${storeSlug}/configuracoes/relatorios`,
      status: "optional",
      badge: "Em breve",
    },
    {
      id: "domino",
      title: "Domínio Personalizado",
      description: "Configure seu próprio domínio para a loja",
      icon: Globe,
      href: `/dashboard/${storeSlug}/configuracoes/dominio`,
      status: "optional",
      badge: "Em breve",
    },
    {
      id: "app",
      title: "App Mobile",
      description: "Configure notificações push e funcionalidades do app",
      icon: DeviceMobile,
      href: `/dashboard/${storeSlug}/configuracoes/app`,
      status: "optional",
      badge: "Em breve",
    },
  ];

  const getStatusColor = (status: "completed" | "pending" | "optional") => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "optional":
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: "completed" | "pending" | "optional") => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "pending":
        return <WarningCircle className="h-5 w-5 text-orange-600" />;
      case "optional":
        return <Gear className="h-5 w-5 text-gray-600" />;
    }
  };

  const completedCount = configSections.filter(
    (section) => section.status === "completed"
  ).length;
  const totalRequired = configSections.filter(
    (section) => section.status === "pending"
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Gear className="h-6 w-6 text-orange-500" />
              <h1 className="text-xl font-semibold text-gray-900">
                Configurações
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {completedCount} de {configSections.length} configuradas
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Geral */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Status das Configurações
            </h2>
            <div className="flex items-center space-x-2">
              <Storefront className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">{storeSlug}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {completedCount}
              </div>
              <p className="text-sm text-gray-600">Configuradas</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {totalRequired}
              </div>
              <p className="text-sm text-gray-600">Pendentes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {Math.round((completedCount / configSections.length) * 100)}%
              </div>
              <p className="text-sm text-gray-600">Completude</p>
            </div>
          </div>

          {/* Barra de Progresso */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progresso geral</span>
              <span>
                {Math.round((completedCount / configSections.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(completedCount / configSections.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Seções de Configuração */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {configSections.map((section) => (
            <div
              key={section.id}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer ${
                section.status === "completed" ? "ring-2 ring-green-200" : ""
              }`}
              onClick={() => router.push(section.href)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      section.status === "completed"
                        ? "bg-green-100"
                        : section.status === "pending"
                        ? "bg-orange-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <section.icon
                      className={`h-5 w-5 ${
                        section.status === "completed"
                          ? "text-green-600"
                          : section.status === "pending"
                          ? "text-orange-600"
                          : "text-gray-600"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {section.description}
                    </p>
                  </div>
                </div>
                {getStatusIcon(section.status)}
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                    section.status
                  )}`}
                >
                  {section.badge}
                </span>
                <div className="text-gray-400">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dicas e Informações */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            💡 Dicas de Configuração
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">
                Configurações Obrigatórias:
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  • <strong>Aparência Visual:</strong> Defina a identidade da
                  sua marca
                </li>
                <li>
                  • <strong>Horários:</strong> Configure quando sua loja
                  funciona
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">
                Configurações Recomendadas:
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  • <strong>Pagamento:</strong> Configure formas de pagamento
                </li>
                <li>
                  • <strong>Entrega:</strong> Defina zonas e taxas de entrega
                </li>
                <li>
                  • <strong>Notificações:</strong> Mantenha clientes informados
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Suporte */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <Gear className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Precisa de ajuda?
              </p>
              <p className="text-sm text-gray-600">
                Consulte nossa documentação ou entre em contato com o suporte
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
