'use client'

import { Plus, Store, Edit, ExternalLink, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface StoreData {
  slug: string
  name: string
  description: string
  branding: {
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    textColor: string
    accentColor: string
    logo?: string
  }
  business: {
    phone: string
    email: string
    address?: string
    website?: string
  }
  createdAt: string
}

export default function GerenciarLojas() {
  const router = useRouter()
  const [stores, setStores] = useState<StoreData[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    primaryColor: '#e53e3e',
    secondaryColor: '#c53030',
    backgroundColor: '#fff5f5',
    textColor: '#1a202c',
    accentColor: '#fc8181',
    phone: '',
    email: '',
    address: '',
    website: ''
  })

  // Carregar lojas do localStorage
  useEffect(() => {
    const savedStores = localStorage.getItem('custom-stores')
    if (savedStores) {
      setStores(JSON.parse(savedStores))
    }
  }, [])

  // Salvar lojas no localStorage
  const saveStores = (newStores: StoreData[]) => {
    localStorage.setItem('custom-stores', JSON.stringify(newStores))
    setStores(newStores)
  }

  // Gerar slug automaticamente
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // Criar nova loja
  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const slug = formData.slug || generateSlug(formData.name)
    
    // Verificar se slug já existe
    if (stores.some(store => store.slug === slug)) {
      alert('Já existe uma loja com este slug. Escolha outro nome.')
      return
    }

    const newStore: StoreData = {
      slug,
      name: formData.name,
      description: formData.description,
      branding: {
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        backgroundColor: formData.backgroundColor,
        textColor: formData.textColor,
        accentColor: formData.accentColor
      },
      business: {
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        website: formData.website
      },
      createdAt: new Date().toISOString()
    }

    // Criar configuração JSON completa
    const storeConfig = {
      slug: newStore.slug,
      name: newStore.name,
      description: newStore.description,
      branding: newStore.branding,
      business: newStore.business,
      menu: {
        categories: [
          {
            id: 'principais',
            name: 'Pratos Principais',
            description: 'Nossos pratos principais',
            active: true
          }
        ],
        products: [
          {
            id: 'produto-exemplo',
            name: 'Produto Exemplo',
            description: 'Este é um produto de exemplo. Edite ou remova conforme necessário.',
            price: 19.90,
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
            category: 'principais',
            ingredients: ['Ingrediente 1', 'Ingrediente 2'],
            tags: ['Novo'],
            tagColor: 'blue',
            active: true,
            preparationTime: 20,
            customizeIngredients: [],
            addons: []
          }
        ]
      },
      delivery: {
        enabled: true,
        radius: 5,
        fee: 5.00,
        freeDeliveryMinimum: 30.00,
        estimatedTime: 45,
        areas: []
      },
      payments: {
        pix: true,
        cash: true,
        card: true,
        online: false,
        integrations: {}
      },
      schedule: {
        timezone: 'America/Sao_Paulo',
        workingHours: {
          monday: { open: false, hours: [] },
          tuesday: { open: true, hours: [{ start: '18:00', end: '23:00' }] },
          wednesday: { open: true, hours: [{ start: '18:00', end: '23:00' }] },
          thursday: { open: true, hours: [{ start: '18:00', end: '23:00' }] },
          friday: { open: true, hours: [{ start: '18:00', end: '23:30' }] },
          saturday: { open: true, hours: [{ start: '18:00', end: '23:30' }] },
          sunday: { open: true, hours: [{ start: '18:00', end: '23:00' }] }
        },
        closedMessage: 'Estamos fechados no momento. Horário de funcionamento: Terça a Domingo, 18h às 23h.',
        specialDates: []
      },
      promotions: {
        coupons: [],
        loyaltyProgram: {
          enabled: false,
          pointsPerReal: 1,
          pointsToReal: 100
        }
      },
      settings: {
        whatsappTemplate: `Olá! Gostaria de fazer um pedido na ${newStore.name}. 🍽️`,
        preparationTime: 30,
        orderNotifications: {
          email: true,
          whatsapp: true,
          dashboard: true
        }
      }
    }

    try {
      // Salvar via API
      const response = await fetch('/api/stores/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(storeConfig)
      })

      if (response.ok) {
        // Salvar no localStorage também
        const updatedStores = [...stores, newStore]
        saveStores(updatedStores)
        
        // Resetar formulário
        setFormData({
          name: '',
          description: '',
          slug: '',
          primaryColor: '#e53e3e',
          secondaryColor: '#c53030',
          backgroundColor: '#fff5f5',
          textColor: '#1a202c',
          accentColor: '#fc8181',
          phone: '',
          email: '',
          address: '',
          website: ''
        })
        
        setIsCreateModalOpen(false)
        alert('Loja criada com sucesso!')
      } else {
        alert('Erro ao criar loja. Salvando apenas localmente.')
        const updatedStores = [...stores, newStore]
        saveStores(updatedStores)
        setIsCreateModalOpen(false)
      }
    } catch (error) {
      console.error('Erro ao criar loja:', error)
      // Salvar apenas no localStorage em caso de erro
      const updatedStores = [...stores, newStore]
      saveStores(updatedStores)
      setIsCreateModalOpen(false)
      alert('Loja salva localmente. Verifique a conexão para sincronizar.')
    }
  }

  // Excluir loja
  const handleDeleteStore = (slug: string) => {
    if (confirm('Tem certeza que deseja excluir esta loja?')) {
      const updatedStores = stores.filter(store => store.slug !== slug)
      saveStores(updatedStores)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Lojas</h1>
          <p className="text-gray-600">Crie e gerencie suas lojas de delivery</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nova Loja
        </button>
      </div>

      {/* Lista de lojas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Loja exemplo (Boteco do João) */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <Store className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Boteco do João</h3>
                <p className="text-sm text-gray-500">Loja de exemplo</p>
              </div>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Comida caseira e cerveja gelada no coração da cidade
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push('/dashboard/boteco-do-joao')}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </button>
            <a
              href="/loja/boteco-do-joao"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Lojas criadas */}
        {stores.map((store) => (
          <div key={store.slug} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: store.branding.primaryColor }}
                >
                  <Store className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                  <p className="text-sm text-gray-500">/{store.slug}</p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteStore(store.slug)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              {store.description}
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push(`/dashboard/${store.slug}`)}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </button>
              <a
                href={`/loja/${store.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        ))}

        {/* Card para criar nova loja */}
        <div 
          className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition-colors"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Criar Nova Loja</h3>
          <p className="text-gray-500 text-sm">
            Clique para adicionar uma nova loja ao seu sistema
          </p>
        </div>
      </div>

      {/* Modal de criação */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Criar Nova Loja</h2>
              
              <form onSubmit={handleCreateStore} className="space-y-6">
                {/* Informações básicas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Informações Básicas</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome da Loja
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value })
                          if (!formData.slug) {
                            setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        placeholder="Ex: Pizzaria do João"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slug (URL)
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        placeholder="pizzaria-do-joao"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        URL: /loja/{formData.slug}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      rows={3}
                      placeholder="Descreva sua loja..."
                    />
                  </div>
                </div>

                {/* Cores do tema */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Tema Visual</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cor Primária
                      </label>
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-full h-10 rounded-md border border-gray-300"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cor Secundária
                      </label>
                      <input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="w-full h-10 rounded-md border border-gray-300"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cor de Destaque
                      </label>
                      <input
                        type="color"
                        value={formData.accentColor}
                        onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                        className="w-full h-10 rounded-md border border-gray-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Informações de contato */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Contato</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        placeholder="contato@minhapizzaria.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Endereço (opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      placeholder="Rua das Flores, 123, Centro"
                    />
                  </div>
                </div>

                {/* Botões */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Criar Loja
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}