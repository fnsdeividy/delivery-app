'use client'

import { List, X } from '@phosphor-icons/react'
import Link from 'next/link'

interface MobileMenuProps {
  isOpen: boolean
  onToggle: () => void
}

export function MobileMenu({ isOpen, onToggle }: MobileMenuProps) {
  return (
    <>
      {/* Botão hamburger */}
      <button
        onClick={onToggle}
        className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        aria-label="Abrir menu"
      >
        <List className="w-6 h-6" />
      </button>

      {/* Overlay do menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onToggle}
            data-testid="backdrop"
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header do menu */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <button
                  onClick={onToggle}
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  aria-label="Fechar menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Links do menu */}
              <nav className="flex-1 p-6">
                <div className="space-y-4">
                  <Link
                    href="/login/lojista"
                    className="block py-3 px-4 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    onClick={onToggle}
                  >
                    Dashboard Lojista
                  </Link>
                </div>
              </nav>

              {/* Botões de ação */}
              <div className="p-6 border-t border-gray-200 space-y-3">
                <Link
                  href="/login"
                  className="block w-full py-3 px-4 text-center border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:text-gray-900 transition-colors font-medium"
                  onClick={onToggle}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block w-full py-3 px-4 text-center bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  onClick={onToggle}
                >
                  Cadastrar
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 