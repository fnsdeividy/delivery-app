"use client";

import { Header } from "@/components/Header";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Clock,
  FileText,
  HelpCircle,
  Mail,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SupportLayoutProps {
  children: React.ReactNode;
}

export default function SupportLayout({ children }: SupportLayoutProps) {
  const pathname = usePathname();

  const supportNavigation = [
    {
      name: "Central de Ajuda",
      href: "/suporte/central-ajuda",
      icon: HelpCircle,
      current: pathname === "/suporte/central-ajuda",
      description: "Encontre respostas rápidas",
    },
    {
      name: "Contato",
      href: "/suporte/contato",
      icon: Mail,
      current: pathname === "/suporte/contato",
      description: "Fale conosco diretamente",
    },
    {
      name: "Termos de Uso",
      href: "/suporte/termos-uso",
      icon: FileText,
      current: pathname === "/suporte/termos-uso",
      description: "Políticas e condições",
    },
  ];

  const quickContact = [
    {
      icon: <MessageCircle className="w-4 h-4" />,
      text: "WhatsApp",
      href: "https://wa.me/5522999293439",
      color: "text-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb melhorado */}
        <nav className="flex mb-8 animate-fade-in" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-2">
            <li className="inline-flex items-center">
              <Link
                href="/"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors duration-200 group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                Voltar ao início
              </Link>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-sm font-medium text-gray-500">
                  Suporte
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar de Navegação melhorada */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 animate-slide-in-left">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Suporte</h2>
              </div>

              <nav className="space-y-2 mb-8">
                {supportNavigation.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105",
                        item.current
                          ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200 shadow-sm"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
                      )}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5 mr-3 transition-colors duration-200",
                          item.current
                            ? "text-purple-600"
                            : "text-gray-500 group-hover:text-purple-600"
                        )}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Contato rápido */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-purple-600" />
                  Contato Rápido
                </h3>
                <div className="space-y-2">
                  {quickContact.map((contact, index) => (
                    <a
                      key={contact.text}
                      href={contact.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 hover:scale-105"
                      style={{ animationDelay: `${(index + 3) * 0.1}s` }}
                    >
                      <span className={cn("mr-2", contact.color)}>
                        {contact.icon}
                      </span>
                      {contact.text}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo Principal melhorado */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-slide-in-right">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
