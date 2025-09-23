import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook para sincronizar token entre localStorage e cookies
 * Garante que o token seja sempre acessível tanto no cliente quanto no servidor
 */
export function useTokenSync() {
  const syncAttempts = useRef(0);
  const maxSyncAttempts = 3;
  const [isSynced, setIsSynced] = useState(false);
  const lastTokenRef = useRef<string | null>(null);

  const syncToken = useCallback(() => {
    try {
      const token = localStorage.getItem("cardapio_token");

      // Evitar sincronização desnecessária se o token não mudou
      if (lastTokenRef.current === token) {
        return;
      }

      lastTokenRef.current = token;

      if (token && token.trim() && typeof window !== "undefined") {
        // Verificar se o cookie já existe e é o mesmo
        const existingCookie = document.cookie
          .split(";")
          .find((cookie) => cookie.trim().startsWith("cardapio_token="));

        const existingToken = existingCookie
          ? existingCookie.split("=")[1]
          : null;

        if (existingToken !== token) {
          // Sincronizar com cookie para o middleware acessar
          // Cookie com expiração de 2 horas (7200 segundos)
          const cookieValue = `cardapio_token=${token}; path=/; max-age=7200; SameSite=Lax; secure=${
            window.location.protocol === "https:"
          }`;
          document.cookie = cookieValue;

          // Também criar um cookie de fallback para o middleware
          const fallbackCookieValue = `localStorage_token=${token}; path=/; max-age=7200; SameSite=Lax; secure=${
            window.location.protocol === "https:"
          }`;
          document.cookie = fallbackCookieValue;

          // Aguardar um pouco para o cookie ser processado
          setTimeout(() => {
            const cookieSet = document.cookie.includes("cardapio_token=");
            const fallbackCookieSet = document.cookie.includes(
              "localStorage_token="
            );

            if (
              !cookieSet &&
              !fallbackCookieSet &&
              syncAttempts.current < maxSyncAttempts
            ) {
              syncAttempts.current++;
              console.warn(
                `🔄 Tentativa ${syncAttempts.current} de sincronização de token`
              );
              // Tentar novamente após um delay
              setTimeout(syncToken, 200);
            } else if (cookieSet || fallbackCookieSet) {
              console.log("✅ Token sincronizado com sucesso");
              setIsSynced(true);
            } else {
              console.error(
                "❌ Falha ao sincronizar token após múltiplas tentativas"
              );
              setIsSynced(true); // Considerar sincronizado mesmo com falha
            }
          }, 50);
        } else {
          setIsSynced(true);
        }
      } else {
        setIsSynced(true); // Considerar sincronizado mesmo sem token
      }
    } catch (error) {
      console.error("❌ useTokenSync: Erro ao sincronizar token", error);
      setIsSynced(true); // Considerar sincronizado mesmo com erro
    }
  }, []);

  useEffect(() => {
    // Sincronizar imediatamente apenas uma vez
    if (!isSynced) {
      syncToken();
    }

    // Sincronizar quando o storage mudar
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cardapio_token") {
        syncAttempts.current = 0;
        setIsSynced(false);
        syncToken();
      }
    };

    // Sincronizar quando a página ganhar foco (refresh) - com debounce
    let focusTimeout: NodeJS.Timeout;
    const handleFocus = () => {
      clearTimeout(focusTimeout);
      focusTimeout = setTimeout(() => {
        if (!isSynced) {
          syncAttempts.current = 0;
          setIsSynced(false);
          syncToken();
        }
      }, 100);
    };

    // Sincronizar quando a visibilidade da página mudar - com debounce
    let visibilityTimeout: NodeJS.Timeout;
    const handleVisibilityChange = () => {
      if (!document.hidden && !isSynced) {
        clearTimeout(visibilityTimeout);
        visibilityTimeout = setTimeout(() => {
          syncAttempts.current = 0;
          setIsSynced(false);
          syncToken();
        }, 100);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(focusTimeout);
      clearTimeout(visibilityTimeout);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [syncToken, isSynced]);

  return { isSynced };
}

/**
 * Hook para verificar se o token está sincronizado
 */
export function useTokenSyncStatus() {
  const { isSynced } = useTokenSync();
  return isSynced;
}
