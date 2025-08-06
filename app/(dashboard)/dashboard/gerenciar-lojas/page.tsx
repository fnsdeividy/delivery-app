'use client'

import { Edit, ExternalLink, Eye, Plus, Store, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface StoreData {
  id: string
  slug: string
  name: string
  description: string
  active: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    users: number
  }
}

export default function GerenciarLojas() {
  const router = useRouter()
  const [stores, setStores] = useState<StoreData[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: ''
  })

  // Carregar lojas do banco de dados
  useEffect(() => {
    const loadStores = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/stores')
        if (response.ok) {
          const data = await response.json()
          setStores(data.stores || [])
        } else {
          console.error('Erro ao carregar lojas')
        }
      } catch (error) {
        console.error('Erro ao carregar lojas:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStores()
  }, [])

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

    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          slug: slug
        }),
      })

      if (response.ok) {
        // Recarregar lojas
        const storesResponse = await fetch('/api/stores')
        if (storesResponse.ok) {
          const data = await storesResponse.json()
          setStores(data.stores || [])
        }
        
        // Limpar formulário e fechar modal
        setFormData({
          name: '',
          description: '',
          slug: ''
        })
        setIsCreateModalOpen(false)
      } else {
        const error = await response.json()
        alert(`Erro ao criar loja: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao criar loja:', error)
      alert('Erro ao criar loja. Tente novamente.')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando lojas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gerenciar Lojas</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gerencie todas as lojas do sistema
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Loja
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Store className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Lojas</p>
                <p className="text-2xl font-bold text-gray-900">{stores.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Lojas Ativas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stores.filter(store => store.active).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stores.reduce((total, store) => total + (store._count?.users || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stores List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Lojas Cadastradas</h2>
          </div>
          
          {stores.length === 0 ? (
            <div className="text-center py-12">
              <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma loja encontrada</h3>
              <p className="text-gray-500 mb-4">Comece criando sua primeira loja</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Criar Primeira Loja
              </button>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loja
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuários
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criada em
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stores.map((store) => (
                    <tr key={store.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{store.name}</div>
                          <div className="text-sm text-gray-500">{store.description}</div>
                          <div className="text-xs text-gray-400">/{store.slug}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          store.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {store.active ? 'Ativa' : 'Inativa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {store._count?.users || 0} usuários
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(store.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => router.push(`/store/${store.slug}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver loja"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/dashboard/${store.slug}`)}
                            className="text-green-600 hover:text-green-900"
                            title="Acessar dashboard"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Criar Nova Loja</h3>
              
              <form onSubmit={handleCreateStore} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nome da Loja *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Ex: Pizzaria do João"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Descrição
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Descrição da loja..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    URL da Loja
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      cardap.io/store/
                    </span>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      placeholder="pizzaria-do-joao"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Deixe em branco para gerar automaticamente
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
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