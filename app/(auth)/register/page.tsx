"use client";

import { Storefront } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionamento automático para registro de loja
    router.push("/register/loja");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
            <Storefront className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Redirecionando...
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Você será redirecionado para a página de registro de loja
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Storefront className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aguarde um momento
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Redirecionando para a página de registro de loja...
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                href="/register/loja"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Storefront className="w-4 h-4 mr-2" />
                Ir para registro de loja
              </Link>

              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Voltar ao início
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
