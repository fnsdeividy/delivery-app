'use client'

import { useAuthContext } from '@/contexts/AuthContext'
import { useCurrentStore, useSetCurrentStore } from '@/hooks/useAuthContext'
import { StoreRole, UserRole } from '@/types/cardapio-api'
import { Crown, Storefront, User } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

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
  const [isHydrated, setIsHydrated] = useState(false)

  // Garantir que o componente só renderize completamente após hydration
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Durante SSR e antes da hydration, mostrar estado de loading
  if (!isHydrated) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

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

  // TODO: Componente simplificado temporariamente até implementação dos endpoints
  // Para usuários com lojas
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Informações do usuário */}
      <div className="flex items-center space-x-2">
        <User className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">{user.name}</span>
      </div>

      {/* Loja atual e papel */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">Nenhuma loja selecionada</span>
      </div>
    </div>
  )
}

// Componente simples para mostrar apenas o papel atual
export function UserRoleBadge({ className = '' }: { className?: string }) {
  const { user } = useAuthContext()
  const { currentStore } = useCurrentStore()

  if (!user) return null

  // TODO: Simplificado temporariamente até implementação dos endpoints
  const role = user.role === UserRole.SUPER_ADMIN ? user.role : 'ADMIN'
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