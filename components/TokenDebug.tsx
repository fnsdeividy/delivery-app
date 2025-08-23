'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'

interface TokenDebugInfo {
  localStorageToken: string | null
  cookieToken: string | null
  isAuthenticated: boolean
  currentToken: string | null
  userData: any
}

export function TokenDebug() {
  const [debugInfo, setDebugInfo] = useState<TokenDebugInfo | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateDebugInfo = () => {
      try {
        // Verificar localStorage
        const localStorageToken = localStorage.getItem('cardapio_token')

        // Verificar cookie
        let cookieToken = null
        if (typeof window !== 'undefined') {
          const cookies = document.cookie.split(';')
          const cardapioTokenCookie = cookies.find(cookie =>
            cookie.trim().startsWith('cardapio_token=')
          )
          if (cardapioTokenCookie) {
            cookieToken = cardapioTokenCookie.split('=')[1]
          }
        }

        // Verificar autenticação
        const isAuthenticated = apiClient.isAuthenticated()
        const currentToken = apiClient.getCurrentToken()

        // Verificar dados do usuário
        const userData = localStorage.getItem('user')

        setDebugInfo({
          localStorageToken,
          cookieToken,
          isAuthenticated,
          currentToken,
          userData: userData ? JSON.parse(userData) : null
        })
      } catch (error) {
        console.error('Erro ao obter debug info:', error)
      }
    }

    // Atualizar imediatamente
    updateDebugInfo()

    // Atualizar a cada 2 segundos
    const interval = setInterval(updateDebugInfo, 2000)

    return () => clearInterval(interval)
  }, [])

  if (!debugInfo) return null

  return (
    <>
      {/* Botão para mostrar/ocultar debug */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-blue-500 text-white px-3 py-2 rounded-full text-sm shadow-lg"
      >
        {isVisible ? '🔒' : '🔓'} Token Debug
      </button>

      {/* Painel de debug */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 z-50 bg-black text-white p-4 rounded-lg shadow-lg max-w-md text-xs">
          <h3 className="font-bold mb-2">🔍 Token Debug Info</h3>

          <div className="space-y-2">
            <div>
              <span className="font-semibold">LocalStorage:</span>
              <span className={`ml-2 ${debugInfo.localStorageToken ? 'text-green-400' : 'text-red-400'}`}>
                {debugInfo.localStorageToken ? '✅' : '❌'} {debugInfo.localStorageToken ? `${debugInfo.localStorageToken.length} chars` : 'Nenhum'}
              </span>
            </div>

            <div>
              <span className="font-semibold">Cookie:</span>
              <span className={`ml-2 ${debugInfo.cookieToken ? 'text-green-400' : 'text-red-400'}`}>
                {debugInfo.cookieToken ? '✅' : '❌'} {debugInfo.cookieToken ? `${debugInfo.cookieToken.length} chars` : 'Nenhum'}
              </span>
            </div>

            <div>
              <span className="font-semibold">Autenticado:</span>
              <span className={`ml-2 ${debugInfo.isAuthenticated ? 'text-green-400' : 'text-red-400'}`}>
                {debugInfo.isAuthenticated ? '✅ Sim' : '❌ Não'}
              </span>
            </div>

            <div>
              <span className="font-semibold">Token Atual:</span>
              <span className={`ml-2 ${debugInfo.currentToken ? 'text-green-400' : 'text-red-400'}`}>
                {debugInfo.currentToken ? '✅' : '❌'} {debugInfo.currentToken ? `${debugInfo.currentToken.length} chars` : 'Nenhum'}
              </span>
            </div>

            <div>
              <span className="font-semibold">Usuário:</span>
              <span className={`ml-2 ${debugInfo.userData ? 'text-green-400' : 'text-red-400'}`}>
                {debugInfo.userData ? '✅' : '❌'} {debugInfo.userData ? debugInfo.userData.email || 'Sem email' : 'Nenhum'}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-gray-600">
            <button
              onClick={() => {
                localStorage.removeItem('cardapio_token')
                localStorage.removeItem('user')
                document.cookie = 'cardapio_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
                window.location.reload()
              }}
              className="bg-red-500 text-white px-2 py-1 rounded text-xs"
            >
              🗑️ Limpar Tudo
            </button>

            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs ml-2"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      )}
    </>
  )
}
