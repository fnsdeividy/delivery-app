"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  QrCode,
  Phone,
  ChatCircle,
  ArrowLeft,
  WarningCircle,
  Spinner,
} from "@phosphor-icons/react";
import { apiClient } from "@/lib/api-client";

enum ConnectionStatus {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  QR_CODE_READY = "qr_code_ready",
  ERROR = "error",
}

interface WhatsAppConfig {
  enabled: boolean;
  phoneNumber?: string;
  connectionStatus: ConnectionStatus;
  autoSendMessages: boolean;
  sendOrderConfirmation: boolean;
  sendOrderReady: boolean;
  sendOrderDelivered: boolean;
  sendOrderCancelled: boolean;
  businessName?: string;
  lastConnectedAt?: string;
  errorMessage?: string;
}

export default function WhatsAppSimplesPage() {
  const params = useParams();
  const router = useRouter();
  const storeSlug = params?.storeSlug as string;

  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [qrExpiry, setQrExpiry] = useState<number>(60);

  // Carregar configurações
  useEffect(() => {
    loadConfig();
  }, [storeSlug]);

  // Polling para verificar status da conexão
  useEffect(() => {
    if (connecting) {
      const interval = setInterval(() => {
        checkConnectionStatus();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [connecting]);

  // Timer para expiração do QR Code
  useEffect(() => {
    if (qrCode && qrExpiry > 0) {
      const timer = setTimeout(() => {
        setQrExpiry(qrExpiry - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (qrExpiry === 0 && qrCode) {
      setMessage({ type: "error", text: "QR Code expirou. Tente novamente." });
      setQrCode(null);
      setConnecting(false);
    }
  }, [qrCode, qrExpiry]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        `/stores/${storeSlug}/whatsapp-simple/config`
      );

      if (response.data?.success) {
        setConfig(response.data.data);
      }
    } catch (error: any) {
      console.error("Erro ao carregar configurações:", error);
      // Configuração padrão se não existir
      setConfig({
        enabled: false,
        connectionStatus: ConnectionStatus.DISCONNECTED,
        autoSendMessages: true,
        sendOrderConfirmation: true,
        sendOrderReady: true,
        sendOrderDelivered: true,
        sendOrderCancelled: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setQrCode(null);
      setQrExpiry(60);
      setMessage(null);

      const response = await apiClient.post(
        `/stores/${storeSlug}/whatsapp-simple/connect`
      );

      if (response.data?.success) {
        setQrCode(response.data.qrCode);
        setMessage({
          type: "success",
          text: "QR Code gerado! Escaneie com seu WhatsApp.",
        });
      } else {
        throw new Error(response.data?.message || "Erro ao gerar QR Code");
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Erro ao conectar WhatsApp",
      });
      setConnecting(false);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      const response = await apiClient.get(
        `/stores/${storeSlug}/whatsapp-simple/status`
      );

      if (response.data?.success) {
        const status = response.data.status;

        if (status === ConnectionStatus.CONNECTED) {
          setMessage({
            type: "success",
            text: "WhatsApp conectado com sucesso! 🎉",
          });
          setQrCode(null);
          setConnecting(false);
          await loadConfig();
        }
      }
    } catch (error) {
      console.error("Erro ao verificar status:", error);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Deseja realmente desconectar o WhatsApp?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post(
        `/stores/${storeSlug}/whatsapp-simple/disconnect`
      );

      if (response.data?.success) {
        setMessage({
          type: "success",
          text: "WhatsApp desconectado com sucesso",
        });
        await loadConfig();
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Erro ao desconectar",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestMessage = async () => {
    try {
      const phoneNumber = prompt(
        "Digite o número de telefone para teste (com DDD):\nExemplo: 11999999999"
      );

      if (!phoneNumber) return;

      setLoading(true);
      const response = await apiClient.post(
        `/stores/${storeSlug}/whatsapp-simple/send-test`,
        {
          phoneNumber: `55${phoneNumber}`,
        }
      );

      if (response.data?.success) {
        setMessage({
          type: "success",
          text: "Mensagem de teste enviada com sucesso! ✅",
        });
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Erro ao enviar mensagem",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSetting = async (setting: keyof WhatsAppConfig) => {
    if (!config) return;

    try {
      const newConfig = {
        ...config,
        [setting]: !config[setting],
      };

      const response = await apiClient.patch(
        `/stores/${storeSlug}/whatsapp-simple/config`,
        {
          whatsappSimple: newConfig,
        }
      );

      if (response.data?.success) {
        setConfig(newConfig);
        setMessage({
          type: "success",
          text: "Configuração atualizada com sucesso",
        });
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Erro ao atualizar configuração",
      });
    }
  };

  if (loading && !config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const isConnected = config?.connectionStatus === ConnectionStatus.CONNECTED;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="h-5 w-5" />
                Voltar
              </button>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ChatCircle className="h-8 w-8 text-green-600" />
                WhatsApp - Conexão Simples
              </h1>
              <p className="mt-2 text-gray-600">
                Conecte seu WhatsApp em segundos! Sem tokens, sem complicações.
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-md ${message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
              }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {message.type === "success" ? (
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

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-full ${isConnected ? "bg-green-100" : "bg-gray-100"
                  }`}
              >
                <Phone
                  className={`h-6 w-6 ${isConnected ? "text-green-600" : "text-gray-400"
                    }`}
                />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Status da Conexão
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {isConnected ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-600 font-medium">
                        Conectado
                      </span>
                      {config?.phoneNumber && (
                        <span className="text-gray-500">
                          • {config.phoneNumber}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">Desconectado</span>
                    </>
                  )}
                </div>
                {config?.lastConnectedAt && isConnected && (
                  <p className="text-sm text-gray-500 mt-1">
                    Conectado desde:{" "}
                    {new Date(config.lastConnectedAt).toLocaleString("pt-BR")}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              {!isConnected ? (
                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-md hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {connecting ? (
                    <>
                      <Spinner className="h-5 w-5 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <QrCode className="h-5 w-5" />
                      Conectar WhatsApp
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleTestMessage}
                    className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50"
                  >
                    <ChatCircle className="h-5 w-5" />
                    Testar Envio
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="flex items-center gap-2 px-4 py-2 border border-red-500 text-red-600 rounded-md hover:bg-red-50"
                  >
                    <XCircle className="h-5 w-5" />
                    Desconectar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* QR Code */}
        {qrCode && (
          <div className="bg-white rounded-lg shadow p-8 mb-6">
            <div className="text-center">
              <div className="inline-block p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg mb-4">
                <QrCode className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Escaneie o QR Code
              </h2>
              <p className="text-gray-600 mb-6">
                Use seu celular para escanear o código abaixo
              </p>

              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white rounded-lg border-4 border-green-500">
                  <img
                    src={qrCode}
                    alt="QR Code WhatsApp"
                    className="w-64 h-64"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <h3 className="font-medium text-blue-900 mb-2">
                  📱 Como escanear:
                </h3>
                <ol className="text-left text-sm text-blue-800 space-y-2">
                  <li>1. Abra o WhatsApp no celular</li>
                  <li>2. Toque em Mais opções (⋮) ou Configurações</li>
                  <li>3. Toque em &quot;Aparelhos conectados&quot;</li>
                  <li>4. Toque em &quot;Conectar um aparelho&quot;</li>
                  <li>5. Aponte a câmera para este QR Code</li>
                </ol>
              </div>

              {qrExpiry > 0 && (
                <p className="mt-4 text-sm text-gray-500">
                  ⏱️ Código expira em: {Math.floor(qrExpiry / 60)}:
                  {(qrExpiry % 60).toString().padStart(2, "0")}
                </p>
              )}

              <div className="flex items-center justify-center gap-2 mt-4">
                <Spinner className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-sm text-gray-600">
                  Aguardando conexão...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Configurações */}
        {isConnected && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Notificações Automáticas
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Configure quais mensagens serão enviadas automaticamente para os
              clientes
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    📝 Confirmação de Pedido
                  </label>
                  <p className="text-sm text-gray-500">
                    Enviada quando um novo pedido é confirmado
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config?.sendOrderConfirmation}
                    onChange={() => handleToggleSetting("sendOrderConfirmation")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    ✅ Pedido Pronto
                  </label>
                  <p className="text-sm text-gray-500">
                    Enviada quando o pedido está pronto para retirada/entrega
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config?.sendOrderReady}
                    onChange={() => handleToggleSetting("sendOrderReady")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    🚚 Pedido Entregue
                  </label>
                  <p className="text-sm text-gray-500">
                    Enviada quando o pedido é entregue ao cliente
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config?.sendOrderDelivered}
                    onChange={() => handleToggleSetting("sendOrderDelivered")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    ❌ Pedido Cancelado
                  </label>
                  <p className="text-sm text-gray-500">
                    Enviada quando um pedido é cancelado
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config?.sendOrderCancelled}
                    onChange={() => handleToggleSetting("sendOrderCancelled")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                ✨ Por que esta integração é melhor?
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✅ Sem tokens complicados</li>
                <li>✅ Sem conta no Meta/Facebook</li>
                <li>✅ Totalmente GRATUITO</li>
                <li>✅ Conecta em 30 segundos</li>
                <li>✅ Mensagens automáticas para clientes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

