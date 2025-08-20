import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Usar o apiClient para autenticar com o backend
          const response = await fetch('http://localhost:3001/api/v1/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            }),
          })

          if (!response.ok) {
            console.error('❌ NextAuth: Falha na autenticação:', response.status)
            return null
          }

          const authData = await response.json()
          console.log('✅ NextAuth: Autenticação bem-sucedida:', { 
            email: authData.user?.email,
            role: authData.user?.role 
          })

          if (authData.access_token && authData.user) {
            // Armazenar o token JWT do backend
            if (typeof window !== 'undefined') {
              localStorage.setItem('cardapio_token', authData.access_token)
              document.cookie = `cardapio_token=${authData.access_token}; path=/; max-age=86400; SameSite=Strict`
            }

            return {
              id: authData.user.id,
              email: authData.user.email,
              name: authData.user.name,
              role: authData.user.role,
              storeSlug: authData.user.storeSlug,
              active: authData.user.active,
              accessToken: authData.access_token
            }
          }

          return null
        } catch (error) {
          console.error('❌ NextAuth: Erro na autenticação:', error)
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
        token.accessToken = user.accessToken
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role
        session.user.storeSlug = token.storeSlug
        session.user.active = token.active
        session.accessToken = token.accessToken
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