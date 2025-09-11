import {
  ArrowLeft,
  House,
  MagnifyingGlass,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MagnifyingGlass className="w-12 h-12 text-purple-500" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Página não encontrada
          </h2>
          <p className="text-gray-600 mb-8">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            <House className="w-5 h-5 mr-2" />
            Voltar ao início
          </Link>

          <Link
            href="/dashboard/gerenciar-lojas"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Dashboard
          </Link>
        </div>

        {/* Help links */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Precisa de ajuda? Entre em contato:
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <a
              href="mailto:suporte@cardap.io"
              className="text-purple-600 hover:text-purple-500"
            >
              suporte@cardap.io
            </a>
            <a
              href="tel:+5522999293439"
              className="text-purple-600 hover:text-purple-500"
            >
              (22) 99929-3439
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
