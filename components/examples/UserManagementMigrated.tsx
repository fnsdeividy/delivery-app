"use client";

import { Button } from "@/components/ui/button";
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from "@/hooks";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import {
  CreateUserDto,
  UpdateUserDto,
  User,
  UserRole,
} from "@/types/cardapio-api";
import React, { useState } from "react";
import LoadingSpinner from "../LoadingSpinner";

interface UserManagementProps {
  storeSlug?: string;
}

export function UserManagement({ storeSlug }: UserManagementProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Hooks para gerenciar usuários
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useUsers(currentPage, 10);
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  // Estados do formulário
  const [formData, setFormData] = useState<CreateUserDto>({
    email: "",
    name: "",
    password: "",
    role: UserRole.CLIENTE,
    storeSlug: storeSlug || "",
    phone: "",
  });

  // Hooks para controle de loading com prevenção de cliques duplos
  const { isLoading: isCreating, execute: executeCreate } = useAsyncAction({
    onSuccess: () => {
      setIsCreateModalOpen(false);
      setFormData({
        email: "",
        name: "",
        password: "",
        role: UserRole.CLIENTE,
        storeSlug: storeSlug || "",
        phone: "",
      });
    },
    onError: (error) => {
      console.error("Erro ao criar usuário:", error);
    },
  });

  const { isLoading: isUpdating, execute: executeUpdate } = useAsyncAction({
    onSuccess: () => {
      setEditingUser(null);
      setFormData({
        email: "",
        name: "",
        password: "",
        role: UserRole.CLIENTE,
        storeSlug: storeSlug || "",
        phone: "",
      });
    },
    onError: (error) => {
      console.error("Erro ao atualizar usuário:", error);
    },
  });

  const { isLoading: isDeleting, execute: executeDelete } = useAsyncAction({
    onSuccess: () => {
      console.log("Usuário excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir usuário:", error);
    },
  });

  // Filtrar usuários por busca
  const filteredUsers =
    usersData?.data.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Manipular criação de usuário
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    executeCreate(async () => {
      await createUserMutation.mutateAsync(formData);
    });
  };

  // Manipular edição de usuário
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updateData: UpdateUserDto = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      storeSlug: formData.storeSlug,
      phone: formData.phone,
    };

    executeUpdate(async () => {
      await updateUserMutation.mutateAsync({
        id: editingUser.id,
        userData: updateData,
      });
    });
  };

  // Manipular exclusão de usuário
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      executeDelete(async () => {
        await deleteUserMutation.mutateAsync(userId);
      });
    }
  };

  // Abrir modal de edição
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name || "",
      password: "",
      role: user.role,
      storeSlug: user.storeSlug || storeSlug || "",
      phone: user.phone || "",
    });
  };

  // Fechar modais
  const closeModals = () => {
    setIsCreateModalOpen(false);
    setEditingUser(null);
    setFormData({
      email: "",
      name: "",
      password: "",
      role: UserRole.CLIENTE,
      storeSlug: storeSlug || "",
      phone: "",
    });
  };

  if (isLoadingUsers) {
    return <LoadingSpinner />;
  }

  if (usersError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erro ao carregar usuários</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h1>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          variant="gradient"
          loadingText="Abrindo..."
        >
          Adicionar Usuário
        </Button>
      </div>

      {/* Barra de busca */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar usuários..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Tabela de usuários */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Função
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => openEditModal(user)}
                      variant="outline"
                      size="sm"
                    >
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDeleteUser(user.id)}
                      variant="destructive"
                      size="sm"
                      loadingText="Excluindo..."
                    >
                      Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de criação */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Criar Usuário</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  type="submit"
                  loading={isCreating}
                  loadingText="Criando..."
                  className="flex-1"
                >
                  Criar Usuário
                </Button>
                <Button
                  type="button"
                  onClick={closeModals}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de edição */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editar Usuário</h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  type="submit"
                  loading={isUpdating}
                  loadingText="Atualizando..."
                  className="flex-1"
                >
                  Atualizar Usuário
                </Button>
                <Button
                  type="button"
                  onClick={closeModals}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
