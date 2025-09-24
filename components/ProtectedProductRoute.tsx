"use client";

import { useCardapioAuth } from "@/hooks";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface ProtectedProductRouteProps {
  children: ReactNode;
  storeSlug: string;
  requiredAction?: "read" | "write" | "delete";
}

export function ProtectedProductRoute({
  children,
  storeSlug,
  requiredAction = "read",
}: ProtectedProductRouteProps) {
  const router = useRouter();
  const { isAuthenticated, getCurrentToken } = useCardapioAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Verificar se está autenticado
        if (!isAuthenticated()) {
          router.push("/login");
          return;
        }

        const token = getCurrentToken();
        if (!token) {
          router.push("/login");
          return;
        }

        // Decodificar token JWT de forma mais segura
        let payload: any;
        try {
          const tokenParts = token.split(".");
          if (tokenParts.length !== 3) {
            throw new Error("Token JWT inválido");
          }
          payload = JSON.parse(atob(tokenParts[1]));
        } catch (decodeError) {
          router.push("/login");
          return;
        }

        // A autorização fina fica no back-end.
        // Se o usuário está autenticado e o token é válido, permitir navegação.
        setHasAccess(true);
      } catch (error) {
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [storeSlug, isAuthenticated, getCurrentToken, router, requiredAction]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!hasAccess) {
    return null; // Será redirecionado pelo useEffect
  }

  return <>{children}</>;
}
