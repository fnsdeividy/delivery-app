"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Logo size="md" />
            </div>

            {/* Botões de ação - Desktop */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:text-gray-900 transition-colors font-medium"
              >
                Login
              </Link>
              <Link
                href="/register/loja"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium"
              >
                Cadastrar
              </Link>
            </div>

            {/* Menu mobile */}
            <MobileMenu />
          </div>
        </div>
      </header>

      {/* Spacer para compensar o header fixo */}
      <div className="h-16" data-testid="header-spacer" />
    </>
  );
}
