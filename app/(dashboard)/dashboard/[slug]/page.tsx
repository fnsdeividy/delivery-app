'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function DashboardPage() {
  const params = useParams()
  const slug = params.slug

  useEffect(() => {
    console.log('🏪 Dashboard: Página carregada com slug:', slug)
    console.log('🔑 Dashboard: Verificando autenticação...')
    
    // Verificar se há token no localStorage
    const token = localStorage.getItem('cardapio_token')
    console.log('🔑 Dashboard: Token no localStorage:', token ? 'Sim' : 'Não')
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        console.log('🔓 Dashboard: Token decodificado:', payload)
      } catch (error) {
        console.error('❌ Dashboard: Erro ao decodificar token:', error)
      }
    }
  }, [slug])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900">
            Dashboard da Loja: {slug}
          </h1>
          <p className="mt-2 text-gray-600">
            Bem-vindo ao painel de controle da sua loja.
          </p>
          
          <div className="mt-6 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Status da Autenticação
            </h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500">Token JWT:</span>
                <span className="ml-2 text-sm text-gray-900">
                  {localStorage.getItem('cardapio_token') ? '✅ Presente' : '❌ Ausente'}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500">Slug da Loja:</span>
                <span className="ml-2 text-sm text-gray-900">{slug}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}