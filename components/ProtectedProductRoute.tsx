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

        // Decodificar token JWT
        const payload = JSON.parse(atob(token.split(".")[1]));

        // Verificar permissões baseadas no role
        let access = false;

        if (payload.role === "SUPER_ADMIN") {
          // Super admin tem acesso total
          access = true;
        } else if (payload.role === "ADMIN") {
          // Admin pode acessar apenas sua própria loja
          if (payload.storeSlug === storeSlug) {
            access = true;
          } else {
            access = false;
          }
        } else if (payload.role === "MANAGER") {
          // Manager pode ler e escrever produtos
          if (payload.storeSlug === storeSlug && requiredAction !== "delete") {
            access = true;
          } else {
            access = false;
          }
        } else {
          // Outros roles não têm acesso
          access = false;
        }

        if (access) {
          setHasAccess(true);
        } else {
          router.push("/unauthorized");
        }
      } catch (error) {
        console.error("❌ Erro na verificação de permissões:", error);
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
