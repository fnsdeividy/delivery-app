"use client";

import { useLoadingContext } from "@/contexts/LoadingContext";
import { useEffect, useRef } from "react";

interface GlobalLoadingProps {
  className?: string;
}

export default function GlobalLoading({ className = "" }: GlobalLoadingProps) {
  const { loadingState } = useLoadingContext();
  const { isLoading, loadingMessage, variant = 'topbar' } = loadingState;
  const announcementRef = useRef<HTMLDivElement>(null);

  // Anunciar mudanças de estado para leitores de tela
  useEffect(() => {
    if (announcementRef.current) {
      if (isLoading) {
        announcementRef.current.textContent = loadingMessage || "Carregando...";
      } else {
        announcementRef.current.textContent = "";
      }
    }
  }, [isLoading, loadingMessage]);

  if (!isLoading) return null;

  if (variant === 'overlay') {
    return (
      <>
        {/* Anúncio para leitores de tela */}
        <div
          ref={announcementRef}
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        />
        
        {/* Overlay com backdrop */}
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm mx-4 transform transition-all duration-300 ease-out">
            <div className="flex flex-col items-center space-y-6">
              {/* Spinner */}
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-100"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent absolute top-0 left-0"></div>
              </div>
              
              {/* Mensagem */}
              <div className="text-center">
                <p className="text-xl font-semibold text-gray-900 mb-2">
                  {loadingMessage || "Carregando..."}
                </p>
                <div className="flex space-x-1 justify-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Variante topbar (padrão)
  return (
    <>
      {/* Anúncio para leitores de tela */}
      <div
        ref={announcementRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
      
      {/* Barra de progresso no topo */}
      <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
        <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600 animate-pulse">
          <div className="h-full bg-gradient-to-r from-purple-400 to-purple-500 animate-pulse"></div>
        </div>
        
        {/* Barra de progresso animada */}
        <div className="h-0.5 bg-purple-200">
          <div className="h-full bg-gradient-to-r from-purple-500 via-purple-600 to-purple-500 animate-pulse"></div>
        </div>
      </div>
    </>
  );
}

// Componente para indicar que o conteúdo está carregando (aria-busy)
export function LoadingContent({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  const { loadingState } = useLoadingContext();
  const { isLoading } = loadingState;

  return (
    <div 
      className={className}
      aria-busy={isLoading}
      aria-live={isLoading ? "polite" : "off"}
    >
      {children}
    </div>
  );
}