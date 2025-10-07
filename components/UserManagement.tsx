"use client";

import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from "@/hooks";
import {
  CreateUserDto,
  UpdateUserDto,
  User,
  UserRole,
} from "@/types/cardapio-api";
import React, { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

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
    try {
      await createUserMutation.mutateAsync(formData);
      setIsCreateModalOpen(false);
      setFormData({
        email: "",
        name: "",
        password: "",
        role: UserRole.CLIENTE,
        storeSlug: storeSlug || "",
        phone: "",
      });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
    }
  };

  // Manipular edição de usuário
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const updateData: UpdateUserDto = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        storeSlug: formData.storeSlug,
        phone: formData.phone,
      };

      await updateUserMutation.mutateAsync({
        id: editingUser.id,
        userData: updateData,
      });

      setEditingUser(null);
      setFormData({
        email: "",
        name: "",
        password: "",
        role: UserRole.CLIENTE,
        storeSlug: storeSlug || "",
        phone: "",
      });
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
    }
  };

  // Manipular exclusão de usuário
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        await deleteUserMutation.mutateAsync(userId);
      } catch (error) {
        console.error("Erro ao excluir usuário:", error);
      }
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
      storeSlug: user.storeSlug || "",
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

  // Renderizar modal de criação/edição
  const renderUserModal = () => {
    const isEditing = !!editingUser;
    const title = isEditing ? "Editar Usuário" : "Criar Usuário";
    const onSubmit = isEditing ? handleUpdateUser : handleCreateUser;
    const isLoading =
      createUserMutation.isPending || updateUserMutation.isPending;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={closeModals}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nome *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            {!isEditing && (
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Senha *
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tipo de Usuário *
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as UserRole })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value={UserRole.CLIENTE}>Cliente</option>
                <option value={UserRole.EMPLOYEE}>Funcionário</option>
                <option value={UserRole.MANAGER}>Gerente</option>
                <option value={UserRole.ADMIN}>Lojista</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Telefone
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
            </button>
          </form>
        </div>
      </div>
    );
  };

  if (isLoadingUsers) {
    return <LoadingSpinner />;
  }

  if (usersError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-700">
          Erro ao carregar usuários: {usersError.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Gerenciamento de Usuários
        </h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          + Novo Usuário
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Lista de Usuários */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loja
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    {user.phone && (
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === UserRole.ADMIN
                        ? "bg-red-100 text-red-800"
                        : user.role === UserRole.MANAGER
                        ? "bg-blue-100 text-blue-800"
                        : user.role === UserRole.EMPLOYEE
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.storeSlug || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={deleteUserMutation.isPending}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {usersData && usersData.pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <nav className="flex space-x-2">
            {Array.from(
              { length: usersData.pagination.totalPages },
              (_, i) => i + 1
            ).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Modais */}
      {isCreateModalOpen && renderUserModal()}
      {editingUser && renderUserModal()}
    </div>
  );
}
