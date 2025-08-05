import 'next-auth'
import { UserRole } from '../lib/generated/prisma'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      storeSlug?: string
      active: boolean
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    storeSlug?: string
    active: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    storeSlug?: string
    active: boolean
  }
}