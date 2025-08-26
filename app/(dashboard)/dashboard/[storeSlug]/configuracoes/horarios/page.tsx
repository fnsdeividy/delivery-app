"use client";

import { apiClient } from "@/lib/api-client";
import { useStoreConfig } from "@/lib/store/useStoreConfig";
import {
  CheckCircle,
  Clock,
  FloppyDisk,
  Power,
  WarningCircle,
} from "@phosphor-icons/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface WorkingHours {
  monday: { open: string; close: string; closed: boolean };
  tuesday: { open: string; close: string; closed: boolean };
  wednesday: { open: string; close: string; closed: boolean };
  thursday: { open: string; close: string; closed: boolean };
  friday: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
}

interface StoreSettings {
  workingHours: WorkingHours;
  preparationTime: number;
  timezone: string;
}

export default function HorariosConfigPage() {
  const params = useParams();

  // Capturar o storeSlug corretamente e validar
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
                onClick={() => (window.location.href = "/dashboard")}
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

  const { config, loading, error } = useStoreConfig(storeSlug);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [currentStatus, setCurrentStatus] = useState<{
    status: "open" | "closed";
    message: string;
  }>({ status: "closed", message: "Carregando..." });

  const [settings, setSettings] = useState<StoreSettings>({
    workingHours: {
      monday: { open: "08:00", close: "18:00", closed: false },
      tuesday: { open: "08:00", close: "18:00", closed: false },
      wednesday: { open: "08:00", close: "18:00", closed: false },
      thursday: { open: "08:00", close: "18:00", closed: false },
      friday: { open: "08:00", close: "18:00", closed: false },
      saturday: { open: "08:00", close: "18:00", closed: false },
      sunday: { open: "08:00", close: "18:00", closed: true },
    },
    preparationTime: 25,
    timezone: "America/Sao_Paulo",
  });

  // Carregar configuração atual
  useEffect(() => {
    if (config?.settings) {
      setSettings((prev) => ({
        ...prev,
        preparationTime: config.settings.preparationTime || 25,
        timezone: config.schedule?.timezone || "America/Sao_Paulo",
        workingHours: config.schedule?.workingHours
          ? {
              monday: {
                open:
                  config.schedule.workingHours.monday.hours[0]?.start ||
                  "08:00",
                close:
                  config.schedule.workingHours.monday.hours[0]?.end || "18:00",
                closed: !config.schedule.workingHours.monday.open,
              },
              tuesday: {
                open:
                  config.schedule.workingHours.tuesday.hours[0]?.start ||
                  "08:00",
                close:
                  config.schedule.workingHours.tuesday.hours[0]?.end || "18:00",
                closed: !config.schedule.workingHours.tuesday.open,
              },
              wednesday: {
                open:
                  config.schedule.workingHours.wednesday.hours[0]?.start ||
                  "08:00",
                close:
                  config.schedule.workingHours.wednesday.hours[0]?.end ||
                  "18:00",
                closed: !config.schedule.workingHours.wednesday.open,
              },
              thursday: {
                open:
                  config.schedule.workingHours.thursday.hours[0]?.start ||
                  "08:00",
                close:
                  config.schedule.workingHours.thursday.hours[0]?.end ||
                  "18:00",
                closed: !config.schedule.workingHours.thursday.open,
              },
              friday: {
                open:
                  config.schedule.workingHours.friday.hours[0]?.start ||
                  "08:00",
                close:
                  config.schedule.workingHours.friday.hours[0]?.end || "18:00",
                closed: !config.schedule.workingHours.friday.open,
              },
              saturday: {
                open:
                  config.schedule.workingHours.saturday.hours[0]?.start ||
                  "08:00",
                close:
                  config.schedule.workingHours.saturday.hours[0]?.end ||
                  "18:00",
                closed: !config.schedule.workingHours.saturday.open,
              },
              sunday: {
                open:
                  config.schedule.workingHours.sunday.hours[0]?.start ||
                  "08:00",
                close:
                  config.schedule.workingHours.sunday.hours[0]?.end || "18:00",
                closed: !config.schedule.workingHours.sunday.open,
              },
            }
          : prev.workingHours,
      }));
    }
  }, [config]);

  // Atualizar status quando os horários mudam
  useEffect(() => {
    const status = getCurrentStatus();
    setCurrentStatus(status);
  }, [settings.workingHours]);

  // Atualizar status automaticamente a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      const status = getCurrentStatus();
      setCurrentStatus(status);
    }, 60000); // Atualizar a cada minuto

    return () => clearInterval(interval);
  }, [settings.workingHours]);

  const daysOfWeek = [
    { key: "monday", label: "Segunda-feira", short: "Seg" },
    { key: "tuesday", label: "Terça-feira", short: "Ter" },
    { key: "wednesday", label: "Quarta-feira", short: "Qua" },
    { key: "thursday", label: "Quinta-feira", short: "Qui" },
    { key: "friday", label: "Sexta-feira", short: "Sex" },
    { key: "saturday", label: "Sábado", short: "Sáb" },
    { key: "sunday", label: "Domingo", short: "Dom" },
  ];

  const timeSlots = [
    "00:00",
    "00:30",
    "01:00",
    "01:30",
    "02:00",
    "02:30",
    "03:00",
    "03:30",
    "04:00",
    "04:30",
    "05:00",
    "05:30",
    "06:00",
    "06:30",
    "07:00",
    "07:30",
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
    "22:00",
    "22:30",
    "23:00",
    "23:30",
  ];

  const handleDayToggle = (day: keyof WorkingHours) => {
    setSettings((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          closed: !prev.workingHours[day].closed,
        },
      },
    }));
  };

  const handleTimeChange = (
    day: keyof WorkingHours,
    field: "open" | "close",
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const applyToAllDays = (template: {
    open: string;
    close: string;
    closed: boolean;
  }) => {
    setSettings((prev) => ({
      ...prev,
      workingHours: Object.keys(prev.workingHours).reduce(
        (acc, day) => ({
          ...acc,
          [day]: template,
        }),
        {} as WorkingHours
      ),
    }));
  };

  // Salvar configurações
  const saveSettings = async () => {
    try {
      setSaving(true);
      setMessage(null);

      // Preparar dados para salvar
      const configData = {
        schedule: {
          timezone: settings.timezone,
          workingHours: {
            monday: {
              open: !settings.workingHours.monday.closed,
              hours: settings.workingHours.monday.closed
                ? []
                : [
                    {
                      start: settings.workingHours.monday.open,
                      end: settings.workingHours.monday.close,
                    },
                  ],
            },
            tuesday: {
              open: !settings.workingHours.tuesday.closed,
              hours: settings.workingHours.tuesday.closed
                ? []
                : [
                    {
                      start: settings.workingHours.tuesday.open,
                      end: settings.workingHours.tuesday.close,
                    },
                  ],
            },
            wednesday: {
              open: !settings.workingHours.wednesday.closed,
              hours: settings.workingHours.wednesday.closed
                ? []
                : [
                    {
                      start: settings.workingHours.wednesday.open,
                      end: settings.workingHours.wednesday.close,
                    },
                  ],
            },
            thursday: {
              open: !settings.workingHours.thursday.closed,
              hours: settings.workingHours.thursday.closed
                ? []
                : [
                    {
                      start: settings.workingHours.thursday.open,
                      end: settings.workingHours.thursday.close,
                    },
                  ],
            },
            friday: {
              open: !settings.workingHours.friday.closed,
              hours: settings.workingHours.friday.closed
                ? []
                : [
                    {
                      start: settings.workingHours.friday.open,
                      end: settings.workingHours.friday.close,
                    },
                  ],
            },
            saturday: {
              open: !settings.workingHours.saturday.closed,
              hours: settings.workingHours.saturday.closed
                ? []
                : [
                    {
                      start: settings.workingHours.saturday.open,
                      end: settings.workingHours.saturday.close,
                    },
                  ],
            },
            sunday: {
              open: !settings.workingHours.sunday.closed,
              hours: settings.workingHours.sunday.closed
                ? []
                : [
                    {
                      start: settings.workingHours.sunday.open,
                      end: settings.workingHours.sunday.close,
                    },
                  ],
            },
          },
        },
        settings: {
          preparationTime: settings.preparationTime,
        },
      };

      // Chamar API para salvar
      await apiClient.patch(`/stores/${storeSlug}/config`, configData);

      setMessage({
        type: "success",
        text: "Configurações salvas com sucesso!",
      });

      // Limpar mensagem após 3 segundos
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error("Erro ao salvar configurações:", error);

      // Tratar erros sem forçar logout/redirect
      let errorMessage = "Erro ao salvar configurações";

      if (error?.status === 403) {
        errorMessage =
          "Acesso negado. Você não tem permissão para alterar esta configuração.";
      } else if (error?.status === 404) {
        errorMessage = "Loja não encontrada.";
      } else if (error?.status === 422) {
        errorMessage = "Dados inválidos. Verifique as informações enviadas.";
      } else if (error?.status === 500) {
        errorMessage = "Erro interno do servidor. Tente novamente mais tarde.";
      } else if (error?.status === 401) {
        errorMessage = "Sessão expirada. Faça login novamente.";
        // Não forçar redirect automático
      }

      setMessage({
        type: "error",
        text: errorMessage,
      });

      // Limpar mensagem de erro após 5 segundos
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const getCurrentStatus = (): {
    status: "open" | "closed";
    message: string;
  } => {
    const now = new Date();
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const currentDay = dayNames[now.getDay()] as keyof WorkingHours;

    // Converter hora atual para minutos desde meia-noite
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const todayHours = settings.workingHours[currentDay];
    if (todayHours.closed) {
      return { status: "closed", message: "Loja fechada hoje" };
    }

    // Converter horários de abertura e fechamento para minutos
    const openMinutes =
      parseInt(todayHours.open.split(":")[0]) * 60 +
      parseInt(todayHours.open.split(":")[1]);
    const closeMinutes =
      parseInt(todayHours.close.split(":")[0]) * 60 +
      parseInt(todayHours.close.split(":")[1]);

    const isOpen =
      currentMinutes >= openMinutes && currentMinutes <= closeMinutes;

    return {
      status: isOpen ? "open" : "closed",
      message: isOpen ? "Loja aberta" : "Loja fechada",
    };
  };

  // Renderizar loading
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  // Renderizar erro (sem forçar logout/redirect)
  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <WarningCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Problema ao carregar configurações
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>{error}</p>
              <p className="mt-2">
                Tente recarregar a página ou verificar sua conexão.
              </p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-200"
              >
                Recarregar Página
              </button>
            </div>
          </div>
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
              <Clock className="h-6 w-6 text-orange-500" />
              <h1 className="text-xl font-semibold text-gray-900">
                Horários de Funcionamento
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <div
                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                  currentStatus.status === "open"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                <Power
                  className={`h-4 w-4 ${
                    currentStatus.status === "open"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                />
                <span>{currentStatus.message}</span>
              </div>
              <button
                onClick={saveSettings}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                <FloppyDisk className="h-4 w-4" />
                <span>{saving ? "Salvando..." : "Salvar"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div
            className={`p-4 rounded-lg flex items-center space-x-2 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <WarningCircle className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Horários por Dia */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Horários por Dia
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      applyToAllDays({
                        open: "08:00",
                        close: "18:00",
                        closed: false,
                      })
                    }
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Comercial
                  </button>
                  <button
                    onClick={() =>
                      applyToAllDays({
                        open: "09:00",
                        close: "22:00",
                        closed: false,
                      })
                    }
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Estendido
                  </button>
                  <button
                    onClick={() =>
                      applyToAllDays({
                        open: "00:00",
                        close: "23:59",
                        closed: true,
                      })
                    }
                    className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Fechado
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {daysOfWeek.map((day) => {
                  const dayHours =
                    settings.workingHours[day.key as keyof WorkingHours];
                  return (
                    <div
                      key={day.key}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <button
                          onClick={() =>
                            handleDayToggle(day.key as keyof WorkingHours)
                          }
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            dayHours.closed
                              ? "border-red-300 bg-red-100"
                              : "border-green-300 bg-green-100"
                          }`}
                        >
                          {!dayHours.closed && (
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                          )}
                        </button>
                        <span className="font-medium text-gray-900 min-w-0 flex-1">
                          {day.label}
                        </span>
                      </div>

                      {!dayHours.closed ? (
                        <div className="flex items-center space-x-2">
                          <select
                            value={dayHours.open}
                            onChange={(e) =>
                              handleTimeChange(
                                day.key as keyof WorkingHours,
                                "open",
                                e.target.value
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                            {timeSlots.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                          <span className="text-gray-500">até</span>
                          <select
                            value={dayHours.close}
                            onChange={(e) =>
                              handleTimeChange(
                                day.key as keyof WorkingHours,
                                "close",
                                e.target.value
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                            {timeSlots.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span className="text-red-600 font-medium">
                          Fechado
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Configurações Adicionais */}
          <div className="space-y-6">
            {/* Status Atual */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Status Atual
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status da Loja</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      currentStatus.status === "open"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {currentStatus.message}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Próximo Horário</span>
                  <span className="text-sm font-medium text-gray-900">
                    {currentStatus.status === "open"
                      ? "Fechamento"
                      : "Abertura"}
                  </span>
                </div>
              </div>
            </div>

            {/* Configurações Gerais */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Configurações Gerais
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempo de Preparação (minutos)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={settings.preparationTime}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        preparationTime: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuso Horário
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        timezone: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                    <option value="America/Manaus">Manaus (GMT-4)</option>
                    <option value="America/Belem">Belém (GMT-3)</option>
                    <option value="America/Fortaleza">Fortaleza (GMT-3)</option>
                    <option value="America/Recife">Recife (GMT-3)</option>
                    <option value="America/Bahia">Salvador (GMT-3)</option>
                    <option value="America/Maceio">Maceió (GMT-3)</option>
                    <option value="America/Aracaju">Aracaju (GMT-3)</option>
                    <option value="America/Noronha">
                      Fernando de Noronha (GMT-2)
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Informações */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                💡 Dicas de Horários
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Configure horários realistas</li>
                <li>• Considere horários de pico</li>
                <li>• Mantenha consistência</li>
                <li>• Atualize em feriados</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
