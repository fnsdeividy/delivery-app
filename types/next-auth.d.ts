import 'next-auth'
import { UserRole, UserStoreAssociation } from './cardapio-api'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      storeId?: string // Para compatibilidade - será depreciado
      storeSlug?: string // Para compatibilidade - será depreciado
      active: boolean
      stores?: UserStoreAssociation[]
      currentStoreSlug?: string
    }
    accessToken?: string
  }

  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    storeId?: string // Para compatibilidade - será depreciado
    storeSlug?: string // Para compatibilidade - será depreciado
    active: boolean
    accessToken?: string
    stores?: UserStoreAssociation[]
    currentStoreSlug?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    storeId?: string // Para compatibilidade - será depreciado
    storeSlug?: string // Para compatibilidade - será depreciado
    active: boolean
    accessToken?: string
    stores?: UserStoreAssociation[]
    currentStoreSlug?: string
  }
}