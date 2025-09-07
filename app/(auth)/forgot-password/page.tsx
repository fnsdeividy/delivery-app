'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Por favor, insira seu email');
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.requestPasswordReset(email);
      setIsSuccess(true);
      toast.success('Se o email existir em nossa base, você receberá instruções para redefinir sua senha.');
    } catch (error: any) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      toast.error(error.message || 'Erro ao solicitar recuperação de senha');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Email Enviado!
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Se o email <strong>{email}</strong> existir em nossa base, você receberá
                    instruções para redefinir sua senha em alguns minutos.
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    Não se esqueça de verificar sua pasta de spam.
                  </p>
                </div>

                <Button asChild className="w-full">
                  <Link href="/login">
                    Voltar ao Login
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Recuperar Senha
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Digite seu email para receber instruções de recuperação
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Esqueceu sua senha?</CardTitle>
            <CardDescription>
              Não se preocupe! Digite seu email abaixo e enviaremos instruções para redefinir sua senha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Enviando...' : 'Enviar Instruções'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar ao Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
