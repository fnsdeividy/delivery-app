'use client'

import { useAuth as useAuthContext } from '../contexts/AuthContext'

// Re-exportar o hook do contexto para facilitar importação
export { useAuth } from '../contexts/AuthContext'

// Hook adicional para verificações de autenticação específicas
export function useRequireAuth() {
  const { isAuthenticated, loading } = useAuthContext()
  
  return {
    isAuthenticated,
    loading,
    isReady: !loading && isAuthenticated
  }
}

// Hook para verificar se usuário pode acessar checkout
export function useCheckoutAccess() {
  const { isAuthenticated, loading } = useAuthContext()
  
  return {
    canProceed: !loading && isAuthenticated,
    needsAuth: !loading && !isAuthenticated,
    loading
  }
}