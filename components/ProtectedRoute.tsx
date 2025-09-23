"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { useCurrentStore, useUserPermissions } from "@/hooks/useAuthContext";
import { StoreRole, UserRole } from "@/types/cardapio-api";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  // Roles globais necessários
  requiredRoles?: UserRole[];
  // Roles específicos da loja necessários
  requiredStoreRoles?: StoreRole[];
  // Permissões específicas necessárias
  requiredPermissions?: string[];
  // Slug da loja para verificar permissões (se omitido, usa a loja atual)
  storeSlug?: string;
  // Se deve permitir acesso apenas a owners/admins da loja
  requireStoreAdmin?: boolean;
  // Componente de fallback para acesso negado
  fallback?: ReactNode;
  // Redirecionamento customizado para acesso negado
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRoles = [],
  requiredStoreRoles = [],
  requiredPermissions = [],
  storeSlug,
  requireStoreAdmin = false,
  fallback,
  redirectTo,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuthContext();
  const { currentStore, currentStoreSlug } = useCurrentStore();
  const { data: permissions, isLoading: permissionsLoading } =
    useUserPermissions(storeSlug || currentStoreSlug || undefined);

  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    if (authLoading || permissionsLoading) {
      return;
    }

    // Se não estiver autenticado, negar acesso
    if (!isAuthenticated || !user) {
      setHasAccess(false);
      setAccessChecked(true);
      return;
    }

    let access = true;
    const targetStoreSlug = storeSlug || currentStoreSlug;
    const targetStore = storeSlug
      ? user.stores?.find((s) => s.storeSlug === storeSlug)
      : currentStore;

    // ADMIN (logista) sempre tem acesso
    if (user.role === UserRole.ADMIN) {
      setHasAccess(true);
      setAccessChecked(true);
      return;
    }

    // Verificar roles globais necessários
    if (access && requiredRoles.length > 0) {
      access = requiredRoles.includes(user.role);
    }

    // Verificar se requer admin da loja
    if (access && requireStoreAdmin && targetStore) {
      access =
        targetStore.role === StoreRole.OWNER ||
        targetStore.role === StoreRole.LOJA_ADMIN;
    }

    // Verificar roles específicos da loja
    if (access && requiredStoreRoles.length > 0 && targetStore) {
      access = requiredStoreRoles.includes(targetStore.role);
    }

    // Verificar permissões específicas
    if (access && requiredPermissions.length > 0 && permissions) {
      for (const permission of requiredPermissions) {
        // Verificar permissões globais
        if (permissions.globalPermissions?.includes(permission)) {
          continue;
        }

        // Verificar permissões da loja
        if (
          targetStoreSlug &&
          permissions.stores[targetStoreSlug]?.permissions.includes(permission)
        ) {
          continue;
        }

        // Se chegou aqui, não tem a permissão
        access = false;
        break;
      }
    }

    // Verificar se tem acesso à loja específica
    if (access && storeSlug && !targetStore) {
      // Se especificou uma loja mas o usuário não tem acesso a ela
      access = false;
    }

    setHasAccess(access);
    setAccessChecked(true);
  }, [
    user,
    permissions,
    authLoading,
    permissionsLoading,
    isAuthenticated,
    currentStore,
    currentStoreSlug,
    storeSlug,
    requiredRoles,
    requiredStoreRoles,
    requiredPermissions,
    requireStoreAdmin,
  ]);

  // Redirecionar se necessário
  useEffect(() => {
    if (accessChecked && hasAccess === false && redirectTo) {
      router.push(redirectTo);
    }
  }, [accessChecked, hasAccess, redirectTo, router]);

  // Mostrar loading
  if (authLoading || permissionsLoading || !accessChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Se não tem acesso
  if (hasAccess === false) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acesso Negado
          </h1>
          <p className="text-gray-600 mb-6">
            Você não tem permissão para acessar esta página.
            {storeSlug && ` Acesso restrito à loja "${storeSlug}".`}
          </p>
          <div className="space-y-2">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors mr-2"
            >
              Voltar
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Ir para Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Se tem acesso, renderizar children
  return <>{children}</>;
}

// TODO: Hook comentado temporariamente até implementação dos endpoints
// Hook para usar dentro de componentes para verificar permissões
export function usePermissionCheck() {
  // const { user } = useAuthContext()
  // const { currentStore } = useCurrentStore()
  // const { data: permissions } = useUserPermissions()

  // Fallback temporário: retornar permissões básicas
  return {
    hasPermission: (permission: string, storeSlug?: string) => {
      // TODO: Implementar quando os endpoints estiverem disponíveis
      return true; // Temporariamente permite tudo
    },

    hasStoreRole: (role: StoreRole, storeSlug?: string) => {
      // TODO: Implementar quando os endpoints estiverem disponíveis
      return true; // Temporariamente permite tudo
    },

    isStoreAdmin: (storeSlug?: string) => {
      // TODO: Implementar quando os endpoints estiverem disponíveis
      return true; // Temporariamente é admin
    },

    isSuperAdmin: () => false, // TODO: Implementar quando os endpoints estiverem disponíveis

    canAccessStore: (storeSlug: string) => {
      // TODO: Implementar quando os endpoints estiverem disponíveis
      return true; // Temporariamente pode acessar qualquer loja
    },
  };
}
