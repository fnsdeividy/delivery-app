"use client";

import { useStoreConfig } from "@/lib/store/useStoreConfig";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building, Envelope, Phone, FloppyDisk } from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface StoreBasicInfo {
  name: string;
  email: string;
  phone: string;
}

export default function ConfiguracoesBasicasPage() {
  const params = useParams();
  const router = useRouter();
  const storeSlug = params?.storeSlug as string;
  
  const { config, loading, updateConfig } = useStoreConfig(storeSlug);
  const [formData, setFormData] = useState<StoreBasicInfo>({
    name: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Carregar dados iniciais quando config estiver disponível
  useEffect(() => {
    if (config) {
      const initialData = {
        name: config.name || "",
        email: config.email || "",
        phone: config.phone || "",
      };
      setFormData(initialData);
    }
  }, [config]);

  // Verificar se há mudanças
  useEffect(() => {
    if (config) {
      const hasChanged = 
        formData.name !== (config.name || "") ||
        formData.email !== (config.email || "") ||
        formData.phone !== (config.phone || "");
      setHasChanges(hasChanged);
    }
  }, [formData, config]);

  const handleInputChange = (field: keyof StoreBasicInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    // Implementação simples de toast sem dependência externa
    const toastEl = document.createElement('div');
    toastEl.className = `fixed top-4 right-4 px-4 py-2 rounded-md text-white z-50 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toastEl.textContent = message;
    document.body.appendChild(toastEl);
    setTimeout(() => {
      document.body.removeChild(toastEl);
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showToast("Nome da loja é obrigatório", 'error');
      return;
    }

    if (formData.email && !isValidEmail(formData.email)) {
      showToast("Email inválido", 'error');
      return;
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      showToast("Telefone inválido", 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      await updateConfig({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });

      showToast("Informações básicas atualizadas com sucesso!");
      setHasChanges(false);
    } catch (error) {
      console.error("Erro ao atualizar informações básicas:", error);
      showToast("Erro ao salvar as informações. Tente novamente.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string): boolean => {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, "");
    // Verifica se tem entre 10 e 11 dígitos (telefone brasileiro)
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  };

  const formatPhone = (value: string): string => {
    // Remove todos os caracteres não numéricos
    const cleanValue = value.replace(/\D/g, "");
    
    // Aplica a máscara de telefone brasileiro
    if (cleanValue.length <= 10) {
      return cleanValue.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    } else {
      return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    handleInputChange("phone", formatted);
  };

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/dashboard/${storeSlug}/configuracoes`)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <Building className="h-6 w-6 text-orange-500" />
              <h1 className="text-xl font-semibold text-gray-900">
                Informações Básicas
              </h1>
            </div>
            {hasChanges && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-orange-600">Alterações não salvas</span>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-orange-500" />
                <span>Informações da Loja</span>
              </CardTitle>
              <CardDescription>
                Configure as informações básicas da sua loja que serão exibidas para os clientes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nome da Loja */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nome da Loja *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Digite o nome da sua loja"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500">
                  Este nome será exibido no topo da sua loja online e nos pedidos.
                </p>
              </div>

              {/* Email de Contato */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Envelope className="h-4 w-4" />
                  <span>Email de Contato</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="contato@sualore.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500">
                  Email para contato com clientes e notificações importantes.
                </p>
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Telefone</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  maxLength={15}
                />
                <p className="text-xs text-gray-500">
                  Número de telefone para contato direto com os clientes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/${storeSlug}/configuracoes`)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!hasChanges || isSubmitting}
              className="flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <FloppyDisk className="h-4 w-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Informações Adicionais */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            💡 Dicas Importantes
          </h3>
          <div className="space-y-2 text-sm text-blue-700">
            <p>
              • <strong>Nome da Loja:</strong> Escolha um nome claro e memorável que represente sua marca.
            </p>
            <p>
              • <strong>Email:</strong> Use um email profissional que você monitora regularmente.
            </p>
            <p>
              • <strong>Telefone:</strong> Mantenha sempre atualizado para facilitar o contato dos clientes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
