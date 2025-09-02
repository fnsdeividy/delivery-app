"use client";

import { useWhatsAppConfig } from "@/hooks";
import {
  WhatsAppConfig,
  WhatsAppMessageType,
  WHATSAPP_MESSAGE_TYPE_LABELS,
  WHATSAPP_MESSAGE_TYPE_DESCRIPTIONS,
  DEFAULT_WHATSAPP_TEMPLATES,
} from "@/types/whatsapp";
import {
  CheckCircle,
  DeviceMobile,
  Eye,
  EyeSlash,
  Info,
  ChatCircle,
  Phone,
  Plus,
  FloppyDisk,
  Gear,
  TestTube,
  Trash,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WhatsAppConfigPage() {
  const params = useParams();
  const router = useRouter();
  const storeSlug = params?.storeSlug as string;

  const { config, loading, error, updateConfig, testConnection, getTemplates } = useWhatsAppConfig(storeSlug);

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'templates' | 'test'>('config');

  const [formData, setFormData] = useState<WhatsAppConfig>({
    enabled: false,
    phoneNumber: '',
    businessAccountId: '',
    accessToken: '',
    webhookUrl: '',
    webhookSecret: '',
    autoSendMessages: true,
    sendOrderNotifications: true,
    sendCustomerMessages: true,
    messageDelay: 0,
    businessName: '',
    businessDescription: '',
    businessAddress: '',
    businessHours: '',
    requireCustomerConsent: true,
    consentMessage: 'Você autoriza o recebimento de mensagens via WhatsApp?',
    allowedMessageTypes: [
      WhatsAppMessageType.WELCOME,
      WhatsAppMessageType.ORDER_CONFIRMATION,
      WhatsAppMessageType.ORDER_READY,
      WhatsAppMessageType.ORDER_DELIVERED,
    ],
    messageTemplates: DEFAULT_WHATSAPP_TEMPLATES,
  });

  const [testData, setTestData] = useState({
    phoneNumber: '',
    message: '',
    type: WhatsAppMessageType.WELCOME,
  });

  // Carregar configurações quando o componente montar
  useEffect(() => {
    if (config) {
      setFormData({
        enabled: config.enabled || false,
        phoneNumber: config.phoneNumber || '',
        businessAccountId: config.businessAccountId || '',
        accessToken: config.accessToken || '',
        webhookUrl: config.webhookUrl || '',
        webhookSecret: config.webhookSecret || '',
        autoSendMessages: config.autoSendMessages ?? true,
        sendOrderNotifications: config.sendOrderNotifications ?? true,
        sendCustomerMessages: config.sendCustomerMessages ?? true,
        messageDelay: config.messageDelay || 0,
        businessName: config.businessName || '',
        businessDescription: config.businessDescription || '',
        businessAddress: config.businessAddress || '',
        businessHours: config.businessHours || '',
        requireCustomerConsent: config.requireCustomerConsent ?? true,
        consentMessage: config.consentMessage || 'Você autoriza o recebimento de mensagens via WhatsApp?',
        allowedMessageTypes: config.allowedMessageTypes || [
          WhatsAppMessageType.WELCOME,
          WhatsAppMessageType.ORDER_CONFIRMATION,
          WhatsAppMessageType.ORDER_READY,
          WhatsAppMessageType.ORDER_DELIVERED,
        ],
        messageTemplates: config.messageTemplates || DEFAULT_WHATSAPP_TEMPLATES,
      });
    }
  }, [config]);

  const handleInputChange = (field: keyof WhatsAppConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTemplateChange = (index: number, field: keyof typeof DEFAULT_WHATSAPP_TEMPLATES[0], value: any) => {
    setFormData(prev => ({
      ...prev,
      messageTemplates: prev.messageTemplates?.map((template, i) =>
        i === index ? { ...template, [field]: value } : template
      ) || [],
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      await updateConfig(formData);
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao salvar configurações' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setMessage(null);

      const result = await testConnection(formData);

      if (result.success) {
        setMessage({ type: 'success', text: 'Conexão testada com sucesso!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao testar conexão' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao testar conexão' });
    } finally {
      setTesting(false);
    }
  };

  const handleSendTestMessage = async () => {
    try {
      setTesting(true);
      setMessage(null);

      // Implementar envio de mensagem de teste
      setMessage({ type: 'success', text: 'Mensagem de teste enviada!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao enviar mensagem de teste' });
    } finally {
      setTesting(false);
    }
  };

  if (loading && !config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ChatCircle className="h-8 w-8 text-blue-600" />
                Integração WhatsApp
              </h1>
              <p className="mt-2 text-gray-600">
                Configure a integração com WhatsApp Business para enviar mensagens automáticas aos seus clientes.
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="h-5 w-5" />
              Voltar
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <WarningCircle className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'config', label: 'Configurações', icon: Gear },
                { id: 'templates', label: 'Templates', icon: ChatCircle },
                { id: 'test', label: 'Teste', icon: TestTube },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                                      className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'config' && (
          <div className="space-y-8">
            {/* Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Status da Integração</h3>
                  <p className="text-sm text-gray-600">Ative ou desative a integração com WhatsApp</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => handleInputChange('enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>

            {/* Configurações Básicas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número do WhatsApp Business
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="+5511999999999"
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID da Conta Comercial
                  </label>
                  <input
                    type="text"
                    value={formData.businessAccountId}
                    onChange={(e) => handleInputChange('businessAccountId', e.target.value)}
                    placeholder="123456789012345"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token de Acesso
                  </label>
                  <div className="relative">
                    <input
                      type={showSecrets ? "text" : "password"}
                      value={formData.accessToken}
                      onChange={(e) => handleInputChange('accessToken', e.target.value)}
                      placeholder="EAAxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecrets(!showSecrets)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showSecrets ? (
                        <EyeSlash className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Configurações de Webhook */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações de Webhook</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL do Webhook
                  </label>
                  <input
                    type="url"
                    value={formData.webhookUrl}
                    onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
                    placeholder="https://seu-dominio.com/webhook/whatsapp"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Segredo do Webhook
                  </label>
                  <div className="relative">
                    <input
                      type={showSecrets ? "text" : "password"}
                      value={formData.webhookSecret}
                      onChange={(e) => handleInputChange('webhookSecret', e.target.value)}
                      placeholder="seu-segredo-webhook"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecrets(!showSecrets)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showSecrets ? (
                        <EyeSlash className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Configurações de Mensagens */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações de Mensagens</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Envio Automático de Mensagens</label>
                    <p className="text-sm text-gray-500">Enviar mensagens automaticamente baseadas em eventos</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoSendMessages}
                      onChange={(e) => handleInputChange('autoSendMessages', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Notificações de Pedidos</label>
                    <p className="text-sm text-gray-500">Enviar notificações sobre status dos pedidos</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sendOrderNotifications}
                      onChange={(e) => handleInputChange('sendOrderNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Mensagens para Clientes</label>
                    <p className="text-sm text-gray-500">Permitir envio de mensagens diretas para clientes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sendCustomerMessages}
                      onChange={(e) => handleInputChange('sendCustomerMessages', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delay entre Mensagens (segundos)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    value={formData.messageDelay}
                    onChange={(e) => handleInputChange('messageDelay', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Informações da Empresa */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informações da Empresa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Empresa
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    placeholder="Nome da sua empresa"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horário de Funcionamento
                  </label>
                  <input
                    type="text"
                    value={formData.businessHours}
                    onChange={(e) => handleInputChange('businessHours', e.target.value)}
                    placeholder="Seg-Sex: 8h-18h, Sáb: 8h-12h"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={formData.businessAddress}
                    onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                    placeholder="Endereço completo da empresa"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição da Empresa
                  </label>
                  <textarea
                    value={formData.businessDescription}
                    onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                    placeholder="Breve descrição da sua empresa"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-4">
              <button
                onClick={handleTestConnection}
                disabled={testing || saving}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TestTube className="h-4 w-4" />
                {testing ? 'Testando...' : 'Testar Conexão'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || testing}
                                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FloppyDisk className="h-4 w-4" />
                {saving ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Templates de Mensagem</h3>
              <p className="text-sm text-gray-600 mb-6">
                Configure as mensagens que serão enviadas automaticamente para seus clientes.
                Use variáveis como <code className="bg-gray-100 px-1 rounded">{'{businessName}'}</code> para personalizar as mensagens.
              </p>

              <div className="space-y-6">
                {formData.messageTemplates?.map((template, index) => (
                  <div key={template.type} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {WHATSAPP_MESSAGE_TYPE_LABELS[template.type]}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {WHATSAPP_MESSAGE_TYPE_DESCRIPTIONS[template.type]}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={template.enabled}
                          onChange={(e) => handleTemplateChange(index, 'enabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mensagem
                      </label>
                      <textarea
                        value={template.message}
                        onChange={(e) => handleTemplateChange(index, 'message', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Digite sua mensagem aqui..."
                      />
                    </div>

                    {template.variables && template.variables.length > 0 && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Variáveis Disponíveis
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {template.variables.map((variable) => (
                            <span
                              key={variable}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {`{{${variable}}}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'test' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Teste de Mensagem</h3>
              <p className="text-sm text-gray-600 mb-6">
                Envie uma mensagem de teste para verificar se a integração está funcionando corretamente.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Telefone
                  </label>
                  <input
                    type="tel"
                    value={testData.phoneNumber}
                    onChange={(e) => setTestData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="+5511999999999"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Mensagem
                  </label>
                  <select
                    value={testData.type}
                    onChange={(e) => setTestData(prev => ({ ...prev, type: e.target.value as WhatsAppMessageType }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.values(WhatsAppMessageType).map((type) => (
                      <option key={type} value={type}>
                        {WHATSAPP_MESSAGE_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem de Teste
                  </label>
                  <textarea
                    value={testData.message}
                    onChange={(e) => setTestData(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                    placeholder="Digite sua mensagem de teste aqui..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleSendTestMessage}
                  disabled={testing || !testData.phoneNumber || !testData.message}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChatCircle className="h-4 w-4" />
                  {testing ? 'Enviando...' : 'Enviar Mensagem de Teste'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
