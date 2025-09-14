"use client";

import { PaymentConfigSection } from "@/components/payment/PaymentConfigSection";
import { PaymentHeader } from "@/components/payment/PaymentHeader";
import { PaymentInfoSection } from "@/components/payment/PaymentInfoSection";
import { PaymentMethodModal } from "@/components/payment/PaymentMethodModal";
import { PaymentMethodsList } from "@/components/payment/PaymentMethodsList";
import { StatusMessage } from "@/components/payment/StatusMessage";
import { useStoreConfig } from "@/lib/store/useStoreConfig";
import { PaymentConfig, PaymentMethod } from "@/types/payment";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PagamentoPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.storeSlug as string;

  const { config, loading, updateConfig } = useStoreConfig(slug);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    methods: [],
    autoAccept: false,
    requireConfirmation: true,
    allowPartialPayment: false,
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    type: "card" as PaymentMethod["type"],
    enabled: true,
    fee: 0,
    feeType: "percentage" as "percentage" | "fixed",
    minAmount: "",
    maxAmount: "",
    description: "",
    requiresChange: false,
    changeAmount: "",
  });

  // Métodos de pagamento pré-definidos
  const defaultMethods: PaymentMethod[] = [
    {
      id: "pix",
      name: "PIX",
      type: "pix",
      enabled: true,
      fee: 0,
      feeType: "percentage",
      description: "Pagamento instantâneo via PIX",
      icon: "💳",
      minAmount: 0.01,
      maxAmount: 10000,
    },
    {
      id: "credit_card",
      name: "Cartão de Crédito",
      type: "card",
      enabled: true,
      fee: 2.99,
      feeType: "percentage",
      description: "Visa, Mastercard, Elo e outros",
      icon: "💳",
      minAmount: 1,
      maxAmount: 5000,
    },
    {
      id: "debit_card",
      name: "Cartão de Débito",
      type: "card",
      enabled: true,
      fee: 1.99,
      feeType: "percentage",
      description: "Débito automático em conta",
      icon: "💳",
      minAmount: 1,
      maxAmount: 2000,
    },
    {
      id: "cash",
      name: "Dinheiro",
      type: "cash",
      enabled: true,
      fee: 0,
      feeType: "fixed",
      description: "Pagamento em dinheiro na entrega",
      icon: "💵",
      requiresChange: true,
      changeAmount: 50,
    },
    {
      id: "transfer",
      name: "Transferência Bancária",
      type: "transfer",
      enabled: false,
      fee: 0,
      feeType: "fixed",
      description: "Transferência PIX ou TED",
      icon: "🏦",
      minAmount: 10,
      maxAmount: 10000,
    },
    {
      id: "digital_wallet",
      name: "Carteira Digital",
      type: "digital_wallet",
      enabled: false,
      fee: 1.5,
      feeType: "percentage",
      description: "PayPal, Mercado Pago, etc.",
      icon: "📱",
      minAmount: 1,
      maxAmount: 3000,
    },
  ];

  // Carregar configuração atual
  useEffect(() => {
    if (config) {
      let methods: PaymentMethod[] = [];

      // Priorizar nova estrutura paymentMethodsConfig se disponível
      if (
        config.config?.paymentMethodsConfig &&
        Array.isArray(config.config.paymentMethodsConfig)
      ) {
        methods = config.config.paymentMethodsConfig.map((method: any) => ({
          id: method.id,
          name: method.name,
          type: method.type,
          enabled: method.enabled,
          fee: method.fee || 0,
          feeType: method.feeType || "percentage",
          minAmount: method.minAmount,
          maxAmount: method.maxAmount,
          description: method.description || "",
          icon: method.icon || "💳",
          requiresChange: method.requiresChange || false,
          changeAmount: method.changeAmount,
        }));
      } else if (config?.payments) {
        // Fallback para estrutura antiga - adicionar métodos baseados na configuração
        if (config.payments.pix) {
          methods.push({
            id: "pix",
            name: "PIX",
            type: "pix",
            enabled: true,
            fee: 0,
            feeType: "percentage",
            description: "Pagamento instantâneo via PIX",
            icon: "💳",
            minAmount: 0.01,
            maxAmount: 10000,
          });
        }

        if (config.payments.cash) {
          methods.push({
            id: "cash",
            name: "Dinheiro",
            type: "cash",
            enabled: true,
            fee: 0,
            feeType: "percentage",
            description: "Pagamento em dinheiro",
            icon: "💵",
            requiresChange: true,
            changeAmount: 0,
          });
        }

        if (config.payments.card) {
          methods.push({
            id: "credit_card",
            name: "Cartão de Crédito",
            type: "card",
            enabled: true,
            fee: 2.99,
            feeType: "percentage",
            description: "Visa, Mastercard, Elo e outros",
            icon: "💳",
            minAmount: 1,
            maxAmount: 5000,
          });
        }

        // Para estrutura antiga, adicionar métodos padrão desabilitados que não estão presentes
        const existingIds = methods.map((m) => m.id);
        const missingDefaults = defaultMethods.filter(
          (dm) => !existingIds.includes(dm.id)
        );
        methods.push(
          ...missingDefaults.map((dm) => ({ ...dm, enabled: false }))
        );
      }

      setPaymentConfig({
        methods: methods.length > 0 ? methods : defaultMethods,
        autoAccept: false,
        requireConfirmation: true,
        allowPartialPayment: false,
      });
    } else {
      setPaymentConfig({
        methods: defaultMethods,
        autoAccept: false,
        requireConfirmation: true,
        allowPartialPayment: false,
      });
    }
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Usar updateConfig do hook para sincronizar e invalidar cache automaticamente
      await updateConfig({
        config: {
          // Enviar todos os métodos com seus status enabled/disabled
          paymentMethodsConfig: paymentConfig.methods.map((method) => ({
            id: method.id,
            name: method.name,
            type: method.type,
            enabled: method.enabled,
            fee: method.fee,
            feeType: method.feeType,
            minAmount: method.minAmount,
            maxAmount: method.maxAmount,
            description: method.description,
            icon: method.icon,
            requiresChange: method.requiresChange,
            changeAmount: method.changeAmount,
          })),
          // Manter compatibilidade com o sistema antigo por enquanto
          paymentMethods: paymentConfig.methods
            .filter((m) => m.enabled)
            .map((m) => m.id),
        },
      });

      setMessage({
        type: "success",
        text: "Configurações de pagamento salvas com sucesso!",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erro ao salvar configurações de pagamento",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddMethod = () => {
    const newMethod: PaymentMethod = {
      id: `custom_${Date.now()}`,
      name: formData.name,
      type: formData.type,
      enabled: formData.enabled,
      fee: formData.fee,
      feeType: formData.feeType,
      minAmount: formData.minAmount
        ? parseFloat(formData.minAmount)
        : undefined,
      maxAmount: formData.maxAmount
        ? parseFloat(formData.maxAmount)
        : undefined,
      description: formData.description,
      icon: "💳",
      requiresChange: formData.requiresChange,
      changeAmount: formData.changeAmount
        ? parseFloat(formData.changeAmount)
        : undefined,
    };

    setPaymentConfig((prev) => ({
      ...prev,
      methods: [...prev.methods, newMethod],
    }));

    setShowAddModal(false);
    resetForm();
  };

  const handleEditMethod = () => {
    if (!editingMethod) return;

    const updatedMethods = paymentConfig.methods.map((method) =>
      method.id === editingMethod.id
        ? {
            ...method,
            name: formData.name,
            type: formData.type,
            enabled: formData.enabled,
            fee: formData.fee,
            feeType: formData.feeType,
            minAmount: formData.minAmount
              ? parseFloat(formData.minAmount)
              : undefined,
            maxAmount: formData.maxAmount
              ? parseFloat(formData.maxAmount)
              : undefined,
            description: formData.description,
            requiresChange: formData.requiresChange,
            changeAmount: formData.changeAmount
              ? parseFloat(formData.changeAmount)
              : undefined,
          }
        : method
    );

    setPaymentConfig((prev) => ({
      ...prev,
      methods: updatedMethods,
    }));

    setEditingMethod(null);
    resetForm();
  };

  const handleDeleteMethod = (methodId: string) => {
    setPaymentConfig((prev) => ({
      ...prev,
      methods: prev.methods.filter((method) => method.id !== methodId),
    }));
  };

  const handleToggleMethod = (methodId: string) => {
    setPaymentConfig((prev) => ({
      ...prev,
      methods: prev.methods.map((method) =>
        method.id === methodId
          ? { ...method, enabled: !method.enabled }
          : method
      ),
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "card",
      enabled: true,
      fee: 0,
      feeType: "percentage",
      minAmount: "",
      maxAmount: "",
      description: "",
      requiresChange: false,
      changeAmount: "",
    });
  };

  const openEditModal = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      type: method.type,
      enabled: method.enabled,
      fee: method.fee,
      feeType: method.feeType,
      minAmount: method.minAmount?.toString() || "",
      maxAmount: method.maxAmount?.toString() || "",
      description: method.description || "",
      requiresChange: method.requiresChange || false,
      changeAmount: method.changeAmount?.toString() || "",
    });
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfigChange = (field: keyof PaymentConfig, value: boolean) => {
    setPaymentConfig((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PaymentHeader onSave={handleSave} saving={saving} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatusMessage message={message} />

        <PaymentConfigSection
          config={paymentConfig}
          onConfigChange={handleConfigChange}
        />

        <PaymentMethodsList
          methods={paymentConfig.methods}
          onToggleMethod={handleToggleMethod}
          onEditMethod={openEditModal}
          onDeleteMethod={handleDeleteMethod}
          onAddMethod={() => setShowAddModal(true)}
        />

        <PaymentInfoSection />
      </div>

      <PaymentMethodModal
        isOpen={showAddModal || !!editingMethod}
        editingMethod={editingMethod}
        formData={formData}
        onClose={() => {
          setShowAddModal(false);
          setEditingMethod(null);
          resetForm();
        }}
        onSave={editingMethod ? handleEditMethod : handleAddMethod}
        onFormChange={handleFormChange}
      />
    </div>
  );
}
