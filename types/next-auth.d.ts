import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'CLIENT' | 'ADMIN' | 'SUPER_ADMIN'
      storeId?: string
      storeSlug?: string
      active: boolean
    }
    accessToken?: string
  }

  interface User {
    id: string
    email: string
    name: string
    role: 'CLIENT' | 'ADMIN' | 'SUPER_ADMIN'
    storeId?: string
    storeSlug?: string
    active: boolean
    accessToken?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'CLIENT' | 'ADMIN' | 'SUPER_ADMIN'
    storeId?: string
    storeSlug?: string
    active: boolean
    accessToken?: string
  }
}