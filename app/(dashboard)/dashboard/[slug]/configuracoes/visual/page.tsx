'use client'

import {
    AlertCircle,
    CheckCircle,
    Eye,
    Palette,
    Save,
    Upload,
    X
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useStoreConfig } from '../../../../../lib/store/useStoreConfig'

interface ColorScheme {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  accentColor: string
}

interface BrandingConfig {
  logo?: string
  favicon?: string
  bannerImage?: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  accentColor: string
}

export default function VisualConfigPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const { config, loading, error } = useStoreConfig(slug)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [branding, setBranding] = useState<BrandingConfig>({
    logo: '',
    favicon: '',
    bannerImage: '',
    primaryColor: '#d97706',
    secondaryColor: '#92400e',
    backgroundColor: '#fef3c7',
    textColor: '#1f2937',
    accentColor: '#f59e0b'
  })

  // Carregar configuração atual
  useEffect(() => {
    if (config?.branding) {
      setBranding({
        logo: config.branding.logo || '',
        favicon: config.branding.favicon || '',
        bannerImage: config.branding.bannerImage || '',
        primaryColor: config.branding.primaryColor || '#d97706',
        secondaryColor: config.branding.secondaryColor || '#92400e',
        backgroundColor: config.branding.backgroundColor || '#fef3c7',
        textColor: config.branding.textColor || '#1f2937',
        accentColor: config.branding.accentColor || '#f59e0b'
      })
    }
  }, [config])

  // Esquemas de cores pré-definidos
  const colorSchemes: { name: string; scheme: ColorScheme }[] = [
    {
      name: 'Laranja Clássico',
      scheme: {
        primaryColor: '#d97706',
        secondaryColor: '#92400e',
        backgroundColor: '#fef3c7',
        textColor: '#1f2937',
        accentColor: '#f59e0b'
      }
    },
    {
      name: 'Azul Profissional',
      scheme: {
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
        backgroundColor: '#eff6ff',
        textColor: '#1f2937',
        accentColor: '#3b82f6'
      }
    },
    {
      name: 'Verde Natural',
      scheme: {
        primaryColor: '#059669',
        secondaryColor: '#047857',
        backgroundColor: '#ecfdf5',
        textColor: '#1f2937',
        accentColor: '#10b981'
      }
    },
    {
      name: 'Roxo Elegante',
      scheme: {
        primaryColor: '#7c3aed',
        secondaryColor: '#5b21b6',
        backgroundColor: '#f3f4f6',
        textColor: '#1f2937',
        accentColor: '#8b5cf6'
      }
    },
    {
      name: 'Vermelho Energético',
      scheme: {
        primaryColor: '#dc2626',
        secondaryColor: '#991b1b',
        backgroundColor: '#fef2f2',
        textColor: '#1f2937',
        accentColor: '#ef4444'
      }
    }
  ]

  const applyColorScheme = (scheme: ColorScheme) => {
    setBranding(prev => ({
      ...prev,
      ...scheme
    }))
  }

  const handleFileUpload = (field: 'logo' | 'favicon' | 'bannerImage') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = field === 'favicon' ? 'image/x-icon,image/png' : 'image/*'
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setBranding(prev => ({
            ...prev,
            [field]: result
          }))
        }
        reader.readAsDataURL(file)
      }
    }
    
    input.click()
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
          branding
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar configurações')
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Erro ao salvar configurações' 
      })
    } finally {
      setSaving(false)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Palette className="h-6 w-6 text-orange-500" />
              <h1 className="text-xl font-semibold text-gray-900">Personalização Visual</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </button>
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
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4`}>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configurações */}
          <div className="space-y-8">
            {/* Esquemas de Cores */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Esquemas de Cores</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {colorSchemes.map((scheme) => (
                  <button
                    key={scheme.name}
                    onClick={() => applyColorScheme(scheme.scheme)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: scheme.scheme.primaryColor }}
                      />
                      <span className="font-medium text-gray-900">{scheme.name}</span>
                    </div>
                    <div className="flex space-x-1">
                      {Object.values(scheme.scheme).map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cores Personalizadas */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cores Personalizadas</h3>
              <div className="space-y-4">
                {[
                  { key: 'primaryColor', label: 'Cor Primária', description: 'Botões e elementos principais' },
                  { key: 'secondaryColor', label: 'Cor Secundária', description: 'Elementos secundários' },
                  { key: 'backgroundColor', label: 'Cor de Fundo', description: 'Fundo da loja' },
                  { key: 'textColor', label: 'Cor do Texto', description: 'Texto principal' },
                  { key: 'accentColor', label: 'Cor de Destaque', description: 'Elementos de destaque' }
                ].map(({ key, label, description }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label}
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={branding[key as keyof BrandingConfig] as string}
                        onChange={(e) => setBranding(prev => ({ ...prev, [key]: e.target.value }))}
                        className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={branding[key as keyof BrandingConfig] as string}
                        onChange={(e) => setBranding(prev => ({ ...prev, [key]: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="#000000"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload de Imagens */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Imagens</h3>
              <div className="space-y-4">
                {[
                  { key: 'logo', label: 'Logo da Loja', description: 'Recomendado: 200x200px, PNG' },
                  { key: 'favicon', label: 'Favicon', description: 'Recomendado: 32x32px, ICO ou PNG' },
                  { key: 'bannerImage', label: 'Banner', description: 'Recomendado: 1200x400px, JPG' }
                ].map(({ key, label, description }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label}
                    </label>
                    <div className="flex items-center space-x-3">
                      {branding[key as keyof BrandingConfig] && (
                        <img
                          src={branding[key as keyof BrandingConfig] as string}
                          alt={label}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                        />
                      )}
                      <button
                        onClick={() => handleFileUpload(key as 'logo' | 'favicon' | 'bannerImage')}
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Upload</span>
                      </button>
                      {branding[key as keyof BrandingConfig] && (
                        <button
                          onClick={() => setBranding(prev => ({ ...prev, [key]: '' }))}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview da Loja</h3>
              <div 
                className="border border-gray-300 rounded-lg overflow-hidden"
                style={{ backgroundColor: branding.backgroundColor }}
              >
                {/* Header Preview */}
                <div className="bg-white p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {branding.logo && (
                        <img 
                          src={branding.logo} 
                          alt="Logo" 
                          className="h-8 w-auto"
                        />
                      )}
                      <h2 
                        className="text-lg font-semibold"
                        style={{ color: branding.primaryColor }}
                      >
                        {config.name}
                      </h2>
                    </div>
                    <button
                      className="px-4 py-2 rounded-lg text-white font-medium"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      Pedir Agora
                    </button>
                  </div>
                </div>

                {/* Banner Preview */}
                {branding.bannerImage && (
                  <div className="relative h-32">
                    <img
                      src={branding.bannerImage}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <h3 
                        className="text-white text-xl font-bold"
                        style={{ color: branding.textColor }}
                      >
                        {config.name}
                      </h3>
                    </div>
                  </div>
                )}

                {/* Content Preview */}
                <div className="p-4">
                  <div className="space-y-3">
                    <div 
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: branding.accentColor }}
                    >
                      <p 
                        className="text-sm font-medium"
                        style={{ color: branding.textColor }}
                      >
                        Produto de exemplo
                      </p>
                      <p 
                        className="text-xs"
                        style={{ color: branding.textColor }}
                      >
                        Descrição do produto
                      </p>
                    </div>
                    <button
                      className="w-full py-2 rounded-lg text-white font-medium"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      Adicionar ao Carrinho
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 Dicas de Personalização</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use cores que representem sua marca</li>
                <li>• Mantenha contraste adequado para legibilidade</li>
                <li>• Teste em diferentes dispositivos</li>
                <li>• Imagens devem ter boa qualidade</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 