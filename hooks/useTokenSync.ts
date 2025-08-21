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
        
        // Log para debug
        console.log('🔄 useTokenSync: Token sincronizado para cookie', { 
          tokenLength: token.length,
          hasCookie: !!document.cookie.includes('cardapio_token')
        })
      } else {
        console.log('⚠️ useTokenSync: Nenhum token encontrado no localStorage')
      }
    }

    // Sincronizar imediatamente
    syncToken()

    // Sincronizar quando o storage mudar
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cardapio_token') {
        console.log('🔄 useTokenSync: Storage change detectado, sincronizando...')
        syncToken()
      }
    }

    // Sincronizar quando a página ganhar foco (refresh)
    const handleFocus = () => {
      console.log('🔄 useTokenSync: Página ganhou foco, sincronizando...')
      syncToken()
    }

    // Sincronizar quando a página carregar completamente
    const handleLoad = () => {
      console.log('🔄 useTokenSync: Página carregada, sincronizando...')
      syncToken()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('load', handleLoad)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('load', handleLoad)
    }
  }, [])
}
