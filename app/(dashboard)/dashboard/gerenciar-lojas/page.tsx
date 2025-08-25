"use client";

import { ApproveStoreModal } from "@/components/ApproveStoreModal";
import { useFormValidation } from "@/components/FormValidation";
import { RejectStoreModal } from "@/components/RejectStoreModal";
import { useToast } from "@/components/Toast";
import {
  useApproveStore,
  useCreateStore,
  useDeleteStore,
  useRejectStore,
  useStores,
  useUpdateStore,
} from "@/hooks";
import { CreateStoreDto } from "@/types/cardapio-api";
import { Check, Clock, Eye, Storefront, Users, X } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GerenciarLojas() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<string | null>(null);
  const [rejectingStore, setRejectingStore] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [approvingStore, setApprovingStore] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
  });

  // Validação de formulário
  const {
    errors,
    validateForm,
    clearErrors,
    getFieldError,
    isFieldTouched,
    markFieldAsTouched,
  } = useFormValidation();

  // Hooks da API Cardap.IO
  const { data: storesData, isLoading, refetch, error } = useStores();
  const createStoreMutation = useCreateStore();
  const updateStoreMutation = useUpdateStore();
  const deleteStoreMutation = useDeleteStore();
  const approveStoreMutation = useApproveStore();
  const rejectStoreMutation = useRejectStore();

  const stores = storesData?.data || [];
  const loading = isLoading;

  // Gerar slug automaticamente
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Criar nova loja
  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();

    // Limpar erros anteriores
    clearErrors();

    const slug = formData.slug || generateSlug(formData.name);

    // Validação usando o hook de validação
    const validationRules = {
      name: [
        { required: true, fieldName: "Nome da loja" },
        { minLength: 2, fieldName: "Nome da loja" },
        { maxLength: 100, fieldName: "Nome da loja" },
      ],
      slug: [
        { required: true, fieldName: "Slug" },
        { minLength: 2, fieldName: "Slug" },
        { maxLength: 50, fieldName: "Slug" },
        {
          pattern: /^[a-z0-9-]+$/,
          fieldName: "Slug",
          message:
            "Slug deve conter apenas letras minúsculas, números e hífens",
        },
      ],
    };

    const isValid = validateForm(formData, validationRules);
    if (!isValid) {
      addToast(
        "error",
        "Erro de Validação",
        "Por favor, corrija os campos obrigatórios"
      );
      return;
    }

    // Verificar se slug já existe
    if (stores.some((store) => store.slug === slug)) {
      addToast(
        "error",
        "Slug Duplicado",
        `Já existe uma loja com o slug "${slug}". Escolha outro nome.`
      );
      return;
    }

    try {
      const storeData: CreateStoreDto = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        slug: slug,
        config: {
          address: "Endereço a ser configurado",
          phone: "Telefone a ser configurado",
          email: "email@loja.com",
          logo: "",
          banner: "",
          category: "Outros",
          deliveryFee: 5,
          minimumOrder: 20,
          estimatedDeliveryTime: 30,
          businessHours: {
            monday: { open: true, openTime: "09:00", closeTime: "18:00" },
            tuesday: { open: true, openTime: "09:00", closeTime: "18:00" },
            wednesday: { open: true, openTime: "09:00", closeTime: "18:00" },
            thursday: { open: true, openTime: "09:00", closeTime: "18:00" },
            friday: { open: true, openTime: "09:00", closeTime: "18:00" },
            saturday: { open: true, openTime: "10:00", closeTime: "16:00" },
            sunday: { open: false },
          },
          paymentMethods: ["PIX", "CARTÃO", "DINHEIRO"],
        },
      };

      const createdStore = await createStoreMutation.mutateAsync(storeData);

      // Limpar formulário e fechar modal
      setFormData({
        name: "",
        description: "",
        slug: "",
      });
      setIsCreateModalOpen(false);

      // Recarregar dados
      refetch();

      // Feedback de sucesso
      addToast("success", "Loja Criada!", "Loja criada com sucesso!");

      // Aguardar um momento e redirecionar para o dashboard da loja
      setTimeout(() => {
        router.push(
          `/dashboard/${createdStore.slug}?welcome=true&message=Loja criada com sucesso!`
        );
      }, 1000);
    } catch (error) {
      console.error("Erro ao criar loja:", error);

      // Mensagem de erro mais específica
      let errorMessage = "Erro ao criar loja. Tente novamente.";

      if (error instanceof Error) {
        if (error.message.includes("Conflito")) {
          errorMessage = error.message;
        } else if (error.message.includes("Validação")) {
          errorMessage = error.message;
        } else if (error.message.includes("Não autorizado")) {
          errorMessage = "Sessão expirada. Faça login novamente.";
        }
      }

      addToast("error", "Erro ao Criar Loja", errorMessage);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Aprovar loja
  const handleApproveStore = async (storeId: string) => {
    setApprovingStore({
      id: storeId,
      name: stores.find((store) => store.id === storeId)?.name || "Loja",
    });
  };

  // Rejeitar loja
  const handleRejectStore = async (storeId: string, reason?: string) => {
    try {
      await rejectStoreMutation.mutateAsync({ id: storeId, reason });
      addToast("success", "Loja Rejeitada", "Loja rejeitada com sucesso!");
      refetch();
    } catch (error: any) {
      console.error("Erro ao rejeitar loja:", error);

      let errorMessage = "Erro ao rejeitar loja. Tente novamente.";

      if (error.message?.includes("401")) {
        errorMessage = "Erro de autenticação. Faça login novamente.";
      } else if (error.message?.includes("403")) {
        errorMessage = "Você não tem permissão para rejeitar lojas.";
      } else if (error.message?.includes("404")) {
        errorMessage = "Loja não encontrada. Tente atualizar a página.";
      }

      addToast("error", "Erro ao Rejeitar Loja", errorMessage);
    }
  };

  // Abrir modal de reprovação
  const openRejectModal = (store: any) => {
    setRejectingStore({
      id: store.id,
      name: store.name,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">
            Carregando lojas...
          </p>
          <p className="text-sm text-gray-500 mt-2">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  // Tratamento de erro para falha na busca de lojas
  if (error) {
    console.error("❌ Erro ao carregar lojas:", error);

    let errorMessage = "Erro ao carregar lojas. Tente novamente.";
    let errorTitle = "Erro ao Carregar Lojas";

    if (error.message?.includes("401")) {
      errorMessage = "Sessão expirada. Faça login novamente.";
      errorTitle = "Sessão Expirada";
    } else if (error.message?.includes("403")) {
      errorMessage = "Você não tem permissão para acessar esta página.";
      errorTitle = "Acesso Negado";
    } else if (error.message?.includes("404")) {
      errorMessage = "Recurso não encontrado. Tente atualizar a página.";
      errorTitle = "Recurso Não Encontrado";
    } else if (error.message?.includes("500")) {
      errorMessage =
        "Erro interno do servidor. Tente novamente em alguns minutos.";
      errorTitle = "Erro do Servidor";
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 max-w-md mx-auto">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {errorTitle}
          </h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <div className="space-y-3">
            <button
              onClick={() => refetch()}
              className="w-full px-6 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors duration-200"
            >
              Tentar Novamente
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors duration-200"
            >
              Recarregar Página
            </button>
          </div>
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-500">
              <strong>Detalhes técnicos:</strong>
              <br />
              {error.message || "Erro desconhecido"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 space-y-4 sm:space-y-0">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                Dashboard
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl">
                Gerencie todas as lojas do sistema de forma centralizada e
                eficiente
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Storefront className="w-8 h-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total de Lojas
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stores.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Lojas Aprovadas
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stores.filter((store) => store.approved).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stores.filter((store) => !store.approved).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total de Usuários
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stores.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stores List */}
        <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Lojas Cadastradas
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Gerencie o status e configurações de todas as lojas
            </p>
          </div>

          {stores.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Storefront className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Nenhuma loja encontrada
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Nenhuma loja foi criada no sistema ainda.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Loja
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Usuários
                    </th>
                    <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Criada em
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stores.map((store) => (
                    <tr
                      key={store.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-4 sm:px-6 py-4">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {store.name}
                          </div>
                          <div className="text-sm text-gray-600 truncate max-w-xs">
                            {store.description}
                          </div>
                          <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                            /{store.slug}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="space-y-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                              store.approved
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            }`}
                          >
                            {store.approved ? (
                              <>
                                <Check className="w-3 h-3 mr-1" />
                                Aprovada
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                Pendente
                              </>
                            )}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                              store.active
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-gray-100 text-gray-800 border border-gray-200"
                            }`}
                          >
                            {store.active ? "Ativa" : "Inativa"}
                          </span>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 sm:px-6 py-4 text-sm text-gray-900">
                        N/A
                      </td>
                      <td className="hidden md:table-cell px-4 sm:px-6 py-4 text-sm text-gray-600">
                        {formatDate(store.createdAt)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right text-sm font-medium">
                        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                          {!store.approved && (
                            <>
                              <button
                                onClick={() => handleApproveStore(store.id)}
                                className="inline-flex items-center px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm"
                                title="Aprovar loja"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Aprovar
                              </button>
                              <button
                                onClick={() => openRejectModal(store)}
                                className="inline-flex items-center px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-sm"
                                title="Rejeitar loja"
                              >
                                <X className="w-3 h-3 mr-1" />
                                Rejeitar
                              </button>
                            </>
                          )}
                          {store.approved && (
                            <>
                              <button
                                onClick={() =>
                                  router.push(`/store/${store.slug}`)
                                }
                                className="inline-flex items-center px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                                title="Ver loja"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Ver Loja
                              </button>
                              <button
                                onClick={() =>
                                  router.push(`/dashboard/${store.slug}`)
                                }
                                className="inline-flex items-center px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm"
                                title="Acessar dashboard"
                              >
                                Dashboard
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
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Criar Nova Loja
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateStore} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome da Loja *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
                    placeholder="Ex: Pizzaria do João"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200 resize-none"
                    placeholder="Descrição da loja..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL da Loja
                  </label>
                  <div className="flex rounded-xl shadow-sm border border-gray-300 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 transition-all duration-200">
                    <span className="inline-flex items-center px-4 py-3 rounded-l-xl border-r border-gray-300 bg-gray-50 text-gray-600 text-sm font-medium">
                      cardap.io/store/
                    </span>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className="flex-1 min-w-0 block w-full px-4 py-3 border-0 rounded-r-xl focus:outline-none focus:ring-0 text-gray-900"
                      placeholder="pizzaria-do-joao"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Deixe em branco para gerar automaticamente
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl hover:from-orange-700 hover:to-orange-800 transform hover:scale-105 transition-all duration-200 shadow-lg"
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
            addToast("success", "Loja Aprovada!", "Loja aprovada com sucesso!");
          }}
        />
      )}
    </div>
  );
}
