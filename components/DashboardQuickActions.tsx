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
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      href: `/dashboard/${storeSlug}/estoque`,
      icon: Package,
      label: "Gerenciar Estoque",
      color: "bg-purple-600 hover:bg-purple-700",
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
      color: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-5 mb-4 sm:mb-6 md:mb-8 dashboard-main-card">
      <h2 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-2 sm:mb-3 md:mb-3">
        Ações Rápidas
      </h2>
      {/* Grid responsivo: 2 colunas no mobile, 3 no md, 4 no lg */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`w-full inline-flex items-center justify-center px-3 md:px-3.5 py-2 md:py-2.5 min-h-12 ${action.color} text-white rounded-lg transition-colors text-sm md:text-sm`}
              aria-label={action.label}
            >
              <Icon className="w-4 md:w-4 h-4 md:h-4 mr-1.5 md:mr-1.5" />
              {action.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
