import bcrypt from 'bcryptjs'
import { readFile } from 'fs/promises'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { join } from 'path'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        userType: { label: 'User Type', type: 'text' },
        storeSlug: { label: 'Store Slug', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios')
        }

        try {
          // Carregar usuários
          const usersPath = join(process.cwd(), 'data', 'users.json')
          const usersData = await readFile(usersPath, 'utf-8')
          const users = JSON.parse(usersData)

          // Encontrar usuário
          const user = users.find((u: any) => u.email === credentials.email)
          if (!user) {
            throw new Error('Usuário não encontrado')
          }

          // Verificar senha
          const isValidPassword = await bcrypt.compare(credentials.password, user.password)
          if (!isValidPassword) {
            throw new Error('Senha incorreta')
          }

          if (!user.active) {
            throw new Error('Conta desativada')
          }

          // Validações por role
          if (credentials.userType === 'lojista' && user.role !== 'admin') {
            throw new Error('Acesso negado - apenas lojistas')
          }

          if (credentials.userType === 'super-admin' && user.role !== 'super_admin') {
            throw new Error('Acesso negado - apenas super admins')
          }

          if (credentials.userType === 'lojista' && credentials.storeSlug) {
            if (user.storeSlug !== credentials.storeSlug) {
              throw new Error('Acesso negado para esta loja')
            }
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            storeSlug: user.storeSlug || null,
            active: user.active
          }
        } catch (error) {
          console.error('Erro na autenticação:', error)
          throw error
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
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
        session.user.id = token.sub as string
        session.user.role = token.role as any
        session.user.storeSlug = token.storeSlug as string
        session.user.active = token.active as boolean
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Funções auxiliares para verificação de roles
export function hasRole(session: any, role: string): boolean {
  return session?.user?.role === role
}

export function canAccessStore(session: any, storeSlug: string): boolean {
  if (!session?.user) return false
  
  // Super admin pode acessar qualquer loja
  if (session.user.role === 'super_admin') return true
  
  // Lojista só pode acessar sua própria loja
  if (session.user.role === 'admin') {
    return session.user.storeSlug === storeSlug
  }
  
  return false
}

export function getRedirectUrl(role: string, storeSlug?: string): string {
  switch (role) {
    case 'super_admin':
      return '/admin'
    case 'admin':
      return `/dashboard/${storeSlug}`
    case 'cliente':
      return '/'
    default:
      return '/'
  }
}