"use client";

import { Gear, PencilSimple, Palette, Calendar, CreditCard } from "@phosphor-icons/react";
import Link from "next/link";

interface StoreConfigSectionProps {
  storeSlug: string;
}

export function StoreConfigSection({ storeSlug }: StoreConfigSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
      <h2 className="text-base md:text-lg font-medium text-gray-900 mb-3 md:mb-4 flex items-center">
        <Gear className="w-3.5 sm:w-4 md:w-5 h-3.5 sm:h-4 md:h-5 text-gray-600 mr-1.5 sm:mr-2" />
        Configuração da Loja
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
        <Link
          href={`/dashboard/${storeSlug}/configuracoes`}
          className="flex items-center p-1.5 sm:p-2 md:p-3 lg:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          <PencilSimple className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-blue-600 mr-1 sm:mr-1.5 md:mr-3 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-900">
              Editar Info
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600">Nome, descrição</p>
          </div>
        </Link>
        <Link
          href={`/dashboard/${storeSlug}/configuracoes/visual`}
          className="flex items-center p-1.5 sm:p-2 md:p-3 lg:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          <Palette className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-purple-600 mr-1 sm:mr-2 md:mr-3 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-900">
              Personalização Visual
            </p>
            <p className="text-xs text-gray-600">Cores, logo, banner</p>
          </div>
        </Link>
        <Link
          href={`/dashboard/${storeSlug}/configuracoes/horarios`}
          className="flex items-center p-1.5 sm:p-2 md:p-3 lg:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          <Calendar className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-600 mr-1 sm:mr-2 md:mr-3 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-900">
              Horários de Funcionamento
            </p>
            <p className="text-xs text-gray-600">Dias e horários</p>
          </div>
        </Link>
        <Link
          href={`/dashboard/${storeSlug}/configuracoes/pagamento`}
          className="flex items-center p-1.5 sm:p-2 md:p-3 lg:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          <CreditCard className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-orange-600 mr-1 sm:mr-2 md:mr-3 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-900">
              Métodos de Pagamento
            </p>
            <p className="text-xs text-gray-600">PIX, cartão, dinheiro</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
