'use client'

import { StoreEditForm } from '@/components/StoreEditForm'
import { ArrowLeft, Storefront } from '@phosphor-icons/react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function EditarLojaPage() {
  const params = useParams()
  const router = useRouter()
  const storeId = params.id as string
  const [isEditing, setIsEditing] = useState(false)

  const handleSuccess = () => {
    setIsEditing(false)
    // Redirecionar para o dashboard da loja após edição bem-sucedida
    router.push(`/dashboard/gerenciar-lojas?message=Loja atualizada com sucesso!`)
  }

  const handleCancel = () => {
    router.push('/dashboard/gerenciar-lojas')
  }

  if (!storeId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ID da Loja Não Encontrado</h1>
          <p className="text-gray-600 mb-4">Não foi possível identificar qual loja editar.</p>
          <Link
            href="/dashboard/gerenciar-lojas"
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Gerenciar Lojas
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link
                href="/dashboard/gerenciar-lojas"
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <Storefront className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Editar Loja</h1>
                  <p className="text-sm text-gray-600">Atualize as informações da sua loja</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                href="/dashboard/gerenciar-lojas"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-orange-600"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link
                  href="/dashboard/gerenciar-lojas"
                  className="text-sm font-medium text-gray-700 hover:text-orange-600"
                >
                  Gerenciar Lojas
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-sm font-medium text-gray-500">Editar Loja</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Formulário de Edição */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Informações da Loja</h2>
            <p className="text-sm text-gray-600 mt-1">
              Atualize as informações da sua loja. Os campos marcados com * são obrigatórios.
            </p>
          </div>
          
          <div className="p-6">
            <StoreEditForm
              storeId={storeId}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>

        {/* Ações Adicionais */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Adicionais</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href={`/dashboard/gerenciar-lojas`}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Gerenciar Lojas
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar à Página Anterior
            </button>
          </div>
        </div>
      </main>
    </div>
  )
} 