import { useEffect, useRef, useState } from 'react'

/**
 * Hook para sincronizar token entre localStorage e cookies
 * Garante que o token seja sempre acessível tanto no cliente quanto no servidor
 */
export function useTokenSync() {
  const syncAttempts = useRef(0)
  const maxSyncAttempts = 3
  const [isSynced, setIsSynced] = useState(false)

  useEffect(() => {
    const syncToken = () => {
      try {
        const token = localStorage.getItem('cardapio_token')

        if (token && token.trim() && typeof window !== 'undefined') {
          // Verificar se o cookie já existe e é o mesmo
          const existingCookie = document.cookie
            .split(';')
            .find(cookie => cookie.trim().startsWith('cardapio_token='))

          const existingToken = existingCookie ? existingCookie.split('=')[1] : null

          if (existingToken !== token) {
            // Sincronizar com cookie para o middleware acessar
            const cookieValue = `cardapio_token=${token}; path=/; max-age=86400; SameSite=Lax; secure=${window.location.protocol === 'https:'}`
            document.cookie = cookieValue

            // Verificar se foi definido
            const cookieSet = document.cookie.includes('cardapio_token=')

            // Log para debug
            console.log('🔄 useTokenSync: Token sincronizado para cookie', {
              tokenLength: token.length,
              hasCookie: cookieSet,
              syncAttempt: syncAttempts.current + 1
            })

            if (!cookieSet && syncAttempts.current < maxSyncAttempts) {
              syncAttempts.current++
              // Tentar novamente após um delay
              setTimeout(syncToken, 100)
            } else if (cookieSet) {
              setIsSynced(true)
            }
          } else {
            console.log('✅ useTokenSync: Token já está sincronizado')
            setIsSynced(true)
          }
        } else {
          console.log('⚠️ useTokenSync: Nenhum token válido encontrado no localStorage')
          setIsSynced(true) // Considerar sincronizado mesmo sem token
        }
      } catch (error) {
        console.error('❌ useTokenSync: Erro ao sincronizar token', error)
        setIsSynced(true) // Considerar sincronizado mesmo com erro
      }
    }

    // Sincronizar imediatamente
    syncToken()

    // Sincronizar quando o storage mudar
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cardapio_token') {
        console.log('🔄 useTokenSync: Storage change detectado, sincronizando...')
        syncAttempts.current = 0
        setIsSynced(false)
        syncToken()
      }
    }

    // Sincronizar quando a página ganhar foco (refresh)
    const handleFocus = () => {
      console.log('🔄 useTokenSync: Página ganhou foco, sincronizando...')
      syncAttempts.current = 0
      setIsSynced(false)
      syncToken()
    }

    // Sincronizar quando a página carregar completamente
    const handleLoad = () => {
      console.log('🔄 useTokenSync: Página carregada, sincronizando...')
      syncAttempts.current = 0
      setIsSynced(false)
      syncToken()
    }

    // Sincronizar quando a visibilidade da página mudar
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 useTokenSync: Página tornou-se visível, sincronizando...')
        syncAttempts.current = 0
        setIsSynced(false)
        syncToken()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('load', handleLoad)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('load', handleLoad)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return { isSynced }
}

/**
 * Hook para verificar se o token está sincronizado
 */
export function useTokenSyncStatus() {
  const { isSynced } = useTokenSync()
  return isSynced
}
