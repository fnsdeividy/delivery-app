"use client";

import { apiClient } from "@/lib/api-client";
import {
  ChatCircle,
  CheckCircle,
  QrCode,
  WarningCircle,
  X,
  Lightning,
  DeviceMobile,
  ArrowClockwise,
  Power,
  PaperPlaneTilt,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ConnectionStatus {
  connected: boolean;
  status: "disconnected" | "connecting" | "connected" | "qr_code_ready" | "error";
  phoneNumber?: string;
  lastConnectedAt?: string;
  errorMessage?: string;
}

export default function WhatsAppSimplesPage() {
  const params = useParams();
  const router = useRouter();
  const storeSlug = params?.storeSlug as string;

  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    status: "disconnected",
  });
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrExpiry, setQrExpiry] = useState<number>(60);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Buscar status da conexão
  const fetchStatus = async () => {
    try {
      const response = await apiClient.get(
        `/stores/${storeSlug}/whatsapp-simple/status`
      ) as any;
      setStatus(response.data?.data || response.data);
    } catch (error: any) {
      console.error("Erro ao buscar status:", error);
    } finally {
      setLoading(false);
    }
  };

  // Iniciar conexão
  const handleConnect = async () => {
    try {
      setLoading(true);
      setMessage(null);
      setQrCode(null);

      const response = await apiClient.post(
        `/stores/${storeSlug}/whatsapp-simple/connect`
      ) as any;

      if (response.data?.success || response.success) {
        setStatus({
          ...status,
          status: "qr_code_ready",
        });
        setQrCode(response.data?.qrCode || response.qrCode);
        setQrExpiry(60);

        // Iniciar polling para verificar conexão
        startConnectionPolling();

        setMessage({
          type: "info",
          text: "QR Code gerado! Escaneie com seu WhatsApp.",
        });
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Erro ao gerar QR Code",
      });
    } finally {
      setLoading(false);
    }
  };

  // Polling para verificar conexão
  const startConnectionPolling = () => {
    const interval = setInterval(async () => {
      try {
        const response = await apiClient.get(
          `/stores/${storeSlug}/whatsapp-simple/status`
        ) as any;
        const newStatus = response.data?.data || response.data;

        setStatus(newStatus);

        if (newStatus.status === "connected") {
          clearInterval(interval);
          setQrCode(null);
          setMessage({
            type: "success",
            text: "WhatsApp conectado com sucesso!",
          });
        }
      } catch (error) {
        console.error("Erro ao verificar status:", error);
      }
    }, 2000); // Verifica a cada 2 segundos

    // Limpar após 60 segundos
    setTimeout(() => {
      clearInterval(interval);
      if (status.status !== "connected") {
        setQrCode(null);
        setMessage({
          type: "error",
          text: "QR Code expirou. Tente novamente.",
        });
      }
    }, 60000);
  };

  // Desconectar
  const handleDisconnect = async () => {
    if (!confirm("Tem certeza que deseja desconectar o WhatsApp?")) {
      return;
    }

    try {
      setLoading(true);
      await apiClient.post(`/stores/${storeSlug}/whatsapp-simple/disconnect`) as any;

      setStatus({
        connected: false,
        status: "disconnected",
      });
      setMessage({
        type: "success",
        text: "WhatsApp desconectado com sucesso.",
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Erro ao desconectar",
      });
    } finally {
      setLoading(false);
    }
  };

  // Enviar mensagem de teste
  const handleTestMessage = async () => {
    const phoneNumber = prompt("Digite o número para teste (com DDD):");
    if (!phoneNumber) return;

    try {
      setLoading(true);
      await apiClient.post(`/stores/${storeSlug}/whatsapp-simple/send-test`, {
        to: phoneNumber,
      }) as any;

      setMessage({
        type: "success",
        text: "Mensagem de teste enviada!",
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Erro ao enviar mensagem",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeSlug) {
      fetchStatus();
    }
  }, [storeSlug]);

  useEffect(() => {
    if (qrCode && qrExpiry > 0) {
      const timer = setInterval(() => {
        setQrExpiry((prev) => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [qrCode, qrExpiry]);

  if (loading && !status.status) {
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
                <ChatCircle className="h-8 w-8 text-green-600" />
                WhatsApp Simplificado
              </h1>
              <p className="mt-2 text-gray-600">
                Conecte seu WhatsApp em segundos! Sem tokens, sem complicação.
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

        {/* Benefícios */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <Lightning className="h-6 w-6 text-yellow-500" />
              <div>
                <h3 className="font-medium text-gray-900">Super Rápido</h3>
                <p className="text-sm text-gray-600">Conecta em 30 segundos</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <QrCode className="h-6 w-6 text-blue-500" />
              <div>
                <h3 className="font-medium text-gray-900">Fácil</h3>
                <p className="text-sm text-gray-600">Só escanear o QR Code</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <h3 className="font-medium text-gray-900">Gratuito</h3>
                <p className="text-sm text-gray-600">R$ 0,00 por mensagem</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-md ${message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : message.type === "error"
                ? "bg-red-50 border border-red-200 text-red-800"
                : "bg-blue-50 border border-blue-200 text-blue-800"
              }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {message.type === "success" ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : message.type === "error" ? (
                  <WarningCircle className="h-5 w-5 text-red-400" />
                ) : (
                  <ChatCircle className="h-5 w-5 text-blue-400" />
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{message.text}</p>
              </div>
              <button
                onClick={() => setMessage(null)}
                className="ml-auto flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          {/* Desconectado */}
          {status.status === "disconnected" && !qrCode && (
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <ChatCircle className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                WhatsApp Desconectado
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Conecte seu WhatsApp para enviar notificações automáticas de
                pedidos para seus clientes.
              </p>
              <button
                onClick={handleConnect}
                disabled={loading}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
              >
                <QrCode className="h-6 w-6" />
                {loading ? "Gerando QR Code..." : "Conectar WhatsApp"}
              </button>
            </div>
          )}

          {/* QR Code */}
          {qrCode && status.status !== "connected" && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Escaneie o QR Code
              </h2>
              <p className="text-gray-600 mb-6">
                Abra o WhatsApp no seu celular e escaneie o código
              </p>

              {/* QR Code Display */}
              <div className="inline-block p-6 bg-white border-4 border-gray-200 rounded-lg mb-6">
                <Image
                  src={qrCode}
                  alt="QR Code WhatsApp"
                  width={300}
                  height={300}
                  className="mx-auto"
                />
              </div>

              {/* Timer */}
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  Código expira em:{" "}
                  <span className="font-mono font-bold text-red-600">
                    {Math.floor(qrExpiry / 60)}:
                    {(qrExpiry % 60).toString().padStart(2, "0")}
                  </span>
                </p>
              </div>

              {/* Instruções */}
              <div className="bg-blue-50 rounded-lg p-6 text-left max-w-md mx-auto">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <DeviceMobile className="h-5 w-5" />
                  Como conectar:
                </h3>
                <ol className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">1.</span>
                    Abra o WhatsApp no seu celular
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">2.</span>
                    Toque em <strong>Mais opções (⋮)</strong>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">3.</span>
                    Toque em <strong>Aparelhos conectados</strong>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">4.</span>
                    Toque em <strong>Conectar um aparelho</strong>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">5.</span>
                    Aponte a câmera para este código
                  </li>
                </ol>
              </div>

              {/* Botão para gerar novo QR */}
              {qrExpiry === 0 && (
                <button
                  onClick={handleConnect}
                  className="mt-6 inline-flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  <ArrowClockwise className="h-4 w-4" />
                  Gerar Novo QR Code
                </button>
              )}
            </div>
          )}

          {/* Conectado */}
          {status.status === "connected" && (
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                WhatsApp Conectado! 🎉
              </h2>
              <p className="text-gray-600 mb-6">
                Seu WhatsApp está conectado e pronto para enviar notificações
              </p>

              {/* Informações da Conexão */}
              <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto mb-8">
                <div className="space-y-3 text-left">
                  {status.phoneNumber && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Número:</span>
                      <span className="font-medium text-gray-900">
                        {status.phoneNumber}
                      </span>
                    </div>
                  )}
                  {status.lastConnectedAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Conectado em:
                      </span>
                      <span className="font-medium text-gray-900">
                        {new Date(status.lastConnectedAt).toLocaleString(
                          "pt-BR"
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notificações Ativas */}
              <div className="bg-green-50 rounded-lg p-6 max-w-md mx-auto mb-8">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Notificações Ativas
                </h3>
                <div className="space-y-2 text-sm text-left">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Confirmação de pedido</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Pedido pronto para retirada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Pedido saiu para entrega</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Pedido entregue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Pedido cancelado</span>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleTestMessage}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperPlaneTilt className="h-4 w-4" />
                  Enviar Teste
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Power className="h-4 w-4" />
                  Desconectar
                </button>
              </div>
            </div>
          )}

          {/* Erro */}
          {status.status === "error" && (
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <WarningCircle className="h-12 w-12 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Erro na Conexão
              </h2>
              <p className="text-gray-600 mb-6">
                {status.errorMessage || "Ocorreu um erro ao conectar o WhatsApp"}
              </p>
              <button
                onClick={handleConnect}
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <ArrowClockwise className="h-4 w-4" />
                Tentar Novamente
              </button>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <ChatCircle className="h-5 w-5" />
            Por que esta integração é melhor?
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Gratuito:</strong> Não paga nada por mensagem
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Simples:</strong> Só escanear o QR Code e pronto
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Rápido:</strong> Conecta em 30 segundos
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Sem complicação:</strong> Não precisa de tokens ou
                configurações técnicas
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
