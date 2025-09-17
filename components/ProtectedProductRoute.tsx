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

        // Verificar permissões baseadas no role
        let access = false;

        if (payload.role === "SUPER_ADMIN") {
          // Super admin tem acesso total
          access = true;
        } else if (payload.role === "ADMIN") {
          // Admin pode acessar apenas sua própria loja
          const userStoreSlug = payload.storeSlug || payload.currentStoreSlug;
          const userStores = payload.stores || [];

          // Verificar se o usuário tem acesso à loja solicitada
          const hasStoreAccess =
            userStoreSlug === storeSlug ||
            userStores.some((store: any) => store.storeSlug === storeSlug);

          if (hasStoreAccess) {
            access = true;
          } else {
            access = false;
          }
        } else if (payload.role === "MANAGER") {
          // Manager pode ler e escrever produtos
          const userStoreSlug = payload.storeSlug || payload.currentStoreSlug;
          const userStores = payload.stores || [];

          // Verificar se o usuário tem acesso à loja solicitada
          const hasStoreAccess =
            userStoreSlug === storeSlug ||
            userStores.some((store: any) => store.storeSlug === storeSlug);

          if (hasStoreAccess && requiredAction !== "delete") {
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
