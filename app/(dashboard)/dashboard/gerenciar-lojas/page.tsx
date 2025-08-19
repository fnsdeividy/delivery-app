'use client'

import { ApproveStoreModal } from '@/components/ApproveStoreModal'
import { useFormValidation } from '@/components/FormValidation'
import { RejectStoreModal } from '@/components/RejectStoreModal'
import { useToast } from '@/components/Toast'
import { useApproveStore, useCreateStore, useDeleteStore, useRejectStore, useStores, useUpdateStore } from '@/hooks'
import { CreateStoreDto } from '@/types/cardapio-api'
import { Edit, ExternalLink, Eye, Plus, Store, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function GerenciarLojas() {
  const router = useRouter()
  const { addToast } = useToast()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingStore, setEditingStore] = useState<string | null>(null)
  const [rejectingStore, setRejectingStore] = useState<{ id: string; name: string } | null>(null)
  const [approvingStore, setApprovingStore] = useState<{ id: string; name: string } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: ''
  })

  // Validação de formulário
  const { errors, validateForm, clearErrors, getFieldError, isFieldTouched, markFieldAsTouched } = useFormValidation()

  // Hooks da API Cardap.IO
  const { data: storesData, isLoading, refetch, error } = useStores()
  const createStoreMutation = useCreateStore()
  const updateStoreMutation = useUpdateStore()
  const deleteStoreMutation = useDeleteStore()
  const approveStoreMutation = useApproveStore()
  const rejectStoreMutation = useRejectStore()

  const stores = storesData?.data || []
  const loading = isLoading

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

    // Limpar erros anteriores
    clearErrors()

    const slug = formData.slug || generateSlug(formData.name)

    // Validação usando o hook de validação
    const validationRules = {
      name: [
        { required: true, fieldName: 'Nome da loja' },
        { minLength: 2, fieldName: 'Nome da loja' },
        { maxLength: 100, fieldName: 'Nome da loja' }
      ],
      slug: [
        { required: true, fieldName: 'Slug' },
        { minLength: 2, fieldName: 'Slug' },
        { maxLength: 50, fieldName: 'Slug' },
        {
          pattern: /^[a-z0-9-]+$/,
          fieldName: 'Slug',
          message: 'Slug deve conter apenas letras minúsculas, números e hífens'
        }
      ]
    }

    const isValid = validateForm(formData, validationRules)
    if (!isValid) {
      addToast({
        type: 'error',
        title: 'Erro de Validação',
        message: 'Por favor, corrija os campos obrigatórios'
      })
      return
    }

    // Verificar se slug já existe
    if (stores.some(store => store.slug === slug)) {
      addToast({
        type: 'error',
        title: 'Slug Duplicado',
        message: `Já existe uma loja com o slug "${slug}". Escolha outro nome.`
      })
      return
    }

    try {
      const storeData: CreateStoreDto = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        slug: slug,
        config: {
          address: 'Endereço a ser configurado',
          phone: 'Telefone a ser configurado',
          email: 'email@loja.com',
          logo: '',
          banner: '',
          category: 'Outros',
          deliveryFee: 5,
          minimumOrder: 20,
          estimatedDeliveryTime: 30,
          businessHours: {
            monday: { open: true, openTime: '09:00', closeTime: '18:00' },
            tuesday: { open: true, openTime: '09:00', closeTime: '18:00' },
            wednesday: { open: true, openTime: '09:00', closeTime: '18:00' },
            thursday: { open: true, openTime: '09:00', closeTime: '18:00' },
            friday: { open: true, openTime: '09:00', closeTime: '18:00' },
            saturday: { open: true, openTime: '10:00', closeTime: '16:00' },
            sunday: { open: false }
          },
          paymentMethods: ['PIX', 'CARTÃO', 'DINHEIRO']
        }
      }

      const createdStore = await createStoreMutation.mutateAsync(storeData)

      // Limpar formulário e fechar modal
      setFormData({
        name: '',
        description: '',
        slug: ''
      })
      setIsCreateModalOpen(false)

      // Recarregar dados
      refetch()

      // Feedback de sucesso
      addToast({
        type: 'success',
        title: 'Loja Criada!',
        message: 'Loja criada com sucesso!'
      })

      // Aguardar um momento e redirecionar para o dashboard da loja
      setTimeout(() => {
        router.push(`/dashboard/${createdStore.slug}?welcome=true&message=Loja criada com sucesso!`)
      }, 1000)

    } catch (error) {
      console.error('Erro ao criar loja:', error)

      // Mensagem de erro mais específica
      let errorMessage = 'Erro ao criar loja. Tente novamente.'

      if (error instanceof Error) {
        if (error.message.includes('Conflito')) {
          errorMessage = error.message
        } else if (error.message.includes('Validação')) {
          errorMessage = error.message
        } else if (error.message.includes('Não autorizado')) {
          errorMessage = 'Sessão expirada. Faça login novamente.'
        }
      }

      addToast({
        type: 'error',
        title: 'Erro ao Criar Loja',
        message: errorMessage
      })
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

  // Aprovar loja
  const handleApproveStore = async (storeId: string) => {
    setApprovingStore({
      id: storeId,
      name: stores.find(store => store.id === storeId)?.name || 'Loja'
    })
  }

  // Rejeitar loja
  const handleRejectStore = async (storeId: string, reason?: string) => {
    try {
      await rejectStoreMutation.mutateAsync({ id: storeId, reason })
      addToast({
        type: 'success',
        title: 'Loja Rejeitada',
        message: 'Loja rejeitada com sucesso!'
      })
      refetch()
    } catch (error: any) {
      console.error('Erro ao rejeitar loja:', error)

      let errorMessage = 'Erro ao rejeitar loja. Tente novamente.'

      if (error.message?.includes('401')) {
        errorMessage = 'Erro de autenticação. Faça login novamente.'
      } else if (error.message?.includes('403')) {
        errorMessage = 'Você não tem permissão para rejeitar lojas.'
      } else if (error.message?.includes('404')) {
        errorMessage = 'Loja não encontrada. Tente atualizar a página.'
      }

      addToast({
        type: 'error',
        title: 'Erro ao Rejeitar Loja',
        message: errorMessage
      })
    }
  }

  // Abrir modal de reprovação
  const openRejectModal = (store: any) => {
    setRejectingStore({
      id: store.id,
      name: store.name
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
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <p className="text-sm font-medium text-gray-500">Lojas Aprovadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stores.filter(store => store.approved).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm font-bold">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stores.filter(store => !store.approved).length}
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
                  {stores.length}
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
                        <div className="space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${store.approved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {store.approved ? 'Aprovada' : 'Pendente'}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${store.active
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}>
                            {store.active ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        N/A
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(store.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {!store.approved && (
                            <>
                              <button
                                onClick={() => handleApproveStore(store.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Aprovar loja"
                              >
                                <span className="text-sm">✅</span>
                              </button>
                              <button
                                onClick={() => openRejectModal(store)}
                                className="text-red-600 hover:text-red-900"
                                title="Rejeitar loja"
                              >
                                <span className="text-sm">❌</span>
                              </button>
                            </>
                          )}
                          {store.approved && (
                            <>
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
                              <button
                                onClick={() => router.push(`/dashboard/editar-loja/${store.id}`)}
                                className="text-orange-600 hover:text-orange-900"
                                title="Editar loja"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </>
                          )}
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
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-black"
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
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-black"
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
                      className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-black"
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

      {/* Reject Store Modal */}
      {rejectingStore && (
        <RejectStoreModal
          isOpen={!!rejectingStore}
          storeName={rejectingStore.name}
          onClose={() => setRejectingStore(null)}
          onConfirm={async (reason) => {
            await handleRejectStore(rejectingStore.id, reason);
            setRejectingStore(null);
          }}
        />
      )}

      {/* Approve Store Modal */}
      {approvingStore && (
        <ApproveStoreModal
          isOpen={!!approvingStore}
          storeName={approvingStore.name}
          onClose={() => setApprovingStore(null)}
          onConfirm={async () => {
            await approveStoreMutation.mutateAsync(approvingStore.id);
            setApprovingStore(null);
            refetch();
            addToast({
              type: 'success',
              title: 'Loja Aprovada!',
              message: 'Loja aprovada com sucesso!'
            });
          }}
        />
      )}
    </div>
  )
}