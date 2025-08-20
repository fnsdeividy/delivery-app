'use client'

import { useAuthContext } from '@/contexts/AuthContext'
import { useCurrentStore, useSetCurrentStore } from '@/hooks/useAuthContext'
import { StoreRole, UserRole } from '@/types/cardapio-api'
import { CaretDown, Crown, Storefront, User } from '@phosphor-icons/react'
import { useState } from 'react'

interface UserStoreStatusProps {
  showStoreSelector?: boolean
  className?: string
}

export function UserStoreStatus({ 
  showStoreSelector = true, 
  className = '' 
}: UserStoreStatusProps) {
  const { user, userStores } = useAuthContext()
  const { currentStore } = useCurrentStore()
  const { mutateAsync: setCurrentStore } = useSetCurrentStore()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  if (!user) {
    return null
  }

  const handleStoreChange = async (storeSlug: string) => {
    try {
      await setCurrentStore({ storeSlug })
      setIsDropdownOpen(false)
    } catch (error) {
      console.error('❌ Erro ao trocar loja:', error)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'Super Administrador'
      case StoreRole.OWNER:
        return 'Proprietário'
      case StoreRole.LOJA_ADMIN:
        return 'Administrador'
      case StoreRole.LOJA_MANAGER:
        return 'Gerente'
      case StoreRole.LOJA_EMPLOYEE:
        return 'Funcionário'
      default:
        return role
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return <Crown className="w-4 h-4 text-purple-600" />
      case StoreRole.OWNER:
      case StoreRole.LOJA_ADMIN:
        return <Storefront className="w-4 h-4 text-blue-600" />
      case StoreRole.LOJA_MANAGER:
        return <User className="w-4 h-4 text-green-600" />
      case StoreRole.LOJA_EMPLOYEE:
        return <User className="w-4 h-4 text-gray-600" />
      default:
        return <User className="w-4 h-4 text-gray-500" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case StoreRole.OWNER:
      case StoreRole.LOJA_ADMIN:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case StoreRole.LOJA_MANAGER:
        return 'bg-green-100 text-green-800 border-green-200'
      case StoreRole.LOJA_EMPLOYEE:
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  // Se é super admin, mostrar apenas isso
  if (user.role === UserRole.SUPER_ADMIN) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-2">
          {getRoleIcon(user.role)}
          <span className="text-sm font-medium text-gray-700">{user.name}</span>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded border ${getRoleBadgeColor(user.role)}`}>
          {getRoleLabel(user.role)}
        </span>
      </div>
    )
  }

  // Para usuários com lojas
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Informações do usuário */}
      <div className="flex items-center space-x-2">
        <User className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">{user.name}</span>
      </div>

      {/* Loja atual e papel */}
      {currentStore ? (
        <div className="flex items-center space-x-2">
          {showStoreSelector && userStores.length > 1 ? (
            // Seletor de loja (dropdown)
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {getRoleIcon(currentStore.role)}
                <span className="font-medium">{currentStore.storeName}</span>
                <CaretDown className="w-4 h-4 text-gray-400" />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    {userStores.map((store) => (
                      <button
                        key={store.storeId}
                        onClick={() => handleStoreChange(store.storeSlug)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 ${
                          store.storeSlug === currentStore.storeSlug 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-gray-700'
                        }`}
                      >
                        {getRoleIcon(store.role)}
                        <div className="flex-1">
                          <div className="font-medium">{store.storeName}</div>
                          <div className="text-xs text-gray-500">
                            {getRoleLabel(store.role)}
                          </div>
                        </div>
                        {store.storeSlug === currentStore.storeSlug && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Loja única (sem dropdown)
            <div className="flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-lg">
              {getRoleIcon(currentStore.role)}
              <span className="text-sm font-medium text-gray-700">{currentStore.storeName}</span>
            </div>
          )}

          {/* Badge do papel */}
          <span className={`px-2 py-1 text-xs font-medium rounded border ${getRoleBadgeColor(currentStore.role)}`}>
            {getRoleLabel(currentStore.role)}
          </span>
        </div>
      ) : (
        // Usuário sem loja atual
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Nenhuma loja selecionada</span>
          {userStores.length > 0 && showStoreSelector && (
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Selecionar loja
            </button>
          )}
        </div>
      )}

      {/* Fechar dropdown ao clicar fora */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  )
}

// Componente simples para mostrar apenas o papel atual
export function UserRoleBadge({ className = '' }: { className?: string }) {
  const { user } = useAuthContext()
  const { currentStore } = useCurrentStore()

  if (!user) return null

  const role = user.role === UserRole.SUPER_ADMIN ? user.role : currentStore?.role
  if (!role) return null

  const getRoleLabel = (role: string) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'Super Admin'
      case StoreRole.OWNER:
        return 'Proprietário'
      case StoreRole.LOJA_ADMIN:
        return 'Admin'
      case StoreRole.LOJA_MANAGER:
        return 'Gerente'
      case StoreRole.LOJA_EMPLOYEE:
        return 'Funcionário'
      default:
        return role
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'bg-purple-100 text-purple-800'
      case StoreRole.OWNER:
      case StoreRole.LOJA_ADMIN:
        return 'bg-blue-100 text-blue-800'
      case StoreRole.LOJA_MANAGER:
        return 'bg-green-100 text-green-800'
      case StoreRole.LOJA_EMPLOYEE:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${getRoleBadgeColor(role)} ${className}`}>
      {getRoleLabel(role)}
    </span>
  )
}