'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useIfoodConfig } from '@/hooks/useIfoodConfig';
import {
  IfoodConfig,
  IfoodConfigFormData,
  IfoodIntegrationType,
  IfoodMenuConfig,
  IfoodOrderConfig,
  IFOOD_INTEGRATION_TYPE_LABELS,
  IFOOD_INTEGRATION_TYPE_DESCRIPTIONS,
  DEFAULT_IFOOD_CONFIG,
} from '@/types/ifood';
import {
  ForkKnife,
  Gear,
  FloppyDisk,
  ArrowClockwise,
  CheckCircle,
  XCircle,
  Warning,
  Info,
  Package,
  ShoppingCart,
  Clock,
  CurrencyDollar,
  MapPin,
  Phone,
  Envelope,
  IdentificationCard,
  Globe
} from '@phosphor-icons/react';

const tabs = [
  {
    id: 'config',
    label: 'Configurações',
    icon: Gear,
  },
  {
    id: 'menu',
    label: 'Configurações de Menu',
    icon: ForkKnife,
  },
  {
    id: 'orders',
    label: 'Configurações de Pedidos',
    icon: ShoppingCart,
  },
  {
    id: 'sync',
    label: 'Sincronização',
    icon: ArrowClockwise,
  },
  {
    id: 'test',
    label: 'Teste de Conexão',
    icon: CheckCircle,
  },
];

export default function IfoodConfigPage() {
  const params = useParams();
  const storeSlug = params.storeSlug as string;

  const {
    config,
    isLoading,
    error,
    message,
    updateConfig,
    testConnection,
    syncProducts,
    syncOrders,
    getStatus,
    refreshConfig,
    setMessage,
    clearError,
  } = useIfoodConfig();

  const [activeTab, setActiveTab] = useState('config');
  const [formData, setFormData] = useState<IfoodConfig>(DEFAULT_IFOOD_CONFIG);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncStatus, setSyncStatus] = useState<any>(null);

  useEffect(() => {
    if (storeSlug) {
      refreshConfig(storeSlug);
      loadSyncStatus();
    }
  }, [storeSlug, refreshConfig]);

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const loadSyncStatus = async () => {
    const status = await getStatus(storeSlug);
    setSyncStatus(status?.data);
  };

  const handleInputChange = (field: keyof IfoodConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMenuConfigChange = (field: keyof IfoodMenuConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      menu: {
        ...prev.menu!,
        [field]: value,
      },
    }));
  };

  const handleOrderConfigChange = (field: keyof IfoodOrderConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      orders: {
        ...prev.orders!,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar se integrationType está definido
    if (!formData.integrationType) {
      console.error('Tipo de integração é obrigatório');
      return;
    }

    // Converter IfoodConfig para IfoodConfigFormData
    const configFormData = {
      integrationType: formData.integrationType,
      clientId: formData.clientId || '',
      clientSecret: formData.clientSecret || '',
      merchantId: formData.merchantId || '',
      storeId: formData.storeId || '',
      webhookUrl: formData.webhookUrl || '',
      webhookSecret: formData.webhookSecret || '',
      sandboxMode: formData.sandboxMode || false,
      businessName: formData.businessName || '',
      businessAddress: formData.businessAddress || '',
      businessPhone: formData.businessPhone || '',
      businessEmail: formData.businessEmail || '',
      cnpj: formData.cnpj || '',
      operatingHours: formData.operatingHours || '',
      active: formData.active || false,
      menu: formData.menu || DEFAULT_IFOOD_CONFIG.menu!,
      orders: formData.orders || DEFAULT_IFOOD_CONFIG.orders!,
    };

    const success = await updateConfig(storeSlug, configFormData);
    if (success) {
      await refreshConfig(storeSlug);
      await loadSyncStatus();
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testConnection(storeSlug, formData);
      setTestResult({
        success: result.success,
        message: result.success ? result.message! : result.error!,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncProducts = async () => {
    const result = await syncProducts(storeSlug);
    if (result.success) {
      await loadSyncStatus();
    }
  };

  const handleSyncOrders = async () => {
    const result = await syncOrders(storeSlug);
    if (result.success) {
      await loadSyncStatus();
    }
  };

  const getStatusBadge = () => {
    if (!syncStatus?.active) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Desabilitado</span>;
    }

    switch (syncStatus.syncStatus) {
      case 'success':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Ativo</span>;
      case 'error':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Erro</span>;
      case 'syncing':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Sincronizando</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Desconhecido</span>;
    }
  };

  if (isLoading && !config) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ForkKnife className="h-8 w-8 text-blue-600" />
                Integração iFood
              </h1>
              <p className="mt-2 text-gray-600">
                Configure a integração com o iFood para sincronizar seu menu e receber pedidos automaticamente.
              </p>
            </div>
            <div className="flex items-center gap-4">
              {getStatusBadge()}
              <button
                onClick={() => refreshConfig(storeSlug)}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <ArrowClockwise className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>
          </div>
        </div>

        {/* Mensagens */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
            <div className="flex">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400 mr-2" />
              )}
              <p>{message.text}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg">
          {/* Configurações Gerais */}
          {activeTab === 'config' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Configurações Gerais</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tipo de Integração */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Integração
                    </label>
                    <select
                      value={formData.integrationType}
                      onChange={(e) => handleInputChange('integrationType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Object.values(IfoodIntegrationType).map((type) => (
                        <option key={type} value={type}>
                          {IFOOD_INTEGRATION_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-sm text-gray-500">
                      {formData.integrationType && IFOOD_INTEGRATION_TYPE_DESCRIPTIONS[formData.integrationType]}
                    </p>
                  </div>

                  {/* Modo Sandbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sandboxMode"
                      checked={formData.sandboxMode}
                      onChange={(e) => handleInputChange('sandboxMode', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sandboxMode" className="ml-2 block text-sm text-gray-700">
                      Modo Sandbox (Teste)
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Client ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client ID *
                    </label>
                    <input
                      type="text"
                      value={formData.clientId || ''}
                      onChange={(e) => handleInputChange('clientId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Seu Client ID do iFood"
                      required
                    />
                  </div>

                  {/* Client Secret */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client Secret *
                    </label>
                    <input
                      type="password"
                      value={formData.clientSecret || ''}
                      onChange={(e) => handleInputChange('clientSecret', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Seu Client Secret do iFood"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Merchant ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Merchant ID *
                    </label>
                    <input
                      type="text"
                      value={formData.merchantId || ''}
                      onChange={(e) => handleInputChange('merchantId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Seu Merchant ID do iFood"
                      required
                    />
                  </div>

                  {/* Store ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store ID *
                    </label>
                    <input
                      type="text"
                      value={formData.storeId || ''}
                      onChange={(e) => handleInputChange('storeId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ID da sua loja no iFood"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Webhook URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL do Webhook
                    </label>
                    <input
                      type="url"
                      value={formData.webhookUrl || ''}
                      onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://seudominio.com/api/webhook/ifood"
                    />
                  </div>

                  {/* Webhook Secret */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secret do Webhook
                    </label>
                    <input
                      type="password"
                      value={formData.webhookSecret || ''}
                      onChange={(e) => handleInputChange('webhookSecret', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Secret para validar webhooks"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nome do Negócio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Negócio
                    </label>
                    <input
                      type="text"
                      value={formData.businessName || ''}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nome da sua empresa"
                    />
                  </div>

                  {/* CNPJ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CNPJ
                    </label>
                    <input
                      type="text"
                      value={formData.cnpj || ''}
                      onChange={(e) => handleInputChange('cnpj', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Endereço */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Endereço
                    </label>
                    <input
                      type="text"
                      value={formData.businessAddress || ''}
                      onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Endereço completo"
                    />
                  </div>

                  {/* Telefone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formData.businessPhone || ''}
                      onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.businessEmail || ''}
                      onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="seu@email.com"
                    />
                  </div>

                  {/* Horário de Funcionamento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horário de Funcionamento
                    </label>
                    <input
                      type="text"
                      value={formData.operatingHours || ''}
                      onChange={(e) => handleInputChange('operatingHours', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Seg-Sex: 10h-22h, Sáb-Dom: 11h-23h"
                    />
                  </div>
                </div>

                {/* Ativo */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => handleInputChange('active', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                    Ativar integração
                  </label>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <FloppyDisk className="h-4 w-4 mr-2" />
                    {isLoading ? 'Salvando...' : 'Salvar Configurações'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Configurações de Menu */}
          {activeTab === 'menu' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Configurações de Menu</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sincronização Automática */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="menuAutoSync"
                      checked={formData.menu?.autoSync}
                      onChange={(e) => handleMenuConfigChange('autoSync', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="menuAutoSync" className="ml-2 block text-sm text-gray-700">
                      Sincronização automática
                    </label>
                  </div>

                  {/* Intervalo de Sincronização */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Intervalo de Sincronização (minutos)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="1440"
                      value={formData.menu?.syncInterval || 30}
                      onChange={(e) => handleMenuConfigChange('syncInterval', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sincronizar Preços */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="syncPrices"
                      checked={formData.menu?.syncPrices}
                      onChange={(e) => handleMenuConfigChange('syncPrices', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="syncPrices" className="ml-2 block text-sm text-gray-700">
                      Sincronizar preços
                    </label>
                  </div>

                  {/* Sincronizar Disponibilidade */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="syncAvailability"
                      checked={formData.menu?.syncAvailability}
                      onChange={(e) => handleMenuConfigChange('syncAvailability', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="syncAvailability" className="ml-2 block text-sm text-gray-700">
                      Sincronizar disponibilidade
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sincronizar Categorias */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="syncCategories"
                      checked={formData.menu?.syncCategories}
                      onChange={(e) => handleMenuConfigChange('syncCategories', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="syncCategories" className="ml-2 block text-sm text-gray-700">
                      Sincronizar categorias
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <FloppyDisk className="h-4 w-4 mr-2" />
                    Salvar Configurações
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Configurações de Pedidos */}
          {activeTab === 'orders' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Configurações de Pedidos</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Aceitar Automaticamente */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoAccept"
                      checked={formData.orders?.autoAccept}
                      onChange={(e) => handleOrderConfigChange('autoAccept', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="autoAccept" className="ml-2 block text-sm text-gray-700">
                      Aceitar pedidos automaticamente
                    </label>
                  </div>

                  {/* Confirmar Automaticamente */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoConfirm"
                      checked={formData.orders?.autoConfirm}
                      onChange={(e) => handleOrderConfigChange('autoConfirm', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="autoConfirm" className="ml-2 block text-sm text-gray-700">
                      Confirmar pedidos automaticamente
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tempo Máximo de Preparo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tempo Máximo de Preparo (minutos)
                    </label>
                    <input
                      type="number"
                      min="5"
                      value={formData.orders?.maxPreparationTime || 45}
                      onChange={(e) => handleOrderConfigChange('maxPreparationTime', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Tempo Máximo de Entrega */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tempo Máximo de Entrega (minutos)
                    </label>
                    <input
                      type="number"
                      min="10"
                      value={formData.orders?.maxDeliveryTime || 60}
                      onChange={(e) => handleOrderConfigChange('maxDeliveryTime', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Valor Mínimo do Pedido */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor Mínimo do Pedido (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.orders?.minimumOrderValue || 0}
                      onChange={(e) => handleOrderConfigChange('minimumOrderValue', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Taxa de Entrega */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taxa de Entrega (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.orders?.deliveryFee || 0}
                      onChange={(e) => handleOrderConfigChange('deliveryFee', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <FloppyDisk className="h-4 w-4 mr-2" />
                    Salvar Configurações
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sincronização */}
          {activeTab === 'sync' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Sincronização</h3>

              {/* Status da Sincronização */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Status da Sincronização</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Última sincronização:</span>
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {syncStatus?.lastSync ? new Date(syncStatus.lastSync).toLocaleString('pt-BR') : 'Nunca'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {syncStatus?.syncStatus || 'Desconhecido'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ações de Sincronização */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <ForkKnife className="h-6 w-6 text-blue-500 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Sincronizar Menu</h4>
                      <p className="text-sm text-gray-500">Envia produtos e categorias para o iFood</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSyncProducts}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <ArrowClockwise className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Sincronizar
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <ShoppingCart className="h-6 w-6 text-green-500 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Sincronizar Pedidos</h4>
                      <p className="text-sm text-gray-500">Busca novos pedidos do iFood</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSyncOrders}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <ArrowClockwise className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Sincronizar
                  </button>
                </div>
              </div>

              {/* Informações */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-400 mr-2" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">Dica:</p>
                    <p>A sincronização automática acontece a cada {formData.menu?.syncInterval || 30} minutos quando ativada.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Teste de Conexão */}
          {activeTab === 'test' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Teste de Conexão</h3>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Configurações para Teste</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Use as configurações salvas ou preencha campos específicos para testar a conexão com o iFood.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client ID
                    </label>
                    <input
                      type="text"
                      value={formData.clientId || ''}
                      onChange={(e) => handleInputChange('clientId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Client ID para teste"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client Secret
                    </label>
                    <input
                      type="password"
                      value={formData.clientSecret || ''}
                      onChange={(e) => handleInputChange('clientSecret', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Client Secret para teste"
                    />
                  </div>
                </div>

                <button
                  onClick={handleTestConnection}
                  disabled={isTesting || !formData.clientId || !formData.clientSecret}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isTesting ? 'Testando...' : 'Testar Conexão'}
                </button>
              </div>

              {/* Resultado do Teste */}
              {testResult && (
                <div className={`p-4 rounded-md ${testResult.success
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
                  }`}>
                  <div className="flex">
                    {testResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400 mr-2" />
                    )}
                    <div>
                      <p className="font-medium">
                        {testResult.success ? 'Conexão bem-sucedida!' : 'Falha na conexão'}
                      </p>
                      <p className="text-sm mt-1">{testResult.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Informações de Teste */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex">
                  <Warning className="h-5 w-5 text-yellow-400 mr-2" />
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">Importante:</p>
                    <p>O teste verifica se as credenciais estão corretas e se é possível conectar com a API do iFood.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
