import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'admin' | 'super_admin' | 'cliente'
      storeSlug?: string
      active: boolean
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: 'super-admin' | 'lojista' | 'cliente'
    storeSlug?: string
    active: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'super-admin' | 'lojista' | 'cliente'
    storeSlug?: string
    active: boolean
  }
}