/**
 * Utilitário para verificação de permissões de acesso
 * Centraliza a lógica de verificação de roles e permissões
 */

export interface UserPayload {
  role: string;
  storeSlug?: string;
  stores?: (string | { storeSlug: string; role: string })[];
}

export interface PermissionCheckResult {
  hasAccess: boolean;
  reason?: string;
}

/**
 * Verifica se um usuário tem acesso a uma loja específica
 * @param payload - Payload do token JWT do usuário
 * @param targetSlug - Slug da loja que está tentando acessar
 * @returns Resultado da verificação de permissão
 */
export function checkStoreAccess(
  payload: UserPayload,
  targetSlug: string
): PermissionCheckResult {
  // Admin sem storeSlug específico tem acesso a todas as lojas
  if (payload.role === "ADMIN" && !payload.storeSlug) {
    return { hasAccess: true, reason: "Admin (acesso total)" };
  }

  // Admin com acesso à loja específica
  if (payload.role === "ADMIN" && payload.storeSlug === targetSlug) {
    return { hasAccess: true, reason: "Admin da loja" };
  }

  // Verificar se tem acesso através do array de stores
  if (payload.role === "ADMIN" && payload.stores) {
    const hasStoreAccess = payload.stores.some((store) =>
      typeof store === "string"
        ? store === targetSlug
        : store.storeSlug === targetSlug
    );

    if (hasStoreAccess) {
      return { hasAccess: true, reason: "Admin com acesso à loja" };
    }
  }

  // Usuário comum - verificar se tem acesso à loja específica
  if (payload.storeSlug === targetSlug) {
    return { hasAccess: true, reason: "Usuário da loja" };
  }

  // Verificar através do array de stores para usuários comuns
  if (payload.stores) {
    const hasStoreAccess = payload.stores.some((store) =>
      typeof store === "string"
        ? store === targetSlug
        : store.storeSlug === targetSlug
    );

    if (hasStoreAccess) {
      return { hasAccess: true, reason: "Usuário com acesso à loja" };
    }
  }

  return {
    hasAccess: false,
    reason: `Usuário ${payload.role} sem acesso à loja ${targetSlug}`,
  };
}

/**
 * Verifica se um usuário é administrador
 * @param payload - Payload do token JWT do usuário
 * @returns true se for admin
 */
export function isAdmin(payload: UserPayload): boolean {
  return payload.role === "ADMIN";
}

/**
 * Verifica se um usuário é administrador com acesso total (sem loja específica)
 * @param payload - Payload do token JWT do usuário
 * @returns true se for admin com acesso total
 */
export function isAdminWithFullAccess(payload: UserPayload): boolean {
  return payload.role === "ADMIN" && !payload.storeSlug;
}
