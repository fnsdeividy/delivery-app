'use client'

import {
    AlertCircle,
    CheckCircle,
    Clock,
    Power,
    Save
} from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useStoreConfig } from '../../../../../lib/store/useStoreConfig'

interface WorkingHours {
  [key: string]: {
    open: string
    close: string
    closed: boolean
  }
}

interface StoreSettings {
  workingHours: WorkingHours
  preparationTime: number
  autoClose: boolean
  timezone: string
}

export default function HorariosConfigPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const { config, loading, error } = useStoreConfig(slug)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [settings, setSettings] = useState<StoreSettings>({
    workingHours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '08:00', close: '18:00', closed: false },
      sunday: { open: '08:00', close: '18:00', closed: true }
    },
    preparationTime: 25,
    autoClose: true,
    timezone: 'America/Sao_Paulo'
  })

  // Carregar configuração atual
  useEffect(() => {
    if (config?.settings) {
      setSettings(prev => ({
        ...prev,
        preparationTime: config.settings.preparationTime || 25,
        autoClose: config.settings.autoClose !== false,
        timezone: config.settings.timezone || 'America/Sao_Paulo',
        workingHours: config.settings.workingHours || prev.workingHours
      }))
    }
  }, [config])

  const daysOfWeek = [
    { key: 'monday', label: 'Segunda-feira', short: 'Seg' },
    { key: 'tuesday', label: 'Terça-feira', short: 'Ter' },
    { key: 'wednesday', label: 'Quarta-feira', short: 'Qua' },
    { key: 'thursday', label: 'Quinta-feira', short: 'Qui' },
    { key: 'friday', label: 'Sexta-feira', short: 'Sex' },
    { key: 'saturday', label: 'Sábado', short: 'Sáb' },
    { key: 'sunday', label: 'Domingo', short: 'Dom' }
  ]

  const timeSlots = [
    '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30',
    '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30',
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
  ]

  const handleDayToggle = (day: string) => {
    setSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          closed: !prev.workingHours[day].closed
        }
      }
    }))
  }

  const handleTimeChange = (day: string, field: 'open' | 'close', value: string) => {
    setSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value
        }
      }
    }))
  }

  const applyToAllDays = (template: { open: string; close: string; closed: boolean }) => {
    setSettings(prev => ({
      ...prev,
      workingHours: Object.keys(prev.workingHours).reduce((acc, day) => ({
        ...acc,
        [day]: template
      }), {} as WorkingHours)
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    
    try {
      const response = await fetch(`/api/stores/${slug}/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          settings
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Horários salvos com sucesso!' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar horários')
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Erro ao salvar horários' 
      })
    } finally {
      setSaving(false)
    }
  }

  const getCurrentStatus = () => {
    const now = new Date()
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' })
    const currentTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    
    const todayHours = settings.workingHours[currentDay]
    if (todayHours.closed) {
      return { status: 'closed', message: 'Loja fechada hoje' }
    }
    
    const isOpen = currentTime >= todayHours.open && currentTime <= todayHours.close
    return {
      status: isOpen ? 'open' : 'closed',
      message: isOpen ? 'Loja aberta' : 'Loja fechada'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar</h2>
          <p className="text-gray-600">{error || 'Configurações não encontradas'}</p>
        </div>
      </div>
    )
  }

  const currentStatus = getCurrentStatus()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Clock className="h-6 w-6 text-orange-500" />
              <h1 className="text-xl font-semibold text-gray-900">Horários de Funcionamento</h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                currentStatus.status === 'open' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <Power className={`h-4 w-4 ${
                  currentStatus.status === 'open' ? 'text-green-600' : 'text-red-600'
                }`} />
                <span>{currentStatus.message}</span>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Salvando...' : 'Salvar'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className={`p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
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
                <h3 className="text-lg font-semibold text-gray-900">Horários por Dia</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => applyToAllDays({ open: '08:00', close: '18:00', closed: false })}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Comercial
                  </button>
                  <button
                    onClick={() => applyToAllDays({ open: '09:00', close: '22:00', closed: false })}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Estendido
                  </button>
                  <button
                    onClick={() => applyToAllDays({ open: '00:00', close: '23:59', closed: true })}
                    className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Fechado
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {daysOfWeek.map((day) => {
                  const dayHours = settings.workingHours[day.key]
                  return (
                    <div key={day.key} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <button
                          onClick={() => handleDayToggle(day.key)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            dayHours.closed
                              ? 'border-red-300 bg-red-100'
                              : 'border-green-300 bg-green-100'
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
                            onChange={(e) => handleTimeChange(day.key, 'open', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                            {timeSlots.map((time) => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                          <span className="text-gray-500">até</span>
                          <select
                            value={dayHours.close}
                            onChange={(e) => handleTimeChange(day.key, 'close', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                            {timeSlots.map((time) => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span className="text-red-600 font-medium">Fechado</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Configurações Adicionais */}
          <div className="space-y-6">
            {/* Status Atual */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Atual</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status da Loja</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    currentStatus.status === 'open' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {currentStatus.message}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Próximo Horário</span>
                  <span className="text-sm font-medium text-gray-900">
                    {currentStatus.status === 'open' ? 'Fechamento' : 'Abertura'}
                  </span>
                </div>
              </div>
            </div>

            {/* Configurações Gerais */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações Gerais</h3>
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
                    onChange={(e) => setSettings(prev => ({ ...prev, preparationTime: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuso Horário
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
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
                    <option value="America/Noronha">Fernando de Noronha (GMT-2)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Fechamento Automático</label>
                    <p className="text-xs text-gray-500">Fechar automaticamente fora do horário</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, autoClose: !prev.autoClose }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.autoClose ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoClose ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Informações */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 Dicas de Horários</h4>
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
  )
} 