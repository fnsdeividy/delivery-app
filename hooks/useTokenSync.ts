import { useEffect } from 'react'

/**
 * Hook para sincronizar token entre localStorage e cookies
 * Garante que o token seja sempre acessível tanto no cliente quanto no servidor
 */
export function useTokenSync() {
  useEffect(() => {
    const syncToken = () => {
      const token = localStorage.getItem('cardapio_token')
      if (token && typeof window !== 'undefined') {
        // Sincronizar com cookie para o middleware acessar
        document.cookie = `cardapio_token=${token}; path=/; max-age=86400; SameSite=Lax; secure=${window.location.protocol === 'https:'}`
      }
    }

    // Sincronizar imediatamente
    syncToken()

    // Sincronizar quando o storage mudar
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cardapio_token') {
        syncToken()
      }
    }

    // Sincronizar quando a página ganhar foco (refresh)
    const handleFocus = () => {
      syncToken()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])
}
