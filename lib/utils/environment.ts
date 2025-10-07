/**
 * Utility para detectar o ambiente de execução
 */

export const isServer = typeof window === 'undefined'
export const isClient = !isServer

/**
 * Verifica se localStorage está disponível
 */
export const isLocalStorageAvailable = (): boolean => {
  if (isServer) return false
  
  try {
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

/**
 * Acesso seguro ao localStorage
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isLocalStorageAvailable()) return null
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  
  setItem: (key: string, value: string): void => {
    if (!isLocalStorageAvailable()) return
    try {
      localStorage.setItem(key, value)
    } catch {
      // Silently fail in case of quota exceeded or other issues
    }
  },
  
  removeItem: (key: string): void => {
    if (!isLocalStorageAvailable()) return
    try {
      localStorage.removeItem(key)
    } catch {
      // Silently fail
    }
  }
} 