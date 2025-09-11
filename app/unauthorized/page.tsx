"use client";

import {
  ArrowLeft,
  Clock,
  House,
  Warning,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Unauthorized() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  const isPendingApproval = reason === "pending_approval";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* 403 Icon */}
        <div className="mb-8">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isPendingApproval ? "bg-yellow-100" : "bg-red-100"
            }`}
          >
            {isPendingApproval ? (
              <Clock className="w-12 h-12 text-yellow-500" />
            ) : (
              <Warning className="w-12 h-12 text-red-500" />
            )}
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-2">
            {isPendingApproval ? "⏳" : "403"}
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            {isPendingApproval ? "Aguardando Aprovação" : "Acesso Negado"}
          </h2>
          <p className="text-gray-600 mb-8">
            {isPendingApproval
              ? "Sua loja está em análise pelo administrador. Você receberá uma notificação assim que for aprovada."
              : "Você não tem permissão para acessar esta página. Verifique suas credenciais ou entre em contato com o administrador."}
          </p>
        </div>

        {/* Role-specific messages */}
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h3 className="font-semibold text-amber-800 mb-2">
            Diferentes níveis de acesso:
          </h3>
          <div className="text-sm text-amber-700 space-y-1">
            <p>
              <strong>🏪 Loja Pública:</strong> Acesso livre para todos
            </p>
            <p>
              <strong>📊 Dashboard Lojista:</strong> Apenas proprietários de
              loja
            </p>
            <p>
              <strong>👑 Super Admin:</strong> Apenas administradores do sistema
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
          >
            <House className="w-5 h-5 mr-2" />
            Fazer Login
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar ao início
          </Link>
        </div>

        {/* Help links */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Precisa de acesso? Entre em contato:
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <a
              href="mailto:suporte@cardap.io"
              className="text-orange-600 hover:text-orange-500"
            >
              suporte@cardap.io
            </a>
            <a
              href="tel:+5522999293439"
              className="text-orange-600 hover:text-orange-500"
            >
              (22) 99929-3439
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
