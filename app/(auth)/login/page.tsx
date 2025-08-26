"use client";

import { useCardapioAuth } from "@/hooks";
import { Eye, EyeSlash, SignIn } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error } = useCardapioAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
    } catch (err) {
      console.error("Erro no login:", err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Ícone */}
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
            <SignIn className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Título */}
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
          Acesse seu Dashboard
        </h2>
        <p className="mt-2 text-center text-sm text-white/80">
          Faça login para gerenciar sua loja
        </p>
      </div>

      {/* Card de Login */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white rounded-xl shadow-lg py-8 px-6 sm:px-10">
          {/* Mensagem de sucesso */}
          {message && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-green-700 text-sm">
                {decodeURIComponent(message)}
              </p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-800"
              >
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-800"
              >
                Senha
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlash className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold 
                rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed 
                shadow-md transition-all"
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </button>
            </div>

            {/* Links adicionais */}
            <div className="flex items-center justify-between">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-purple-600 hover:text-purple-500 transition-colors"
              >
                Esqueceu a senha?
              </Link>
              <Link
                href="/register/loja"
                className="text-sm font-medium text-purple-600 hover:text-purple-500 transition-colors"
              >
                Criar nova loja
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
