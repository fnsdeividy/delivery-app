import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        storeSlug: { label: 'Store Slug', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.storeSlug) {
          return null
        }

        try {
          // Simulação de autenticação - em produção, isso seria uma chamada à API
          if (credentials.email === 'admin@boteco.com' && credentials.password === '123456') {
            return {
              id: '1',
              email: credentials.email,
              name: 'Admin Boteco',
              role: 'ADMIN',
              storeSlug: credentials.storeSlug,
              active: true
            }
          }

          if (credentials.email === 'vnn2006@gmail.com' && credentials.password === '123456') {
            return {
              id: '3',
              email: credentials.email,
              name: 'Vitor',
              role: 'ADMIN',
              storeSlug: credentials.storeSlug,
              active: true
            }
          }

          if (credentials.email === 'superadmin@cardap.io' && credentials.password === 'admin123') {
            return {
              id: '2',
              email: credentials.email,
              name: 'Super Admin',
              role: 'SUPER_ADMIN',
              active: true
            }
          }

          return null
        } catch (error) {
          console.error('Erro na autenticação:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.storeSlug = user.storeSlug
        token.active = user.active
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role
        session.user.storeSlug = token.storeSlug
        session.user.active = token.active
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Se a URL for relativa, adicionar baseUrl
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Se a URL for do mesmo domínio, permitir
      else if (new URL(url).origin === baseUrl) return url
      // Por padrão, redirecionar para home se não for uma URL específica
      return baseUrl
    }
  },
  pages: {
    signIn: '/login/lojista',
    error: '/unauthorized',
    signOut: '/',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here',
  // Configuração para desenvolvimento
  debug: process.env.NODE_ENV === 'development',
} 