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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`inline-flex items-center justify-center px-4 py-3 ${action.color} text-white rounded-lg transition-colors`}
            >
              <Icon className="w-5 h-5 mr-2" />
              {action.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
