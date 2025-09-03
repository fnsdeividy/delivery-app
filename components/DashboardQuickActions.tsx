import { Eye, Gear, Package, Plus } from "@phosphor-icons/react";
import Link from "next/link";

interface DashboardQuickActionsProps {
  storeSlug: string;
}

export function DashboardQuickActions({
  storeSlug,
}: DashboardQuickActionsProps) {
  const actions = [
    {
      href: `/dashboard/${storeSlug}/produtos/novo`,
      icon: Plus,
      label: "Adicionar Produto",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      href: `/dashboard/${storeSlug}/estoque`,
      icon: Package,
      label: "Gerenciar Estoque",
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      href: `/dashboard/${storeSlug}/configuracoes`,
      icon: Gear,
      label: "Personalizar Loja",
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      href: `/dashboard/${storeSlug}/pedidos`,
      icon: Eye,
      label: "Ver Pedidos",
      color: "bg-orange-600 hover:bg-orange-700",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
      <h2 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-2 sm:mb-3 md:mb-4">Ações Rápidas</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`inline-flex items-center justify-center px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 ${action.color} text-white rounded-lg transition-colors text-xs sm:text-sm md:text-base`}
            >
              <Icon className="w-3.5 sm:w-4 md:w-5 h-3.5 sm:h-4 md:h-5 mr-1 sm:mr-1.5 md:mr-2" />
              {action.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
