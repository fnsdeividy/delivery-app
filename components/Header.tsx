"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { CaretDown, SignOut, Storefront, User } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const { user, isAuthenticated, logout, isLoading } = useAuthContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const effectiveStoreSlug =
    (user as any)?.currentStoreSlug ||
    (user as any)?.storeSlug ||
    apiClient.getCurrentStoreSlug();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 sm:h-24">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Logo size="md" />
            </div>

            {/* Botão Ver Loja - Mobile */}
            {isAuthenticated && effectiveStoreSlug && (
              <div className="lg:hidden">
                <Link
                  href={`/dashboard/${effectiveStoreSlug}`}
                  className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                >
                  <Storefront className="w-3.5 h-3.5 mr-1.5" />
                  Dashboard
                </Link>
              </div>
            )}

            {/* Botões de ação - Desktop */}
            <div className="hidden lg:flex items-center space-x-4">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                  <span className="text-gray-500">Carregando...</span>
                </div>
              ) : isAuthenticated && user ? (
                <div className="flex items-center space-x-3">
                  {effectiveStoreSlug && (
                    <Link
                      href={`/dashboard/${effectiveStoreSlug}`}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                    >
                      <Storefront className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  )}
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors font-medium rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="max-w-32 truncate">
                        {user.name || user.email}
                      </span>
                      <CaretDown
                        className={`w-4 h-4 transition-transform ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.name || "Usuário"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>

                        {effectiveStoreSlug && (
                          <Link
                            href={`/dashboard/${effectiveStoreSlug}`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <Storefront className="w-4 h-4 mr-3 text-gray-400" />
                            Dashboard
                          </Link>
                        )}
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <SignOut className="w-4 h-4 mr-3" />
                            Sair
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>

            {/* Menu mobile */}
            <MobileMenu />
          </div>
        </div>
      </header>

      {/* Overlay para fechar dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      {/* Spacer para compensar o header fixo */}
      <div className="h-20 sm:h-24" data-testid="header-spacer" />
    </>
  );
}
