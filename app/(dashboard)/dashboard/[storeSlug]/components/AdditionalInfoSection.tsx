"use client";

import { Clock, CreditCard, Truck } from "@phosphor-icons/react";

interface AdditionalInfoSectionProps {
  storeSlug: string;
}

export function AdditionalInfoSection({ storeSlug }: AdditionalInfoSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-2.5 md:p-3 lg:p-4">
        <div className="flex items-center">
          <Clock className="w-3.5 sm:w-4 md:w-5 lg:w-6 h-3.5 sm:h-4 md:h-5 lg:h-6 text-yellow-600 flex-shrink-0" />
          <div className="ml-1.5 sm:ml-2 md:ml-3 lg:ml-4 min-w-0">
            <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900">
              Horário de Funcionamento
            </h3>
            <p className="text-xs md:text-sm text-gray-600">
              Segunda a Sábado: 8h às 18h
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-2.5 md:p-3 lg:p-4">
        <div className="flex items-center">
          <CreditCard className="w-3.5 sm:w-4 md:w-5 lg:w-6 h-3.5 sm:h-4 md:h-5 lg:h-6 text-green-600 flex-shrink-0" />
          <div className="ml-1.5 sm:ml-2 md:ml-3 lg:ml-4 min-w-0">
            <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900">
              Formas de Pagamento
            </h3>
            <p className="text-xs md:text-sm text-gray-600">
              PIX, Cartão, Dinheiro
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-2.5 md:p-3 lg:p-4">
        <div className="flex items-center">
          <Truck className="w-3.5 sm:w-4 md:w-5 lg:w-6 h-3.5 sm:h-4 md:h-5 lg:h-6 text-blue-600 flex-shrink-0" />
          <div className="ml-1.5 sm:ml-2 md:ml-3 lg:ml-4 min-w-0">
            <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900">
              Delivery
            </h3>
            <p className="text-xs md:text-sm text-gray-600">
              Entrega em até 40 min
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
